import { BUNBUN_API_BASE } from '$lib/api/bunbunServer';
import type { RequestHandler } from './$types';

function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Converts query-style `<loc>https://domain/?category=cat&amp;slug=slug</loc>`
 * into SEO-friendly `<loc>https://domain/cat/slug</loc>`
 */
function rewriteLocToSeoFriendly(xmlText: string): string {
  return xmlText.replace(
    /<loc>(https?:\/\/[^/<]+)\/\?category=([^&<]+)&(?:amp;)?slug=([^<]+)<\/loc>/gi,
    (_match, domainOrigin, cat, slug) => `<loc>${domainOrigin}/${cat}/${slug}</loc>`
  );
}

export const GET: RequestHandler = async ({ fetch, url }) => {
  const host = (url.hostname || 'localhost').toLowerCase();
  const origin = url.origin;
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  const domainParam = (url.searchParams.get('domain') || (isLocal ? 'all' : host)).trim();
  const dbParam = (url.searchParams.get('db') || url.searchParams.get('category') || 'all').trim();
  const rawLimit = parseInt(url.searchParams.get('limit') || '500', 10);
  const limitParam = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50000) : 500;

  const upstreamParams = new URLSearchParams({
    domain: domainParam,
    db: dbParam,
    limit: String(limitParam)
  });

  try {
    const upstreamRes = await fetch(`${BUNBUN_API_BASE}/sitemap.xml?${upstreamParams.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/xml, text/xml, */*',
        Origin: origin,
        Referer: `${origin}/`
      }
    });

    if (upstreamRes.ok) {
      const rawXml = await upstreamRes.text();
      if (rawXml && rawXml.includes('<urlset')) {
        const seoXml = rewriteLocToSeoFriendly(rawXml);
        return new Response(seoXml, {
          status: 200,
          headers: {
            'Content-Type': 'application/xml; charset=UTF-8',
            'Cache-Control': 'no-store, must-revalidate'
          }
        });
      }
    }

    // Fallback generator producing SEO-friendly `<loc>${origin}/${category}/${slug}</loc>`
    const fallbackLimit = Math.min(limitParam, 100);
    const randomParams = new URLSearchParams({ limit: String(fallbackLimit) });
    if (dbParam && dbParam !== 'all') {
      randomParams.set('category', dbParam);
    }

    const randomRes = await fetch(`${BUNBUN_API_BASE}/api/articles/random?${randomParams.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Origin: origin,
        Referer: `${origin}/`
      }
    });

    const data = randomRes.ok ? await randomRes.json() : { articles: [] };
    const articles = Array.isArray(data.articles) ? data.articles : [];
    const nowIso = new Date().toISOString();

    const entries = [
      `  <url>\n    <loc>${escapeXml(`${origin}/`)}</loc>\n    <lastmod>${nowIso}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`
    ];

    for (const item of articles) {
      if (!item || !item.category || !item.slug) continue;
      const loc = `${origin}/${encodeURIComponent(item.category)}/${encodeURIComponent(item.slug)}`;
      const lastMod = item.updatedAt
        ? new Date(Number(item.updatedAt) * 1000).toISOString()
        : nowIso;
      entries.push(
        `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${escapeXml(lastMod)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      );
    }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `${entries.join('\n')}\n` +
      `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  } catch {
    const emptyXml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `  <url>\n    <loc>${escapeXml(`${origin}/`)}</loc>\n  </url>\n` +
      `</urlset>`;
    return new Response(emptyXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  }
};
