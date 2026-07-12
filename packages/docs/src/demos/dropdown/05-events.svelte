<script lang="ts">
  import { Dropdown, Button, Toast } from '@chenzy-design/svelte';
</script>

<!--
  触发事件：菜单项支持 onClick / onMouseEnter / onMouseLeave / onContextMenu 四类鼠标事件。
-->
<Dropdown trigger="click" position="bottomStart">
  <Button type="tertiary">Click Me ▾</Button>

  {#snippet render()}
    <Dropdown.Menu>
      <Dropdown.Item key="1" onClick={() => Toast.info('You clicked me!')}>
        1: click me!
      </Dropdown.Item>
      <Dropdown.Item key="2" onMouseEnter={() => Toast.info('Nice to meet you!')}>
        2: mouse enter
      </Dropdown.Item>
      <Dropdown.Item key="3" onMouseLeave={() => Toast.info('See ya!')}>
        3: mouse leave
      </Dropdown.Item>
      <Dropdown.Item key="4" onContextMenu={() => Toast.info('Right clicked!')}>
        4: right click
      </Dropdown.Item>
    </Dropdown.Menu>
  {/snippet}
</Dropdown>
