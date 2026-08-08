<script lang="ts">
  // 严格对齐 Semi「配置区域」第二个 demo：用 getConfigureItem（本库对应
  // AIChatInputConfigureItem，render-prop 而非 React HOC，符合 Svelte 5 习惯）
  // 把任意受控组件（这里用 Cascader）接入配置区 context。
  import { AIChatInput, AIChatInputConfigureItem, Cascader } from '@chenzy-design/svelte';
  import type {
    AIChatInputConfigureValue,
    AIChatInputMessageContent,
    CascaderNode,
  } from '@chenzy-design/svelte';

  const cascaderModelOptions: CascaderNode[] = [
    {
      label: 'GPT',
      value: 'GPT',
      children: [
        { label: 'GPT-4o', value: 'GPT-4o' },
        { label: 'GPT-5', value: 'GPT-5' },
      ],
    },
    {
      label: 'Claude',
      value: 'Claude',
      children: [{ label: 'Claude 3.5 Sonnet', value: 'Claude 3.5 Sonnet' }],
    },
  ];

  let setup = $state<AIChatInputConfigureValue>({});

  function onConfigureChange(value: AIChatInputConfigureValue, changedValue: unknown): void {
    console.log('onConfigureChange', value, changedValue);
  }

  function onMessageSend(message: AIChatInputMessageContent): void {
    setup = message.setup ?? {};
  }
</script>

<div style="margin: 12px;">
  <AIChatInput placeholder="用于查看左下方配置项的用例" {onConfigureChange} {onMessageSend}>
    {#snippet renderConfigureArea()}
      <AIChatInputConfigureItem field="model" initValue={['GPT', 'GPT-4o']}>
        {#snippet children({ value, onChange })}
          <Cascader
            treeData={cascaderModelOptions}
            value={value as string[]}
            onChange={(v) => onChange(v)}
            class="cd-ai-chat-input-cascader-configure"
          />
        {/snippet}
      </AIChatInputConfigureItem>
    {/snippet}
  </AIChatInput>
  <p style="margin-top: 12px; color: var(--cd-color-text-2);">
    发送时的 setup：{JSON.stringify(setup)}
  </p>
</div>
