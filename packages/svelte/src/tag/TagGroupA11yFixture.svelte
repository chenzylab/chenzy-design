<!--
  TagGroup a11y 测试夹具：自带 LocaleProvider（+N aria-label 走 i18n），故测试直接 render 本夹具。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import TagGroup from './TagGroup.svelte';

  interface Props {
    props?: Record<string, unknown>;
  }
  let { props = {} }: Props = $props();

  const tagList = [
    { children: 'Alpha' },
    { children: 'Beta' },
    { children: 'Gamma' },
    { children: 'Delta' },
  ];
</script>

<LocaleProvider locale="en_US">
  <TagGroup {tagList} {...props} />
</LocaleProvider>
