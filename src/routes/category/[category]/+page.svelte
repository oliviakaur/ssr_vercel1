<script lang="ts">
  import SeoHead from '$lib/components/SeoHead.svelte';
  import CategoryBar from '$lib/components/CategoryBar.svelte';
  import ArticleCard from '$lib/components/ArticleCard.svelte';

  export let data;
</script>

<SeoHead seo={data.seo} origin={data.origin} />
<CategoryBar categories={data.categories} activeCategory={data.category} />

<main class="bb-main" id="bb-main-root" role="main">
  <div class="bb-container" id="bb-viewport">
    {#if !data.articles || data.articles.length === 0}
      <div class="bb-404-box">
        <span class="bb-404-box__badge">0 RESULTS</span>
        <h1 class="u-mb-sm">No Matching Technical Articles in {data.categoryLabel}</h1>
        <p class="u-text-muted u-mb-md">Try clearing your keyword filter or returning to the homepage.</p>
        <a class="bb-btn" href="/">Back to Homepage</a>
      </div>
    {:else}
      <section class="bb-section-header">
        <h1 class="bb-section-header__title">{data.categoryLabel} Specifications</h1>
        <span class="u-text-sm u-text-muted">
          {Number(data.totalInCategory).toLocaleString()} verified articles in category database
        </span>
      </section>
      <div class="bb-grid">
        {#each data.articles as card, idx (card.slug + '-' + idx)}
          <ArticleCard {card} index={idx} />
        {/each}
      </div>
    {/if}
  </div>
</main>
