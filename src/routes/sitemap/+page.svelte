<script lang="ts">
  import SeoHead from '$lib/components/SeoHead.svelte';
  import CategoryBar from '$lib/components/CategoryBar.svelte';
  import ArticleCard from '$lib/components/ArticleCard.svelte';

  export let data;
</script>

<SeoHead seo={data.seo} origin={data.origin} />
<CategoryBar categories={data.categories} activeCategory="" />

<main class="bb-main" id="bb-main-root" role="main">
  <div class="bb-container" id="bb-viewport">
    <section class="bb-section-header">
      <h1 class="bb-section-header__title">Sitemap Directory</h1>
      <span class="u-text-sm u-text-muted">
        {data.articles.length} indexed articles across {data.categories.length} categories
      </span>
    </section>
    <div class="bb-grid">
      {#each data.articles as card, idx (card.slug + '-' + idx)}
        <ArticleCard {card} index={idx} />
      {/each}
    </div>
  </div>
</main>
