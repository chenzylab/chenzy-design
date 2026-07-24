<script lang="ts">
  import { Select, Button, Space } from '@chenzy-design/svelte';

  let ref = $state<ReturnType<typeof Select>>();

  const optionList = [
    { value: 'douyin', label: '抖音' },
    { value: 'ulikecam', label: '轻颜相机' },
    { value: 'jianying', label: '剪映' },
    { value: 'xigua', label: '西瓜视频' },
  ];
</script>

<Space vertical align="start">
  <Space>
    <Button onclick={() => ref?.open()}>open</Button>
    <Button onclick={() => ref?.close()}>close</Button>
    <Button onclick={() => ref?.focus()}>focus</Button>
    <Button onclick={() => ref?.selectAll()}>selectAll</Button>
    <Button onclick={() => ref?.deselectAll()}>deselectAll</Button>
  </Space>
  <Select bind:this={ref} multiple style="width: 320px" placeholder="命令式方法" {optionList} />
</Space>
