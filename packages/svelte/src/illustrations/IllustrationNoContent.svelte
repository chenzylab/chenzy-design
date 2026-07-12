<!--
  IllustrationNoContent — 对齐 @douyinfe/semi-illustrations 的 IllustrationNoContent。
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
  <ellipse cx="100" cy="168" rx="70" ry="10" fill="#F0F1F5" /><rect x="46" y="44" width="108" height="112" rx="8" fill="#E4F0FF" /><rect x="46" y="44" width="108" height="26" rx="8" fill="#C7E0FF" /><circle cx="59" cy="57" r="4" fill="#8FB8FF" /><circle cx="73" cy="57" r="4" fill="#8FB8FF" /><rect x="62" y="86" width="76" height="8" rx="4" fill="#BFD8F7" /><rect x="62" y="104" width="60" height="8" rx="4" fill="#D3E4F9" /><rect x="62" y="122" width="68" height="8" rx="4" fill="#D3E4F9" /><circle cx="132" cy="132" r="26" fill="#0064FA" /><path d="M132 122v20M122 132h20" stroke="#fff" stroke-width="4" stroke-linecap="round" />
</svg>
