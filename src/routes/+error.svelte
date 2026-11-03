<script lang="ts">
  import { page } from '$app/stores';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import { build404Seo } from '$lib/seo/seoBuilder';

  $: origin = $page.url.origin;
  $: siteTitle = $page.data?.siteTitle || $page.url.hostname || 'Technical Reference';
  $: seo = build404Seo(origin, siteTitle, $page.url.pathname);
</script>

<SeoHead {seo} {origin} />

<main class="bb-main" id="bb-main-root" role="main">
  <div class="bb-container" id="bb-viewport">
    <section class="bb-404-box" role="alert">
      <span class="bb-404-box__badge">HTTP {$page.status} &middot; PAGE NOT FOUND</span>
      <h1 class="u-mb-sm" style="font-size:1.75rem;font-weight:800;">Page Not Found</h1>
      <p class="u-text-muted u-mb-md">
        {$page.error?.message || 'The requested technical specification or category does not exist.'}
      </p>
      <div class="u-flex u-justify-between u-gap-sm" style="justify-content:center;">
        <a class="bb-btn" href="/">Return to Homepage</a>
        <a class="bb-btn bb-btn--outline" href="/sitemap">View Sitemap</a>
      </div>
    </section>
  </div>
</main>
