<script lang="ts">
  import { Space, Button, Tag } from '@chenzy-design/svelte';

  const boxStyle =
    'width:80px;height:100px;display:flex;align-items:center;justify-content:center;border:1px solid var(--cd-color-border);border-radius:3px;';
  const aligns = ['start', 'center', 'end', 'baseline'] as const;
</script>

<Space vertical spacing="loose">
  {#each aligns as align (align)}
    <Space {align}>
      <div style={boxStyle}>{align}</div>
      <Button theme="solid" type="primary">按钮</Button>
      <Tag color="green" size="large">标签</Tag>
    </Space>
  {/each}
</Space>
