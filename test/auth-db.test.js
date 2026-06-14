import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  notifyMentions,
  getOrCreateConversation,
  createNotification,
} from '../functions/_auth.js';

// Minimal D1 mock. `handlers` is an array of { match, first?, run? } where
// `match` is a substring tested against the SQL. The first matching handler
// wins; `first`/`run` receive the bound args and return the row / result.
function mockDB(handlers) {
  const runs = [];
  const DB = {
    runs,
    prepare(sql) {
      let args = [];
      const stmt = {
        bind(...a) {
          args = a;
          return stmt;
        },
        async first() {
          const h = handlers.find((h) => sql.includes(h.match) && h.first);
          return h ? h.first(args) : null;
        },
        async run() {
          const h = handlers.find((h) => sql.includes(h.match) && h.run);
          runs.push({ sql, args });
          return h ? h.run(args) : { success: true };
        },
      };
      return stmt;
    },
  };
  return DB;
}

describe('createNotification', () => {
  it('never notifies yourself', async () => {
    const DB = mockDB([{ match: 'INSERT INTO notifications', run: () => ({}) }]);
    await createNotification({ DB }, { userId: 'u1', actorId: 'u1', type: 'like' });
    expect(DB.runs).toHaveLength(0);
  });

  it('no-ops when userId or actorId is missing', async () => {
    const DB = mockDB([{ match: 'INSERT INTO notifications', run: () => ({}) }]);
    await createNotification({ DB }, { userId: null, actorId: 'u2', type: 'like' });
    await createNotification({ DB }, { userId: 'u1', actorId: null, type: 'like' });
    expect(DB.runs).toHaveLength(0);
  });

  it('inserts a notification for a distinct actor/user pair', async () => {
    const DB = mockDB([{ match: 'INSERT INTO notifications', run: () => ({}) }]);
    await createNotification({ DB }, { userId: 'u1', actorId: 'u2', type: 'like', postId: 'p1' });
    expect(DB.runs).toHaveLength(1);
    // id, user_id, actor_id, type, post_id
    expect(DB.runs[0].args.slice(1)).toEqual(['u1', 'u2', 'like', 'p1']);
  });

  it('swallows DB errors (best-effort)', async () => {
    const DB = {
      prepare: () => ({
        bind: () => ({
          run: async () => {
            throw new Error('db down');
          },
        }),
      }),
    };
    await expect(
      createNotification({ DB }, { userId: 'u1', actorId: 'u2', type: 'like' })
    ).resolves.toBeUndefined();
  });
});

describe('notifyMentions', () => {
  it('notifies each distinct existing mentioned user', async () => {
    const known = new Set(['ace', 'bee']);
    const DB = mockDB([
      {
        match: 'SELECT id FROM users',
        first: ([username]) => (known.has(username) ? { id: `id_${username}` } : null),
      },
      { match: 'INSERT INTO notifications', run: () => ({}) },
    ]);
    await notifyMentions(
      { DB },
      { content: 'hey @ace and @bee and @ghost', actorId: 'me', postId: 'p1' }
    );
    const inserts = DB.runs.filter((r) => r.sql.includes('INSERT INTO notifications'));
    // ace + bee insert; ghost does not exist
    expect(inserts).toHaveLength(2);
    expect(inserts.map((r) => r.args[1]).sort()).toEqual(['id_ace', 'id_bee']);
  });

  it('lowercases and dedupes repeated mentions', async () => {
    const lookups = [];
    const DB = mockDB([
      {
        match: 'SELECT id FROM users',
        first: ([username]) => {
          lookups.push(username);
          return null;
        },
      },
    ]);
    await notifyMentions({ DB }, { content: '@Ace @ACE @ace', actorId: 'me', postId: 'p1' });
    expect(lookups).toEqual(['ace']);
  });

  it('ignores mentions shorter than 3 chars and handles empty content', async () => {
    const lookups = [];
    const DB = mockDB([
      { match: 'SELECT id FROM users', first: ([u]) => (lookups.push(u), null) },
    ]);
    await notifyMentions({ DB }, { content: 'hi @ab @valid', actorId: 'me', postId: 'p1' });
    await notifyMentions({ DB }, { content: null, actorId: 'me', postId: 'p1' });
    expect(lookups).toEqual(['valid']);
  });
});

describe('getOrCreateConversation', () => {
  it('returns the existing conversation id when one is found', async () => {
    const DB = mockDB([
      { match: 'SELECT id FROM conversations', first: () => ({ id: 'conv_existing' }) },
      { match: 'INSERT INTO conversations', run: () => ({}) },
    ]);
    const id = await getOrCreateConversation({ DB }, 'b', 'a');
    expect(id).toBe('conv_existing');
    expect(DB.runs).toHaveLength(0);
  });

  it('creates a conversation with user ids in canonical (sorted) order', async () => {
    const DB = mockDB([
      { match: 'SELECT id FROM conversations', first: () => null },
      { match: 'INSERT INTO conversations', run: () => ({}) },
    ]);
    const id = await getOrCreateConversation({ DB }, 'zeta', 'alpha');
    expect(typeof id).toBe('string');
    const insert = DB.runs.find((r) => r.sql.includes('INSERT INTO conversations'));
    // args: id, user_a, user_b — a/b sorted so alpha < zeta
    expect(insert.args[1]).toBe('alpha');
    expect(insert.args[2]).toBe('zeta');
  });

  it('orders ids the same regardless of argument order', async () => {
    const seen = [];
    const make = () =>
      mockDB([
        { match: 'SELECT id FROM conversations', first: (a) => (seen.push(a), null) },
        { match: 'INSERT INTO conversations', run: () => ({}) },
      ]);
    const db1 = make();
    await getOrCreateConversation({ DB: db1 }, 'x', 'y');
    const db2 = make();
    await getOrCreateConversation({ DB: db2 }, 'y', 'x');
    // both lookups query the same (a,b) pair
    expect(seen[0]).toEqual(seen[1]);
    expect(seen[0]).toEqual(['x', 'y']);
  });
});
