<!--
  SplitTagGroup a11y 测试夹具：自带 LocaleProvider（子 Tag closable 走 i18n）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import SplitTagGroup from './SplitTagGroup.svelte';
  import Tag from './Tag.svelte';

  interface Props {
    ariaLabel?: string;
  }
  let { ariaLabel = 'Status' }: Props = $props();
</script>

<LocaleProvider locale="en_US">
  <SplitTagGroup {ariaLabel}>
    <Tag>Pending</Tag>
    <Tag>Active</Tag>
    <Tag>Done</Tag>
  </SplitTagGroup>
</LocaleProvider>
