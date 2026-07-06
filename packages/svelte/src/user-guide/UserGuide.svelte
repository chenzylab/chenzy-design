<!--
  UserGuide — see specs/components/show/UserGuide.spec.md
  分步用户引导。两种模式：
  - popup：<svg> mask 挖洞遮罩（spotlight 高亮目标）+ floating 定位气泡贴目标 + 目标 scrollIntoView。
  - modal：复用 Modal（centered、无 header/footer、cover + 圆点指示器）。

  a11y（超越 Semi）：role=dialog + aria-modal + aria-labelledby/describedby；
  打开移焦（useFocusTrap）+ 焦点困住 + 关闭归还；背景 inert（useInertBackground）；
  Esc=跳过、←/→=上一步/下一步；scroll-lock（getPopupContainer 时跳过）；
  进度 aria-label + live-announcer polite 播报。

  红线 #3：spotlight 矩形测量延后到下一宏任务（setTimeout 0）避免首帧同步 dispatch
  触发 effect_update_depth_exceeded；timer 纳入 cleanup。svg mask id 用 useId 递增计数
  （非 Math.random/Date.now）避免 SSR 冲突。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    useId,
    useFocusTrap,
    useScrollLock,
    useInertBackground,
    useLiveAnnouncer,
    createUserGuide,
    getSpotlightRect,
    isStepActive,
    shouldShowSkip,
    shouldShowPrev,
    isLastStep,
    type SpotlightRect,
    type UserGuideController,
  } from '@chenzy-design/core';
  import { Button } from '../button/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import { getGlobalPopupContainer } from '../config-provider/index.js';
  import { floating } from '../_floating/use-floating.js';

  type Mode = 'popup' | 'modal';
  type Theme = 'default' | 'primary';
  type Position = 'top' | 'bottom' | 'left' | 'right';

  export interface UserGuideStep {
    /** 锚定/高亮目标（popup 必需，无则该步跳过；modal 忽略）。 */
    target?: (() => Element | null | undefined) | Element | null;
    /** 步骤标题。 */
    title?: string | Snippet;
    /** 步骤描述。 */
    description?: string | Snippet;
    /** 封面（modal 有 cover 才渲染圆点指示器）。 */
    cover?: Snippet;
    /** 本步气泡位置。 */
    position?: Position;
    /** 本步主题。 */
    theme?: Theme;
    /** 气泡箭头（popup）。 */
    showArrow?: boolean;
    /** 本步高亮内边距。 */
    spotlightPadding?: number;
    /** 步骤自定义类名。 */
    className?: string;
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
    getPopupContainer?: () => HTMLElement | null | undefined;
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
    spotlightPadding = 5,
    showPrevButton = true,
    showSkipButton = true,
    finishText,
    nextButtonProps,
    prevButtonProps,
    getPopupContainer,
    zIndex = 1030,
    class: className,
    style,
    onChange,
    onNext,
    onPrev,
    onFinish,
    onSkip,
  }: Props = $props();

  const loc = useLocale();
  const announcer = useLiveAnnouncer();
  const globalPopupContainer = getGlobalPopupContainer();
  // 唯一 mask id（递增计数，非随机，避免 SSR / 多实例冲突）。
  const maskId = useId('cd-userguide-mask');
  const titleId = useId('cd-userguide-title');
  const descId = useId('cd-userguide-desc');

  const isControlled = $derived(current !== undefined);
  // 非受控内部步；受控读 current。
  let innerCurrent = $state(0);
  const activeCurrent = $derived(isControlled ? (current as number) : innerCurrent);
  const total = $derived(steps.length);

  // 控制器：每次 steps/current 变化重建（纯逻辑，无副作用）。回调更新内部步。
  const controller = $derived<UserGuideController>(
    createUserGuide({
      steps: steps.map((s) => ({
        target: s.target,
        spotlightPadding: s.spotlightPadding,
      })),
      current: isControlled ? (current as number) : undefined,
      mode,
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
  const stepTheme = $derived<Theme>(step?.theme ?? theme);
  const stepPosition = $derived<Position>(step?.position ?? position);
  const stepShowArrow = $derived(step?.showArrow ?? true);
  const showArrow = $derived(stepShowArrow);

  // popup 是否有可渲染的当前步（有 target）。
  const popupActive = $derived(
    mode === 'popup' && visible && isStepActive(step, 'popup'),
  );
  const modalActive = $derived(mode === 'modal' && visible && total > 0);

  // 圆点指示器：modal 且任一步有 cover 时渲染。
  const hasCover = $derived(steps.some((s) => Boolean(s.cover)));

  const finishLabel = $derived(finishText ?? loc().t('UserGuide.finish'));
  const stepIndicatorLabel = $derived(
    loc().t('UserGuide.stepIndicator', {
      current: activeCurrent + 1,
      total,
    }),
  );

  const showPrev = $derived(showPrevButton && shouldShowPrev(activeCurrent));
  const showSkip = $derived(showSkipButton && shouldShowSkip(activeCurrent, total));
  const isLast = $derived(isLastStep(activeCurrent, total));

  function doNext() {
    if (isLast) {
      controller.handleFinish();
    } else {
      controller.handleNext();
    }
  }
  function doPrev() {
    controller.handlePrev();
  }
  function doSkip() {
    controller.handleSkip();
  }

  // --- visible false→true 重置（非受控） ---
  let wasVisible = false;
  $effect(() => {
    if (visible && !wasVisible) {
      controller.reset();
      if (!isControlled) innerCurrent = controller.getCurrent();
    }
    wasVisible = visible;
  });

  // --- spotlight 矩形：延后到下一宏任务测量（红线 #3），随 current/visible 变化重算，
  //     scroll/resize 时 rAF 去抖重算。目标 scrollIntoView 进视口居中。 ---
  let spotlight = $state<SpotlightRect | null>(null);

  function measure() {
    if (typeof window === 'undefined') return;
    spotlight = getSpotlightRect(
      step ? { target: step.target, spotlightPadding: step.spotlightPadding } : undefined,
      spotlightPadding,
    );
  }

  $effect(() => {
    if (!popupActive) {
      spotlight = null;
      return;
    }
    // 依赖收集：current / step 变化触发重测。
    void activeCurrent;
    void step;
    // 目标滚动进视口（同步安全，非 dispatch）。
    const el =
      typeof step?.target === 'function' ? step?.target() : step?.target;
    if (el && typeof (el as Element).scrollIntoView === 'function') {
      (el as Element).scrollIntoView({ block: 'center', inline: 'center' });
    }
    // 首帧测量延后到下一宏任务，避免挂载 effect 同步栈内读写自身（红线 #3.2）。
    const t = setTimeout(measure, 0);
    let frame = 0;
    function schedule() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    }
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    return () => {
      clearTimeout(t);
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
    };
  });

  // --- 浮层命令式编排（红线 #3）：popup/modal 激活且面板就绪时，
  //     focus-trap activate、加 scroll-lock（getPopupContainer 时跳过）、背景 inert、
  //     绑 Esc/←/→ 键盘；cleanup 里 deactivate（归还焦点）、release、解绑。 ---
  let bubbleEl = $state<HTMLElement | null>(null);
  let overlayRootEl = $state<HTMLElement | null>(null);

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      doSkip();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      controller.handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      controller.handlePrev();
    }
  }

  $effect(() => {
    // popup 模式的浮层编排（modal 模式由 Modal 组件自带 trap/scroll-lock/inert）。
    if (!popupActive || !bubbleEl) return;
    const trap = useFocusTrap(bubbleEl);
    trap.activate();
    const releaseScroll = getPopupContainer ? () => {} : useScrollLock();
    const releaseInert =
      mask && overlayRootEl ? useInertBackground(overlayRootEl) : () => {};
    bubbleEl.addEventListener('keydown', onKeydown);
    return () => {
      bubbleEl?.removeEventListener('keydown', onKeydown);
      releaseInert();
      releaseScroll();
      trap.deactivate();
    };
  });

  // --- 步进播报（polite）：current 变化时播报「第 N 步：{title}」。 ---
  let lastAnnounced = -1;
  $effect(() => {
    if (!visible) {
      lastAnnounced = -1;
      return;
    }
    const c = activeCurrent;
    if (c === lastAnnounced) return;
    lastAnnounced = c;
    const t = step?.title;
    const titleText = typeof t === 'string' ? t : '';
    const msg = titleText
      ? `${stepIndicatorLabel}：${titleText}`
      : stepIndicatorLabel;
    announcer.announce(msg, 'polite');
  });

  // svg mask viewBox / spotlight 矩形样式。
  const spotlightStyle = $derived(
    spotlight
      ? `--cd-ug-x:${spotlight.x}px;--cd-ug-y:${spotlight.y}px;--cd-ug-w:${spotlight.width}px;--cd-ug-h:${spotlight.height}px;`
      : '',
  );

  // popup 气泡定位锚点：resolve 当前 target 元素。
  const anchorEl = $derived.by<HTMLElement | null>(() => {
    if (!popupActive) return null;
    const el =
      typeof step?.target === 'function' ? step?.target() : step?.target;
    return (el as HTMLElement) ?? null;
  });

  // floating placement 映射（Position → 底层 Placement 中心对齐）。
  const placement = $derived(stepPosition);

  const rootZ = $derived(zIndex);

  // portal action：把 popup 遮罩 + 气泡挂到 getPopupContainer()/body。
  function portal(node: HTMLElement) {
    if (typeof document === 'undefined') return { destroy() {} };
    const target =
      getPopupContainer?.() ?? globalPopupContainer?.() ?? document.body;
    target.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  }

  // modal 模式浮层编排（与 popup 分开，锚定 modal 面板）。
  let modalPanelEl = $state<HTMLElement | null>(null);
  let modalMaskEl = $state<HTMLElement | null>(null);
  $effect(() => {
    if (!modalActive || !modalPanelEl) return;
    const trap = useFocusTrap(modalPanelEl);
    trap.activate();
    const releaseScroll = getPopupContainer ? () => {} : useScrollLock();
    const releaseInert =
      mask && modalMaskEl ? useInertBackground(modalMaskEl) : () => {};
    modalPanelEl.addEventListener('keydown', onKeydown);
    return () => {
      modalPanelEl?.removeEventListener('keydown', onKeydown);
      releaseInert();
      releaseScroll();
      trap.deactivate();
    };
  });

  // 是否为 string 型 title/description（用于 aria 关联决定）。
  const hasStringTitle = $derived(typeof step?.title === 'string' && step.title !== '');
  const hasDesc = $derived(Boolean(step?.description));

  const rootClass = $derived(
    ['cd-userguide', `cd-userguide--${stepTheme}`, step?.className, className]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#if popupActive}
  <!-- popup 遮罩 + spotlight svg mask，portal 到 getPopupContainer()/body。
       遮罩 role=presentation：挖洞高亮区可透传交互（引导「点这里」场景）。 -->
  <div
    class="cd-userguide-overlay"
    bind:this={overlayRootEl}
    style="z-index:{rootZ}; {spotlightStyle}"
    use:portal
  >
    {#if mask}
      <svg class="cd-userguide-mask" aria-hidden="true" width="100%" height="100%">
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {#if spotlight}
              <rect
                class="cd-userguide-hole"
                x={spotlight.x}
                y={spotlight.y}
                width={spotlight.width}
                height={spotlight.height}
                rx="4"
                ry="4"
                fill="black"
              />
            {/if}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="var(--cd-userguide-mask-bg)"
          mask="url(#{maskId})"
        />
      </svg>
    {/if}

    <!-- spotlight 边框高亮（可选视觉，pointer-events:none，不拦截交互） -->
    {#if spotlight}
      <div class="cd-userguide-spotlight" aria-hidden="true"></div>
    {/if}

    <!-- 气泡：role=dialog，floating 贴目标；keydown Esc/←→ 在脚本命令式绑定 -->
    {#if anchorEl}
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        class={rootClass}
        bind:this={bubbleEl}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasStringTitle ? titleId : undefined}
        aria-label={hasStringTitle ? undefined : loc().t('UserGuide.next')}
        aria-describedby={hasDesc ? descId : undefined}
        tabindex="-1"
        style={style}
        use:floating={{
          trigger: anchorEl,
          placement,
          offset: 12,
          autoAdjust: true,
        }}
      >
        {#if showArrow}
          <span class="cd-userguide__arrow" aria-hidden="true"></span>
        {/if}
        {#if step?.title}
          <div class="cd-userguide__title" id={hasStringTitle ? titleId : undefined}>
            {#if typeof step.title === 'string'}
              {step.title}
            {:else}
              {@render step.title()}
            {/if}
          </div>
        {/if}
        {#if step?.description}
          <div class="cd-userguide__desc" id={descId}>
            {#if typeof step.description === 'string'}
              {step.description}
            {:else}
              {@render step.description()}
            {/if}
          </div>
        {/if}

        <div class="cd-userguide__footer">
          <span class="cd-userguide__progress" aria-label={stepIndicatorLabel}>
            {stepIndicatorLabel}
          </span>
          <div class="cd-userguide__actions">
            {#if showSkip}
              <Button size="small" onclick={doSkip}>{loc().t('UserGuide.skip')}</Button>
            {/if}
            {#if showPrev}
              <Button size="small" onclick={doPrev} {...(prevButtonProps ?? {})}>
                {loc().t('UserGuide.prev')}
              </Button>
            {/if}
            <Button size="small" type="primary" onclick={doNext} {...(nextButtonProps ?? {})}>
              {isLast ? finishLabel : loc().t('UserGuide.next')}
            </Button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

{#if modalActive}
  <div
    class="cd-userguide-modal-mask"
    class:cd-userguide-modal-mask--no-mask={!mask}
    bind:this={modalMaskEl}
    style="z-index:{rootZ}; {mask ? 'background:var(--cd-userguide-mask-bg);' : ''}"
    role="presentation"
    use:portal
  >
    <div
      class={rootClass + ' cd-userguide-modal'}
      bind:this={modalPanelEl}
      role="dialog"
      aria-modal="true"
      aria-labelledby={hasStringTitle ? titleId : undefined}
      aria-describedby={hasDesc ? descId : undefined}
      tabindex="-1"
      style={style}
    >
      {#if step?.cover}
        <div class="cd-userguide-modal__cover">{@render step.cover()}</div>
      {/if}
      {#if step?.title}
        <div class="cd-userguide__title" id={hasStringTitle ? titleId : undefined}>
          {#if typeof step.title === 'string'}
            {step.title}
          {:else}
            {@render step.title()}
          {/if}
        </div>
      {/if}
      {#if step?.description}
        <div class="cd-userguide__desc" id={descId}>
          {#if typeof step.description === 'string'}
            {step.description}
          {:else}
            {@render step.description()}
          {/if}
        </div>
      {/if}

      {#if hasCover}
        <div class="cd-userguide__indicators" aria-hidden="true">
          {#each steps as _, i (i)}
            <span
              class="cd-userguide__dot"
              class:cd-userguide__dot--active={i === activeCurrent}
            ></span>
          {/each}
        </div>
      {/if}

      <div class="cd-userguide__footer">
        <span class="cd-userguide__progress" aria-label={stepIndicatorLabel}>
          {stepIndicatorLabel}
        </span>
        <div class="cd-userguide__actions">
          {#if showSkip}
            <Button size="small" onclick={doSkip}>{loc().t('UserGuide.skip')}</Button>
          {/if}
          {#if showPrev}
            <Button size="small" onclick={doPrev} {...(prevButtonProps ?? {})}>
              {loc().t('UserGuide.prev')}
            </Button>
          {/if}
          <Button size="small" type="primary" onclick={doNext} {...(nextButtonProps ?? {})}>
            {isLast ? finishLabel : loc().t('UserGuide.next')}
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .cd-userguide-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
  }
  .cd-userguide-mask {
    position: fixed;
    inset: 0;
    display: block;
    pointer-events: auto;
  }
  /* 挖洞区域让出交互：spotlight 视觉边框，pointer-events:none */
  .cd-userguide-spotlight {
    position: fixed;
    inset-inline-start: var(--cd-ug-x);
    inset-block-start: var(--cd-ug-y);
    inline-size: var(--cd-ug-w);
    block-size: var(--cd-ug-h);
    border-radius: var(--cd-userguide-spotlight-radius);
    box-shadow: 0 0 0 2px var(--cd-userguide-indicator-active);
    pointer-events: none;
    transition: all var(--cd-userguide-spotlight-transition);
  }

  .cd-userguide {
    box-sizing: border-box;
    inline-size: max-content;
    max-inline-size: var(--cd-userguide-popup-width);
    padding: var(--cd-userguide-popup-padding);
    background: var(--cd-userguide-popup-bg);
    color: var(--cd-userguide-popup-color);
    border-radius: var(--cd-userguide-popup-radius);
    box-shadow: var(--cd-userguide-popup-shadow);
    pointer-events: auto;
    position: relative;
  }
  .cd-userguide--primary {
    background: var(--cd-userguide-popup-bg-primary);
    color: var(--cd-userguide-popup-color-primary);
  }
  .cd-userguide__arrow {
    position: absolute;
    inline-size: 8px;
    block-size: 8px;
    background: inherit;
    /* 简化：不做方位精细贴合，视觉指示 */
    inset-block-start: -4px;
    inset-inline-start: 16px;
    transform: rotate(45deg);
    background: var(--cd-userguide-popup-bg);
  }
  .cd-userguide--primary .cd-userguide__arrow {
    background: var(--cd-userguide-popup-bg-primary);
  }
  .cd-userguide__title {
    font-size: var(--cd-userguide-title-size);
    font-weight: var(--cd-userguide-title-weight);
    margin-block-end: 8px;
  }
  .cd-userguide__desc {
    color: var(--cd-userguide-desc-color);
    font-size: var(--cd-font-size-regular);
    line-height: 1.5;
  }
  .cd-userguide--primary .cd-userguide__desc {
    color: var(--cd-userguide-popup-color-primary);
    opacity: 0.9;
  }
  .cd-userguide__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-block-start: 16px;
  }
  .cd-userguide__progress {
    font-size: var(--cd-font-size-secondary, 12px);
    color: var(--cd-userguide-desc-color);
    white-space: nowrap;
  }
  .cd-userguide--primary .cd-userguide__progress {
    color: var(--cd-userguide-popup-color-primary);
    opacity: 0.85;
  }
  .cd-userguide__actions {
    display: flex;
    gap: 8px;
  }

  /* modal 模式 */
  .cd-userguide-modal-mask {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    overflow: auto;
  }
  .cd-userguide-modal-mask--no-mask {
    pointer-events: none;
  }
  .cd-userguide-modal-mask--no-mask .cd-userguide-modal {
    pointer-events: auto;
  }
  .cd-userguide-modal {
    inline-size: 420px;
    max-inline-size: 90vw;
  }
  .cd-userguide-modal__cover {
    margin-block-end: 16px;
    border-radius: var(--cd-userguide-popup-radius);
    overflow: hidden;
  }
  .cd-userguide__indicators {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-block-start: 16px;
  }
  .cd-userguide__dot {
    inline-size: var(--cd-userguide-indicator-size);
    block-size: var(--cd-userguide-indicator-size);
    border-radius: 50%;
    background: var(--cd-userguide-indicator-color);
    transition: background var(--cd-userguide-spotlight-transition);
  }
  .cd-userguide__dot--active {
    background: var(--cd-userguide-indicator-active);
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-userguide-spotlight,
    .cd-userguide__dot {
      transition: none;
    }
  }
</style>
