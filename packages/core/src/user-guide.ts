/**
 * createUserGuide — headless 步进状态机 + spotlight 矩形计算，框架无关。
 *
 * 用于 UserGuide 用户引导（见 specs/components/show/UserGuide.spec.md）：
 * - 步进：current（受控/非受控）、handleNext/handlePrev/handleSkip/handleFinish；
 *   回调去重（current 未变不 notify）。
 * - visible false→true 时重置 current=0（非受控）。
 * - popup 无 target 的步骤跳过（前进/后退时跳过无锚定步骤）。
 * - spotlight 矩形：target.getBoundingClientRect() + padding 三层覆盖（step > props > 默认 5）。
 * - 按钮显隐规则（跳过：非末步；上一步：非首步；下一步/完成）。
 *
 * 纯逻辑，无 DOM 依赖（矩形计算接收调用方传入的 target Element，仅在浏览器侧调用
 * getBoundingClientRect —— getSpotlightRect 由渲染层在有 document 时调用）。
 */

export type UserGuideMode = 'popup' | 'modal';
export type UserGuideTheme = 'default' | 'primary';
export type UserGuidePosition = 'top' | 'bottom' | 'left' | 'right';

/** 单步定义（core 只关心与步进/矩形有关的字段；渲染字段如 title/description 在渲染层）。 */
export interface UserGuideStepData {
  /** 锚定/高亮目标（popup 必需，无则该步跳过；modal 忽略）。 */
  target?: (() => Element | null | undefined) | Element | null | undefined;
  /** 本步高亮内边距（覆盖 props 级）。 */
  spotlightPadding?: number | undefined;
}

export interface CreateUserGuideOptions {
  /** 步骤数组。 */
  steps: UserGuideStepData[];
  /** 受控当前步；提供即受控（内部不改，需配合 onChange 回写）。 */
  current?: number | undefined;
  /** props 级默认 spotlight 内边距，默认 5。 */
  spotlightPadding?: number | undefined;
  /** 模式；modal 模式下步骤不因缺 target 跳过。默认 'popup'。 */
  mode?: UserGuideMode | undefined;
  onChange?: ((current: number) => void) | undefined;
  onNext?: ((current: number) => void) | undefined;
  onPrev?: ((current: number) => void) | undefined;
  onFinish?: (() => void) | undefined;
  onSkip?: (() => void) | undefined;
}

/** spotlight 高亮矩形（视口坐标）。 */
export interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UserGuideState {
  /** 生效的当前步（受控取 options.current，非受控取内部）。 */
  readonly current: number;
  /** 是否首步（考虑可跳过步）。 */
  readonly isFirst: boolean;
  /** 是否末步。 */
  readonly isLast: boolean;
  readonly total: number;
}

const DEFAULT_PADDING = 5;

function resolveTarget(
  target: UserGuideStepData['target'],
): Element | null {
  if (!target) return null;
  const el = typeof target === 'function' ? target() : target;
  return el ?? null;
}

/**
 * 一个步骤在 popup 模式下是否「有效」（有可解析的 target）。modal 模式恒有效。
 */
export function isStepActive(
  step: UserGuideStepData | undefined,
  mode: UserGuideMode,
): boolean {
  if (!step) return false;
  if (mode === 'modal') return true;
  return resolveTarget(step.target) !== null;
}

/**
 * 从 from 起（含/不含由 inclusive 控制）按 dir 方向找到下一个有效步索引。
 * 找不到返回 -1。popup 模式跳过无 target 步；modal 模式所有步有效。
 */
export function nextActiveIndex(
  steps: UserGuideStepData[],
  from: number,
  dir: 1 | -1,
  mode: UserGuideMode,
  inclusive = false,
): number {
  let i = inclusive ? from : from + dir;
  for (; i >= 0 && i < steps.length; i += dir) {
    if (isStepActive(steps[i], mode)) return i;
  }
  return -1;
}

