import {
  formatEpochIso,
  type ArticleSummaryCard,
  type NormalizedArticle
} from '$lib/api/bunbunServer';

export interface SeoPayload {
  viewType: 'home' | 'category' | 'single' | 'sitemap' | '404';
  title: string;
  canonical: string;
  robots: string;
  description: string;
  includePubSubHub: boolean;
  jsonLdSchema: Record<string, unknown> | null;
  jsonLdBreadcrumb: Record<string, unknown> | null;
}

export function buildHomeSeo(
  origin: string,
  siteTitle: string,
  articles: ArticleSummaryCard[],
  query = ''
): SeoPayload {
  const canonical = `${origin}/`;
  const title = query ? `Search: ${query} - ${siteTitle}` : siteTitle;
  const robots = query
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const description = `Verified technical specifications, automotive sensor resistance data, and wiring diagrams on ${siteTitle}.`;

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: `${origin}/`,
        name: siteTitle,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${origin}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'ItemList',
        '@id': `${origin}/#itemlist`,
        name: 'Random Technical Specifications',
        itemListElement: articles.slice(0, 24).map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.title,
          url: `${origin}${item.seoPath}`
        }))
      }
    ]
  };

  return {
    viewType: 'home',
    title,
    canonical,
    robots,
    description,
    includePubSubHub: true,
    jsonLdSchema,
    jsonLdBreadcrumb: null
  };
}

export function buildCategorySeo(
  origin: string,
  siteTitle: string,
  categorySlug: string,
  categoryLabel: string,
  totalInCategory: number
): SeoPayload {
  const label = categoryLabel || categorySlug;
  return {
    viewType: 'category',
    title: `${label} Specifications (${totalInCategory}) - ${siteTitle}`,
    canonical: `${origin}/category/${encodeURIComponent(categorySlug)}`,
    robots: 'index, follow',
    description: `Browse ${totalInCategory} technical articles, sensor specs, and wiring diagrams in ${label} on ${siteTitle}.`,
    includePubSubHub: false,
    jsonLdSchema: null, // Strictly Zero JSON-LD on Category Page
    jsonLdBreadcrumb: null
  };
}

export function buildSingleArticleSeo(
  origin: string,
  siteTitle: string,
  article: NormalizedArticle
): SeoPayload {
  const fullUrl = `${origin}${article.seoPath}`;

  const imageObjects = article.images.map((img) => ({
    '@type': 'ImageObject',
    url: img.url,
    contentUrl: img.url,
    name: img.title,
    caption: img.alt,
    width: img.width,
    height: img.height
  }));

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl
    },
    headline: article.title,
    description: article.metaDesc,
    articleSection: article.categoryLabel,
    keywords: article.metaKeywords || article.keyword,
    articleBody: article.articleBody,
    image: imageObjects,
    datePublished: formatEpochIso(article.createdAt),
    dateModified: formatEpochIso(article.updatedAt || article.createdAt),
    author: {
      '@type': 'Organization',
      name: siteTitle,
      url: `${origin}/`
    },
    publisher: {
      '@type': 'Organization',
      name: siteTitle,
      url: `${origin}/`
    }
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${origin}/`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: article.categoryLabel,
        item: `${origin}/category/${encodeURIComponent(article.category)}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: fullUrl
      }
    ]
  };

  return {
    viewType: 'single',
    title: `${article.title} - ${siteTitle}`,
    canonical: fullUrl,
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    description: article.metaDesc || article.title,
    includePubSubHub: false,
    jsonLdSchema,
    jsonLdBreadcrumb
  };
}

export function buildSitemapSeo(origin: string, siteTitle: string): SeoPayload {
  return {
    viewType: 'sitemap',
    title: `Sitemap - ${siteTitle}`,
    canonical: `${origin}/sitemap`,
    robots: 'index, follow',
    description: `Complete HTML Sitemap directory for ${siteTitle}.`,
    includePubSubHub: false,
    jsonLdSchema: null,
    jsonLdBreadcrumb: null
  };
}

export function build404Seo(origin: string, siteTitle: string, pathname = '/'): SeoPayload {
  return {
    viewType: '404',
    title: `Page Not Found - ${siteTitle}`,
    canonical: `${origin}${pathname}`,
    robots: 'noindex, nofollow',
    description: 'The requested technical specification or category page could not be found.',
    includePubSubHub: false,
    jsonLdSchema: null, // Strictly Zero JSON-LD on 404
    jsonLdBreadcrumb: null
  };
}
