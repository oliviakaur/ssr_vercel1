import { getSiteTitle } from '$lib/api/bunbunServer';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
  return {
    origin: url.origin,
    siteTitle: getSiteTitle(url),
    currentQuery: (url.searchParams.get('q') || url.searchParams.get('keyword') || '').trim()
  };
};
