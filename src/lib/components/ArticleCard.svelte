<script lang="ts">
  import {
    FALLBACK_SVG_DATA_URI,
    formatEpochDate,
    type ArticleSummaryCard
  } from '$lib/api/bunbunServer';

  export let card: ArticleSummaryCard;
  export let index = 0;

  $: href = card.seoPath || `/${encodeURIComponent(card.category)}/${encodeURIComponent(card.slug)}`;
  $: imgSrc = card.thumbnail || card.image || FALLBACK_SVG_DATA_URI;
  $: loadingMode = index < 6 ? ('eager' as const) : ('lazy' as const);
  $: dateStr = formatEpochDate(card.updatedAt || card.createdAt);
</script>

<article class="bb-card">
  <a class="bb-card__media" href={href}>
    <img
      alt={card.imageAlt || card.title}
      class="bb-card__img"
      decoding="async"
      height="400"
      loading={loadingMode}
      onerror="window.__BUNBUN_IMG_ERR__(this)"
      src={imgSrc}
      width="600"
    >
    <span class="bb-card__badge">{card.categoryLabel || card.category}</span>
  </a>
  <div class="bb-card__body">
    <h2 class="bb-card__title">
      <a href={href}>{card.title}</a>
    </h2>
    <p class="bb-card__excerpt">{card.excerpt || ''}</p>
    <div class="bb-card__footer">
      <span>{Number(card.sentenceCount || 0)} specs &middot; {Number(card.imageCount || 0)} images</span>
      <time datetime={dateStr}>{dateStr}</time>
    </div>
  </div>
</article>
