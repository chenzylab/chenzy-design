<script lang="ts">
  import { Dropdown, Button } from '@chenzy-design/svelte';
</script>

<!--
  嵌套使用：在 render 内手动嵌套 <Dropdown>，其 children 为一个 Dropdown.Item 作为子菜单触发器
  （对齐 Semi 嵌套写法）。子 Dropdown 默认 hover 展开，position 控制子菜单方位（rightStart≈Semi rightTop）。
-->
<div style="margin: 40px 0">
  <Dropdown position="bottomStart">
    <Button type="tertiary">Hover Me ▾</Button>

    {#snippet render()}
      <Dropdown.Menu>
        <Dropdown position="rightStart">
          <Dropdown.Item key="1">Menu Item 1 ▸</Dropdown.Item>
          {#snippet render()}
            <Dropdown.Menu>
              <Dropdown.Item key="1-1">Nested Menu Item 1</Dropdown.Item>
              <Dropdown.Item key="1-2">Nested Menu Item 2</Dropdown.Item>
              <Dropdown.Item key="1-3">Nested Menu Item 3</Dropdown.Item>
            </Dropdown.Menu>
          {/snippet}
        </Dropdown>

        <Dropdown position="leftStart">
          <Dropdown.Item key="2">Menu Item 2 ▸</Dropdown.Item>
          {#snippet render()}
            <Dropdown.Menu>
              <Dropdown.Item key="2-1">Nested Menu Item 1</Dropdown.Item>
              <Dropdown.Item key="2-2">Nested Menu Item 2</Dropdown.Item>
              <Dropdown.Item key="2-3">Nested Menu Item 3</Dropdown.Item>
            </Dropdown.Menu>
          {/snippet}
        </Dropdown>

        <Dropdown.Item key="3">Menu Item 3</Dropdown.Item>
      </Dropdown.Menu>
    {/snippet}
  </Dropdown>
</div>
