import { BUNBUN_API_BASE } from '$lib/api/bunbunServer';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch, url }) => {
  const host = (url.hostname || 'localhost').toLowerCase();
  const origin = url.origin;
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  const domainParam = (url.searchParams.get('domain') || (isLocal ? 'all' : host)).trim();
  const dbParam = (url.searchParams.get('db') || url.searchParams.get('category') || 'all').trim();
  const rawLimit = parseInt(url.searchParams.get('limit') || '100', 10);
  const limitParam = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 5000) : 100;

  const params = new URLSearchParams({
    domain: domainParam,
    db: dbParam,
    limit: String(limitParam)
  });

  try {
    const res = await fetch(`${BUNBUN_API_BASE}/atom.xml?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/atom+xml, application/xml, text/xml',
        Origin: origin,
        Referer: `${origin}/`
      }
    });
    const body = await res.text();
    return new Response(body, {
      status: res.ok ? 200 : 502,
      headers: {
        'Content-Type': 'application/atom+xml; charset=UTF-8',
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  } catch {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"></feed>', {
      status: 502,
      headers: {
        'Content-Type': 'application/atom+xml; charset=UTF-8',
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  }
};
