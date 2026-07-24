<script lang="ts">
  import { Dropdown, Button, HotKeys } from '@chenzy-design/svelte';
  import {
    IconBox,
    IconSetting,
    IconForward,
    IconRefresh,
    IconSearch,
    IconAlertCircle,
  } from '@chenzy-design/icons';
</script>

<!--
  基本用法：children 为触发器；render 用 Dropdown.Menu 组合 Dropdown.Title / Item / Divider。
  Item 支持 icon（前置图标）、disabled（禁用）、type（primary/secondary/tertiary/warning/danger 语义色）。
  快捷键用 HotKeys 组件展示（对齐 Semi）。
-->
<Dropdown position="bottomStart">
  <Button theme="outline" type="tertiary">Hover Me ▾</Button>

  {#snippet render()}
    <Dropdown.Menu>
      <Dropdown.Title>分组 1</Dropdown.Title>
      <Dropdown.Item key="box">
        {#snippet icon()}<IconBox />{/snippet}
        Menu Item 1
        <HotKeys
          style="margin-left:20px"
          hotKeys={[HotKeys.Keys.Control, HotKeys.Keys.B]}
          content={['Ctrl', 'B']}
        />
      </Dropdown.Item>
      <Dropdown.Item key="setting">
        {#snippet icon()}<IconSetting />{/snippet}
        Menu Item 2
        <HotKeys
          style="margin-left:20px"
          hotKeys={[HotKeys.Keys.Control, HotKeys.Keys.V]}
          content={['Ctrl', 'V']}
        />
      </Dropdown.Item>
      <Dropdown.Item key="forward" disabled>
        {#snippet icon()}<IconForward />{/snippet}
        Menu Item 3
        <HotKeys
          style="margin-left:20px"
          hotKeys={[HotKeys.Keys.Control, HotKeys.Keys.F3]}
          content={['Ctrl', 'F3']}
        />
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Title>分组 2</Dropdown.Title>
      <Dropdown.Item key="refresh" type="tertiary">
        {#snippet icon()}<IconRefresh />{/snippet}
        tertiary
      </Dropdown.Item>
      <Dropdown.Item key="search" type="warning">
        {#snippet icon()}<IconSearch />{/snippet}
        warning
      </Dropdown.Item>
      <Dropdown.Item key="alert" type="danger">
        {#snippet icon()}<IconAlertCircle />{/snippet}
        danger
      </Dropdown.Item>
    </Dropdown.Menu>
  {/snippet}
</Dropdown>
