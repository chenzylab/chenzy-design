<script lang="ts">
  // 严格对齐 Semi「配置区域」第二个 demo：用 getConfigureItem 把任意受控组件
  // （这里用 Cascader）接入配置区 context——与 Semi `getConfigureItem(Cascader, {...})`
  // 同构的运行时 HOC（Svelte 组件本质是 (internals, props) => Exports 的函数，
  // 工厂函数原样转发 internals，见 get-configure-item.svelte.ts）。
  import { AIChatInput, Cascader, getConfigureItem } from '@chenzy-design/svelte';
  import type {
    AIChatInputConfigureValue,
    AIChatInputMessageContent,
    CascaderNode,
  } from '@chenzy-design/svelte';

  // Cascader 的 value/onChange 恰好匹配 getConfigureItem 默认的 valueKey/onKeyChangeFnName，
  // 无需传 opts（对齐 Semi demo 里 `getConfigureItem(Cascader, { className: '...' })`
  // 也只传了 className）。
  const CustomCascader = getConfigureItem(Cascader, {
    className: 'cd-ai-chat-input-cascader-configure',
  });

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
      <CustomCascader field="model" initValue={['GPT', 'GPT-4o']} treeData={cascaderModelOptions} />
    {/snippet}
  </AIChatInput>
  <p style="margin-top: 12px; color: var(--cd-color-text-2);">
    发送时的 setup：{JSON.stringify(setup)}
  </p>
</div>

<style>
  /* 严格对齐 Semi src/styles/docDemo.scss 的 .aiChatInput-cascader-configure——这是官网
     文档站自己的样式补丁（docDemo 命名即"文档演示专属样式"），不属于组件库/story 打包
     产物，也不属于 Cascader 组件本体。packages/semi-ui/aiChatInput/_story/stories.scss
     里同名选择器是旧版本、缺 padding-right 这条，docDemo.scss 才是官网线上实际生效、
     更新过的真源（真机 DevTools 核实）；本库没有独立的文档站补丁样式表，demo 文件自身
     的 <style> 块承担等价角色，故落在此处而非组件库/Cascader 组件内，不需要挪动位置。
     hover/focus 态官网版本已注释掉 background-color 覆盖，同步不再声明。
     圆角 border-radius: 9999px 不跟随 AIChatInput 的 round prop 联动（Semi 原样式硬编码）。
     Cascader.svelte 内 .cd-cascader 的圆角是 scoped 单类声明，与此处单类 :global()
     选择器特异性打平、源码顺序判定下未生效（同 RadioGroup round 那次踩过的坑）——
     用 !important 稳定压过。 */
  :global(.cd-ai-chat-input-cascader-configure) {
    border: 1px solid var(--cd-color-border) !important;
    background: var(--cd-color-bg-0) !important;
    border-radius: 9999px !important;
    font-weight: 600;
  }

  :global(.cd-ai-chat-input-cascader-configure .cd-cascader-selection) {
    padding-right: 0;
    color: var(--cd-color-text-1);
  }

  :global(.cd-ai-chat-input-cascader-configure:hover),
  :global(.cd-ai-chat-input-cascader-configure.cd-cascader-focus:hover),
  :global(.cd-ai-chat-input-cascader-configure:focus:not(.cd-cascader-disabled)) {
    border-color: var(--cd-color-border) !important;
  }
</style>
