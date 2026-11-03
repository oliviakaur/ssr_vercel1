import { error, redirect } from '@sveltejs/kit';
import { fetchRandomArticlesServer, getSiteTitle } from '$lib/api/bunbunServer';
import { buildHomeSeo } from '$lib/seo/seoBuilder';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
  const category = (url.searchParams.get('category') || '').trim().replace(/\.(sqlite|db)$/i, '');
  const slug = (url.searchParams.get('slug') || '').trim();
  const page = (url.searchParams.get('page') || '').trim().toLowerCase();
  const query = (url.searchParams.get('q') || url.searchParams.get('keyword') || '').trim();

  // Redirect legacy query-string routes to SEO-friendly SvelteKit SSR paths
  if (page === 'sitemap') {
    throw redirect(301, '/sitemap');
  }
  if (category && slug) {
    throw redirect(301, `/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`);
  }
  if (category && !slug) {
    const qs = query ? `?q=${encodeURIComponent(query)}` : '';
    throw redirect(301, `/category/${encodeURIComponent(category)}${qs}`);
  }
  if (!category && slug) {
    throw error(404, 'Both category and slug parameters are required.');
  }

  const origin = url.origin;
  const siteTitle = getSiteTitle(url);
  const res = await fetchRandomArticlesServer(fetch, origin, 24, query);

  return {
    articles: res.articles,
    categories: res.categories,
    query,
    seo: buildHomeSeo(origin, siteTitle, res.articles, query)
  };
};
