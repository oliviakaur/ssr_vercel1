import { fetchRandomArticlesServer, getSiteTitle } from '$lib/api/bunbunServer';
import { buildSitemapSeo } from '$lib/seo/seoBuilder';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
  const origin = url.origin;
  const siteTitle = getSiteTitle(url);
  const res = await fetchRandomArticlesServer(fetch, origin, 60);

  return {
    articles: res.articles,
    categories: res.categories,
    seo: buildSitemapSeo(origin, siteTitle)
  };
};
