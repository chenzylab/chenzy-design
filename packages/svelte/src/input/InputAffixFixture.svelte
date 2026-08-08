<!--
  prefix/suffix 变体 fixture：验证「字符串=文案(-text) / Snippet=图标(-icon)」的 class 分派
  （对齐 Semi isString(suffix)→-suffix-text、isSemiIcon(suffix)→-suffix-icon）。
  两者水平外边距不同，直接决定 hover 时 suffix↔clearbtn 互换是否宽度守恒。
-->
<script lang="ts">
  import Input from './Input.svelte';

  let {
    iconSuffix = false,
    iconPrefix = false,
    hideSuffix = false,
    value = '',
  }: {
    iconSuffix?: boolean;
    iconPrefix?: boolean;
    hideSuffix?: boolean;
    value?: string;
  } = $props();
</script>

<Input
  aria-label="affix"
  {value}
  {hideSuffix}
  showClear
  suffix={iconSuffix ? iconSnippet : 'RMB'}
  prefix={iconPrefix ? iconSnippet : 'USD'}
/>

{#snippet iconSnippet()}
  <span class="fixture-icon" aria-hidden="true">◔</span>
{/snippet}
