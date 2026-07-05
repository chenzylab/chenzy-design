<script lang="ts">
  import {
    AIChatInput,
    AIChatInputConfigureSelect,
    AIChatInputConfigureButton,
    AIChatInputConfigureMcp,
  } from '@chenzy-design/svelte';
  import type {
    AIChatInputConfigureValue,
    AIChatInputMessageContent,
  } from '@chenzy-design/svelte';

  // renderConfigureArea 放配置项（Select 选模型 + Button 开关联网/深度思考），
  // 经 configure context 用 field 绑定；发送时配置值并入 MessageContent.setup。
  const modelOptions = [
    { label: 'GPT-5', value: 'gpt-5' },
    { label: 'Opus 4.8', value: 'opus-4-8' },
  ];
  const mcpOptions = [
    { label: '文件系统', value: 'fs' },
    { label: '数据库', value: 'db' },
    { label: '浏览器', value: 'browser' },
  ];
  let setup = $state<AIChatInputConfigureValue>({});

  function handleSend(message: AIChatInputMessageContent): void {
    setup = message.setup ?? {};
  }
</script>

<div style="max-width: 600px;">
  <AIChatInput
    defaultContent="<p>介绍一下这个库</p>"
    configureDefaultValue={{ model: 'gpt-5' }}
    onMessageSend={handleSend}
  >
    {#snippet renderConfigureArea()}
      <AIChatInputConfigureSelect field="model" options={modelOptions} style="width: 130px;" />
      <AIChatInputConfigureButton field="web">联网</AIChatInputConfigureButton>
      <AIChatInputConfigureButton field="think">深度思考</AIChatInputConfigureButton>
      <AIChatInputConfigureMcp field="mcp" options={mcpOptions} />
    {/snippet}
  </AIChatInput>
  <p style="margin-top: 12px; color: var(--cd-color-text-2);">
    发送时的 setup：{JSON.stringify(setup)}
  </p>
</div>
