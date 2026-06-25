<!--
  仅供 Pagination.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  total=30 / pageSize=10 → 3 个页码按钮（无省略号），页码组 roving（真实焦点）。
  前后各放按钮验证 Tab 进入只停靠单个页码、Tab 出去落到 after。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Pagination from './Pagination.svelte';
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Pagination total={30} defaultCurrentPage={1} pageSize={10} />
  <button type="button" data-testid="after">after</button>
</LocaleProvider>
