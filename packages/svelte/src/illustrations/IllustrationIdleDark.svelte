<!--
  IllustrationIdleDark — 对齐 @douyinfe/semi-illustrations 的 IllustrationIdleDark。
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
  <ellipse cx="100" cy="168" rx="70" ry="10" fill="#2E3238" /><circle cx="100" cy="94" r="52" fill="#3A4048" /><path d="M112 70a30 30 0 1 0 18 46 24 24 0 0 1-18-46z" fill="#3B7DFF" /><circle cx="86" cy="80" r="3" fill="#FFAE4D" /><circle cx="120" cy="118" r="2.5" fill="#FFAE4D" />
</svg>
