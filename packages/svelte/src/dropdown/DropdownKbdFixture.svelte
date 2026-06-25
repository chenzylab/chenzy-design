<!--
  仅供 Dropdown.kbd.test.ts（browser project）使用的菜单 roving + Esc 键盘 e2e 夹具。
  trigger='click'（role=button），键盘可用 Enter/Space/ArrowDown 打开并聚焦首项；
  浮层菜单 portal 到 document.body（use:floating），role=menu + role=menuitem。
  destroyOnClose=true：关闭即 {#if} 卸载浮层，便于断言「菜单消失」。
  验证：打开后 ↑↓ 真实移动焦点到相邻 menuitem；Esc 关闭浮层并归还焦点触发器。
-->
<script lang="ts">
  import type { DropdownItem } from './types.js';
  import { LocaleProvider } from '../locale-provider/index.js';
  import Dropdown from './Dropdown.svelte';

  const items: DropdownItem[] = [
    { key: 'edit', label: 'Edit' },
    { key: 'dup', label: 'Duplicate' },
    { key: 'del', label: 'Delete' },
  ];
</script>

<LocaleProvider locale="en_US">
  <Dropdown {items} trigger="click" destroyOnClose>
    {#snippet triggerContent()}
      <span data-testid="trigger-label">Actions</span>
    {/snippet}
  </Dropdown>
</LocaleProvider>
