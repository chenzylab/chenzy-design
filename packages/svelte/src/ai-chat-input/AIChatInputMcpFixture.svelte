<!--
  测试夹具：AIChatInput + renderConfigureArea（放一个 ConfigureMcp 多选字段）。
  验证 Mcp 选中集经 configure context 写回、发送并入 setup。仅测试用，不导出。
-->
<script lang="ts">
  import AIChatInput from './AIChatInput.svelte';
  import AIChatInputConfigureMcp from './AIChatInputConfigureMcp.svelte';
  import type { AIChatInputMessageContent } from '@chenzy-design/core';

  interface Props {
    onMessageSend?: (m: AIChatInputMessageContent) => void;
    initValue?: string[] | undefined;
  }
  let { onMessageSend, initValue }: Props = $props();

  const options = [
    { label: '文件系统', value: 'fs' },
    { label: '数据库', value: 'db' },
  ];
</script>

<AIChatInput defaultContent="<p>hi</p>" {onMessageSend}>
  {#snippet renderConfigureArea()}
    <AIChatInputConfigureMcp field="mcp" {options} {initValue} />
  {/snippet}
</AIChatInput>
