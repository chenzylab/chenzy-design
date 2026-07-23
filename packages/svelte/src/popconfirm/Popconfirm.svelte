<!--
  Popconfirm — 气泡确认框（严格对齐 Semi Design semi-ui/popconfirm）。
  架构：Popconfirm 封装 Popover（对齐 Semi `Popconfirm extends PopoverProps` +
  `<Popover content={renderConfirmPopCard}>`）——复用 Popover→Tooltip 的全部定位/触发/
  焦点/dismiss/12 方位/箭头基建，自身只负责渲染确认卡片：
    .cd-popconfirm > .cd-popconfirm-inner >
      .cd-popconfirm-header( header-icon? + header-body(header-title?) + btn-close? )
    + .cd-popconfirm-body(-withIcon?)?
    + .cd-popconfirm-footer( cancel + ok )
  对齐要点（对齐 Semi index.tsx / popconfirm.scss，无自造）：
    - icon 缺省 <IconAlertTriangle size="extra-large"/>（warning 色由 .cd-icon-alert_triangle 上色）；
      不同风格由使用方经 icon(style)+okType 搭配（Semi 无 type 分级 prop）。
    - showCloseIcon 默认 true：header 内 borderless small 关闭按钮（第三个 flex 子项，靠 header-body
      flex-grow 推到右侧，与 Semi 一致——scss 中 btn-close 无独立定位规则）。
    - okType 默认 primary、cancelType 默认 tertiary、确认按钮 theme=solid（对齐 Semi defaultProps）。
    - 异步：onConfirm/onCancel 返回 Promise 时对应按钮 loading，resolve 关闭 / reject 保持打开。
    - autoFocus：okButtonProps/cancelButtonProps.autoFocus 打开时聚焦对应按钮（对齐 Semi 2.30）。
  受控 visible（红线 #1）：不回写，仅经 onVisibleChange 通知；trigger 默认 click，
  position 默认 bottomLeft，stopPropagation 默认 true（对齐 Semi）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tick, untrack } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { IconAlertTriangle, IconClose } from '@chenzy-design/icons';
  import { Button } from '../button/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import Popover from '../popover/Popover.svelte';
  import type { Position } from '../tooltip/placement.js';

  type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
  type TriggerType = 'click' | 'hover' | 'focus' | 'custom';

  /** content 函数形态入参（对齐 Semi content: ({ initialFocusRef }) => ReactNode）：
   *  将 initialFocusRef 绑定到浮层内可聚焦元素，打开时自动聚焦。 */
  interface RenderContentProps {
    initialFocusRef: (node: HTMLElement) => void;
  }

  /** 透传给确认/取消 Button 的额外属性（对齐 Semi okButtonProps/cancelButtonProps）。
   *  onclick/loading/theme/data-type 由组件托管；autoFocus 用于打开时初始聚焦。 */
  type ExtraButtonProps = {
    type?: ButtonType;
    theme?: 'solid' | 'borderless' | 'light' | 'outline';
    size?: 'small' | 'default' | 'large';
    block?: boolean;
    disabled?: boolean;
    htmlType?: 'button' | 'submit' | 'reset';
    ariaLabel?: string;
    class?: string;
    /** 打开面板时自动聚焦此按钮（对齐 Semi autoFocus） */
    autoFocus?: boolean;
  };

  interface Props {
    /** 受控显隐（配合 trigger='custom'），对齐 Semi visible */
    visible?: boolean;
    /** 非受控初始显隐，对齐 Semi defaultVisible */
    defaultVisible?: boolean;
    /** 标题：文本或富文本 Snippet（对齐 Semi title: ReactNode） */
    title?: string | Snippet;
    /** 正文：文本 / 富文本 Snippet / 带 { initialFocusRef } 入参的函数 Snippet
     *  （对齐 Semi content: ReactNode | ({ initialFocusRef }) => ReactNode） */
    content?: string | Snippet<[RenderContentProps]>;
    /** 自定义弹出气泡图标；false 隐藏图标；缺省 <IconAlertTriangle size="extra-large"/>（对齐 Semi） */
    icon?: Snippet | false;
    /** 确认按钮文字，默认 locale 'confirm'（对齐 Semi okText） */
    okText?: string;
    /** 取消按钮文字，默认 locale 'cancel'（对齐 Semi cancelText） */
    cancelText?: string;
    /** 确认按钮类型，默认 primary（对齐 Semi okType） */
    okType?: ButtonType;
    /** 取消按钮类型，默认 tertiary（对齐 Semi cancelType） */
    cancelType?: ButtonType;
    /** 确认按钮 props（对齐 Semi okButtonProps） */
    okButtonProps?: ExtraButtonProps;
    /** 取消按钮 props（对齐 Semi cancelButtonProps） */
    cancelButtonProps?: ExtraButtonProps;
    /** 是否显示右上角关闭按钮，默认 true（对齐 Semi showCloseIcon） */
    showCloseIcon?: boolean;
    /** 弹出方位，默认 bottomLeft（对齐 Semi position） */
    position?: Position;
    /** 触发方式，默认 click（对齐 Semi trigger） */
    trigger?: TriggerType;
    /** 点击子元素是否弹出，false 时不弹（对齐 Semi disabled） */
    disabled?: boolean;
    /** Esc 关闭，受控时不生效，默认 true（对齐 Semi closeOnEsc） */
    closeOnEsc?: boolean;
    /** 箭头是否指向触发元素中心（需 showArrow），默认 false（对齐 Semi arrowPointAtCenter） */
    arrowPointAtCenter?: boolean;
    /** 是否显示箭头三角，默认 false（对齐 Semi showArrow） */
    showArrow?: boolean;
    /** 进出场动画，默认 true（对齐 Semi motion） */
    motion?: boolean;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    /** 自定义浮层容器（对齐 Semi getPopupContainer） */
    getPopupContainer?: () => HTMLElement | null | undefined;
    /** 浮层 z-index，默认 1030（对齐 Semi zIndex） */
    zIndex?: number;
    /** Tab 是否在浮层内循环，默认 true（对齐 Semi guardFocus） */
    guardFocus?: boolean;
    /** Esc 后焦点回到 trigger（仅 trigger=click），默认 true（对齐 Semi returnFocusOnClose） */
    returnFocusOnClose?: boolean;
    /** 阻止浮层内点击冒泡，默认 true（对齐 Semi stopPropagation） */
    stopPropagation?: boolean;
    /** 手动触发重新定位（对齐 Semi rePosKey） */
    rePosKey?: string | number;
    /** 卡片自定义类名（对齐 Semi className） */
    class?: string;
    /** 卡片自定义内联样式（对齐 Semi style） */
    style?: string;
    /** 触发元素（对齐 Semi children） */
    children?: Snippet;
    /** 显隐切换回调（对齐 Semi onVisibleChange） */
    onVisibleChange?: (visible: boolean) => void;
    /** 点击浮层外部回调（对齐 Semi onClickOutSide） */
    onClickOutSide?: (e: MouseEvent) => void;
    /** Esc 键回调（对齐 Semi onEscKeyDown） */
    onEscKeyDown?: (e: KeyboardEvent) => void;
    /** 确认回调；返回 Promise 时确认按钮 loading，resolve 关闭 / reject 保持（对齐 Semi onConfirm） */
    onConfirm?: (e: MouseEvent) => void | Promise<unknown>;
    /** 取消回调；返回 Promise 时取消按钮 loading，resolve 关闭 / reject 保持（对齐 Semi onCancel） */
    onCancel?: (e: MouseEvent) => void | Promise<unknown>;
  }

  let {
    visible,
    defaultVisible = false,
    title,
    content,
    icon,
    okText,
    cancelText,
    okType = 'primary',
    cancelType = 'tertiary',
    okButtonProps,
    cancelButtonProps,
    showCloseIcon = true,
    position = 'bottomLeft',
    trigger = 'click',
    disabled = false,
    closeOnEsc = true,
    arrowPointAtCenter = false,
    showArrow = false,
    motion = true,
    mouseEnterDelay = 50,
    mouseLeaveDelay = 50,
    getPopupContainer,
    zIndex = 1030,
    guardFocus,
    returnFocusOnClose = true,
    stopPropagation = true,
    rePosKey,
    class: className = '',
    style: styleExtra = '',
    children,
    onVisibleChange,
    onClickOutSide,
    onEscKeyDown,
    onConfirm,
    onCancel,
  }: Props = $props();

  const loc = useLocale();
  const titleId = useId('cd-popconfirm-title');

  // --- 受控 visible (红线 #1)：不无条件回写，仅 onVisibleChange ---
  const isControlled = $derived(visible !== undefined);
  // eslint-disable-next-line -- 仅取 defaultVisible 初值作为非受控初始态
  let innerOpen = $state(untrack(() => defaultVisible));
  const isOpen = $derived(isControlled ? !!visible : innerOpen);

  // title / content 归一：string 文本 / Snippet（content 可带 { initialFocusRef } 入参）。
  const titleText = $derived(typeof title === 'string' ? title : undefined);
  const titleSnippet = $derived(typeof title === 'function' ? (title as Snippet) : undefined);
  const hasTitle = $derived(title !== undefined && title !== '');

  const contentText = $derived(typeof content === 'string' ? content : undefined);
  const contentSnippet = $derived(
    typeof content === 'function' ? (content as Snippet<[RenderContentProps]>) : undefined,
  );
  const hasContent = $derived(content !== undefined && content !== '');

  const showIcon = $derived(icon !== false);

  // 透传给 Button 的字段：仅剔除 autoFocus（Popconfirm 私有聚焦语义，经 focusOperateButton
  // 主动 focus，不透传成原生 autofocus）。其余（type/class/theme/size/disabled…）随 Semi
  // 展开在显式默认属性之后，故 okButtonProps.type 等可覆盖组件默认（对齐 Semi）。
  function pickBtnProps(p?: ExtraButtonProps) {
    if (!p) return {};
    const { autoFocus: _a, ...rest } = p;
    return rest;
  }
  const okBtnRest = $derived(pickBtnProps(okButtonProps));
  const cancelBtnRest = $derived(pickBtnProps(cancelButtonProps));

  function setOpen(next: boolean) {
    if (next === (isControlled ? !!visible : innerOpen)) return;
    if (!isControlled) innerOpen = next;
    onVisibleChange?.(next);
  }

  // --- 异步 (红线 #3)：onConfirm/onCancel 返回 Promise 时对应按钮 loading，
  //     resolve 后关闭、reject 保持打开（对齐 Semi PopconfirmFoundation）。 ---
  let confirmLoading = $state(false);
  let cancelLoading = $state(false);
  const busy = $derived(confirmLoading || cancelLoading);

  async function confirm(e: MouseEvent) {
    if (busy) return;
    const result = onConfirm?.(e);
    if (result instanceof Promise) {
      confirmLoading = true;
      try {
        await result;
        confirmLoading = false;
        setOpen(false);
      } catch {
        confirmLoading = false; // reject：复位，保持打开
      }
    } else {
      setOpen(false);
    }
  }

  async function cancel(e: MouseEvent) {
    if (busy) return;
    const result = onCancel?.(e);
    if (result instanceof Promise) {
      cancelLoading = true;
      try {
        await result;
        cancelLoading = false;
        setOpen(false);
      } catch {
        cancelLoading = false;
      }
    } else {
      setOpen(false);
    }
  }

  // Popover onVisibleChange：受控/非受控同步（外部点击/Esc 关闭也走此路）。
  function handlePopoverVisibleChange(next: boolean) {
    if (busy && !next) return; // 异步进行中不被外部关闭打断
    if (!isControlled) innerOpen = next;
    onVisibleChange?.(next);
    if (next) queueMicrotask(focusOperateButton);
  }

  // --- 初始焦点 (对齐 Semi handleFocusOperateButton)：打开时按 autoFocus 聚焦 cancel/ok。 ---
  let footerEl = $state<HTMLDivElement>();
  async function focusOperateButton() {
    await tick();
    const cancelAuto = cancelButtonProps?.autoFocus && !cancelButtonProps?.disabled;
    const okAuto = okButtonProps?.autoFocus && !okButtonProps?.disabled;
    const sel = cancelAuto
      ? '[data-type="cancel"]'
      : okAuto
        ? '[data-type="ok"]'
        : undefined;
    if (!sel) return;
    (footerEl?.querySelector(sel) as HTMLElement | undefined)?.focus({ preventScroll: true });
  }

  // content 函数形态的 initialFocusRef：打开时聚焦浮层内指定元素（复用 Popover 同名机制经 contentSnippet 入参）。
  // 绑定节点自身不可聚焦（如包裹组件的 span）时，聚焦其内部首个可聚焦元素（与 Popover 保持一致）。
  function initialFocusRef(node: HTMLElement) {
    queueMicrotask(() => {
      const target =
        node.matches?.('input, textarea, select, button, a[href], [tabindex]')
          ? node
          : node.querySelector<HTMLElement>('input, textarea, select, button, a[href], [tabindex]');
      (target ?? node).focus?.();
    });
  }
