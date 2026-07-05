<!--
  测试夹具：AIChatInput + renderConfigureArea（放一个 ConfigureButton 布尔字段）。
  用于验证配置区 context 绑定 —— 点击按钮切换字段值，发送时并入 MessageContent.setup。
  仅测试用，不对外导出。
-->
<script lang="ts">
  import AIChatInput from './AIChatInput.svelte';
  import AIChatInputConfigureButton from './AIChatInputConfigureButton.svelte';
  import type { AIChatInputConfigureValue, AIChatInputMessageContent } from '@chenzy-design/core';

  interface Props {
    onMessageSend?: (m: AIChatInputMessageContent) => void;
    onConfigureChange?: (v: AIChatInputConfigureValue, c: AIChatInputConfigureValue) => void;
  }
  let { onMessageSend, onConfigureChange }: Props = $props();
</script>

<AIChatInput
  defaultContent="<p>hi</p>"
  {onMessageSend}
  {onConfigureChange}
>
  {#snippet renderConfigureArea()}
    <AIChatInputConfigureButton field="web">联网</AIChatInputConfigureButton>
  {/snippet}
</AIChatInput>
