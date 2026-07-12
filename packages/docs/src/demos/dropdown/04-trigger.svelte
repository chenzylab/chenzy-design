<script lang="ts">
  import { Dropdown, Tag, Button } from '@chenzy-design/svelte';
</script>

<!--
  触发方式：默认 hover 移入触发；也可通过 focus 聚焦、click 点击、contextMenu 右键唤起。
-->
<div style="display:flex; flex-direction:column; gap:24px; align-items:flex-start; padding-bottom:40px">
  <Dropdown trigger="hover" position="bottomStart">
    <Tag>Hover me</Tag>
    {#snippet render()}
      <Dropdown.Menu>
        <Dropdown.Item key="1">Menu Item 1</Dropdown.Item>
        <Dropdown.Item key="2">Menu Item 2</Dropdown.Item>
        <Dropdown.Item key="3">Menu Item 3</Dropdown.Item>
      </Dropdown.Menu>
    {/snippet}
  </Dropdown>

  <Dropdown trigger="focus" position="bottomStart">
    <div class="demo-focus-box" tabindex="0" role="button">Please use Tab to focus this div</div>
    {#snippet render()}
      <Dropdown.Menu>
        <Dropdown.Item key="1">Menu Item 1</Dropdown.Item>
        <Dropdown.Item key="2">Menu Item 2</Dropdown.Item>
        <Dropdown.Item key="3">Menu Item 3</Dropdown.Item>
      </Dropdown.Menu>
    {/snippet}
  </Dropdown>

  <Dropdown trigger="click" position="bottomStart">
    <Button>Click me</Button>
    {#snippet render()}
      <Dropdown.Menu>
        <Dropdown.Item key="1">Menu Item 1</Dropdown.Item>
        <Dropdown.Item key="2">Menu Item 2</Dropdown.Item>
        <Dropdown.Item key="3">Menu Item 3</Dropdown.Item>
      </Dropdown.Menu>
    {/snippet}
  </Dropdown>

  <Dropdown trigger="contextMenu" position="bottomEnd">
    <Button theme="solid" type="secondary">Right click (ContextMenu)</Button>
    {#snippet render()}
      <Dropdown.Menu>
        <Dropdown.Item key="1">Menu Item 1</Dropdown.Item>
        <Dropdown.Item key="2">Menu Item 2</Dropdown.Item>
        <Dropdown.Item key="3">Menu Item 3</Dropdown.Item>
      </Dropdown.Menu>
    {/snippet}
  </Dropdown>
</div>

<style>
  .demo-focus-box {
    border: 1px solid var(--cd-color-border);
    border-radius: 4px;
    height: 36px;
    width: 220px;
    display: flex;
    align-items: center;
    padding: 0 8px;
    cursor: default;
  }
</style>
