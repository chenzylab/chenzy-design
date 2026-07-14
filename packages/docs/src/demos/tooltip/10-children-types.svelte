<script lang="ts">
  import { Tooltip, Space, Button, Tag } from '@chenzy-design/svelte';

  // Tooltip 需将事件监听与定位应用到 children，故 children 应能承载事件、可被定位：
  // 真实 DOM 节点（span/div…）、可透传属性的组件（Button/Tag…）皆可。
</script>

<Space>
  <Tooltip content="semi design">
    <span style="border: 2px solid var(--cd-color-border); padding: 0 4px; border-radius: 4px;">
      DOM 节点
    </span>
  </Tooltip>
  <Tooltip content="semi design">
    <Button>组件 Button</Button>
  </Tooltip>
  <Tooltip content="semi design">
    <Tag>组件 Tag</Tag>
  </Tooltip>
</Space>
