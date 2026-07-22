<!--
  FilterDropdownHost — 为 Table 自定义筛选项（renderFilterDropdownItem 渲染的 Dropdown.Item）
  提供 DROPDOWN_CTX，使 filterDropdownProps.showTick 生效（选中项左侧显示对勾），对齐 Semi。
  仅在筛选浮层内包裹，setContext 局限于该子树。
-->
<script lang="ts">
  import { setContext, type Snippet } from 'svelte';
  import { DROPDOWN_CTX, type DropdownContext } from '../dropdown/context.js';

  let {
    showTick = false,
    children,
  }: { showTick?: boolean; children: Snippet } = $props();

  setContext<DropdownContext>(DROPDOWN_CTX, {
    get showTick() {
      return showTick;
    },
    level: 1,
  });
</script>

{@render children()}
