import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const formData = await request.formData();
  const name = formData.get('name')?.toString().trim();
  const comment = formData.get('comment')?.toString().trim();

  if (!name || !comment) {
    return new Response('Name and comment are required.', { status: 400 });
  }

  try {
    const db = (locals as any).runtime.env.DB;
    await db
      .prepare('INSERT INTO entries (name, comment) VALUES (?, ?)')
      .bind(name, comment)
      .run();
  } catch (error) {
    console.error('Database error:', error);
    return new Response('Database error', { status: 500 });
  }

  return new Response(null, {
    status: 303,
    headers: { Location: '/notebook' },
  });
};
