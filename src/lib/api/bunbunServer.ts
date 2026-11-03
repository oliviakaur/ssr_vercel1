export const BUNBUN_API_BASE = 'https://bunbunserver.my.id';

export interface ArticleImage {
  keyword: string;
  slug: string;
  title: string;
  alt: string;
  url: string;
  thumb: string;
  filetype: string;
  source: string;
  domain: string;
  width: number;
  height: number;
}

export interface NormalizedArticle {
  id: number;
  category: string;
  categoryLabel: string;
  keyword: string;
  slug: string;
  title: string;
  content: string;
  sentences: string[];
  images: ArticleImage[];
  articleBody: string;
  imageCount: number;
  sentenceCount: number;
  metaDesc: string;
  metaKeywords: string;
  createdAt: number;
  updatedAt: number;
  seoPath: string; // SEO-friendly URL: /<category>/<slug>
}

export interface ArticleSummaryCard {
  id: number;
  category: string;
  categoryLabel: string;
  keyword: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string | null;
  image: string | null;
  imageAlt: string;
  imageCount: number;
  sentenceCount: number;
  createdAt: number;
  updatedAt: number;
  url: string;
  seoPath: string; // SEO-friendly URL: /<category>/<slug>
  crossDomainUrl?: string;
  hostLabel?: string;
}

export interface CategoryInfo {
  category: string;
  label: string;
  count: number;
  loadedAt?: number;
  updatedAt?: number;
}

export const FALLBACK_SVG_DATA_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">' +
      '<rect width="100%" height="100%" fill="#e2e8f0"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="16" font-weight="600">Technical Diagram Unavailable</text>' +
      '</svg>'
  );

export function formatEpochDate(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return new Date().toISOString().split('T')[0];
  const d = new Date(Number(seconds) * 1000);
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
}

export function formatEpochIso(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return new Date().toISOString();
  const d = new Date(Number(seconds) * 1000);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function getSiteTitle(url: URL): string {
  const host = (url.hostname || '').toLowerCase();
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return 'Technical Reference';
  }
  return host;
}

