import { error } from '@sveltejs/kit';
import {
  fetchSingleArticleServer,
  fetchSingleBottomWidgetsServer,
  getSiteTitle
} from '$lib/api/bunbunServer';
import { buildSingleArticleSeo } from '$lib/seo/seoBuilder';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params, url, setHeaders }) => {
  const category = (params.category || '').trim().replace(/\.(sqlite|db)$/i, '');
  const slug = (params.slug || '').trim();
  const origin = url.origin;
  const siteTitle = getSiteTitle(url);

  const singleRes = await fetchSingleArticleServer(fetch, origin, category, slug);
  if (!singleRes.ok || !singleRes.article) {
    throw error(404, `Technical article "${slug}" in category "${category}" was not found.`);
  }

  // Stream / resolve bottom supplementary widgets (Related Posts limit=5 & Related Links limit=5)
  const widgets = await fetchSingleBottomWidgetsServer(fetch, origin, singleRes.article.slug, 5, 5);

  setHeaders({
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
  });

  return {
    article: singleRes.article,
    relatedPosts: widgets.relatedPosts,
    relatedLinks: widgets.relatedLinks,
    seo: buildSingleArticleSeo(origin, siteTitle, singleRes.article)
  };
};
