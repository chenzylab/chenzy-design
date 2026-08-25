<!--
  AIChatInputConfigureRadioButton — 配置区单选按钮组字段（阶段 4，对齐 Semi Configure.RadioButton）。
  用 field 绑定，包裹项目 RadioGroup（type='button'）。放在 renderConfigureArea 里使用。
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import { RadioGroup } from '../radio/index.js';
  import { getConfigureContext } from './configure-context.js';
  import type { RadioValue, RadioChangeEvent } from '../radio/context.js';

  interface Props {
    /** 绑定的配置字段名。 */
    field: string;
    /** 初始值（注册到配置区，不触发 onConfigureChange）。 */
    initValue?: RadioValue;
    /** 单选项（透传给 RadioGroup）。 */
    options?: unknown[];
    /** 附加变更回调。 */
    onChange?: ((value: RadioValue) => void) | undefined;
    /** 附加类名（与组件固有类名合并，对齐 Semi getConfigureItem 的 cls 合并）。 */
    class?: string;
    /** 其余透传给 RadioGroup。 */
    [key: string]: unknown;
  }

  let { field, initValue, options, onChange, class: className, ...rest }: Props = $props();

  // Semi getConfigureItem 把 opts.className 与调用方 className 合并后传给内层组件。
  const cls = $derived(
    ['cd-ai-chat-input-footer-configure-radio-button', className].filter(Boolean).join(' '),
  );

  const ctx = getConfigureContext();

  // untrack：切断对 configureValue 的追踪，避免 setField 写主组件 state → snippet 重渲染 → 自循环。
  $effect(() => {
    untrack(() => {
      if (initValue !== undefined) ctx?.setField({ [field]: initValue }, true);
    });
    return () => untrack(() => ctx?.removeField(field));
  });

  const value = $derived(ctx?.getValue()[field] as RadioValue | undefined);

  function handleChange(e: RadioChangeEvent): void {
    const v = e.target.value;
    if (v === undefined) return;
    ctx?.setField({ [field]: v });
    onChange?.(v);
  }
</script>

<RadioGroup
  {...rest}
  class={cls}
  type="button"
  options={options as never}
  {...(value !== undefined ? { value } : {})}
  onChange={handleChange}
/>

<style>
  /* 逐条对齐 Semi aiChatInput.scss:296-308：单选按钮的高/内距/字号 +
     选中态前景/底色。本库此前只挂了类名（上一轮补的），一条样式都没接。
     RadioGroup 的内部节点 class 在子组件里，故走 :global。
     Semi 未声明 box-sizing，走默认 content-box：height:16px 是内容区，padding 向外
     撑大（对齐 &-attachment 等同类盒模型问题；此选择器限定在 AIChatInput 配置区内，
     不影响独立使用的 RadioGroup）。 */
  :global(.cd-ai-chat-input-footer-configure-radio-button .cd-radio-addon-buttonRadio) {
    box-sizing: content-box;
    height: var(--cd-height-ai-chat-input-footer-configure-radio-button);
    padding: var(--cd-spacing-ai-chat-input-footer-configure-radio-button-padding);
    font-size: var(--cd-font-ai-chat-input-footer-configure-radio-button-fontsize);
  }

  :global(
    .cd-ai-chat-input-footer-configure-radio-button .cd-radio-addon-buttonRadio-checked
  ) {
    color: var(--cd-color-ai-chat-input-footer-configure-radio-button-checked);
    background: var(--cd-color-ai-chat-input-footer-configure-radio-button-checked-bg);
  }

</style>
