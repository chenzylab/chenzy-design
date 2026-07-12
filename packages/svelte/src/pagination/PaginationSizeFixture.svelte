<!--
  仅供 Pagination.kbd.test.ts（browser project）使用的 pageSize 切换夹具。
  验证 changePageSize 的页码重算：
    - 默认按「当前页首条数据位置」重算 currentPage；
    - preventPageChangeOnPageSizeChange=true 时保持 current（仅钳入合法范围）。
  夹具暴露 onChange 收到的 (page, size) 到 data-testid，供测试断言。
  非受控（不传 currentPage/pageSize）：内部状态自行推进，onChange 上报解析后的值。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Pagination from './Pagination.svelte';

  interface Props {
    prevent?: boolean;
  }
  let { prevent = false }: Props = $props();

  let lastPage = $state<number | null>(null);
  let lastSize = $state<number | null>(null);
</script>

<LocaleProvider locale="en_US">
  <Pagination
    total={200}
    defaultCurrentPage={5}
    defaultPageSize={10}
    showSizeChanger
    preventPageChangeOnPageSizeChange={prevent}
    onChange={(p, s) => {
      lastPage = p;
      lastSize = s;
    }}
  />
  <output data-testid="last-page">{lastPage ?? ''}</output>
  <output data-testid="last-size">{lastSize ?? ''}</output>
</LocaleProvider>
