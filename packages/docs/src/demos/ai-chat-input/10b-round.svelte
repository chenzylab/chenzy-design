<script lang="ts">
  // 对齐 Semi「底部按钮形状」段：round 控制底部配置区/操作区按钮形状，
  // 默认 true（全圆角），设为 false 即方形按钮；配上 renderConfigureArea
  // 放 Select/Button/Mcp/RadioButton，才能真正看到 round 对配置区各按钮的效果。
  import {
    AIChatInput,
    Button,
    RadioGroup,
    Radio,
    AIChatInputConfigureSelect,
    AIChatInputConfigureButton,
    AIChatInputConfigureMcp,
    AIChatInputConfigureRadioButton,
  } from '@chenzy-design/svelte';
  import { IconBookOpenStroked, IconFeishuLogo, IconGit, IconFigma } from '@chenzy-design/icons';

  const uploadProps = { action: 'https://api.semi.design/upload' };
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

  let round = $state(false);
</script>

{#snippet iconFeishu()}<IconFeishuLogo />{/snippet}
{#snippet iconGit()}<IconGit />{/snippet}
{#snippet iconFigma()}<IconFigma />{/snippet}
{#snippet iconBookOpen()}<IconBookOpenStroked />{/snippet}

<div style="display: flex; flex-direction: column; gap: 12px;">
  <RadioGroup
    aria-label="按钮形状"
    name="round-shape"
    value={round}
    onChange={(e) => (round = !!e.target.value)}
  >
    <Radio value={true}>圆形</Radio>
    <Radio value={false}>方形</Radio>
  </RadioGroup>

  <div style="margin: 12px;">
    <AIChatInput placeholder="下方按钮为方形的用例" {round} {uploadProps}>
      {#snippet renderConfigureArea()}
        <AIChatInputConfigureSelect
          field="model"
          options={modelOptions}
          initValue="gpt-4o"
          style="width: 130px;"
        />
        <AIChatInputConfigureButton field="onlineSearch" icon={iconBookOpen}>联网搜索</AIChatInputConfigureButton>
        <AIChatInputConfigureMcp field="mcp" options={mcpOptions} />
        <AIChatInputConfigureRadioButton field="thinkType" options={radioButtonProps} initValue="fast" />
      {/snippet}
    </AIChatInput>
  </div>
</div>
