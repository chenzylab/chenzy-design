<script lang="ts">
  import { TagInput, Button, Space } from '@chenzy-design/svelte';

  let ref = $state<ReturnType<typeof TagInput> | undefined>(undefined);
</script>

<Space vertical align="start" style="width: 320px">
  <Space>
    <Button size="small" onclick={() => ref?.focus()}>聚焦</Button>
    <Button size="small" type="tertiary" onclick={() => ref?.blur()}>失焦</Button>
  </Space>
  <TagInput
    bind:this={ref}
    defaultValue={['svelte', 'vite']}
    placeholder="点击上方按钮聚焦 / 失焦"
  />
</Space>
