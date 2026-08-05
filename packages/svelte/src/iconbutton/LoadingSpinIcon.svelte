<!--
  LoadingSpinIcon — 严格对齐 Semi spin/icon.tsx。
  渐变描边圆弧（<linearGradient> 由透明到 currentColor），非纯色圆环。
  SSR/hydration 稳定性对齐 Semi 策略：首次渲染（含 SSR）用固定 fallback id，
  挂载后（仅客户端）换成实例唯一 id，避免同页多个 Button loading 时 id 冲突
  又不引入 hydration mismatch。
-->
<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    class?: string;
    [key: string]: unknown;
  }

  let { class: className, ...rest }: Props = $props();

  const fallbackId = 'cd-button-loading-gradient';
  let gradientId = $state(fallbackId);

  onMount(() => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ';
    let unique = '';
    for (let i = 0; i < 7; i++) {
      unique += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    gradientId = `cd-button-loading-gradient-${unique}`;
  });
</script>

<svg
  {...rest}
  class={className}
  width="48"
  height="48"
  viewBox="0 0 36 36"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
  data-icon="spin"
>
  <defs>
    <linearGradient x1="0%" y1="100%" x2="100%" y2="100%" id={gradientId}>
      <stop stop-color="currentColor" stop-opacity="0" offset="0%" />
      <stop stop-color="currentColor" stop-opacity="0.50" offset="39.9430698%" />
      <stop stop-color="currentColor" offset="100%" />
    </linearGradient>
  </defs>
  <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <rect fill-opacity="0.01" fill="none" x="0" y="0" width="36" height="36" />
    <path
      d="M34,18 C34,9.163444 26.836556,2 18,2 C11.6597233,2 6.18078805,5.68784135 3.59122325,11.0354951"
      stroke={`url(#${gradientId})`}
      stroke-width="4"
      stroke-linecap="round"
    />
  </g>
</svg>
