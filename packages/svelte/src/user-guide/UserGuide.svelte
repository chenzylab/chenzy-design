<!--
  UserGuide — 用户引导，严格对齐 Semi userGuide（破坏性重写，无向后兼容）。
  DOM / token / API 逐条镜像 ~/i/semi-design/packages/semi-ui/userGuide/index.tsx。

  两种模式：
  - popup：每步用本库 Popover（trigger="custom"）贴一个 fixed 定位的透明 target div，
    content=.cd-userGuide-popup-content（cover/body/title/description/footer/indicator/buttons）；
    另渲染 <svg class="cd-userGuide-spotlight"> mask 挖洞遮罩 + 4 块透明 rect 让高亮区可交互。
  - modal：复用本库 Modal（header/footer=null、centered、bodyStyle padding:0），
    .cd-userGuide-modal-cover + -indicator（圆点）+ -body（title/description）+ -footer（按钮）。

  对齐 Semi：无 focus-trap / 无 inert / 无 Esc / 无箭头键 / 无 role=dialog / 无进度 aria /
  无 live-announcer（Semi 皆无）。仅 Semi 的 disabledBodyScroll（body overflow:hidden + 补偿滚动条宽）。
  spotlight 矩形打开/步进时同步测量（对齐 Semi updateSpotlightRect 同步取 rect），scroll/resize rAF 去抖重算。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    useId,
    createUserGuide,
    getSpotlightRect,
    DEFAULT_SPOTLIGHT_PADDING,
    DEFAULT_USER_GUIDE_Z_INDEX,
    type SpotlightRect,
    type UserGuideController,
    type UserGuideMode,
    type UserGuideTheme,
    type UserGuidePosition,
  } from '@chenzy-design/core';
  import { Button } from '../button/index.js';
  import { Popover } from '../popover/index.js';
  import { Modal } from '../modal/index.js';
  import { useLocale } from '../locale-provider/index.js';

  type Mode = UserGuideMode;
  type Theme = UserGuideTheme;
  type Position = UserGuidePosition;

  export interface UserGuideStep {
    /** 步骤自定义类名。 */
    className?: string;
    /** 封面（modal cover + 圆点指示器；popup cover）。 */
    cover?: Snippet | string;
    /** 锚定/高亮目标（popup 必需，无则该步不渲染；modal 忽略）。 */
    target?: (() => Element | null | undefined) | Element | null;
    /** 步骤标题。 */
    title?: string | Snippet;
    /** 步骤描述。 */
    description?: string | Snippet;
    /** 是否显示此步蒙层（覆盖全局，对齐 Semi step.mask）。 */
    mask?: boolean;
    /** 气泡箭头（popup）。 */
    showArrow?: boolean;
    /** 本步高亮内边距（覆盖全局）。 */
    spotlightPadding?: number;
    /** 本步主题（覆盖全局）。 */
    theme?: Theme;
    /** 本步气泡位置（覆盖全局）。 */
    position?: Position;
  }

  interface Props {
    /** **必填**。引导步骤数组。 */
    steps: UserGuideStep[];
    /** 是否显示引导。false→true 时重置到第 0 步。 */
    visible?: boolean;
    /** 当前步索引。提供即受控（内部不改，需配合 onChange 回写）。 */
    current?: number;
    /** popup=气泡贴目标 + spotlight；modal=居中弹窗。 */
    mode?: Mode;
    /** 是否显示遮罩。 */
    mask?: boolean;
    /** 气泡主题（popup）。 */
    theme?: Theme;
    /** 气泡相对目标位置（全局，可被 step 覆盖）。 */
    position?: Position;
    /** 高亮区内边距 px（可被 step 覆盖）。 */
    spotlightPadding?: number;
    /** 显示上一步（首步自动隐藏）。 */
    showPrevButton?: boolean;
    /** 显示跳过（末步自动隐藏）。 */
    showSkipButton?: boolean;
    /** 末步完成按钮文本。 */
    finishText?: string;
    /** 下一步按钮属性透传。 */
    nextButtonProps?: Record<string, unknown>;
    /** 上一步按钮属性透传。 */
    prevButtonProps?: Record<string, unknown>;
    /** 挂载父级；提供时不锁 body 滚动。 */
    getPopupContainer?: () => HTMLElement;
    /** 弹层/spotlight 层级。 */
    zIndex?: number;
    class?: string;
    style?: string;
    /** 步骤改变（去重）。 */
    onChange?: (current: number) => void;
    /** 点下一步（非末步），参数为新 current。 */
    onNext?: (current: number) => void;
    /** 点上一步，参数为 current-1。 */
    onPrev?: (current: number) => void;
    /** 末步点完成（不自动关闭，使用方置 visible=false）。 */
    onFinish?: () => void;
    /** 点跳过（不自动关闭）。 */
    onSkip?: () => void;
  }

  let {
    steps,
    visible = false,
    current,
    mode = 'popup',
    mask = true,
    theme = 'default',
    position = 'bottom',
    spotlightPadding = DEFAULT_SPOTLIGHT_PADDING,
    showPrevButton = true,
    showSkipButton = true,
    finishText,
    nextButtonProps,
    prevButtonProps,
    getPopupContainer,
    zIndex = DEFAULT_USER_GUIDE_Z_INDEX,
    class: className,
    style,
    onChange,
    onNext,
    onPrev,
    onFinish,
    onSkip,
  }: Props = $props();

  const loc = useLocale();
  const userGuideId = useId('cd-userGuide-spotlight');

  const isControlled = $derived(current !== undefined);
  let innerCurrent = $state(0);
  const activeCurrent = $derived(isControlled ? (current as number) : innerCurrent);
  const total = $derived(steps.length);

  const controller = $derived<UserGuideController>(
    createUserGuide({
      steps: steps.map((s) => ({
        target: s.target,
        spotlightPadding: s.spotlightPadding,
      })),
      current: isControlled ? (current as number) : undefined,
      spotlightPadding,
      onChange: (c) => {
        if (!isControlled) innerCurrent = c;
        onChange?.(c);
      },
      onNext,
      onPrev,
      onFinish,
      onSkip,
    }),
  );

  const step = $derived<UserGuideStep | undefined>(steps[activeCurrent]);
  const isFirst = $derived(activeCurrent === 0);
  const isLast = $derived(activeCurrent === total - 1);
  const isPrimary = $derived(theme === 'primary' || step?.theme === 'primary');

  const finishLabel = $derived(finishText || loc().t('UserGuide.finish'));

  function doNext() {
    controller.handleNext();
  }
  function doPrev() {
    controller.handlePrev();
  }
  function doSkip() {
    controller.handleSkip();
  }

  // —— Semi disabledBodyScroll：visible false→true 锁 body 滚动（getPopupContainer 时跳过）+ 重置 current=0 ——
  let bodyOverflow = '';
  let originBodyWidth = '';
  let scrollBarWidth = 0;
  let wasVisible = false;

  function disabledBodyScroll() {
    if (typeof document === 'undefined' || getPopupContainer) return;
    bodyOverflow = document.body.style.overflow || '';
    originBodyWidth = document.body.style.width || '';
    if (bodyOverflow !== 'hidden') {
      document.body.style.overflow = 'hidden';
      document.body.style.width = `calc(${originBodyWidth || '100%'} - ${scrollBarWidth}px)`;
    }
  }
  function enabledBodyScroll() {
    if (typeof document === 'undefined' || getPopupContainer) return;
    if (bodyOverflow !== 'hidden') {
      document.body.style.overflow = bodyOverflow;
      document.body.style.width = originBodyWidth;
    }
  }

  $effect(() => {
    if (typeof window !== 'undefined' && scrollBarWidth === 0) {
      // 对齐 Semi getScrollbarWidth：视口宽 - 文档宽 = 滚动条宽。
      scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    }
    if (visible && !wasVisible) {
      disabledBodyScroll();
      controller.reset();
      if (!isControlled) innerCurrent = 0;
    } else if (!visible && wasVisible) {
      enabledBodyScroll();
    }
    wasVisible = visible;
  });

  $effect(() => {
    return () => enabledBodyScroll();
  });

  // —— spotlight 矩形（popup）：打开/步进同步测量，scroll/resize rAF 去抖重算，目标滚动进视口 ——
  let spotlightRect = $state<SpotlightRect | null>(null);

  const popupTarget = $derived.by<Element | null>(() => {
    if (mode !== 'popup' || !visible || !step?.target) return null;
    const el = typeof step.target === 'function' ? step.target() : step.target;
    return (el as Element) ?? null;
  });

  function scrollTargetIntoViewIfNeeded(target: Element) {
    const rect = target.getBoundingClientRect();
    const inView =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth);
    if (!inView) {
      target.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }

  function measure() {
    if (typeof window === 'undefined') return;
    spotlightRect = getSpotlightRect(
      step ? { target: step.target, spotlightPadding: step.spotlightPadding } : undefined,
      spotlightPadding,
    );
  }

  $effect(() => {
    if (!popupTarget) {
      spotlightRect = null;
      return;
    }
    void activeCurrent;
    scrollTargetIntoViewIfNeeded(popupTarget);
    // 对齐 Semi updateSpotlightRect：打开/步进时同步测量（Semi 同步取 rect，仅 setState 进 rAF）。
    // 全靠 rAF 会在标签被遮挡（rAF 冻结）时让 spotlight 滞后一步；同步测量无此问题。
    measure();
    let frame = 0;
    function schedule() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    }
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
    };
  });

  // popup Popover 定位锚点的 fixed 透明 target 层样式（对齐 Semi renderStep）。
  // 直接取已测量的 spotlightRect（= target rect ± padding），使其仅在测量时离散更新，
  // 避免每次响应式读取都 getBoundingClientRect 触发浮层 style 重写与滚动重排循环。
  const anchorStyle = $derived(
    spotlightRect
      ? `position:fixed;left:${spotlightRect.x}px;top:${spotlightRect.y}px;` +
          `width:${spotlightRect.width}px;height:${spotlightRect.height}px;pointer-events:none;`
      : '',
  );

  const popoverStyle = $derived(
    'padding:0;' +
      (isPrimary ? 'background-color:var(--cd-color-primary);' : '') +
      (style ?? ''),
  );
  const stepPosition = $derived<Position>(step?.position ?? position);

  const maskId = $derived(`spotlight-${userGuideId}`);

  const active = $derived(visible && total > 0);

  // popup 定位锚点是空 div，本库 Popover(trigger=custom) 会把它包成 role=button 宿主；
  // 给一个视觉隐藏的可访问名（step.title 字符串优先，否则用 next 文案），避免 aria-command-name 违规。
  const triggerLabel = $derived(
    typeof step?.title === 'string' && step.title ? step.title : loc().t('UserGuide.next'),
  );
