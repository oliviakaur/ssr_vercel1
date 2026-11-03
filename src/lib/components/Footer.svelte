<script lang="ts">
  export let siteTitle = 'Technical Reference';
  export let origin = '';
</script>

<footer class="bb-footer" role="contentinfo">
  <div class="bb-container u-flex u-flex-wrap u-items-center u-justify-between u-gap-md">
    <div>
      <strong>{siteTitle}</strong>
    </div>
    <div class="u-flex u-flex-wrap u-gap-md">
      <a href="/">Home</a>
      <a href="/sitemap">Sitemap</a>
      <a href="{origin}/atom.xml" rel="alternate" type="application/atom+xml">Atom.xml</a>
    </div>
  </div>
</footer>
