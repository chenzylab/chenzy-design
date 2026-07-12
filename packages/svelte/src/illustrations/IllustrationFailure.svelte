<!--
  IllustrationFailure — 对齐 @douyinfe/semi-illustrations 的 IllustrationFailure。
  扁平多彩占位插画（浅色主题），默认 200x200，可经 style/class 覆盖尺寸。
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
  <ellipse cx="100" cy="168" rx="70" ry="10" fill="#F0F1F5" /><circle cx="100" cy="94" r="52" fill="#E4F0FF" /><circle cx="100" cy="94" r="34" fill="#FC5D5D" /><path d="M88 82l24 24M112 82l-24 24" stroke="#fff" stroke-width="6" stroke-linecap="round" />
</svg>