</script>

<Popover
  {trigger}
  {position}
  {disabled}
  {closeOnEsc}
  {arrowPointAtCenter}
  {showArrow}
  {motion}
  {mouseEnterDelay}
  {mouseLeaveDelay}
  {returnFocusOnClose}
  {stopPropagation}
  {zIndex}
  visible={isOpen}
  onVisibleChange={handlePopoverVisibleChange}
  {...(guardFocus !== undefined ? { guardFocus } : {})}
  {...(rePosKey !== undefined ? { rePosKey } : {})}
  {...(getPopupContainer !== undefined ? { getPopupContainer } : {})}
  {...(onClickOutSide !== undefined ? { onClickOutSide } : {})}
  {...(onEscKeyDown !== undefined ? { onEscKeyDown } : {})}
  {...(hasTitle ? { ariaLabelledby: titleId } : {})}
>
  {#snippet content()}
    <div class={`cd-popconfirm ${className}`.trim()} style={styleExtra}>
      <div class="cd-popconfirm-inner">
        <div class="cd-popconfirm-header">
          {#if showIcon}
            <i class="cd-popconfirm-header-icon">
              {#if typeof icon === 'function'}
                {@render icon()}
              {:else}
                <IconAlertTriangle size="extra-large" />
              {/if}
            </i>
          {/if}
          <div class="cd-popconfirm-header-body">
            {#if hasTitle}
              <div class="cd-popconfirm-header-title" id={titleId}>
                {#if titleSnippet}
                  {@render titleSnippet()}
                {:else}
                  {titleText}
                {/if}
              </div>
            {/if}
          </div>
          {#if showCloseIcon}
            <Button
              class="cd-popconfirm-btn-close"
              size="small"
              theme="borderless"
              type={cancelType}
              icon={closeIcon}
              onclick={cancel}
            />
          {/if}
        </div>
        {#if hasContent}
          <div class="cd-popconfirm-body" class:cd-popconfirm-body-withIcon={showIcon}>
            {#if contentSnippet}
              {@render contentSnippet({ initialFocusRef })}
            {:else}
              {contentText}
            {/if}
          </div>
        {/if}
        <div class="cd-popconfirm-footer" bind:this={footerEl}>
          <Button
            data-type="cancel"
            type={cancelType}
            {...cancelBtnRest}
            loading={cancelLoading}
            disabled={cancelButtonProps?.disabled || confirmLoading}
            onclick={cancel}
          >
            {cancelText ?? loc().t('Popconfirm.cancel')}
          </Button>
          <Button
            data-type="ok"
            type={okType}
            theme="solid"
            {...okBtnRest}
            loading={confirmLoading}
            disabled={okButtonProps?.disabled || cancelLoading}
            onclick={confirm}
          >
            {okText ?? loc().t('Popconfirm.confirm')}
          </Button>
        </div>
      </div>
    </div>
  {/snippet}
  {@render children?.()}
</Popover>

{#snippet closeIcon()}
  <IconClose />
{/snippet}

<style>
  /* Popconfirm 卡片：渲染在 Popover 的 .cd-popover 卡面内（bg-0 + border + radius）。
     结构/token/spacing 全量对齐 Semi popconfirm.scss（$module = semi-popconfirm）。 */
  .cd-popconfirm {
    box-sizing: border-box;
    max-inline-size: var(--cd-width-popconfirm-maxwidth);
  }
  /* inner padding: top top top bottom（对齐 Semi：右=top，左=bottom；底=top）。 */
  .cd-popconfirm-inner {
    display: flex;
    flex-direction: column;
    padding: var(--cd-spacing-popconfirm-top) var(--cd-spacing-popconfirm-top)
      var(--cd-spacing-popconfirm-top) var(--cd-spacing-popconfirm-bottom);
    position: relative;
  }
  .cd-popconfirm-header {
    display: flex;
    justify-content: flex-start;
  }
  .cd-popconfirm-header-icon {
    inline-size: var(--cd-width-popconfirm-icon);
    block-size: var(--cd-width-popconfirm-icon);
    margin-inline-end: var(--cd-spacing-popconfirm-header-icon-marginright);
  }
  /* IconAlertTriangle 警示色（对齐 Semi .semi-icon-alert_triangle { color: warning }）。 */
  .cd-popconfirm-header-icon :global(.cd-icon-alert_triangle) {
    color: var(--cd-color-popconfirm-header-alert-icon);
  }
  .cd-popconfirm-header-body {
    display: inline-flex;
    flex-grow: 1;
    flex-direction: column;
    min-inline-size: 0;
  }
  .cd-popconfirm-header-title {
    font-size: var(--cd-font-size-header-6);
    font-weight: var(--cd-font-popconfirm-header-title-fontweight);
    margin-block-end: var(--cd-spacing-popconfirm-header-title-marginbottom);
    color: var(--cd-color-popconfirm-header-text);
  }
  .cd-popconfirm-body {
    color: var(--cd-color-popconfirm-body-text);
  }
  /* 有图标时正文缩进对齐标题（图标宽 + 右外边距，对齐 Semi body-withIcon margin-left）。 */
  .cd-popconfirm-body-withIcon {
    margin-inline-start: calc(
      var(--cd-width-popconfirm-icon) + var(--cd-spacing-popconfirm-header-icon-marginright)
    );
  }
  .cd-popconfirm-body :global(p) {
    margin: var(--cd-spacing-popconfirm-body-p-margin);
    padding: var(--cd-spacing-popconfirm-body-p-padding);
  }
  .cd-popconfirm-footer {
    margin-block-start: var(--cd-spacing-popconfirm-footer-margintop);
    display: flex;
    justify-content: flex-end;
  }
  /* footer 首按钮（非唯一）右外边距（对齐 Semi first-child:not(:last-child)）。 */
  .cd-popconfirm-footer :global(.cd-button:first-child:not(:last-child)) {
    margin-inline-end: var(--cd-spacing-popconfirm-footer-btn-marginright);
  }
</style>