function preParseArray(rawField: unknown): unknown[] {
  if (Array.isArray(rawField)) return rawField;
  if (typeof rawField === 'string' && rawField.trim()) {
    try {
      const parsed = JSON.parse(rawField);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function attachSeoPathToCard(raw: any): ArticleSummaryCard {
  const category = String(raw?.category || '');
  const slug = String(raw?.slug || '');
  return {
    ...raw,
    category,
    slug,
    seoPath: `/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`
  };
}

export function normalizeSingleArticle(
  raw: any,
  fallbackCategory: string,
  fallbackSlug: string
): NormalizedArticle | null {
  if (!raw || typeof raw !== 'object') return null;

  const sentencesRaw = raw.sentences !== undefined ? raw.sentences : raw.json_sentences;
  const imagesRaw = raw.images !== undefined ? raw.images : raw.json_images;

  const sentences = preParseArray(sentencesRaw)
    .map((s) => String(s == null ? '' : s).trim())
    .filter(Boolean);

  const images: ArticleImage[] = preParseArray(imagesRaw)
    .filter((img: any) => img && typeof img === 'object' && (img.url || img.thumb))
    .map((img: any) => ({
      keyword: String(img.keyword || raw.keyword || ''),
      slug: String(img.slug || raw.slug || fallbackSlug),
      title: String(img.title || raw.title || 'Technical Diagram'),
      alt: String(img.alt || img.title || raw.title || 'Technical Diagram'),
      url: String(img.url || img.thumb || ''),
      thumb: String(img.thumb || img.url || ''),
      filetype: String(img.filetype || 'jpg'),
      source: String(img.source || ''),
      domain: String(img.domain || ''),
      width: Number(img.width) > 0 ? Number(img.width) : 600,
      height: Number(img.height) > 0 ? Number(img.height) : 400
    }));

  const articleBody = sentences.join(' ');
  let metaDesc = String(raw.metaDesc || '').trim();
  if (!metaDesc && articleBody) {
    metaDesc = articleBody.length > 157 ? articleBody.slice(0, 157) + '...' : articleBody;
  }

  const category = String(raw.category || fallbackCategory);
  const slug = String(raw.slug || fallbackSlug);

  return {
    id: Number(raw.id || 0),
    category,
    categoryLabel: String(raw.categoryLabel || category),
    keyword: String(raw.keyword || ''),
    slug,
    title: String(raw.title || raw.keyword || slug),
    content: String(raw.content || ''),
    sentences,
    images,
    articleBody,
    imageCount: Number(raw.imageCount != null ? raw.imageCount : images.length),
    sentenceCount: Number(raw.sentenceCount != null ? raw.sentenceCount : sentences.length),
    metaDesc,
    metaKeywords: String(raw.metaKeywords || ''),
    createdAt: Number(raw.createdAt || 0),
    updatedAt: Number(raw.updatedAt || raw.createdAt || 0),
    seoPath: `/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`
  };
}

function buildHeaders(origin: string, accept = 'application/json'): HeadersInit {
  return {
    Accept: accept,
    Origin: origin,
    Referer: `${origin}/`
  };
}

export async function fetchRandomArticlesServer(
  fetchFn: typeof fetch,
  origin: string,
  limit = 24,
  query = '',
  category = ''
) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (query) params.set('q', query);
  if (category) params.set('category', category);

  const res = await fetchFn(`${BUNBUN_API_BASE}/api/articles/random?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(origin)
  });

  if (!res.ok) {
    return { ok: false, status: res.status, articles: [] as ArticleSummaryCard[], categories: [] as CategoryInfo[] };
  }

  const data = await res.json();
  const articles = Array.isArray(data.articles) ? data.articles.map(attachSeoPathToCard) : [];
  const categories: CategoryInfo[] = Array.isArray(data.categories) ? data.categories : [];
  return { ok: true, status: 200, articles, categories };
}

export async function fetchCategoryPageServer(
  fetchFn: typeof fetch,
  origin: string,
  category: string,
  limit = 24,
  query = ''
) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (query) params.set('q', query);

  const [catRes, dirRes] = await Promise.all([
    fetchFn(`${BUNBUN_API_BASE}/api/category/${encodeURIComponent(category)}?${params.toString()}`, {
      method: 'GET',
      headers: buildHeaders(origin)
    }),
    fetchFn(`${BUNBUN_API_BASE}/api/categories`, {
      method: 'GET',
      headers: buildHeaders(origin)
    }).catch(() => null)
  ]);

  if (!catRes.ok) {
    return {
      ok: false,
      status: catRes.status,
      category,
      categoryLabel: category,
      totalInCategory: 0,
      articles: [] as ArticleSummaryCard[],
      categories: [] as CategoryInfo[]
    };
  }

  const catJson = await catRes.json();
  const dirJson = dirRes && dirRes.ok ? await dirRes.json() : { categories: [] };
  const articles = Array.isArray(catJson.articles) ? catJson.articles.map(attachSeoPathToCard) : [];

  return {
    ok: true,
    status: 200,
    category: String(catJson.category || category),
    categoryLabel: String(catJson.categoryLabel || category),
    totalInCategory: Number(catJson.totalInCategory ?? articles.length),
    articles,
    categories: Array.isArray(dirJson.categories) ? dirJson.categories : []
  };
}

export async function fetchSingleArticleServer(
  fetchFn: typeof fetch,
  origin: string,
  category: string,
  slug: string
) {
  const qs = new URLSearchParams({ category, slug });
  const res = await fetchFn(`${BUNBUN_API_BASE}/api/article?${qs.toString()}`, {
    method: 'GET',
    headers: buildHeaders(origin)
  });

  if (!res.ok) {
    return { ok: false, status: res.status, article: null };
  }

  const raw = await res.json();
  const article = normalizeSingleArticle(raw, category, slug);
  if (!article || article.sentences.length === 0) {
    return { ok: false, status: 404, article: null };
  }

  return { ok: true, status: 200, article };
}

export async function fetchSingleBottomWidgetsServer(
  fetchFn: typeof fetch,
  origin: string,
  currentSlug: string,
  postsLimit = 5,
  linksLimit = 5
) {
  const [postsRes, linksRes, domainsRes] = await Promise.all([
    fetchFn(`${BUNBUN_API_BASE}/api/articles/random?limit=${postsLimit}`, {
      method: 'GET',
      headers: buildHeaders(origin)
    }).catch(() => null),
    fetchFn(`${BUNBUN_API_BASE}/api/articles/random?limit=${linksLimit}`, {
      method: 'GET',
      headers: buildHeaders(origin)
    }).catch(() => null),
    fetchFn(`${BUNBUN_API_BASE}/api/domains/status`, {
      method: 'GET',
      headers: buildHeaders(origin)
    }).catch(() => null)
  ]);

  const postsJson = postsRes && postsRes.ok ? await postsRes.json() : { articles: [] };
  const linksJson = linksRes && linksRes.ok ? await linksRes.json() : { articles: [] };
  const domainsJson = domainsRes && domainsRes.ok ? await domainsRes.json() : { activeHttp200Domains: [] };

  const relatedPosts: ArticleSummaryCard[] = (Array.isArray(postsJson.articles) ? postsJson.articles : [])
    .filter((a: any) => a && a.slug && a.slug !== currentSlug)
    .slice(0, postsLimit)
    .map(attachSeoPathToCard);

  const rawDomains: string[] = Array.isArray(domainsJson.activeHttp200Domains)
    ? domainsJson.activeHttp200Domains
    : [];

  const validOrigins = Array.from(
    new Set(
      rawDomains
        .map((d) => String(d || '').trim().replace(/\/+$/, ''))
        .filter((d) => d && !d.includes('*'))
        .map((d) => (d.startsWith('http://') || d.startsWith('https://') ? d : `https://${d}`))
        .filter((d) => {
          try {
            const host = new URL(d).hostname.toLowerCase();
            return host !== 'localhost' && host !== '127.0.0.1' && host !== 'bunbunserver.my.id';
          } catch {
            return false;
          }
        })
    )
  );

  const relatedLinks: ArticleSummaryCard[] = (Array.isArray(linksJson.articles) ? linksJson.articles : [])
    .filter((a: any) => a && a.slug && a.slug !== currentSlug)
    .slice(0, linksLimit)
    .map((item: any, idx: number) => {
      const targetOrigin = validOrigins.length > 0 ? validOrigins[idx % validOrigins.length] : origin;
      let hostLabel = targetOrigin;
      try {
        hostLabel = new URL(targetOrigin).hostname;
      } catch {}
      return {
        ...attachSeoPathToCard(item),
        crossDomainUrl: `${targetOrigin}/?category=${encodeURIComponent(item.category)}&slug=${encodeURIComponent(item.slug)}`,
        hostLabel
      };
    });

  return { relatedPosts, relatedLinks };
}
