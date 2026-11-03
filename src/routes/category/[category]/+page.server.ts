import { error } from '@sveltejs/kit';
import { fetchCategoryPageServer, getSiteTitle } from '$lib/api/bunbunServer';
import { buildCategorySeo } from '$lib/seo/seoBuilder';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params, url }) => {
  const categorySlug = (params.category || '').trim().replace(/\.(sqlite|db)$/i, '');
  const query = (url.searchParams.get('q') || url.searchParams.get('keyword') || '').trim();
  const origin = url.origin;
  const siteTitle = getSiteTitle(url);

  const data = await fetchCategoryPageServer(fetch, origin, categorySlug, 24, query);
  if (!data.ok) {
    throw error(404, `Category database "${categorySlug}" was not found.`);
  }

  return {
    category: data.category,
    categoryLabel: data.categoryLabel,
    totalInCategory: data.totalInCategory,
    articles: data.articles,
    categories: data.categories,
    query,
    seo: buildCategorySeo(origin, siteTitle, data.category, data.categoryLabel, data.totalInCategory)
  };
};
