<script lang="ts">
  import {
    AIChatInput,
    AIChatInputConfigureSelect,
    AIChatInputConfigureButton,
    AIChatInputConfigureMcp,
    AIChatInputConfigureRadioButton,
  } from '@chenzy-design/svelte';
  import { IconBookOpenStroked, IconFeishuLogo, IconGit, IconFigma } from '@chenzy-design/icons';
  import type {
    AIChatInputConfigureValue,
    AIChatInputMessageContent,
  } from '@chenzy-design/svelte';

  // renderConfigureArea 放配置项（Select 选模型 + Button 开关联网 + Mcp 多选服务
  // + RadioButton 思考模式），经 configure context 用 field 绑定；
  // 发送时配置值并入 MessageContent.setup（严格对齐 Semi「配置区域」ConfigureButton demo）。
  const modelOptions = [
    { label: 'GPT-5', value: 'gpt-5' },
    { label: 'GPT-4o', value: 'gpt-4o' },
    { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet' },
  ];
  const mcpOptions = [
    { icon: iconFeishu, label: '飞书文档', value: 'feishu' },
    { icon: iconGit, label: 'Github Mcp', value: 'github' },
    { icon: iconFigma, label: 'Figma Mcp', value: 'figma' },
  ];
  const radioButtonProps = [
    { label: '极速', value: 'fast' },
    { label: '思考', value: 'think' },
    { label: '超能', value: 'super' },
  ];
  let setup = $state<AIChatInputConfigureValue>({});

  function handleSend(message: AIChatInputMessageContent): void {
    setup = message.setup ?? {};
  }

  function onConfigureButtonClick(): void {
    console.log('onConfigureButtonClick');
  }

  function onConfigureChange(value: AIChatInputConfigureValue, changedValue: unknown): void {
    console.log('onConfigureChange', value, changedValue);
  }
</script>

{#snippet iconFeishu()}<IconFeishuLogo />{/snippet}
{#snippet iconGit()}<IconGit />{/snippet}
{#snippet iconFigma()}<IconFigma />{/snippet}
{#snippet iconBookOpen()}<IconBookOpenStroked />{/snippet}

<div style="margin: 12px;">
  <AIChatInput placeholder="用于查看左下方配置项的用例" {onConfigureChange} onMessageSend={handleSend}>
    {#snippet renderConfigureArea()}
      <AIChatInputConfigureSelect
        field="model"
        options={modelOptions}
        initValue="gpt-4o"
        style="width: 130px;"
      />
      <AIChatInputConfigureButton field="onlineSearch" icon={iconBookOpen}>联网搜索</AIChatInputConfigureButton>
      <AIChatInputConfigureMcp field="mcp" options={mcpOptions} {onConfigureButtonClick} showConfigure />
      <AIChatInputConfigureRadioButton field="thinkType" options={radioButtonProps} initValue="fast" />
    {/snippet}
  </AIChatInput>
  <p style="margin-top: 12px; color: var(--cd-color-text-2);">
    发送时的 setup：{JSON.stringify(setup)}
  </p>
</div>
