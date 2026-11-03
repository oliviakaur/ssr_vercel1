<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';

  export let data;
</script>

<Header siteTitle={data.siteTitle} currentQuery={data.currentQuery} />

<slot />

<Footer siteTitle={data.siteTitle} origin={data.origin} />
