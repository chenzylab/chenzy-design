<script lang="ts">
  import { DatePicker, Space, Button } from '@chenzy-design/svelte';

  // 本库无静态方法，命令式能力经 export function + bind:this 暴露（对齐 Semi ref 用法）。
  let ref = $state<DatePicker>();

  const handleClickOutside = () => {
    console.log('click outside');
  };
</script>

<Space vertical align="start">
  <Space>
    <Button onclick={() => ref?.open()}>open</Button>
    <Button onclick={() => ref?.close()}>close</Button>
    <Button onclick={() => ref?.focus()}>focus</Button>
    <Button onclick={() => ref?.blur()}>blur</Button>
  </Space>
  <div>
    <DatePicker bind:this={ref} type="dateTime" onClickOutSide={handleClickOutside} />
  </div>
</Space>
