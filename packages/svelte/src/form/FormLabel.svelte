<!--
  Form.Label — see specs/components/input/Form.spec.md
  独立标签组件，与 Field 内标签样式一致，可用于自定义布局。对齐 Semi label.tsx。
  DOM 严格镜像 Semi：<label class="cd-form-field-label ..."> > <div class="cd-form-field-label-text">
  （text + optional）+ 可选兄弟 <div class="cd-form-field-label-extra">。
  必填星标由 label-text::after 伪元素呈现（对齐 Semi，非独立 DOM）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    /** 标签文本（不传时回退到 children）。 */
    text?: string | undefined;
    /** 文本对齐（默认 'left'）。 */
    align?: 'left' | 'right';
    className?: string;
    /** 禁用态样式。 */
    disabled?: boolean;
    /** label 元素 id。 */
    id?: string;
    /** 是否必填（显示 * 星标）。 */
    required?: boolean;
    /** 是否显示「可选」标记（与 required 互斥，required 优先）。 */
    optional?: boolean;
    /** 标签后补充说明文字。 */
    extra?: string | Snippet;
    /** 关联控件的 id（对应 <label for>，对齐 Semi htmlFor={name}）。 */
    htmlFor?: string;
    /** 标签宽度（number → px）。 */
    width?: number | string | undefined;
    /** 透传到 <label> 的内联样式。 */
    style?: string;
    children?: Snippet;
  }

  let {
    text,
    align = 'left',
    className,
    disabled = false,
    id,
    required = false,
    optional = false,
    extra,
    htmlFor,
    width,
    style,
    children,
  }: Props = $props();

  const loc = useLocale();

  const hasExtra = $derived(extra !== undefined);
  const extraSnippet = $derived(typeof extra === 'function' ? (extra as Snippet) : undefined);
  const extraText = $derived(typeof extra === 'string' ? extra : undefined);

  // class 扁平命名严格对齐 Semi label.tsx（-left/-right/-required/-disabled/-with-extra）。
  const cls = $derived(
    [
      'cd-form-field-label',
      align === 'left' && 'cd-form-field-label-left',
      align === 'right' && 'cd-form-field-label-right',
      required && 'cd-form-field-label-required',
      disabled && 'cd-form-field-label-disabled',
      hasExtra && 'cd-form-field-label-with-extra',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const labelStyle = $derived(
    [
      width !== undefined
        ? `width:${typeof width === 'number' ? `${width}px` : width}`
        : undefined,
      style,
    ]
      .filter(Boolean)
      .join(';') || undefined,
  );
</script>

<label class={cls} for={htmlFor} {id} style={labelStyle}>
  <div class="cd-form-field-label-text">
    {#if text !== undefined}
      {text}
    {:else}
      {@render children?.()}
    {/if}
    {#if !required && optional}
      <span class="cd-form-field-label-optional-text">{loc().t('Form.optional')}</span>
    {/if}
  </div>
  {#if hasExtra}
    <div class="cd-form-field-label-extra">
      {#if extraSnippet}{@render extraSnippet()}{:else}{extraText}{/if}
    </div>
  {/if}
</label>

<style>
  /*
    label 样式用 :global 声明，保证无论由 FormLabel 独立渲染，还是被 Field / InputGroup / Slot
    复用渲染，同一套 cd-form-field-label-* 规则都生效（单一样式来源）。严格镜像 Semi form.scss。
  */
  :global(.cd-form-field-label) {
    box-sizing: border-box;
    font-weight: var(--cd-font-form-label-fontweight);
    color: var(--cd-color-form-label-text-default);
    margin-block-end: var(--cd-spacing-form-label-marginbottom);
    margin-block-start: var(--cd-spacing-form-label-margintop);
    padding-inline-end: var(--cd-spacing-form-label-paddingright);
    display: inline-block;
    vertical-align: middle;
    font-size: var(--cd-font-size-regular);
    flex-shrink: 0;
  }
  :global(.cd-form-field-label-disabled) {
    color: var(--cd-color-form-label-disabled-text-default);
  }
  :global(.cd-form-field-label-with-extra) {
    display: flex;
    align-items: center;
  }
  :global(.cd-form-field-label-with-extra .cd-form-field-label-text) {
    display: inline-block;
  }
  :global(.cd-form-field-label-with-extra .cd-form-field-label-extra) {
    display: flex;
    align-items: center;
    margin-inline-start: var(--cd-spacing-form-label-extra-marginleft);
    color: var(--cd-color-form-label-extra-text-default);
  }
  /* 必填星标：label-text::after 伪元素（对齐 Semi，非独立 DOM）。 */
  :global(.cd-form-field-label-required .cd-form-field-label-text::after) {
    content: '*';
    margin-inline-start: var(--cd-spacing-form-label-required-marginleft);
    color: var(--cd-color-form-requiredmark-text-default);
    font-weight: var(--cd-font-form-requiredmark-fontweight);
  }
  :global(.cd-form-field-label-required.cd-form-field-label-disabled .cd-form-field-label-text::after) {
    color: var(--cd-color-form-requiredmark-disabled-text-default);
  }
  :global(.cd-form-field-label-optional-text) {
    color: var(--cd-color-form-label-optional-text-default);
  }
  :global(.cd-form-field-label-left) {
    text-align: left;
  }
  :global(.cd-form-field-label-right) {
    text-align: right;
  }
</style>