</script>

{#if active && mode === 'popup'}
  <!-- 按 activeCurrent 键控整段重挂：每步换 target 时浮层重建，锚点/定位干净初始化。 -->
  {#if step?.target}
    {#key activeCurrent}
      <Popover
        class={['cd-userGuide-popover', className].filter(Boolean).join(' ')}
        style={popoverStyle}
        position={stepPosition}
        trigger="custom"
        visible={true}
        showArrow={step?.showArrow !== false}
        {...(isPrimary
          ? { arrowStyle: { backgroundColor: 'var(--cd-color-primary)', borderColor: 'var(--cd-color-primary)' } }
          : {})}
        {zIndex}
        {...(getPopupContainer ? { getPopupContainer } : {})}
        triggerStyle={anchorStyle}
        content={popupContent}
      >
        <span class="cd-userGuide-sr-only">{triggerLabel}</span>
      </Popover>
    {/key}
  {/if}

  <!-- spotlight svg mask（对齐 Semi renderSpotlight）：挖洞遮罩 + 4 块透明 rect（高亮区可交互） -->
  {#if step?.target && spotlightRect}
    {@const r = spotlightRect}
    <svg class="cd-userGuide-spotlight" style="z-index:{zIndex};">
      <defs>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill="white" />
          <rect
            class="cd-userGuide-spotlight-rect"
            x={r.x}
            y={r.y}
            width={r.width}
            height={r.height}
            rx={4}
            fill="black"
          />
        </mask>
      </defs>
      {#if step?.mask ?? mask}
        <rect
          width="100%"
          height="100%"
          fill="var(--cd-userguide-spotlight-mask-bg)"
          mask="url(#{maskId})"
        />
        <rect
          x={0}
          y={0}
          width="100%"
          height={r.y}
          fill="transparent"
          class="cd-userGuide-spotlight-transparent-rect"
        />
        <rect
          x={0}
          y={r.y}
          width={r.x}
          height={r.height}
          fill="transparent"
          class="cd-userGuide-spotlight-transparent-rect"
        />
        <rect
          x={r.x + r.width}
          y={r.y}
          width="calc(100% - {r.x + r.width}px)"
          height={r.height}
          fill="transparent"
          class="cd-userGuide-spotlight-transparent-rect"
        />
        <rect
          y={r.y + r.height}
          width="100%"
          height="calc(100% - {r.y + r.height}px)"
          fill="transparent"
          class="cd-userGuide-spotlight-transparent-rect"
        />
      {/if}
    </svg>
  {/if}
{/if}

{#if active && mode === 'modal'}
  <Modal
    class="cd-userGuide-modal"
    bodyStyle="padding:0;"
    header={null}
    footer={null}
    visible={true}
    maskClosable={false}
    {mask}
    centered
    {zIndex}
    {...(getPopupContainer ? { getPopupContainer } : {})}
  >
    {#if step?.cover}
      <div class="cd-userGuide-modal-cover">
        {#if typeof step.cover === 'string'}
          {step.cover}
        {:else}
          {@render step.cover()}
        {/if}
      </div>
      <div class="cd-userGuide-modal-indicator">
        {#each steps as _, i (i)}
          <span
            data-index={i}
            class="cd-userGuide-modal-indicator-item"
            class:cd-userGuide-modal-indicator-item-active={i === activeCurrent}
          ></span>
        {/each}
      </div>
    {/if}
    {#if step?.title || step?.description}
      <div class="cd-userGuide-modal-body">
        {#if step?.title}
          <div class="cd-userGuide-modal-body-title">
            {#if typeof step.title === 'string'}{step.title}{:else}{@render step.title()}{/if}
          </div>
        {/if}
        {#if step?.description}
          <div class="cd-userGuide-modal-body-description">
            {#if typeof step.description === 'string'}{step.description}{:else}{@render step.description()}{/if}
          </div>
        {/if}
      </div>
    {/if}
    <div class="cd-userGuide-modal-footer">
      {#if showSkipButton && !isLast}
        <Button type="tertiary" onclick={doSkip}>{loc().t('UserGuide.skip')}</Button>
      {/if}
      {#if showPrevButton && !isFirst}
        <Button type="tertiary" onclick={doPrev} {...(prevButtonProps ?? {})}>
          {(prevButtonProps?.children as string) || loc().t('UserGuide.prev')}
        </Button>
      {/if}
      <Button theme="solid" onclick={doNext} {...(nextButtonProps ?? {})}>
        {isLast
          ? finishLabel
          : (nextButtonProps?.children as string) || loc().t('UserGuide.next')}
      </Button>
    </div>
  </Modal>
{/if}

<!-- popup 气泡内容（对齐 Semi renderPopupContent）：cover + body（title/description/footer） -->
{#snippet popupContent()}
  <div
    class="cd-userGuide-popup-content"
    class:cd-userGuide-popup-content-primary={isPrimary}
  >
    {#if step?.cover}
      <div class="cd-userGuide-popup-content-cover">
        {#if typeof step.cover === 'string'}
          {step.cover}
        {:else}
          {@render step.cover()}
        {/if}
      </div>
    {/if}
    <div class="cd-userGuide-popup-content-body">
      {#if step?.title}
        <div class="cd-userGuide-popup-content-title">
          {#if typeof step.title === 'string'}{step.title}{:else}{@render step.title()}{/if}
        </div>
      {/if}
      {#if step?.description}
        <div class="cd-userGuide-popup-content-description">
          {#if typeof step.description === 'string'}{step.description}{:else}{@render step.description()}{/if}
        </div>
      {/if}
      <div class="cd-userGuide-popup-content-footer">
        {#if total > 1}
          <div class="cd-userGuide-popup-content-indicator">
            {activeCurrent + 1}/{total}
          </div>
        {/if}
        <div class="cd-userGuide-popup-content-buttons">
          {#if showSkipButton && !isLast}
            <Button
              style={isPrimary ? 'background-color:var(--cd-color-fill-2);' : ''}
              theme={isPrimary ? 'solid' : 'light'}
              type={isPrimary ? 'primary' : 'tertiary'}
              onclick={doSkip}
            >
              {loc().t('UserGuide.skip')}
            </Button>
          {/if}
          {#if showPrevButton && !isFirst}
            <Button
              style={isPrimary ? 'background-color:var(--cd-color-fill-2);' : ''}
              theme={isPrimary ? 'solid' : 'light'}
              type={isPrimary ? 'primary' : 'tertiary'}
              onclick={doPrev}
              {...(prevButtonProps ?? {})}
            >
              {(prevButtonProps?.children as string) || loc().t('UserGuide.prev')}
            </Button>
          {/if}
          <Button
            style={isPrimary ? 'background-color:#FFF;' : ''}
            theme={isPrimary ? 'borderless' : 'solid'}
            type="primary"
            onclick={doNext}
            {...(nextButtonProps ?? {})}
          >
            {isLast
              ? finishLabel
              : (nextButtonProps?.children as string) || loc().t('UserGuide.next')}
          </Button>
        </div>
      </div>
    </div>
  </div>
{/snippet}

<style>
  /* 对齐 Semi userGuide.scss。popover/modal 骨架由 Popover/Modal 组件提供，此处仅 UserGuide 专属层。 */
  :global(.cd-userGuide-spotlight) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
  }
  :global(.cd-userGuide-spotlight-transparent-rect) {
    pointer-events: auto;
  }
  /* 视觉隐藏但读屏可读：给定位锚点 button 宿主一个可访问名。 */
  :global(.cd-userGuide-sr-only) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  :global(.cd-userGuide-spotlight-rect) {
    transition: all var(--cd-userguide-spotlight-duration)
      var(--cd-userguide-spotlight-function);
  }

  :global(.cd-userGuide-popover) {
    max-width: fit-content;
    width: var(--cd-userguide-popover-width);
  }
  /* 清零 Popover 内层卡片 padding（对齐 Semi userGuide 给 Popover 传 style padding:0）：
     气泡内边距全部由 -popup-content-body 的 24px 承担；否则 Popover 带箭头默认 12px 会
     多撑出一圈，气泡宽高比 Semi 大。 */
  :global(.cd-userGuide-popover .cd-popover) {
    padding: 0;
  }

  :global(.cd-userGuide-popup-content) {
    color: var(--cd-userguide-popup-text-default);
  }
  :global(.cd-userGuide-popup-content-primary) {
    color: var(--cd-userguide-popup-text-primary);
  }
  :global(.cd-userGuide-popup-content-cover img) {
    display: block;
    height: var(--cd-userguide-popup-cover-height);
    width: 100%;
    border-radius: var(--cd-userguide-popup-cover-radius);
  }
  :global(.cd-userGuide-popup-content-body) {
    padding: var(--cd-userguide-popup-body-padding);
  }
  :global(.cd-userGuide-popup-content-title) {
    font-size: var(--cd-userguide-popup-title-font-size);
    font-weight: var(--cd-userguide-popup-title-font-weight);
    line-height: var(--cd-userguide-popup-title-line-height);
    margin-bottom: var(--cd-userguide-popup-title-margin-bottom);
  }
  :global(.cd-userGuide-popup-content-description) {
    font-size: var(--cd-userguide-popup-description-font-size);
    line-height: var(--cd-userguide-popup-description-line-height);
    margin-bottom: var(--cd-userguide-popup-description-margin-bottom);
  }
  :global(.cd-userGuide-popup-content-footer) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  :global(.cd-userGuide-popup-content-buttons) {
    display: flex;
    gap: var(--cd-userguide-popup-button-gap);
    margin-left: var(--cd-userguide-popup-button-margin-left);
  }
  :global(.cd-userGuide-popup-content-indicator) {
    font-size: var(--cd-userguide-popup-indicator-font-size);
    line-height: var(--cd-userguide-popup-indicator-line-height);
  }

  /* modal：覆写 Modal 原始 padding + 宽度（对齐 Semi .cd-userGuide-modal .semi-modal-content） */
  :global(.cd-userGuide-modal .cd-modal-small) {
    width: fit-content;
  }
  :global(.cd-userGuide-modal .cd-modal-content) {
    padding: 0;
    width: var(--cd-userguide-modal-cover-width);
    max-width: fit-content;
  }
  :global(.cd-userGuide-modal-cover) {
    height: var(--cd-userguide-modal-cover-height);
  }
  :global(.cd-userGuide-modal-indicator) {
    height: var(--cd-userguide-modal-indicator-height);
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: var(--cd-userguide-popup-indicator-gap);
  }
  :global(.cd-userGuide-modal-indicator-item) {
    width: var(--cd-userguide-modal-indicator-item-width);
    height: var(--cd-userguide-modal-indicator-item-height);
    border-radius: var(--cd-userguide-modal-indicator-radius);
    background-color: var(--cd-userguide-modal-indicator-bg);
  }
  :global(.cd-userGuide-modal-indicator-item-active) {
    background: var(--cd-userguide-modal-indicator-bg-active);
  }
  :global(.cd-userGuide-modal-body) {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: var(--cd-userguide-modal-body-padding);
  }
  :global(.cd-userGuide-modal-body-title) {
    font-size: var(--cd-userguide-modal-title-font-size);
    font-weight: var(--cd-userguide-modal-title-font-weight);
    line-height: var(--cd-userguide-modal-title-line-height);
    margin-bottom: var(--cd-userguide-modal-title-margin-bottom);
  }
  :global(.cd-userGuide-modal-body-description) {
    font-size: var(--cd-userguide-modal-description-font-size);
    line-height: var(--cd-userguide-modal-description-line-height);
  }
  :global(.cd-userGuide-modal-footer) {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--cd-userguide-modal-footer-padding);
    column-gap: var(--cd-userguide-modal-button-gap);
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.cd-userGuide-spotlight-rect) {
      transition: none;
    }
  }
</style>
