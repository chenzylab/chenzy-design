<!--
  Tag — 严格对齐 Semi semi-ui/tag/index.tsx。
  展示原子。受控 visible 不回写（仅通过 onClose 通知）。
  DOM 结构对齐 Semi：根 div（clickable 时 role=button + tabIndex + keydown），
  子序 prefix-icon → avatar → content(ellipsis/center) → suffix-icon → close(div + IconClose)。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Avatar from '../avatar/Avatar.svelte';
  import { IconClose } from '@chenzy-design/icons';

  type TagType = 'light' | 'solid' | 'ghost';
  type TagColor =
    | 'amber'
    | 'blue'
    | 'cyan'
    | 'green'
    | 'grey'
    | 'indigo'
    | 'light-blue'
    | 'light-green'
    | 'lime'
    | 'orange'
    | 'pink'
    | 'purple'
    | 'red'
    | 'teal'
    | 'violet'
    | 'yellow'
    | 'white';
  type TagSize = 'small' | 'default' | 'large';
  type TagShape = 'square' | 'circle';
  type AvatarShape = 'square' | 'circle';

  interface Props {
    /** 视觉风格：light 浅色底 / solid 深色底 / ghost 白色底镂空。默认 light（对齐 Semi） */
    type?: TagType;
    /** 语义色，17 种色板 + white（对齐 Semi 色板）。默认 grey */
    color?: TagColor;
    /** 尺寸 small/default/large；default 与 small 同高（对齐 Semi） */
    size?: TagSize;
    /** 形状 square 直角 / circle 胶囊。默认 square */
    shape?: TagShape;
    /** 尾部关闭按钮 */
    closable?: boolean;
    /** 受控显隐；受控时不回写，仅通过 onClose 通知（对齐 Semi visible 受控/非受控双轨） */
    visible?: boolean;
    /** AI 多彩标签：蓝→紫渐变（对齐 Semi colorful）。字重比非多彩更重 */
    colorful?: boolean;
    /** 是否渐变色，仅在 colorful=true 时生效（对齐 Semi gradient） */
    gradient?: boolean;
    /** 头像型 Tag 的图片地址（对齐 Semi avatarSrc） */
    avatarSrc?: string;
    /** 头像形状（对齐 Semi avatarShape），默认 square */
    avatarShape?: AvatarShape;
    /** 在 TagGroup 中的稳定标识（对齐 Semi tagKey） */
    tagKey?: string | number;
    /** 前置图标（对齐 Semi prefixIcon） */
    prefixIcon?: Snippet;
    /** 后置图标（关闭图标始终最右，对齐 Semi suffixIcon） */
    suffixIcon?: Snippet;
    /** 标签内容 */
    children?: Snippet;
    /**
     * 内容对齐（对齐 Semi content-${stringChild ? 'ellipsis' : 'center'}）：
     * 'ellipsis'（默认）——纯文本，单行省略号、左对齐；
     * 'center'——含富内容（图标等），flex 垂直居中。
     * Semi 按 children 是否纯字符串自动判断，本库 children 为 Snippet 无法内省，故显式指定。
     */
    contentAlign?: 'ellipsis' | 'center';
    /**
     * 关闭回调。对齐 Semi onClose(tagChildren, e, tagKey)：
     * 在回调内 e.preventDefault() 可阻止默认隐藏（点击后依然显示）。
     */
    onClose?: (
      tagChildren: unknown,
      e: MouseEvent | KeyboardEvent,
      tagKey: string | number | undefined,
    ) => void;
    /** 单击标签回调（对齐 Semi onClick）；传入后标签变为可交互（role=button、可聚焦、Enter 激活） */
    onClick?: (e: MouseEvent | KeyboardEvent) => void;
    /** 鼠标进入回调（对齐 Semi onMouseEnter） */
    onMouseEnter?: (e: MouseEvent) => void;
    /** 键盘事件回调（对齐 Semi onKeyDown），在内部处理后触发 */
    onKeyDown?: (e: KeyboardEvent) => void;
    /**
     * 可交互 Tag 的 tabIndex（对齐 Semi tabIndex）；TagInput 内用 -1 以左右方向键控制焦点。
     * 仅在 clickable（有 onClick 或 closable）时生效。
     */
    tabIndex?: number;
    /** 根元素可访问名（对齐 Semi aria-label） */
    ariaLabel?: string;
    /** 透传根类名（对齐 Semi className） */
    class?: string;
    /** 透传根内联样式（对齐 Semi style） */
    style?: string;
  }

  let {
    type = 'light',
    color = 'grey',
    size = 'default',
    shape = 'square',
    closable = false,
    visible,
    colorful = false,
    gradient = false,
    avatarSrc,
    avatarShape = 'square',
    tagKey,
    prefixIcon,
    suffixIcon,
    children,
    contentAlign = 'ellipsis',
    onClose,
    onClick,
    onMouseEnter,
    onKeyDown,
    tabIndex,
    ariaLabel,
    class: className,
    style,
  }: Props = $props();

  // —— visible：受控 vs 非受控（永不回写 prop，对齐 Semi getDerivedStateFromProps）——
  const visibleControlled = $derived(visible !== undefined);
  let innerVisible = $state(true);
  const isVisible = $derived(visibleControlled ? !!visible : innerVisible);

  // clickable：有自定义 onClick 或 closable（对齐 Semi：onClick !== defaultProps.onClick || closable）
  const clickable = $derived(!!onClick || closable);

  // avatar 尺寸随 tag 尺寸（circle 头像用专属尺寸，方形头像跟随 tag 高）
  const avatarSize = $derived(
    avatarShape === 'circle'
      ? size === 'large'
        ? 20
        : 16
      : size === 'large'
        ? 24
        : 20,
  );

  const cls = $derived(
    [
      'cd-tag',
      `cd-tag--${size}`,
      `cd-tag--${shape}`,
      `cd-tag--${type}`,
      `cd-tag--${color}-${type}`,
      closable && 'cd-tag--closable',
      !isVisible && 'cd-tag--invisible',
      avatarSrc && `cd-tag--avatar-${avatarShape}`,
      colorful && 'cd-tag--colorful',
      colorful && gradient && 'cd-tag--gradient',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  function setVisible(v: boolean) {
    if (!visibleControlled) innerVisible = v;
  }

  // 关闭：对齐 Semi close(e, value, tagKey) —— stopPropagation、onClose，preventDefault 则不隐藏。
  function close(e: MouseEvent | KeyboardEvent) {
    e.stopPropagation();
    onClose?.(childrenValue(), e, tagKey);
    if (e.defaultPrevented) return;
    setVisible(false);
  }

  // Semi 用 children 作为 onClose 第一参 / tagKey 兜底；此处 children 是 Snippet 无法取文本，回传 undefined。
  function childrenValue(): unknown {
    return undefined;
  }

  function handleClick(e: MouseEvent) {
    onClick?.(e);
  }

  // 键盘（对齐 Semi handleKeyDown）：Enter 激活 onClick、Delete/Backspace 关闭、Esc 失焦。
  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Backspace':
      case 'Delete':
        if (closable) {
          close(e);
          e.preventDefault();
          e.stopPropagation();
        }
        break;
      case 'Enter':
        onClick?.(e);
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'Escape':
        (e.target as HTMLElement)?.blur();
        break;
      default:
        break;
    }
    onKeyDown?.(e);
  }
