<!--
  IllustrationConstructionDark — 对齐 @douyinfe/semi-illustrations 的 IllustrationConstructionDark。
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
  <ellipse cx="100" cy="168" rx="70" ry="10" fill="#2E3238" /><circle cx="100" cy="94" r="52" fill="#3A4048" /><path d="M70 108a30 30 0 0 1 60 0z" fill="#FFAE4D" /><rect x="64" y="108" width="72" height="10" rx="5" fill="#FFAE4D" /><rect x="96" y="66" width="8" height="16" rx="4" fill="#FFAE4D" />
</svg>
