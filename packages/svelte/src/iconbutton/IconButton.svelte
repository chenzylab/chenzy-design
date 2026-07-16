<!--
  IconButton — 带图标的 Button 薄封装（严格对齐 Semi iconButton/index.tsx）。
  Semi 本质是「委托 Button 组装」：children(文字) + icon 均非必填，icon-only 只是 children 为空的分支。
  全部组装逻辑（-with-icon/-with-icon-only/-loading class、iconPosition、noHorizontalPadding、
  contentClassName、loading spinner、colorful fill 注入）都在 Button 内建，本组件仅透传。
  iconSize/iconStyle 作用在图标元素上（对齐 Semi）：Button 不支持这两个，故在传入的 icon 外层
  用 <Icon size={iconSize} style={iconStyle}> 包裹（仅在提供时）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from '../button/Button.svelte';
  import { Icon, type IconSize } from '@chenzy-design/icons';
  import type { ButtonType, ButtonTheme, ButtonSize } from '../button/context.js';

  interface Props {
    /** 图标内容（可选）。 */
    icon?: Snippet;
    /** 文字内容（可选）；提供后不再是纯图标按钮（对齐 Semi children）。 */
    children?: Snippet;
    /** 可访问名（可选，透传到 Button 的 aria-label）。纯图标按钮建议提供。 */
    ariaLabel?: string;
    /** 语义类型。默认 primary（对齐 Semi Button）。 */
    type?: ButtonType;
    /** 视觉变体。默认 light。 */
    theme?: ButtonTheme;
    /** 尺寸三档。 */
    size?: ButtonSize;
    /** 图标相对文字位置。 */
    iconPosition?: 'left' | 'right';
    /** 图标尺寸（作用在图标元素上，对齐 Semi iconSize）。 */
    iconSize?: IconSize;
    /** 图标内联样式（作用在图标元素上，对齐 Semi iconStyle）。 */
    iconStyle?: string;
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

  let { icon, iconSize, iconStyle, children, ...rest }: Props = $props();

  // iconSize/iconStyle 提供时，用 <Icon> 包裹图标以套用尺寸/样式（对齐 Semi 作用在图标元素上）。
  const wrapIcon = $derived(icon !== undefined && (iconSize !== undefined || iconStyle !== undefined));
  // 传给包裹 <Icon> 的尺寸/样式：走基类默认（size='default'、style=''），避免透传 undefined。
  const wrapSize = $derived(iconSize ?? 'default');
  const wrapStyle = $derived(iconStyle ?? '');
  // 最终 icon snippet：需要包裹则用 wrappedIcon，否则原样。
  const finalIcon = $derived(wrapIcon ? wrappedIcon : icon);
</script>

{#snippet wrappedIcon()}
  <Icon size={wrapSize} style={wrapStyle}>
    {@render icon?.()}
  </Icon>
{/snippet}

{#if finalIcon}
  {#if children}
    <Button icon={finalIcon} {children} {...rest} />
  {:else}
    <Button icon={finalIcon} {...rest} />
  {/if}
{:else if children}
  <Button {children} {...rest} />
{:else}
  <Button {...rest} />
{/if}
