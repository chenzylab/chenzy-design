<!--
  IllustrationNoContentDark — 对齐 @douyinfe/semi-illustrations 的 IllustrationNoContentDark。
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
  <ellipse cx="100" cy="168" rx="70" ry="10" fill="#2E3238" /><rect x="46" y="44" width="108" height="112" rx="8" fill="#3A4048" /><rect x="46" y="44" width="108" height="26" rx="8" fill="#454C55" /><circle cx="59" cy="57" r="4" fill="#5B6673" /><circle cx="73" cy="57" r="4" fill="#5B6673" /><rect x="62" y="86" width="76" height="8" rx="4" fill="#4A525C" /><rect x="62" y="104" width="60" height="8" rx="4" fill="#3F464F" /><rect x="62" y="122" width="68" height="8" rx="4" fill="#3F464F" /><circle cx="132" cy="132" r="26" fill="#3B7DFF" /><path d="M132 122v20M122 132h20" stroke="#fff" stroke-width="4" stroke-linecap="round" />
</svg>
