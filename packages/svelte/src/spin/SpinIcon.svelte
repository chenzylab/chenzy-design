<!--
  SpinIcon — 对应 Semi semi-ui/spin/icon.tsx，独立拆分文件（Semi 亦拆 icon.tsx + index.tsx）。
  渐变弧 SVG：linearGradient id 必须跨实例唯一（url(#id) 引用，同 id 多实例会互相干扰）。
  SSR 安全策略同 Semi 注释：首次渲染（含 SSR）用稳定 fallback id 保持 markup 一致，
  挂载后（client-only $effect）换成 useId() 生成的实例唯一 id，避免 hydration mismatch。
-->
<script lang="ts">
  import { useId } from '@chenzy-design/core';

  interface Props {
    class?: string;
  }

  let { class: className }: Props = $props();

  const fallbackId = 'linearGradient-cd-spin';
  let gradientId = $state(fallbackId);

  $effect(() => {
    gradientId = useId('linearGradient-cd-spin-gradient');
  });
</script>

<svg
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
      <stop stop-color="currentColor" stop-opacity="0.5" offset="39.9430698%" />
      <stop stop-color="currentColor" offset="100%" />
    </linearGradient>
  </defs>
  <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <rect fill-opacity="0.01" fill="none" x="0" y="0" width="36" height="36" />
    <path
      d="M34,18 C34,9.163444 26.836556,2 18,2 C11.6597233,2 6.18078805,5.68784135 3.59122325,11.0354951"
      stroke="url(#{gradientId})"
      stroke-width="4"
      stroke-linecap="round"
    />
  </g>
</svg>
