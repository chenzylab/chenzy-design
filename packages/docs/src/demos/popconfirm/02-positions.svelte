<script lang="ts">
  import { Popconfirm, Button, Text } from '@chenzy-design/svelte';

  let result = $state('（无）');

  const placements = [
    'top',
    'bottom',
    'left',
    'right',
    'topStart',
    'topEnd',
    'bottomStart',
    'bottomEnd',
  ] as const;
</script>

<div style="display:flex; gap:16px; padding:40px; flex-wrap:wrap">
  {#each placements as p (p)}
    <Popconfirm
      position={p}
      showArrow
      title="确认操作？"
      content={`弹出方向 position="${p}"。`}
      onConfirm={() => { result = `${p} 已确认`; }}
    >
      {#snippet trigger()}
        <Button>{p}</Button>
      {/snippet}
    </Popconfirm>
  {/each}
</div>

<Text type="tertiary">操作结果：{result}</Text>
