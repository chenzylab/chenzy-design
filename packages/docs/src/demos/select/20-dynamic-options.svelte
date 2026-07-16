<script lang="ts">
  import { Select, Button, Space } from '@chenzy-design/svelte';

  let optionList = $state([
    { label: '选项 1', value: 1 },
    { label: '选项 2', value: 2 },
  ]);
  let val = $state<string | number | undefined>(undefined);

  function addOption() {
    const next = optionList.length + 1;
    optionList = [...optionList, { label: `选项 ${next}`, value: next }];
  }
  function resetOptions() {
    optionList = [
      { label: '选项 1', value: 1 },
      { label: '选项 2', value: 2 },
    ];
  }
</script>

<Space vertical align="start">
  <Space>
    <Button size="small" onclick={addOption}>新增选项</Button>
    <Button size="small" type="tertiary" onclick={resetOptions}>重置</Button>
  </Space>
  <div style="width:240px">
    <Select {optionList} value={val} onChange={(v) => (val = v as string | number)} placeholder="动态选项" />
  </div>
</Space>
