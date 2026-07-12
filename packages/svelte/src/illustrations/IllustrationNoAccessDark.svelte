<!--
  IllustrationNoAccessDark — 对齐 @douyinfe/semi-illustrations 的 IllustrationNoAccessDark。
  扁平多彩占位插画（暗色主题），默认 200x200，可经 style/class 覆盖尺寸。
-->
<script lang="ts">
  interface Props {
    class?: string;
    style?: string;
  }
  let { class: className = '', style = '' }: Props = $props();
</script>

<svg
  class={className}
  {style}
  width="200"
  height="200"
  viewBox="0 0 200 200"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
  focusable="false"
>
  <ellipse cx="100" cy="168" rx="70" ry="10" fill="#2E3238" /><circle cx="100" cy="94" r="52" fill="#3A4048" /><rect x="78" y="92" width="44" height="34" rx="6" fill="#3B7DFF" /><path d="M86 92v-8a14 14 0 0 1 28 0v8" stroke="#3B7DFF" stroke-width="6" fill="none" stroke-linecap="round" /><circle cx="100" cy="106" r="4" fill="#fff" /><rect x="98" y="108" width="4" height="10" rx="2" fill="#fff" />
</svg>
