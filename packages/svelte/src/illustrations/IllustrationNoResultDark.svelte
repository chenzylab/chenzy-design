<!--
  IllustrationNoResultDark — 对齐 @douyinfe/semi-illustrations 的 IllustrationNoResultDark。
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
  <ellipse cx="100" cy="168" rx="70" ry="10" fill="#2E3238" /><rect x="46" y="44" width="108" height="112" rx="8" fill="#3A4048" /><rect x="46" y="44" width="108" height="26" rx="8" fill="#454C55" /><circle cx="59" cy="57" r="4" fill="#5B6673" /><circle cx="73" cy="57" r="4" fill="#5B6673" /><rect x="62" y="86" width="76" height="8" rx="4" fill="#4A525C" /><rect x="62" y="104" width="60" height="8" rx="4" fill="#3F464F" /><rect x="62" y="122" width="68" height="8" rx="4" fill="#3F464F" /><circle cx="128" cy="126" r="20" fill="none" stroke="#3B7DFF" stroke-width="5" /><line x1="143" y1="141" x2="156" y2="154" stroke="#3B7DFF" stroke-width="6" stroke-linecap="round" />
</svg>
