<script lang="ts">
  import { Dropdown, Tag } from '@chenzy-design/svelte';
  import type { ComponentProps } from 'svelte';

  type Position = NonNullable<ComponentProps<typeof Dropdown>['position']>;
  // 12 方位全集（语义对齐 Semi Tooltip 位置：bottomStart≈bottomLeft、rightStart≈rightTop）
  const positions: Position[] = [
    'top', 'topStart', 'topEnd',
    'bottom', 'bottomStart', 'bottomEnd',
    'left', 'leftStart', 'leftEnd',
    'right', 'rightStart', 'rightEnd',
  ];
</script>

<!-- 弹出位置：position 控制浮层相对触发器的方位，空间不足时自动翻转（autoAdjustOverflow）。 -->
<div style="display:flex; flex-wrap:wrap; gap:16px; padding:60px">
  {#each positions as position (position)}
    <Dropdown {position}>
      <Tag>{position}</Tag>

      {#snippet render()}
        <Dropdown.Menu>
          <Dropdown.Item key="1">Menu Item 1</Dropdown.Item>
          <Dropdown.Item key="2">Menu Item 2</Dropdown.Item>
          <Dropdown.Item key="3">Menu Item 3</Dropdown.Item>
        </Dropdown.Menu>
      {/snippet}
    </Dropdown>
  {/each}
</div>
