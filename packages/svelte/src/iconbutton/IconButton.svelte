<!--
  IconButton — 纯图标便捷封装（对齐 Semi iconButton：强制 icon + ariaLabel）。
  内部委托 Button（派发器）走 icon-only 组装分支，复用同一套 token 与视觉。
  icon/ariaLabel 必填（类型 + dev warn），其余 Button props 原样透传。
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
    /** 语义类型。默认 primary（对齐 Semi Button）。 */
    type?: ButtonType;
    /** 视觉变体。默认 light。 */
    theme?: ButtonTheme;
    /** 尺寸三档。 */
    size?: ButtonSize;
    /** 图标相对文字位置（IconButton 一般无文字，保留对齐 Semi）。 */
    iconPosition?: 'left' | 'right';
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
    /** 去水平内边距（仅 icon 时有效，inline padding，对齐 Semi）。 */
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
    /** 其余原生属性透传（data-* 、aria-controls、aria-expanded 等）。 */
    [key: string]: unknown;
  }

  let { icon, ariaLabel, ...rest }: Props = $props();

  // dev 检测：兼容 Vite（import.meta.env.DEV）与非 Vite 消费方（缺失时静默 no-op）。
  const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false;

  // dev 模式：缺失/空 ariaLabel 时告警（强约束可访问名）。
  $effect(() => {
    if (isDev && (!ariaLabel || ariaLabel.trim() === '')) {
      console.warn(
        '[IconButton] `ariaLabel` is required for icon-only buttons to provide an accessible name.',
      );
    }
  });
</script>

<Button {icon} {ariaLabel} {...rest} />
