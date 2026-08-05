<!--
  Button — 对外派发器（严格对齐 Semi semi-ui/button/index.tsx）。
  Semi：有 icon || (loading && !disabled) → 委托 IconButton；否则 → BaseButton 纯容器。
  本组件只做 defaults 解析（type/theme/size/disabled/colorful，来源：显式 prop > ButtonGroup
  上下文 > cdGlobal 全局默认 > 组件内置默认）与分支派发，不含图标装配逻辑
  （icon 组装/loading/colorful fill 全部落在 ../iconbutton/IconButton.svelte，单一来源）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { resolveDefault } from '@chenzy-design/core';
  import type { IconSize } from '@chenzy-design/icons';
  import BaseButton from './BaseButton.svelte';
  import IconButton from '../iconbutton/IconButton.svelte';
  import {
    getButtonGroupContext,
    type ButtonType,
    type ButtonTheme,
    type ButtonSize,
  } from './context.js';

  interface Props {
    type?: ButtonType;
    theme?: ButtonTheme;
    size?: ButtonSize;
    block?: boolean;
    disabled?: boolean;
    loading?: boolean;
    /**
     * AI 多彩按钮：对齐 Semi，仅 type=primary/tertiary 有 colorful 语义
     * （primary solid/light/borderless/outline，tertiary solid），其余组合无效果。
     */
    colorful?: boolean;
    htmlType?: 'button' | 'submit' | 'reset';
    /** 圆形按钮（border-radius:50%），配合 icon-only 呈正圆。 */
    circle?: boolean;
    /** 无障碍名；纯图标按钮必填（透传 aria-label）。 */
    'aria-label'?: string;
    /** 图标内容（Snippet）；colorful 命中 multipleColor/twoColor 时收到 fill 数组。 */
    icon?: Snippet<[{ fill?: string | string[] | undefined }]>;
    /** 图标相对文字位置。 */
    iconPosition?: 'left' | 'right';
    /** 图标尺寸（作用在图标元素上，对齐 Semi IconButtonProps.iconSize；无 icon 时无效果）。 */
    iconSize?: IconSize;
    /** 图标内联样式（作用在图标元素上，对齐 Semi IconButtonProps.iconStyle；无 icon 时无效果）。 */
    iconStyle?: string;
    /**
     * 水平方向去内边距，仅在设置了 icon 时有效（对齐 Semi IconButton）。
     * true 等效 ['left','right']；'left'/'right' 去单侧；数组组合去两侧。inline padding 实现。
     */
    noHorizontalPadding?: boolean | 'left' | 'right' | Array<'left' | 'right'>;
    /** 根元素自定义类名（透传，叠加在内置 class 之后）。 */
    class?: string;
    /** 根元素自定义内联样式（透传）。 */
    style?: string;
    /** 内容区（.cd-button-content）自定义类名（对齐 Semi contentClassName）。 */
    contentClassName?: string;
    children?: Snippet;
    onclick?: (e: MouseEvent) => void;
    onmousedown?: (e: MouseEvent) => void;
    onmouseenter?: (e: MouseEvent) => void;
    onmouseleave?: (e: MouseEvent) => void;
    /** 其余原生属性透传到根 button（data-* 名 name value form title tabindex aria-controls aria-expanded 等）。 */
    [key: string]: unknown;
  }

  let {
    type: typeProp,
    theme: themeProp,
    size: sizeProp,
    block = false,
    disabled: disabledProp,
    loading = false,
    colorful: colorfulProp,
    htmlType = 'button',
    circle = false,
    'aria-label': ariaLabel,
    icon,
    iconPosition = 'left',
    iconSize,
    iconStyle,
    noHorizontalPadding = false,
    class: className,
    style,
    contentClassName,
    children,
    onclick,
    onmousedown,
    onmouseenter,
    onmouseleave,
    ...rest
  }: Props = $props();

  // ButtonGroup 上下文：仅在未显式设置对应 prop 时作为默认回退（显式 prop 始终优先）。
  // 优先级（对齐 Semi）：显式 prop > ButtonGroup 上下文 > cdGlobal 全局默认 > 组件内置默认。
  // cdGlobal 见 core/global-config.ts（对齐 Semi semiGlobal.config.overrideDefaultProps）。
  const group = getButtonGroupContext();
  const type = $derived<ButtonType>(
    typeProp ?? group?.type ?? resolveDefault(undefined, 'Button', 'type', 'primary'),
  );
  const theme = $derived<ButtonTheme>(
    themeProp ?? group?.theme ?? resolveDefault(undefined, 'Button', 'theme', 'light'),
  );
  const size = $derived<ButtonSize>(
    sizeProp ?? group?.size ?? resolveDefault(undefined, 'Button', 'size', 'default'),
  );
  const disabled = $derived<boolean>(
    disabledProp ?? group?.disabled ?? resolveDefault(undefined, 'Button', 'disabled', false),
  );
  const colorful = $derived<boolean>(
    colorfulProp ?? group?.colorful ?? resolveDefault(undefined, 'Button', 'colorful', false),
  );

  // 对齐 Semi 派发：有 icon || (loading && !disabled) 走 IconButton 分支。
  const isIconButton = $derived(!!icon || (loading && !disabled));
</script>

{#if isIconButton}
  <IconButton
    {...rest}
    {type}
    {theme}
    {size}
    {block}
    {disabled}
    {loading}
    {colorful}
    {circle}
    {htmlType}
    aria-label={ariaLabel}
    {icon}
    {iconPosition}
    {iconSize}
    {iconStyle}
    {noHorizontalPadding}
    class={className}
    {style}
    {contentClassName}
    {onclick}
    {onmousedown}
    {onmouseenter}
    {onmouseleave}
    {children}
  />
{:else}
  <BaseButton
    {...rest}
    {type}
    {theme}
    {size}
    {block}
    {disabled}
    {colorful}
    {circle}
    {htmlType}
    class={className}
    {style}
    {contentClassName}
    aria-label={ariaLabel}
    {onclick}
    {onmousedown}
    {onmouseenter}
    {onmouseleave}
    {children}
  />
{/if}
