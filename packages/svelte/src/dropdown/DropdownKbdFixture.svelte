<!--
  仅供 Dropdown.kbd.test.ts（browser project）使用的菜单 roving + Esc 键盘 e2e 夹具。
  对齐重写后的 Dropdown API：触发器是默认 children（span.cd-dropdown-trigger，无 role=button），
  浮层内容用 render snippet（Dropdown.Menu + 3 个 Dropdown.Item）。trigger='click'：
  Enter/Space/ArrowDown 打开菜单，ArrowDown 打开并把真实焦点送到首个 menuitem。
  keepDOM 默认 false：关闭即卸载浮层（{#if} 移除），便于断言「菜单消失」。
  验证：打开后 ↑↓ 真实移动焦点到相邻 menuitem；Esc 关闭浮层并复位 aria-expanded。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Dropdown } from './index.js';
</script>

<LocaleProvider locale="en_US">
  <Dropdown trigger="click">
    <button type="button" data-testid="trigger-label">Actions</button>
    {#snippet render()}
      <Dropdown.Menu>
        <Dropdown.Item key="edit">Edit</Dropdown.Item>
        <Dropdown.Item key="dup">Duplicate</Dropdown.Item>
        <Dropdown.Item key="del">Delete</Dropdown.Item>
      </Dropdown.Menu>
    {/snippet}
  </Dropdown>
</LocaleProvider>
