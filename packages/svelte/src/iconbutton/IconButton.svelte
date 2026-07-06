<!--
  IconButton — see specs/components/basic/IconButton.spec.md
  极薄封装：转发全部 Button props + icon，强制 ariaLabel 必填（类型 + dev warn）。
  内部渲染 <Button icon ariaLabel {...rest} /> 不传 children，复用 Button 的 icon-only 语义。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from '../button/Button.svelte';
  import type { ButtonType, ButtonTheme, ButtonSize } from '../button/context.js';

  interface Props {
    /** 图标内容（必填）。 */
    icon: Snippet;
    /** 可访问名（必填）。纯图标无文字，屏幕阅读器唯一名称来源。dev 缺失时 console.warn。 */
    ariaLabel: string;
    /** 语义类型。默认 secondary（对齐本库 Button）。 */
    type?: ButtonType;
    /** 视觉变体。默认 light。 */
    theme?: ButtonTheme;
    /** 尺寸三档。 */
    size?: ButtonSize;
    /** 圆形按钮（复用 Button circle）。 */
    circle?: boolean;
    /** 禁用。 */
    disabled?: boolean;
    /** 加载态（spin 图标替换）。 */
    loading?: boolean;
    /** AI 多彩。 */
    colorful?: boolean;
    /** 撑满容器宽度。 */
    block?: boolean;
    /** 去水平内边距。 */
    noHorizontalPadding?: boolean | 'left' | 'right' | Array<'left' | 'right'>;
    /** 原生 button type。 */
    htmlType?: 'button' | 'submit' | 'reset';
    /** 根元素自定义类名（透传）。 */
    class?: string;
    /** 根元素自定义内联样式（透传）。 */
    style?: string;
    /** 内容区自定义类名（透传给 Button contentClassName）。 */
    contentClassName?: string;
    onclick?: (e: MouseEvent) => void;
    onmousedown?: (e: MouseEvent) => void;
    onmouseenter?: (e: MouseEvent) => void;
    onmouseleave?: (e: MouseEvent) => void;
  }

  let { icon, ariaLabel, ...rest }: Props = $props();

  // dev 检测：兼容 Vite（import.meta.env.DEV）与非 Vite 消费方（缺失时静默 no-op），
  // 避免依赖 vite/client 环境类型即可通过 svelte-check。
  const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false;

  // dev 模式：缺失/空 ariaLabel 时告警（超越 Semi 的「可选不校验」，强约束可访问名）。
  $effect(() => {
    if (isDev && (!ariaLabel || ariaLabel.trim() === '')) {
      console.warn(
        '[IconButton] `ariaLabel` is required for icon-only buttons to provide an accessible name.',
      );
    }
  });
</script>

<Button {icon} {ariaLabel} {...rest} />
