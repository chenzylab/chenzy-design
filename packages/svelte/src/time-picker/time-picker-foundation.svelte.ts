/**
 * TimePicker foundation（值模型 + open 状态 + format 分派 + 时区往返）—— 对齐 Semi
 * semi-foundation/timePicker/foundation.ts。
 *
 * foundation 分层（同 [[date-picker-foundation]] 既定模式）：逻辑在此 rune 模块
 * （对应 Semi *Foundation.ts），视图在 .svelte（对应 *.tsx）。
 * 工厂 createTimePickerState(getProps) 接收 `() => props` getter，内部 $state/$derived 读
 * getProps() 以响应 props 变化（Svelte5 rune 跨文件响应式：$derived 读 getter 调用即建立依赖）。
 *
 * 受控红线：不无条件回写 value/open，仅 onChange/onOpenChange。
 */
import {
  parseFormatSpec,
  parseTimeString,
  utcToZonedTime,
  zonedTimeToUtc,
  isValidTimeZone,
} from '@chenzy-design/core';
import { strings } from './constants.js';

/** 单选入参：Date 或时间字符串（如 '12:30:45'）。 */
export type TimeInputValue = Date | string | null;
/** 内部统一用 [start, end] 元组表示（单选只用 [0]），避免双分支。 */
export type Pair = [Date | null, Date | null];

/** disabledTime 返回的禁用规则（对齐 Semi getDisabledTimeOptions 返回形态）。 */
export interface DisabledTimeRules {
  disabledHours?: () => number[];
  disabledMinutes?: (h: number) => number[];
  disabledSeconds?: (h: number, m: number) => number[];
}

/**
 * foundation 消费的 props 子集（视图层 $props() 后经 getter 传入）。
 * optional 字段显式含 undefined，适配 exactOptionalPropertyTypes。
 */
export interface TimePickerFoundationProps {
  type: 'time' | 'timeRange';
  value?: TimeInputValue | [TimeInputValue, TimeInputValue] | null | undefined;
  defaultValue?: TimeInputValue | [TimeInputValue, TimeInputValue] | null | undefined;
  open?: boolean | undefined;
  defaultOpen: boolean;
  format?: string | undefined;
  use12Hours: boolean;
  disabled: boolean;
  /** 有效时区：组件自身 timeZone ?? ConfigProvider（视图层已合并后传入）。 */
  effectiveTimeZone?: string | number | undefined;
  /**
   * 第一参是**已选值数组**（对齐 Semi `disabledTime(dates: Date[], panelType)`），
   * 长度 0/1/2；仅 range 模式调用。
   */
  disabledTime?:
    | ((dates: Date[], panelType?: 'left' | 'right') => DisabledTimeRules | undefined)
    | undefined;
  onChange?: ((v: (Date | null) | [Date | null, Date | null]) => void) | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * 已提交值对 → 触发器展示文案（未处于输入草稿态时的回落值）。对齐 Semi formatValue(value)。
   * 依赖 currentPair 而 currentPair 由本 foundation 派生，故用回调而非现成字符串，避免循环依赖。
   */
  formatDisplay: (pair: Pair) => string;
  /** 范围模式分隔符，用于拆分输入串两端。对齐 Semi rangeSeparator。 */
  rangeSeparator: string;
  /** 输入框 readonly 时不解析键入（仅允许面板选择）。对齐 Semi inputReadOnly。 */
  inputReadOnly: boolean;
}

/** 字符串/Date 入参归一化为 Date|null（字符串经 core parseTimeString）。 */
export function toDate(input: TimeInputValue): Date | null {
  if (input == null) return null;
  if (input instanceof Date) return input;
  const parts = parseTimeString(input);
  if (!parts) return null;
  const d = new Date();
  d.setHours(parts.hour, parts.minute, parts.second, 0);
  return d;
}

function toPair(input: TimePickerFoundationProps['value']): Pair {
  if (Array.isArray(input)) return [toDate(input[0] ?? null), toDate(input[1] ?? null)];
  return [toDate((input ?? null) as TimeInputValue), null];
}

