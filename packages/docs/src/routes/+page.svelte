<script lang="ts">
  import { base } from '$app/paths';
  import componentsJson from '@chenzy-design/svelte/components.json';
</script>

<svelte:head>
  <title>chenzy-design</title>
</svelte:head>

<h1>chenzy-design</h1>
<p>基于 Svelte 5 的企业级组件库，对标 Semi Design。</p>
<p>共 {componentsJson.count} 个组件。</p>
<a href="{base}/components">浏览所有组件 →</a>