</script>

<!--
  根 div：clickable 时挂 role=button + tabIndex + keydown（对齐 Semi wrapProps）。
  svelte 的 a11y 规则要求交互元素配 keydown，这里 clickable 时已具备。
-->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class={cls}
  {style}
  role={clickable ? 'button' : undefined}
  tabindex={clickable ? (tabIndex ?? 0) : undefined}
  aria-label={ariaLabel}
  onclick={clickable ? handleClick : undefined}
  onkeydown={clickable ? handleKeyDown : undefined}
  onmouseenter={onMouseEnter}
>
  {#if prefixIcon}
    <div class="cd-tag__prefix-icon">{@render prefixIcon()}</div>
  {/if}
  {#if avatarSrc}
    <Avatar src={avatarSrc} shape={avatarShape} size={avatarSize} />
  {/if}
  <div class="cd-tag__content cd-tag__content--{contentAlign}">
    {#if children}{@render children()}{/if}
  </div>
  {#if suffixIcon}
    <div class="cd-tag__suffix-icon">{@render suffixIcon()}</div>
  {/if}
  {#if closable}
    <!-- close：对齐 Semi <div class="semi-tag-close" onClick>；键盘走根 div 的 Delete/Backspace -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="cd-tag__close" onclick={close}>
      <IconClose size="small" />
    </div>
  {/if}
</div>

<style>
  /* —— 基础（对齐 Semi tag.scss .semi-tag）—— */
  .cd-tag {
    box-sizing: border-box;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--cd-tag-radius);
    background-color: transparent;
    border: var(--cd-tag-border-width) solid transparent;
    user-select: none;
    overflow: hidden;
    white-space: nowrap;
    vertical-align: bottom;
  }

  /* default / small 同高（对齐 Semi &-default,&-small）；large 单列 */
  .cd-tag--default,
  .cd-tag--small {
    font-size: var(--cd-tag-font-size);
    height: var(--cd-tag-height-small);
    padding: var(--cd-tag-small-padding-y) var(--cd-tag-small-padding-x);
  }
  .cd-tag--large {
    font-size: var(--cd-tag-font-size);
    height: var(--cd-tag-height-large);
    padding: var(--cd-tag-large-padding-y) var(--cd-tag-large-padding-x);
  }

  .cd-tag--square {
    border-radius: var(--cd-tag-radius);
  }
  .cd-tag--circle {
    border-radius: var(--cd-tag-radius-circle);
  }

  .cd-tag:focus-visible {
    outline: var(--cd-tag-outline-width) solid var(--cd-tag-outline-color);
  }

  .cd-tag--invisible {
    display: none;
  }

  /* —— prefix / suffix icon（对齐 Semi &-prefix-icon / &-suffix-icon）—— */
  .cd-tag__prefix-icon {
    display: flex;
    padding-right: var(--cd-tag-prefix-icon-padding-right);
  }
  .cd-tag__suffix-icon {
    display: flex;
    padding-left: var(--cd-tag-suffix-icon-padding-left);
  }

  /* —— content（对齐 Semi &-content / -ellipsis / -center）—— */
  .cd-tag__content {
    flex: 1;
  }
  .cd-tag__content--ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /*
    对齐 Semi content-center：含富内容（图标等）时 content 走 flex 垂直居中。
    Snippet 无法内省 children 类型，改用显式 contentAlign 语义控制（默认 ellipsis）。
  */
  .cd-tag__content--center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-width: 0;
  }

  /* —— close（对齐 Semi &-close）—— */
  .cd-tag__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-tag-close-icon-default);
    padding-left: var(--cd-tag-close-padding-left);
    cursor: pointer;
  }
  .cd-tag__close:hover {
    color: var(--cd-tag-close-icon-hover);
  }
  .cd-tag__close:active {
    color: var(--cd-tag-close-icon-active);
  }

  /* closable 内边距（对齐 Semi &-closable）—— */
  .cd-tag--closable {
    padding: var(--cd-tag-closable-padding-top) var(--cd-tag-closable-padding-right)
      var(--cd-tag-closable-padding-bottom) var(--cd-tag-closable-padding-left);
  }

  /* —— 头像标签（对齐 Semi &-avatar-square / -circle）—— */
  .cd-tag--avatar-square,
  .cd-tag--avatar-circle {
    background-color: var(--cd-tag-avatar-bg);
    border: var(--cd-tag-border-width) solid var(--cd-tag-avatar-border);
    color: var(--cd-tag-avatar-text);
  }
  .cd-tag--avatar-square :global(.cd-avatar),
  .cd-tag--avatar-circle :global(.cd-avatar) {
    margin-right: var(--cd-tag-avatar-margin-right);
  }
  .cd-tag--avatar-square {
    padding: 0 var(--cd-tag-avatar-square-padding-x) 0 0;
  }
  .cd-tag--avatar-square :global(.cd-avatar > img) {
    background-color: var(--cd-tag-avatar-square-img-bg);
  }
  .cd-tag--avatar-circle {
    padding: var(--cd-tag-avatar-circle-padding-y) var(--cd-tag-avatar-circle-padding-x)
      var(--cd-tag-avatar-circle-padding-y) var(--cd-tag-avatar-circle-padding-left);
  }
  /* 方形头像宽高跟随 tag 高（对齐 Semi avatar-square.default/small/large）—— */
  .cd-tag--avatar-square.cd-tag--default :global(.cd-avatar),
  .cd-tag--avatar-square.cd-tag--small :global(.cd-avatar) {
    width: var(--cd-tag-height-small);
    height: var(--cd-tag-height-small);
  }
  .cd-tag--avatar-square.cd-tag--large :global(.cd-avatar) {
    width: var(--cd-tag-height-large);
    height: var(--cd-tag-height-large);
  }
  /* 圆头像改 tag 圆角为 height*0.5+1（对齐 Semi avatar-circle 圆角计算）—— */
  .cd-tag--avatar-circle.cd-tag--small,
  .cd-tag--avatar-circle.cd-tag--default {
    border-radius: calc(var(--cd-tag-height-small) * 0.5 + 1px);
  }
  .cd-tag--avatar-circle.cd-tag--small :global(.cd-avatar),
  .cd-tag--avatar-circle.cd-tag--default :global(.cd-avatar) {
    width: var(--cd-tag-avatar-circle-small);
    height: var(--cd-tag-avatar-circle-small);
  }
  .cd-tag--avatar-circle.cd-tag--large {
    border-radius: calc(var(--cd-tag-height-large) * 0.5 + 1px);
  }
  .cd-tag--avatar-circle.cd-tag--large :global(.cd-avatar) {
    width: var(--cd-tag-avatar-circle-large);
    height: var(--cd-tag-avatar-circle-large);
  }

  /*
    —— 17 色 × 3 type（对齐 Semi tag/mixin.scss @each tag-style）——
    solid: bg=<c>-5, text=white
    ghost: bg=transparent, border=<c>-4, text=<c>-5
    light: bg=<c>-5 @15%, text=<c>-8
    用 --cd-color-<c>-N 全局色阶 + color-mix 派生。
  */
  /* solid */
  .cd-tag--amber-solid { background-color: var(--cd-color-amber-5); color: var(--cd-color-white); }
  .cd-tag--blue-solid { background-color: var(--cd-color-blue-5); color: var(--cd-color-white); }
  .cd-tag--cyan-solid { background-color: var(--cd-color-cyan-5); color: var(--cd-color-white); }
  .cd-tag--green-solid { background-color: var(--cd-color-green-5); color: var(--cd-color-white); }
  .cd-tag--grey-solid { background-color: var(--cd-color-grey-5); color: var(--cd-color-white); }
  .cd-tag--indigo-solid { background-color: var(--cd-color-indigo-5); color: var(--cd-color-white); }
  .cd-tag--light-blue-solid { background-color: var(--cd-color-light-blue-5); color: var(--cd-color-white); }
  .cd-tag--light-green-solid { background-color: var(--cd-color-light-green-5); color: var(--cd-color-white); }
  .cd-tag--lime-solid { background-color: var(--cd-color-lime-5); color: var(--cd-color-white); }
  .cd-tag--orange-solid { background-color: var(--cd-color-orange-5); color: var(--cd-color-white); }
  .cd-tag--pink-solid { background-color: var(--cd-color-pink-5); color: var(--cd-color-white); }
  .cd-tag--purple-solid { background-color: var(--cd-color-purple-5); color: var(--cd-color-white); }
  .cd-tag--red-solid { background-color: var(--cd-color-red-5); color: var(--cd-color-white); }
  .cd-tag--teal-solid { background-color: var(--cd-color-teal-5); color: var(--cd-color-white); }
  .cd-tag--violet-solid { background-color: var(--cd-color-violet-5); color: var(--cd-color-white); }
  .cd-tag--yellow-solid { background-color: var(--cd-color-yellow-5); color: var(--cd-color-white); }

  /* ghost */
  .cd-tag--amber-ghost { background-color: transparent; border-color: var(--cd-color-amber-4); color: var(--cd-color-amber-5); }
  .cd-tag--blue-ghost { background-color: transparent; border-color: var(--cd-color-blue-4); color: var(--cd-color-blue-5); }
  .cd-tag--cyan-ghost { background-color: transparent; border-color: var(--cd-color-cyan-4); color: var(--cd-color-cyan-5); }
  .cd-tag--green-ghost { background-color: transparent; border-color: var(--cd-color-green-4); color: var(--cd-color-green-5); }
  .cd-tag--grey-ghost { background-color: transparent; border-color: var(--cd-color-grey-4); color: var(--cd-color-grey-5); }
  .cd-tag--indigo-ghost { background-color: transparent; border-color: var(--cd-color-indigo-4); color: var(--cd-color-indigo-5); }
  .cd-tag--light-blue-ghost { background-color: transparent; border-color: var(--cd-color-light-blue-4); color: var(--cd-color-light-blue-5); }
  .cd-tag--light-green-ghost { background-color: transparent; border-color: var(--cd-color-light-green-4); color: var(--cd-color-light-green-5); }
  .cd-tag--lime-ghost { background-color: transparent; border-color: var(--cd-color-lime-4); color: var(--cd-color-lime-5); }
  .cd-tag--orange-ghost { background-color: transparent; border-color: var(--cd-color-orange-4); color: var(--cd-color-orange-5); }
  .cd-tag--pink-ghost { background-color: transparent; border-color: var(--cd-color-pink-4); color: var(--cd-color-pink-5); }
  .cd-tag--purple-ghost { background-color: transparent; border-color: var(--cd-color-purple-4); color: var(--cd-color-purple-5); }
  .cd-tag--red-ghost { background-color: transparent; border-color: var(--cd-color-red-4); color: var(--cd-color-red-5); }
  .cd-tag--teal-ghost { background-color: transparent; border-color: var(--cd-color-teal-4); color: var(--cd-color-teal-5); }
  .cd-tag--violet-ghost { background-color: transparent; border-color: var(--cd-color-violet-4); color: var(--cd-color-violet-5); }
  .cd-tag--yellow-ghost { background-color: transparent; border-color: var(--cd-color-yellow-4); color: var(--cd-color-yellow-5); }

  /* light */
  .cd-tag--amber-light { background-color: color-mix(in srgb, var(--cd-color-amber-5) 15%, transparent); color: var(--cd-color-amber-8); }
  .cd-tag--blue-light { background-color: color-mix(in srgb, var(--cd-color-blue-5) 15%, transparent); color: var(--cd-color-blue-8); }
  .cd-tag--cyan-light { background-color: color-mix(in srgb, var(--cd-color-cyan-5) 15%, transparent); color: var(--cd-color-cyan-8); }
  .cd-tag--green-light { background-color: color-mix(in srgb, var(--cd-color-green-5) 15%, transparent); color: var(--cd-color-green-8); }
  .cd-tag--grey-light { background-color: color-mix(in srgb, var(--cd-color-grey-5) 15%, transparent); color: var(--cd-color-grey-8); }
  .cd-tag--indigo-light { background-color: color-mix(in srgb, var(--cd-color-indigo-5) 15%, transparent); color: var(--cd-color-indigo-8); }
  .cd-tag--light-blue-light { background-color: color-mix(in srgb, var(--cd-color-light-blue-5) 15%, transparent); color: var(--cd-color-light-blue-8); }
  .cd-tag--light-green-light { background-color: color-mix(in srgb, var(--cd-color-light-green-5) 15%, transparent); color: var(--cd-color-light-green-8); }
  .cd-tag--lime-light { background-color: color-mix(in srgb, var(--cd-color-lime-5) 15%, transparent); color: var(--cd-color-lime-8); }
  .cd-tag--orange-light { background-color: color-mix(in srgb, var(--cd-color-orange-5) 15%, transparent); color: var(--cd-color-orange-8); }
  .cd-tag--pink-light { background-color: color-mix(in srgb, var(--cd-color-pink-5) 15%, transparent); color: var(--cd-color-pink-8); }
  .cd-tag--purple-light { background-color: color-mix(in srgb, var(--cd-color-purple-5) 15%, transparent); color: var(--cd-color-purple-8); }
  .cd-tag--red-light { background-color: color-mix(in srgb, var(--cd-color-red-5) 15%, transparent); color: var(--cd-color-red-8); }
  .cd-tag--teal-light { background-color: color-mix(in srgb, var(--cd-color-teal-5) 15%, transparent); color: var(--cd-color-teal-8); }
  .cd-tag--violet-light { background-color: color-mix(in srgb, var(--cd-color-violet-5) 15%, transparent); color: var(--cd-color-violet-8); }
  .cd-tag--yellow-light { background-color: color-mix(in srgb, var(--cd-color-yellow-5) 15%, transparent); color: var(--cd-color-yellow-8); }

  /* —— white 色（对齐 Semi @each white-<type> + 边框 + close icon）—— */
  .cd-tag--white-light,
  .cd-tag--white-solid,
  .cd-tag--white-ghost {
    background-color: var(--cd-tag-white-bg);
    border: var(--cd-tag-border-width) solid var(--cd-tag-white-border);
    color: var(--cd-tag-white-text);
  }
  .cd-tag--white-light .cd-tag__close,
  .cd-tag--white-solid .cd-tag__close,
  .cd-tag--white-ghost .cd-tag__close {
    color: var(--cd-tag-white-icon);
  }

  /*
    —— colorful（AI 多彩标签，对齐 Semi &-colorful）——
    type 仍生效，配色改用 AI 渐变覆盖 color 语义色；gradient=true 三段渐变，false 单色紫(via)。
    多彩标签字重更重。
  */
  .cd-tag--colorful {
    --ct: linear-gradient(
      120deg,
      var(--cd-tag-colorful-from) 0%,
      var(--cd-tag-colorful-via) 52%,
      var(--cd-tag-colorful-to) 100%
    );
    --ct-solid: var(--cd-tag-colorful-via);
    --ct-fill: var(--ct-solid);
    --ct-text: var(--cd-tag-colorful-via);
    font-weight: var(--cd-tag-colorful-font-weight);
  }
  .cd-tag--colorful.cd-tag--gradient {
    --ct-fill: var(--ct);
  }
  /* solid：多彩实心 + 白字 */
  .cd-tag--colorful.cd-tag--solid {
    background: var(--ct-fill);
    color: var(--cd-color-white);
    border-color: transparent;
  }
  /* light：浅多彩底 + 紫字 */
  .cd-tag--colorful.cd-tag--light {
    background: color-mix(in srgb, var(--ct-text) 12%, var(--cd-color-bg-0));
    color: var(--ct-text);
    border-color: transparent;
  }
  .cd-tag--colorful.cd-tag--gradient.cd-tag--light {
    background: linear-gradient(
      120deg,
      color-mix(in srgb, var(--cd-tag-colorful-from) 14%, transparent) 0%,
      color-mix(in srgb, var(--cd-tag-colorful-via) 14%, transparent) 52%,
      color-mix(in srgb, var(--cd-tag-colorful-to) 14%, transparent) 100%
    );
  }
  /* ghost：透明 + 紫边框（gradient 用渐变边框）+ 紫字 */
  .cd-tag--colorful.cd-tag--ghost {
    background: transparent;
    border-color: var(--ct-text);
    color: var(--ct-text);
  }
  .cd-tag--colorful.cd-tag--gradient.cd-tag--ghost {
    border-color: transparent;
    border-image: var(--ct) 1;
  }
</style>
