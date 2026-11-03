<script lang="ts">
  import type { SeoPayload } from '$lib/seo/seoBuilder';

  export let seo: SeoPayload;
  export let origin: string;

  $: schemaJson = seo.jsonLdSchema
    ? `<script id="json-ld-schema" type="application/ld+json">${JSON.stringify(seo.jsonLdSchema)}<\/script>`
    : '';
  $: breadcrumbJson = seo.jsonLdBreadcrumb
    ? `<script id="json-ld-breadcrumb" type="application/ld+json">${JSON.stringify(seo.jsonLdBreadcrumb)}<\/script>`
    : '';
</script>

<svelte:head>
  <title id="page-title">{seo.title}</title>
  <link id="canonical-url" rel="canonical" href={seo.canonical}>
  <meta id="meta-robots" name="robots" content={seo.robots}>
  <meta id="meta-seo" name="description" content={seo.description}>

  {#if seo.includePubSubHub}
    <link id="pubsub-hub-link" rel="hub" href="https://pubsubhubbub.appspot.com/">
  {/if}
  <link id="atom-feed-link" rel="alternate" type="application/atom+xml" title="Atom 1.0 Syndication Feed" href="{origin}/atom.xml">

  {#if schemaJson}
    {@html schemaJson}
  {/if}
  {#if breadcrumbJson}
    {@html breadcrumbJson}
  {/if}
</svelte:head>
