<script lang="ts">
  export let siteTitle = 'Technical Reference';
  export let currentQuery = '';
  export let searchAction = '/';

  function toggleTheme() {
    if (typeof document === 'undefined') return;
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('bb_theme', next);
    } catch {}
  }
</script>

<header class="bb-header" role="banner">
  <div class="bb-container bb-header__inner">
    <a class="bb-brand" href="/">
      <span class="bb-brand__badge">SPEC</span>
      <span id="bb-site-name">{siteTitle}</span>
    </a>

    <form action={searchAction} class="bb-search" id="bb-search-form" method="get" role="search">
      <input
        aria-label="Search technical specifications"
        class="bb-search__input"
        id="bb-search-input"
        name="q"
        placeholder="Search specs, sensors, diagrams..."
        type="search"
        value={currentQuery}
      >
      <button class="bb-btn" type="submit">Search</button>
    </form>

    <div class="u-flex u-items-center u-gap-xs">
      <a class="bb-btn bb-btn--outline" href="/sitemap">Sitemap</a>
      <button aria-label="Toggle dark mode" class="bb-btn bb-btn--outline" id="bb-theme-btn" on:click={toggleTheme} type="button">
        Theme
      </button>
    </div>
  </div>
</header>
