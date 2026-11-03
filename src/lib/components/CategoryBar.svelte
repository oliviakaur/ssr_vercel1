<script lang="ts">
  import type { CategoryInfo } from '$lib/api/bunbunServer';

  export let categories: CategoryInfo[] = [];
  export let activeCategory = 'all';
</script>

{#if categories && categories.length > 0}
  <nav aria-label="Category Directory" class="bb-cat-bar" id="bb-category-bar">
    <div class="bb-container">
      <ul class="bb-cat-bar__list" id="bb-category-list">
        <li>
          <a class="bb-cat-pill {!activeCategory || activeCategory === 'all' ? 'bb-cat-pill--active' : ''}" href="/">
            All Categories
          </a>
        </li>
        {#each categories as cat (cat.category)}
          <li>
            <a
              class="bb-cat-pill {cat.category === activeCategory ? 'bb-cat-pill--active' : ''}"
              href="/category/{encodeURIComponent(cat.category)}"
            >
              {cat.label || cat.category}
              <span class="u-text-xs u-text-muted">({Number(cat.count || 0).toLocaleString()})</span>
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </nav>
{/if}
