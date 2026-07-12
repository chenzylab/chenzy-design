<script lang="ts">
  import { Dropdown, Button } from '@chenzy-design/svelte';
</script>

<!--
  基本用法：children 为触发器；render 用 Dropdown.Menu 组合 Dropdown.Title / Item / Divider。
  Item 支持 icon（前置图标）、disabled（禁用）、type（primary/secondary/tertiary/warning/danger 语义色）。
-->
<Dropdown position="bottomStart">
  <Button type="tertiary">Hover Me ▾</Button>

  {#snippet render()}
    <Dropdown.Menu>
      <Dropdown.Title>分组 1</Dropdown.Title>
      <Dropdown.Item key="box" onClick={() => console.log('Menu Item 1')}>
        {#snippet icon()}{@render boxIcon()}{/snippet}
        Menu Item 1
        <span class="demo-kbd">Ctrl B</span>
      </Dropdown.Item>
      <Dropdown.Item key="setting">
        {#snippet icon()}{@render settingIcon()}{/snippet}
        Menu Item 2
        <span class="demo-kbd">Ctrl V</span>
      </Dropdown.Item>
      <Dropdown.Item key="forward" disabled>
        {#snippet icon()}{@render forwardIcon()}{/snippet}
        Menu Item 3
        <span class="demo-kbd">Ctrl F3</span>
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Title>分组 2</Dropdown.Title>
      <Dropdown.Item key="refresh" type="tertiary">
        {#snippet icon()}{@render refreshIcon()}{/snippet}
        tertiary
      </Dropdown.Item>
      <Dropdown.Item key="search" type="warning">
        {#snippet icon()}{@render searchIcon()}{/snippet}
        warning
      </Dropdown.Item>
      <Dropdown.Item key="alert" type="danger">
        {#snippet icon()}{@render alertIcon()}{/snippet}
        danger
      </Dropdown.Item>
    </Dropdown.Menu>
  {/snippet}
</Dropdown>

{#snippet boxIcon()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 8v8l-9 5-9-5V8l9-5 9 5Z M3 8l9 5 9-5 M12 13v8" /></svg>
{/snippet}
{#snippet settingIcon()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1Z" /></svg>
{/snippet}
{#snippet forwardIcon()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M13 5l7 7-7 7 M4 12h16" /></svg>
{/snippet}
{#snippet refreshIcon()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7L21 8 M21 4v4h-4" /></svg>
{/snippet}
{#snippet searchIcon()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></svg>
{/snippet}
{#snippet alertIcon()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5 M12 16h.01" /></svg>
{/snippet}

<style>
  .demo-kbd {
    margin-left: 20px;
    font-size: 12px;
    color: var(--cd-color-text-2);
  }
</style>
