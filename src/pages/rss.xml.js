import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  const sorted = posts.sort((a, b) => b.data.pubDate - a.data.pubDate);

  return rss({
    title: "Osprey Thread Kastle Five",
    description: 'An ongoing body of written work. In partnership with Red Bull.',
    site: context.site,
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/writtenwork/${post.id}/`,
    })),
  });
}
