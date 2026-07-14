/**
 * createUserGuide — headless 步进状态机 + spotlight 矩形计算，框架无关。
 *
 * 严格对齐 Semi userGuide/foundation.ts（破坏性重写，无向后兼容）：
 * - 步进：current（受控/非受控）、handlePrev/handleNext/handleSkip；回调去重（notifyChange
 *   仅在 current 变化时触发）。末步 handleNext 触发 finish 而非前进。
 * - 受控判定：提供 current 即受控，内部不 setCurrent，仅 notify。
 * - 无「无 target 步骤跳过」逻辑（对齐 Semi：renderStep 对无 target 步返回 null，导航仍 +1/-1）。
 * - spotlight 矩形：target.getBoundingClientRect() + padding（step > props > 默认 5）。
 */

export type UserGuideMode = 'popup' | 'modal';
export type UserGuideTheme = 'default' | 'primary';
/** 对齐 Semi POSITION_SET（tooltip 14 方位）。 */
export type UserGuidePosition =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTopOver'
  | 'rightTopOver';

/** 单步定义（core 只关心与步进/矩形有关的字段；渲染字段如 title/description 在渲染层）。 */
export interface UserGuideStepData {
  /** 锚定/高亮目标（popup；无则该步不渲染 spotlight/popover）。 */
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
  onChange?: ((current: number) => void) | undefined;
  onNext?: ((current: number) => void) | undefined;
  onPrev?: ((current: number) => void) | undefined;
  onFinish?: (() => void) | undefined;
  onSkip?: (() => void) | undefined;
}

/** spotlight 高亮矩形（视口坐标，对齐 Semi DOMRect x/y/width/height）。 */
export interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DEFAULT_SPOTLIGHT_PADDING = 5;
export const DEFAULT_USER_GUIDE_Z_INDEX = 1030;

function resolveTarget(target: UserGuideStepData['target']): Element | null {
  if (!target) return null;
  const el = typeof target === 'function' ? target() : target;
  return el ?? null;
}

/**
 * 计算 spotlight 高亮矩形：target.getBoundingClientRect() 外扩 padding。
 * padding：step.spotlightPadding > props spotlightPadding > 默认 5（对齐 Semi）。
 * 无 target 返回 null。
 */
export function getSpotlightRect(
  step: UserGuideStepData | undefined,
  propsPadding: number = DEFAULT_SPOTLIGHT_PADDING,
): SpotlightRect | null {
  if (!step) return null;
  const el = resolveTarget(step.target);
  if (!el || typeof el.getBoundingClientRect !== 'function') return null;
  const rect = el.getBoundingClientRect();
  const padding =
    step.spotlightPadding || propsPadding || DEFAULT_SPOTLIGHT_PADDING;
  return {
    x: rect.left - padding,
    y: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

export interface UserGuideController {
  /** 当前生效步索引。 */
  getCurrent(): number;
  /** 总步数。 */
  getTotal(): number;
  /** 是否受控。 */
  isControlled(): boolean;
  /** 前进：非末步 current+1（notifyChange+notifyNext），末步触发 finish。 */
  handleNext(): void;
  /** 回退：current-1（notifyChange+notifyPrev）。 */
  handlePrev(): void;
  /** 跳过：触发 onSkip（不自动关闭，使用方置 visible=false）。 */
  handleSkip(): void;
  /** visible false→true 时调用：非受控重置 current=0（对齐 Semi setState current:0）。 */
  reset(): void;
  /** 同步受控 current（受控模式外部改变时调用）。 */
  setControlledCurrent(current: number): void;
}

/**
 * 创建步进控制器。受控（提供 current）时内部不改 current，仅经回调通知；非受控内部维护。
 * 回调去重：notifyChange 仅在目标 current 与当前不同才触发（对齐 Semi _notifyChange）。
 */
export function createUserGuide(
  options: CreateUserGuideOptions,
): UserGuideController {
  const controlled = options.current !== undefined;
  let inner = controlled ? (options.current as number) : 0;

  function total(): number {
    return options.steps.length;
  }

  function current(): number {
    return controlled ? (options.current as number) : inner;
  }

  function notifyChange(next: number): void {
    if (next !== current()) options.onChange?.(next);
  }

  return {
    getCurrent: current,
    getTotal: total,
    isControlled: () => controlled,
    handleNext() {
      const cur = current();
      const isLast = cur === total() - 1;
      if (isLast) {
        options.onFinish?.();
        return;
      }
      const next = cur + 1;
      notifyChange(next);
      options.onNext?.(next);
      if (!controlled) inner = next;
    },
    handlePrev() {
      const cur = current();
      const next = cur - 1;
      // 先按旧 current 判定是否 notify（对齐 Semi _notifyChange 读 setState 前的 state），再回写。
      notifyChange(next);
      if (!controlled) inner = next;
      options.onPrev?.(next);
    },
    handleSkip() {
      options.onSkip?.();
    },
    reset() {
      if (!controlled) inner = 0;
    },
    setControlledCurrent(next: number) {
      if (!controlled) inner = next;
    },
  };
}