export function createTimePickerState(getProps: () => TimePickerFoundationProps) {
  const p = () => getProps();

  const isRange = $derived(p().type === 'timeRange');

  // 未显式传 format 时按 use12Hours 分派默认值（照搬 Semi foundation.getDefaultFormatIfNeed：
  // Semi 的 defaultProps 刻意不给 format 默认值，正是为了让 use12Hours 能改写默认格式串）。
  const effFormat = $derived(
    p().format ?? (p().use12Hours ? strings.DEFAULT_FORMAT_A : strings.DEFAULT_FORMAT),
  );

  // format 串解析：决定显示列与 12h（对齐 Semi showSecond = 含 ss）。
  const formatSpec = $derived(parseFormatSpec(effFormat));
  const effUse12Hours = $derived(p().use12Hours || formatSpec.use12Hours);

  // --- 受控 value（红线 #1）：不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(p().value !== undefined);
  // 仅捕获初始 defaultValue（非受控初值）；用函数包裹避免 state_referenced_locally。
  function getInitialPair(): Pair {
    return toPair(p().defaultValue);
  }
  let innerValue = $state<Pair>(getInitialPair());
  const currentPair = $derived<Pair>(isValueControlled ? toPair(p().value) : innerValue);

  function emit(next: Pair) {
    if (!isValueControlled) innerValue = next;
    p().onChange?.(isRange ? next : next[0]);
  }

  // --- 受控 open（红线 #1）：不无条件回写 open，仅 onOpenChange ---
  const isOpenControlled = $derived(p().open !== undefined);
  function getInitialOpen(): boolean {
    return p().defaultOpen;
  }
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(isOpenControlled ? !!p().open : innerOpen);

  // 面板首次打开后常驻 DOM，关闭仅 CSS 隐藏（对齐 Semi Popover 惰性挂载）。
  let hasOpened = $state(getInitialOpen());

  // --- 触发器可键入：解析输入串回写（镜像 Semi inputFoundation.handleInputChange/handleBlur）---
  // 输入过程只做本地展示，Enter/Blur 时解析并提交（单选整串 → 时间；范围按 rangeSeparator 拆两端）。
  let inputDraft = $state<string | null>(null);
  const inputValue = $derived(inputDraft ?? p().formatDisplay(currentPair));
  // invalid 校验态（对齐 Semi foundation invalid）：手输非法/无法解析时置 true，触发器显示 error 样式。
  let invalid = $state(false);

  function parseAndCommit(raw: string) {
    if (p().inputReadOnly) return;
    const text = raw.trim();
    const sep = p().rangeSeparator;
    if (text === '') {
      emit([null, null]);
      inputDraft = null;
      invalid = false;
      return;
    }
    if (isRange) {
      const parts = text.split(sep.trim() === '' ? '~' : sep.trim());
      const s = parts[0] ? toDate(parts[0].trim()) : null;
      const e = parts[1] ? toDate(parts[1].trim()) : null;
      if (s || e) {
        emit([s, e]);
        invalid = false;
      } else {
        invalid = true; // 两端都解析失败
      }
    } else {
      const d = toDate(text);
      if (d) {
        emit([d, currentPair[1]]);
        invalid = false;
      } else {
        invalid = true; // 解析失败：标记 invalid，回落展示但给 error 反馈（对齐 Semi）
      }
    }
    inputDraft = null;
  }

  return {
    get isRange() {
      return isRange;
    },
    get format() {
      return effFormat;
    },
    get showSecond() {
      return formatSpec.showSecond;
    },
    get use12Hours() {
      return effUse12Hours;
    },
    get currentPair() {
      return currentPair;
    },
    /** 单选值（range 时为起点）。 */
    get current() {
      return currentPair[0];
    },
    get isOpen() {
      return isOpen;
    },
    get hasOpened() {
      return hasOpened;
    },
    /** 打开后置位，供视图惰性挂载面板。 */
    markOpened() {
      if (isOpen) hasOpened = true;
    },

    setOpen(next: boolean) {
      if (next === isOpen) return;
      if (!isOpenControlled) innerOpen = next;
      p().onOpenChange?.(next);
    },
    toggleOpen() {
      if (p().disabled) return;
      this.setOpen(!isOpen);
    },

    /** 编辑端（0=start,1=end）已提交值。 */
    dateOf(panelIndex: 0 | 1): Date | null {
      return currentPair[panelIndex];
    },

    /**
     * 墙上时间视图（对齐 Semi）：Combobox 时间列/isAM 展示的时分秒须是目标时区墙上时间，
     * 与触发器展示一致。存储层 UTC → utcToZonedTime → 墙上时间；无 timeZone 时原样。
     */
    wallDateOf(panelIndex: 0 | 1): Date | null {
      const d = currentPair[panelIndex];
      if (!d) return null;
      const tz = p().effectiveTimeZone;
      return isValidTimeZone(tz) ? utcToZonedTime(d, tz as string | number) : d;
    },

    /**
     * disabledTime 按面板取规则 —— 照搬 Semi foundation.getDisabledTimeFns：
     * **第一参传的是「已选值数组」而非当前面板自己的值**（Semi 传 dates: Date[]），
     * 右面板才拿得到起点做「禁用早于开始时间」这类联动；只传本面板值会恒为 null 导致规则失效。
     * 且仅 range 模式调用（单选下 panelType 无意义，回落顶层 disabledHours/Minutes/Seconds）。
     */
    disabledRulesFor(panelIndex: 0 | 1): DisabledTimeRules | undefined {
      const fn = p().disabledTime;
      if (!fn || !isRange) return undefined;
      const dates = currentPair.filter((d): d is Date => d != null);
      return fn(dates, panelIndex === 0 ? 'left' : 'right');
    },

    /**
     * 合成 Date：基于当前编辑端或今天，写入 h/m/s（保留该端日期部分）。
     * 时区语义（对齐 Semi）：存储/抛出层始终是 UTC 时刻；用户在墙上时间选择，
     * 故 setHours 须作用在墙上时间 base 上，再 zonedTimeToUtc 转回 UTC 存储——保证读写往返自洽。
     */
    commit(panelIndex: 0 | 1, h: number, m: number, s: number) {
      const src = currentPair[panelIndex];
      const tz = p().effectiveTimeZone;
      const next: Pair = [...currentPair];
      if (isValidTimeZone(tz)) {
        const zone = tz as string | number;
        const base = src ? utcToZonedTime(src, zone) : utcToZonedTime(new Date(), zone);
        base.setHours(h, m, s, 0);
        next[panelIndex] = zonedTimeToUtc(base, zone);
      } else {
        const base = src ? new Date(src) : new Date();
        base.setHours(h, m, s, 0);
        next[panelIndex] = base;
      }
      emit(next);
    },

    /** 直接提交一对值（输入框解析 / 清除走此口）。 */
    emit,

    /** 触发器输入框展示值：草稿态优先，否则回落已提交值的格式化文案。 */
    get inputValue() {
      return inputValue;
    },
    /** 校验失败态（对齐 Semi aria-invalid / 触发器 error 样式）。 */
    get invalid() {
      return invalid;
    },
    /** 键入过程：仅更新本地草稿，不解析提交（对齐 Semi setInputValue 展示态）。 */
    onInputChange(v: string) {
      inputDraft = v;
    },
    /** 失焦：草稿非空则解析提交（对齐 Semi handleInputBlur）。 */
    onInputBlur() {
      if (inputDraft !== null) parseAndCommit(inputDraft);
    },
    /** Enter：草稿非空则解析提交并打开面板（对齐 Semi handleInputBlur + 打开语义）。 */
    commitDraftAndOpen() {
      if (inputDraft !== null) parseAndCommit(inputDraft);
      this.setOpen(true);
    },
    /** 清除：清空草稿与 invalid，提交空值对（对齐 Semi clear）。 */
    clear() {
      inputDraft = null;
      emit([null, null]);
    },
    /** 面板选择是有效操作，清 invalid（对齐 Semi）。 */
    clearInvalid() {
      invalid = false;
    },
  };
}

export type TimePickerState = ReturnType<typeof createTimePickerState>;
