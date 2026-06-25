<!--
  Dropdown a11y 测试夹具：在 LocaleProvider 内渲染 Dropdown，仅传 items（不传 children）。
  说明：LocaleHarness 总会注入一个 children 插槽，会命中 Dropdown 的 {#if children}
  分支而跳过 items 渲染，故这里直接包 LocaleProvider 渲染、不经 harness。
  仅供 Dropdown.a11y.test.ts 使用，不对外导出。
-->
<script lang="ts">
  import type { DropdownItem } from './types.js';
  import { LocaleProvider } from '../locale-provider/index.js';
  import Dropdown from './Dropdown.svelte';

  interface Props {
    items?: DropdownItem[];
    open?: boolean;
    trigger?: 'hover' | 'click' | 'contextMenu';
    locale?: string;
  }

  let { items = [], open = false, trigger = 'click', locale = 'en_US' }: Props = $props();
</script>

<LocaleProvider {locale}>
  <Dropdown {items} {open} {trigger} />
</LocaleProvider>
