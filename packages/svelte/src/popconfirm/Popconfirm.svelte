<!--
  Popconfirm — 气泡确认框（严格对齐 Semi Design semi-ui/popconfirm）。
  架构：Popconfirm 封装 Popover（对齐 Semi `Popconfirm extends PopoverProps` +
  `<Popover content={renderConfirmPopCard}>`）——复用 Popover→Tooltip 的全部定位/触发/
  焦点/dismiss/12 方位/箭头基建，自身只负责：
    - 卡片内容 .cd-popconfirm（header 图标+标题 / body 正文 / footer 取消+确定按钮）
    - 危险分级 type（default/danger/warning）默认图标 + okType/cancelType
    - 异步确认：onConfirm 返回 Promise 时确定按钮 loading，resolve 关闭 / reject 保持打开
  受控 visible（红线 #1）：不回写，仅经 onVisibleChange 通知；trigger 默认 click，
  position 默认 bottomLeft（对齐 Semi）。stopPropagation 默认 true。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { useId, useLiveAnnouncer } from '@chenzy-design/core';
  import { Button } from '../button/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import Popover from '../popover/Popover.svelte';
  import type { Position } from '../tooltip/placement.js';

  type PopType = 'default' | 'danger' | 'warning';
  type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
  type TriggerType = 'click' | 'hover' | 'focus' | 'custom';

  /** 透传给确认/取消 Button 的额外属性（type/theme/size/block/disabled/ariaLabel 等，不含 onclick/loading：由组件托管） */
  type ExtraButtonProps = {
    type?: ButtonType;
    theme?: 'solid' | 'borderless' | 'light' | 'outline';
    size?: 'small' | 'default' | 'large';
    block?: boolean;
    disabled?: boolean;
    htmlType?: 'button' | 'submit' | 'reset';
    ariaLabel?: string;
  };

  interface Props {
    /** 受控显隐（配合 trigger='custom'），对齐 Semi visible */
    visible?: boolean;
    /** 非受控初始显隐 */
    defaultVisible?: boolean;
    title?: string;
    titleSnippet?: Snippet;
    content?: string;
    contentSnippet?: Snippet;
    /** 危险分级：影响默认图标与确定按钮默认 type */
    type?: PopType;
    /** 自定义图标，或传 false 不显示图标 */
    icon?: Snippet | false;
    okText?: string;
    cancelText?: string;
    /** 确定按钮类型，默认 primary（对齐 Semi） */
    okType?: ButtonType;
    /** 取消按钮类型，默认 tertiary（对齐 Semi） */
    cancelType?: ButtonType;
    okButtonProps?: ExtraButtonProps;
    cancelButtonProps?: ExtraButtonProps;
    showCancel?: boolean;
    /** 弹出方位，默认 bottomLeft（对齐 Semi） */
    position?: Position;
    /** 触发方式，默认 click（对齐 Semi） */
    trigger?: TriggerType;
    disabled?: boolean;
    closeOnEsc?: boolean;
    /** 箭头是否指向触发元素中心 */
    arrowPointAtCenter?: boolean;
    /** 是否显示箭头三角，默认 false */
    showArrow?: boolean;
    motion?: boolean;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    getPopupContainer?: () => HTMLElement | null | undefined;
    zIndex?: number;
    /** Tab 键是否在浮层内循环（焦点陷阱），默认随 dialog（click/custom） */
    guardFocus?: boolean;
    returnFocusOnClose?: boolean;
    /** 点击浮层内事件是否阻止冒泡到文档，默认 true（对齐 Semi） */
    stopPropagation?: boolean;
    rePosKey?: string | number;
    class?: string;
    style?: string;
    /** 触发元素（children） */
    children?: Snippet;
    onVisibleChange?: (visible: boolean) => void;
    onClickOutSide?: (e: MouseEvent) => void;
    /** 确认回调；返回 Promise 时确认按钮 loading，resolve 关闭 / reject 保持打开 */
    onConfirm?: () => void | Promise<unknown>;
    onCancel?: () => void;
  }

  let {
    visible,
    defaultVisible = false,
    title,
    titleSnippet,
    content,
    contentSnippet,
    type = 'default',
    icon,
    okText,
    cancelText,
    okType,
    cancelType = 'tertiary',
    okButtonProps,
    cancelButtonProps,
    showCancel = true,
    position = 'bottomLeft',
    trigger = 'click',
    disabled = false,
    closeOnEsc = true,
    arrowPointAtCenter = true,
    showArrow = false,
    motion = true,
    mouseEnterDelay = 50,
    mouseLeaveDelay = 50,
    getPopupContainer,
    zIndex,
    guardFocus,
    returnFocusOnClose = true,
    stopPropagation = true,
    rePosKey,
    class: className = '',
    style: styleExtra = '',
    children,
    onVisibleChange,
    onClickOutSide,
    onConfirm,
    onCancel,
  }: Props = $props();

  const loc = useLocale();
  // 单例 live region（polite）：异步确认进入 loading 时播报「处理中」给屏幕阅读器。
  const announcer = useLiveAnnouncer();

  const titleId = useId('cd-popconfirm-title');
  const contentId = useId('cd-popconfirm-content');

  // --- 受控 visible (红线 #1)：不无条件回写，仅 onVisibleChange ---
  const isControlled = $derived(visible !== undefined);
  // eslint-disable-next-line -- 仅取 defaultVisible 初值作为非受控初始态
  let innerOpen = $state(untrack(() => defaultVisible));
  const isOpen = $derived(isControlled ? !!visible : innerOpen);

  // 确认按钮 type 优先级：显式 okType > okButtonProps.type > 由 type 推导（danger→danger，否则 primary）。
  const resolvedOkType = $derived<ButtonType>(
    okType ?? okButtonProps?.type ?? (type === 'danger' ? 'danger' : 'primary'),
  );
  const resolvedCancelType = $derived<ButtonType>(cancelType ?? cancelButtonProps?.type ?? 'tertiary');

  const hasContent = $derived(Boolean(contentSnippet) || Boolean(content));
  const hasTitle = $derived(Boolean(titleSnippet) || Boolean(title));
  const showIcon = $derived(icon !== false);
  // 别名：Popover 的 content 插槽 `{#snippet content()}` 会遮蔽同名 content prop，
  // 故在插槽内改用这两个别名引用字符串 prop（否则 `{content}` 被当 snippet 触发
  // snippet_without_render_tag）。同理 title。
  const titleTextVal = $derived(title);
  const contentTextVal = $derived(content);

  function setOpen(next: boolean) {
    if (next === (isControlled ? !!visible : innerOpen)) return;
    if (!isControlled) innerOpen = next;
    onVisibleChange?.(next);
  }

  // --- 异步确认 (红线 #3)：onConfirm 返回 Promise 时确认按钮 loading，
  //     resolve 后关闭、reject 保持打开（对齐 ConfirmModal）。 ---
  let confirmLoading = $state(false);

  async function confirm() {
    if (confirmLoading) return;
    const result = onConfirm?.();
    if (result instanceof Promise) {
      confirmLoading = true;
      announcer.announce(loc().t('Popconfirm.confirming'));
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

  function cancel() {
    if (confirmLoading) return;
    onCancel?.();
    setOpen(false);
  }

  // Popover onVisibleChange：受控/非受控同步（外部点击/Esc 关闭时也走此路，触发 onCancel 语义交给 Popover 的 onClickOutSide）。
  function handlePopoverVisibleChange(next: boolean) {
    if (confirmLoading && !next) return; // 异步确认进行中不被外部关闭打断
    if (!isControlled) innerOpen = next;
    onVisibleChange?.(next);
  }

  // dialog 模式无标题时的兜底：Popover 内部已处理（用 Popconfirm.dialogLabel 走 Popover.dialogLabel）。
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
  visible={isOpen}
  onVisibleChange={handlePopoverVisibleChange}
  {...(guardFocus !== undefined ? { guardFocus } : {})}
  {...(zIndex !== undefined ? { zIndex } : {})}
  {...(rePosKey !== undefined ? { rePosKey } : {})}
  {...(getPopupContainer !== undefined ? { getPopupContainer } : {})}
  {...(onClickOutSide !== undefined ? { onClickOutSide } : {})}
  {...(hasTitle ? { ariaLabelledby: titleId } : {})}
>
  {#snippet content()}
    <div class={`cd-popconfirm ${className}`} style={styleExtra}>
      <div class="cd-popconfirm__inner">
        <div class="cd-popconfirm__header">
          {#if showIcon}
            <span
              class="cd-popconfirm__header-icon cd-popconfirm__header-icon--{type}"
              aria-hidden="true"
            >
              {#if typeof icon === 'function'}
                {@render icon()}
              {:else if type === 'danger'}
                <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
                  <path d="M8 4.5v4.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  <circle cx="8" cy="11.3" r="0.9" fill="currentColor" />
                </svg>
              {:else if type === 'warning'}
                <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2 1.5 13.5h13L8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                  <path d="M8 6.3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  <circle cx="8" cy="11.4" r="0.85" fill="currentColor" />
                </svg>
              {:else}
                <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2 1.5 13.5h13L8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                  <path d="M8 6.3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  <circle cx="8" cy="11.4" r="0.85" fill="currentColor" />
                </svg>
              {/if}
            </span>
          {/if}
          <div class="cd-popconfirm__header-body">
            {#if hasTitle}
              <div class="cd-popconfirm__header-title" id={titleId}>
                {#if titleSnippet}
                  {@render titleSnippet()}
                {:else}
                  {titleTextVal}
                {/if}
              </div>
            {/if}
          </div>
        </div>
        {#if hasContent}
          <div
            class="cd-popconfirm__body"
            class:cd-popconfirm__body--with-icon={showIcon}
            id={contentId}
          >
            {#if contentSnippet}
              {@render contentSnippet()}
            {:else}
              {contentTextVal}
            {/if}
          </div>
        {/if}
        <div class="cd-popconfirm__footer">
          {#if showCancel}
            <Button size="small" {...cancelButtonProps} type={resolvedCancelType} disabled={confirmLoading} onclick={cancel}>
              {cancelText ?? loc().t('Popconfirm.cancel')}
            </Button>
          {/if}
          <Button
            size="small"
            theme="solid"
            {...okButtonProps}
            type={resolvedOkType}
            loading={confirmLoading}
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

<style>
  /* Popconfirm 卡片：渲染在 Popover 的 .cd-popover 卡面内（light bg-3 + border + radius）。
     对齐 Semi .popconfirm-inner/header/body/footer 结构与 token。 */
  .cd-popconfirm {
    max-inline-size: var(--cd-width-popconfirm-maxwidth);
  }
  .cd-popconfirm__inner {
    padding: var(--cd-spacing-popconfirm-top) var(--cd-spacing-popconfirm-top)
      var(--cd-spacing-popconfirm-bottom) var(--cd-spacing-popconfirm-top);
  }
  .cd-popconfirm__header {
    display: flex;
    align-items: flex-start;
  }
  .cd-popconfirm__header-icon {
    display: inline-flex;
    flex-shrink: 0;
    inline-size: var(--cd-width-popconfirm-icon);
    block-size: var(--cd-width-popconfirm-icon);
    margin-inline-end: var(--cd-spacing-popconfirm-header-icon-marginright);
    line-height: 1;
  }
  .cd-popconfirm__header-icon--danger {
    color: var(--cd-popconfirm-icon-color-danger);
  }
  .cd-popconfirm__header-icon--warning,
  .cd-popconfirm__header-icon--default {
    color: var(--cd-popconfirm-icon-color-warning);
  }
  .cd-popconfirm__header-body {
    min-inline-size: 0;
    flex: 1;
  }
  .cd-popconfirm__header-title {
    color: var(--cd-color-popconfirm-header-text);
    font-weight: var(--cd-font-popconfirm-header-title-fontweight);
    line-height: 1.4;
    margin-block-end: var(--cd-spacing-popconfirm-header-title-marginbottom);
  }
  .cd-popconfirm__body {
    color: var(--cd-color-popconfirm-body-text);
    line-height: 1.5;
  }
  /* 有图标时正文缩进对齐标题（图标宽 + 右外边距） */
  .cd-popconfirm__body--with-icon {
    padding-inline-start: calc(
      var(--cd-width-popconfirm-icon) + var(--cd-spacing-popconfirm-header-icon-marginright)
    );
  }
  .cd-popconfirm__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--cd-spacing-popconfirm-footer-btn-marginright);
    margin-block-start: var(--cd-spacing-popconfirm-footer-margintop);
  }
</style>
