<!--
  仅供 OverflowList.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  mode='scroll'：不折叠，可见层（.cd-overflow-list__visible）成为可滚动容器，
  设 tabindex=0 + role=group + aria-label，键盘用户可聚焦后用方向键滚动（WCAG 2.1.1）。
  data-testid=before 用于 Tab 起跳。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import OverflowList from './OverflowList.svelte';

  const items = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <OverflowList {items} mode="scroll" ariaLabel="Tags">
    {#snippet item({ item }: { item: string; index: number })}
      <span>{item}</span>
    {/snippet}
  </OverflowList>
</LocaleProvider>
