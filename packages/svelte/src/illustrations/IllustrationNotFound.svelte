<!--
  IllustrationNotFound — 对齐 @douyinfe/semi-illustrations 的 IllustrationNotFound。
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
  <ellipse cx="100" cy="168" rx="70" ry="10" fill="#F0F1F5" /><rect x="46" y="44" width="108" height="112" rx="8" fill="#E4F0FF" /><rect x="46" y="44" width="108" height="26" rx="8" fill="#C7E0FF" /><circle cx="59" cy="57" r="4" fill="#8FB8FF" /><circle cx="73" cy="57" r="4" fill="#8FB8FF" /><text x="100" y="132" font-size="46" font-weight="700" text-anchor="middle" fill="#FF9820" font-family="system-ui, sans-serif">?</text>
</svg>
