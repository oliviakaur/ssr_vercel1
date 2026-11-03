<script lang="ts">
  import SeoHead from '$lib/components/SeoHead.svelte';
  import { formatEpochDate } from '$lib/api/bunbunServer';

  export let data;

  $: article = data.article;
  $: pubDate = formatEpochDate(article.createdAt);
  $: modDate = formatEpochDate(article.updatedAt || article.createdAt);
  $: catHref = `/category/${encodeURIComponent(article.category)}`;
</script>

<SeoHead seo={data.seo} origin={data.origin} />

<!-- Strictly NO CategoryBar component on Single Article Page -->
<main class="bb-main" id="bb-main-root" role="main">
  <div class="bb-container bb-container--narrow" id="bb-viewport">
    <nav aria-label="Breadcrumb">
      <ol class="bb-breadcrumbs">
        <li><a href="/">Home</a></li>
        <li>/</li>
        <li><a href={catHref}>{article.categoryLabel}</a></li>
        <li>/</li>
        <li aria-current="page">{article.title}</li>
      </ol>
    </nav>

    <article class="bb-article">
      <header class="bb-article__header">
        <a class="bb-cat-pill bb-cat-pill--active" href={catHref}>{article.categoryLabel}</a>
        <h1 class="bb-article__h1">{article.title}</h1>
        <div class="bb-article__meta">
          <span class="bb-article__meta-chip">Published: {pubDate}</span>
          <span class="bb-article__meta-chip">Updated: {modDate}</span>
          <span class="bb-article__meta-chip">{article.sentenceCount} Technical Sentences</span>
          <span class="bb-article__meta-chip">{article.imageCount} Diagrams</span>
        </div>
      </header>

      {#if article.images && article.images.length > 0}
        {@const firstImg = article.images[0]}
        <figure class="bb-figure">
          <div class="bb-figure__canvas">
            <img
              alt={firstImg.alt}
              decoding="async"
              fetchpriority="high"
              height={firstImg.height}
              loading="eager"
              onerror="window.__BUNBUN_IMG_ERR__(this)"
              src={firstImg.url}
              width={firstImg.width}
            >
          </div>
          <figcaption class="bb-figure__caption">
            <strong>{firstImg.title}</strong> &mdash; {firstImg.width}x{firstImg.height}px ({firstImg.filetype.toUpperCase()})
          </figcaption>
        </figure>
      {/if}

      <div class="bb-article__sentences">
        {#each article.sentences as sentence}
          <p>{sentence}</p>
        {/each}
      </div>

      {#if article.images && article.images.length > 1}
        <section aria-label="Technical Diagrams" class="bb-diagrams-section">
          <h2 class="u-mb-sm" style="font-size:1.3rem;font-weight:800;">
            Technical Diagrams &amp; Schematics ({article.images.length})
          </h2>
          <div class="bb-diagram-grid">
            {#each article.images.slice(1) as img}
              <figure class="bb-figure">
                <div class="bb-figure__canvas">
                  <img
                    alt={img.alt}
                    decoding="async"
                    height={img.height}
                    loading="eager"
                    onerror="window.__BUNBUN_IMG_ERR__(this)"
                    src={img.url}
                    width={img.width}
                  >
                </div>
                <figcaption class="bb-figure__caption">
                  <strong>{img.title}</strong> ({img.width}x{img.height}px)
                </figcaption>
              </figure>
            {/each}
          </div>
        </section>
      {/if}
    </article>

    <!-- Bottom Supplementary Widgets: Related Posts (limit=5, same domain) & Related Links (limit=5, cross-domain) -->
    <section aria-label="Supplementary Technical Resources" class="bb-bottom-widgets">
      <div class="bb-widget-card">
        <h2 class="bb-widget-card__title">
          <span>Related Posts</span>
          <span class="u-text-xs u-text-muted">Same Domain (5)</span>
        </h2>
        <ul class="bb-widget-list" id="bb-related-posts-slot">
          {#if !data.relatedPosts || data.relatedPosts.length === 0}
            <li class="bb-widget-list__item u-text-xs u-text-muted">No additional related posts found.</li>
          {:else}
            {#each data.relatedPosts as item (item.slug)}
              <li class="bb-widget-list__item">
                <a class="bb-widget-list__link" href={item.seoPath}>{item.title}</a>
                <span class="u-text-xs u-text-muted">
                  {item.categoryLabel || item.category} &middot; {Number(item.sentenceCount || 0)} specs
                </span>
              </li>
            {/each}
          {/if}
        </ul>
      </div>

      <div class="bb-widget-card">
        <h2 class="bb-widget-card__title">
          <span>Related Links</span>
          <span class="u-text-xs u-text-muted">All Categories &amp; Domains (5)</span>
        </h2>
        <ul class="bb-widget-list" id="bb-related-links-slot">
          {#if !data.relatedLinks || data.relatedLinks.length === 0}
            <li class="bb-widget-list__item u-text-xs u-text-muted">No cross-domain links available.</li>
          {:else}
            {#each data.relatedLinks as item (item.slug)}
              <li class="bb-widget-list__item">
                <a class="bb-widget-list__link" href={item.crossDomainUrl} rel="noopener" target="_blank">
                  {item.title}
                </a>
                <span class="u-text-xs u-text-muted">
                  {item.categoryLabel || item.category} &middot; {item.hostLabel} &#8599;
                </span>
              </li>
            {/each}
          {/if}
        </ul>
      </div>
    </section>
  </div>
</main>
