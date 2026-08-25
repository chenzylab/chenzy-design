<!--
  AIChatInputConfigureButton — 配置区开关按钮字段（阶段 4，对齐 Semi Configure.Button）。
  点击在 true/false 间切换，写回 value[field]；active 态用 aria-pressed + 类名标记。
  用于「联网 / 深度思考」等布尔开关。放在 AIChatInput 的 renderConfigureArea 里使用。

  Semi Configure.Button 内部真实复用 <Button theme='outline' type='tertiary' {...rest} />
  （configure/button.tsx），不是手写 <button>——padding/字重/交互态全部走 Button 组件基线。

  aiChatInput.scss 里默认态 `&-configure-button { border: ... primary色 }` 是单类选择器
  （特异性 0,1,0），打不过 Button 自身 `.semi-button-tertiary.semi-button-outline` 的默认
  边框声明（复合选择器，特异性 0,2,0）——真机验证 Semi 官方渲染确认默认态是 Button 的
  灰色描边，这条蓝色规则是从未生效过的死代码，不应对齐。激活态选择器多叠一层
  `-active.semi-button-tertiary.semi-button-outline`（0,3,0）才真正压过 Button 默认值，
  这条是真实生效的，予以保留。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { Button } from '../button/index.js';
  import { getConfigureContext } from './configure-context.js';

  interface Props {
    /** 绑定的配置字段名。 */
    field: string;
    /** 初始值（注册到配置区，不触发 onConfigureChange）。 */
    initValue?: boolean;
    /** 按钮文案。 */
    children?: Snippet;
    /** 前置图标（对齐 Semi Configure.Button 透传底层 Button 的 icon）。 */
    icon?: Snippet<[{ fill?: string | string[] | undefined }]>;
    /** 附加变更回调。 */
    onChange?: ((value: boolean) => void) | undefined;
    /** 禁用。 */
    disabled?: boolean;
    /** 附加类名（与组件固有类名合并，对齐 Semi getConfigureItem 的 cls 合并）。 */
    class?: string;
  }

  let {
    field,
    initValue,
    children,
    icon,
    onChange,
    disabled = false,
    class: className,
  }: Props = $props();

  const ctx = getConfigureContext();

  // untrack：切断对 configureValue 的追踪，避免 setField 写主组件 state → snippet 重渲染 → 自循环。
  $effect(() => {
    untrack(() => {
      if (initValue !== undefined) ctx?.setField({ [field]: initValue }, true);
    });
    return () => untrack(() => ctx?.removeField(field));
  });

  const active = $derived(!!ctx?.getValue()[field]);

  const cls = $derived(
    [
      'cd-ai-chat-input-footer-configure-button',
      active && 'cd-ai-chat-input-footer-configure-button-active',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  function handleClick(): void {
    const next = !active;
    ctx?.setField({ [field]: next });
    onChange?.(next);
  }
</script>

<Button
  theme="outline"
  type="tertiary"
  class={cls}
  aria-pressed={active}
  {disabled}
  onclick={handleClick}
  {...icon ? { icon } : {}}
>
  {#if children}{@render children()}{/if}
</Button>

<style>
  /* 默认态不覆盖 border——padding/字重/边框色/hover 全部走 Button(tertiary+outline) 基线
     （灰色描边，真机核对 Semi 官方渲染确认，aiChatInput.scss 里默认态那条蓝色 border
     规则因选择器特异性不足从未生效，见上方组件注释）。
     激活态选择器多叠一层 .cd-button-tertiary.cd-button-outline 才压过 Button 默认边框，
     这条是真实生效的样式，予以保留。 */
  :global(.cd-ai-chat-input-footer-configure-button-active) {
    border: var(--cd-width-ai-chat-input-footer-configure-button-border) solid
      var(--cd-color-ai-chat-input-footer-configure-button-border-active) !important;
    color: var(--cd-color-ai-chat-input-footer-configure-button-text) !important;
    background-color: var(--cd-color-primary-light-default) !important;
  }
</style>