/**
 * 计算 spotlight 高亮矩形：target.getBoundingClientRect() 外扩 padding。
 * padding 三层覆盖：step.spotlightPadding > props spotlightPadding > 默认 5。
 * 无 target 返回 null。
 */
export function getSpotlightRect(
  step: UserGuideStepData | undefined,
  propsPadding: number = DEFAULT_PADDING,
): SpotlightRect | null {
  if (!step) return null;
  const el = resolveTarget(step.target);
  if (!el || typeof el.getBoundingClientRect !== 'function') return null;
  const rect = el.getBoundingClientRect();
  const padding =
    step.spotlightPadding ?? propsPadding ?? DEFAULT_PADDING;
  return {
    x: rect.left - padding,
    y: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

/** 跳过按钮是否显示：非末步显示（末步用完成替代）。 */
export function shouldShowSkip(current: number, total: number): boolean {
  return total > 0 && current < total - 1;
}

/** 上一步按钮是否显示：非首步显示。 */
export function shouldShowPrev(current: number): boolean {
  return current > 0;
}

/** 末步（下一步按钮变完成）。 */
export function isLastStep(current: number, total: number): boolean {
  return total > 0 && current >= total - 1;
}

export interface UserGuideController {
  /** 当前生效步索引。 */
  getCurrent(): number;
  /** 总步数。 */
  getTotal(): number;
  /** 是否受控。 */
  isControlled(): boolean;
  /** 前进到下一有效步（末步不前进）。返回是否改变。 */
  handleNext(): boolean;
  /** 回退到上一有效步（首步不回退）。返回是否改变。 */
  handlePrev(): boolean;
  /** 跳过：触发 onSkip（不自动关闭，使用方置 visible=false）。 */
  handleSkip(): void;
  /** 完成：触发 onFinish（不自动关闭）。 */
  handleFinish(): void;
  /** visible false→true 时调用：非受控重置 current=0（并对齐到首个有效步）。 */
  reset(): void;
  /** 同步受控 current（受控模式外部改变时调用）。 */
  setControlledCurrent(current: number): void;
}

/**
 * 创建步进控制器。受控（提供 current）时内部不改 current，仅经 onChange 通知；
 * 非受控时内部维护 current。回调去重：目标 current 与当前相同则不 notify onChange。
 */
export function createUserGuide(
  options: CreateUserGuideOptions,
): UserGuideController {
  const controlled = options.current !== undefined;
  const mode: UserGuideMode = options.mode ?? 'popup';
  // 非受控内部状态；对齐到首个有效步。
  let inner = controlled
    ? (options.current as number)
    : Math.max(0, nextActiveIndex(options.steps, 0, 1, mode, true));

  function total(): number {
    return options.steps.length;
  }

  function current(): number {
    return controlled ? (options.current as number) : inner;
  }

  function commit(next: number, notifyPrev: boolean, notifyNext: boolean): boolean {
    const cur = current();
    if (next === cur || next < 0 || next >= total()) return false;
    if (!controlled) inner = next;
    if (notifyNext) options.onNext?.(next);
    if (notifyPrev) options.onPrev?.(next);
    options.onChange?.(next);
    return true;
  }

  return {
    getCurrent: current,
    getTotal: total,
    isControlled: () => controlled,
    handleNext() {
      const from = current();
      const next = nextActiveIndex(options.steps, from, 1, mode);
      if (next === -1) return false;
      return commit(next, false, true);
    },
    handlePrev() {
      const from = current();
      const prev = nextActiveIndex(options.steps, from, -1, mode);
      if (prev === -1) return false;
      return commit(prev, true, false);
    },
    handleSkip() {
      options.onSkip?.();
    },
    handleFinish() {
      options.onFinish?.();
    },
    reset() {
      if (controlled) return;
      inner = Math.max(0, nextActiveIndex(options.steps, 0, 1, mode, true));
    },
    setControlledCurrent(next: number) {
      if (controlled) return;
      inner = next;
    },
  };
}
