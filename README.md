# Osprey

A small social network — posts, threads, replies, likes, reposts, follows,
direct messages, notifications, and an AI "oracle". Built with
[Astro](https://astro.build) and deployed on Cloudflare Pages, with the API
running as Cloudflare Pages Functions backed by a D1 (SQLite) database.

## Stack

- **Frontend** — Astro pages in `src/pages`, components in `src/components`.
- **API** — Cloudflare Pages Functions in `functions/` (file-based routing;
  `functions/api/posts/like.js` → `POST /api/posts/like`). Files and folders
  prefixed with `_` (e.g. `functions/_auth.js`) are shared helpers, not routes.
- **Database** — Cloudflare D1. Schema lives in `migrations/` and is applied in
  order (`0001_*` → `0007_*`).
- **Auth** — Google and GitHub OAuth; sessions are stored in the `sessions`
  table and carried in an `HttpOnly` `session` cookie.

## Project layout

```text
functions/        Cloudflare Pages Functions (the API)
  _auth.js        shared helpers: sessions, cookies, post/user shaping
  api/            REST endpoints (posts, follow, messages, search, …)
migrations/       D1 schema migrations, applied in numeric order
src/
  pages/          Astro routes (index, profile, postview, messages, …)
  components/      shared UI components
  content/        markdown content (blog posts)
test/             Vitest unit tests for the function helpers
```

## Commands

All commands run from the project root.

| Command              | Action                                   |
| :------------------- | :--------------------------------------- |
| `npm install`        | Install dependencies                     |
| `npm run dev`        | Start the dev server at `localhost:4321` |
| `npm run build`      | Build the production site to `./dist/`   |
| `npm run preview`    | Preview the production build locally      |
| `npm test`           | Run the unit tests once                  |
| `npm run test:watch` | Run the unit tests in watch mode         |

## Tests

Unit tests live in `test/` and run with [Vitest](https://vitest.dev). They
cover the pure and DB-backed helpers in `functions/_auth.js` (cookie parsing,
JSON responses, user/post shaping, mention notifications, conversation
creation) using a lightweight in-memory D1 mock — no live database required.
