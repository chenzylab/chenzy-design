/**
 * DatePicker foundation（值模型 + 格式化 + open 状态）—— 对齐 Semi foundation.ts。
 *
 * foundation 分层：逻辑在此 rune 模块（对应 Semi *Foundation.ts），视图在 .svelte（对应 *.tsx）。
 * 工厂 createDatePickerState(getProps) 接收 `() => props` getter，内部 $state/$derived 读 getProps()
 * 以响应 props 变化（Svelte5 rune 跨文件响应式：$derived 读 getter 调用即建立依赖，本模块打通该模式）。
 *
 * 逻辑从旧 DatePicker.svelte <script> 移植（已验证正确），归类进 foundation。
 * 受控红线：不无条件回写 value/open，仅 onChange/onOpenChange。
 */
import { untrack } from 'svelte';
import { startOfDay, utcToZonedTime, zonedTimeToUtc, localeFormat as coreLocaleFormat } from '@chenzy-design/core';
import { getDefaultFormatTokenByType } from './constants.js';
import isValidTimeZone from './_utils/isValidTimeZone.js';
import type { PickerType, PickerSize } from './constants.js';

export type RangeValue = [Date | null, Date | null];
export type ValidateStatus = 'default' | 'warning' | 'error';

/** 快捷选择预设（对齐 Semi foundation PresetType/PresetsType）。 */
export type BaseValueType = string | number | Date;
export type PresetType = {
  start?: BaseValueType | (() => BaseValueType);
  end?: BaseValueType | (() => BaseValueType);
  text?: string;
};
export type PresetsType = Array<PresetType | (() => PresetType)>;

/**
 * foundation 消费的 props 子集（视图层 $props() 后经 getter 传入）。
 * optional 字段显式含 undefined，适配 exactOptionalPropertyTypes（getter 恒返回值，缺省即 undefined）。
 */
export interface DatePickerFoundationProps {
  type: PickerType;
  value?: Date | Date[] | RangeValue | null | undefined;
  defaultValue?: Date | Date[] | RangeValue | null | undefined;
  open?: boolean | undefined;
  defaultOpen: boolean;
  multiple: boolean;
  format?: string | undefined;
  locale: string;
  rangeSeparator: string;
  timeZone?: string | number | undefined;
  /** ConfigProvider 注入的时区（自身 timeZone 优先）。 */
  configTimeZone?: string | number | undefined;
  showSecond: boolean;
  onChange?: ((value: Date | Date[] | RangeValue | null, dateString: string) => void) | undefined;
  onChangeWithDateFirst: boolean;
  onOpenChange?: ((open: boolean) => void) | undefined;
}

export function createDatePickerState(getProps: () => DatePickerFoundationProps) {
  const p = getProps;

  // --- 7-type 派生分派（对齐 Semi isRangeType /range/i.test）---
  const isRange = $derived(/range/i.test(p().type));
  const isDateTime = $derived(/dateTime/i.test(p().type)); // dateTime | dateTimeRange
  const isMonth = $derived(p().type === 'month' || p().type === 'monthRange');
  const isYear = $derived(p().type === 'year');

  // ===================== 时区（自身 timeZone 优先 ConfigProvider）=====================
  const effectiveTimeZone = $derived<string | number | undefined>(
    p().timeZone ?? p().configTimeZone,
  );

  // ===================== 值模型（受控/非受控）=====================
  // 对齐 Semi：state 存的是【目标时区墙上时间】(zoned value)，非 UTC。
  //  - 进（parseWithTimezone）：受控/默认传入的 UTC value 经 utcToZonedTime 转墙上时间存入。
  //  - 出（disposeCallbackArgs）：抛回调前经 zonedTimeToUtc 还原 UTC，再按 type 默认 token 序列化。
  const isValueControlled = $derived(p().value !== undefined);

  /** 单值按 type 归一（type-level 精度：monthRange 归月首、date 归日首）。 */
  function normOne(d: Date | null | undefined): Date | null {
    if (!d) return null;
    const t = p().type;
    if (/dateTime/i.test(t)) return new Date(d);
    if (t === 'month' || t === 'monthRange') return startOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
    return startOfDay(d);
  }

  /**
   * parseWithTimezone —— 对齐 Semi foundation.parseWithTimezone。
   * 把入参绝对时刻（UTC）经 utcToZonedTime 转成「目标时区墙上时间」存入 state。
   * timeZone 无效则原样（本地时区），与 Semi isValidTimeZone 守卫一致。
   */
  function parseWithTimezone(d: Date | null | undefined): Date | null {
    const one = normOne(d);
    if (!one) return null;
    const tz = effectiveTimeZone;
    return isValidTimeZone(tz) ? utcToZonedTime(one, tz as string | number) : one;
  }

  function toRangePair(v: unknown): RangeValue {
    if (Array.isArray(v)) {
      const a = v[0] instanceof Date ? (v[0] as Date) : null;
      const b = v[1] instanceof Date ? (v[1] as Date) : null;
      return [parseWithTimezone(a), parseWithTimezone(b)];
    }
    return [null, null];
  }

  function getInitialValue(): Date | Date[] | null {
    const dv = p().defaultValue;
    if (p().multiple) {
      if (Array.isArray(dv)) return (dv as Date[]).map((d) => parseWithTimezone(d)).filter(Boolean) as Date[];
      if (dv instanceof Date) return [parseWithTimezone(dv)].filter(Boolean) as Date[];
      return [];
    }
    if (Array.isArray(dv)) return parseWithTimezone((dv as Date[])[0]);
    return parseWithTimezone(dv as Date | null);
  }

  let innerValue = $state<Date | Date[] | null>(untrack(getInitialValue));
  const current = $derived<Date | Date[] | null>(
    isValueControlled
      ? p().multiple
        ? (Array.isArray(p().value) ? (p().value as Date[]).map((d) => parseWithTimezone(d)).filter(Boolean) as Date[] : [])
        : parseWithTimezone((Array.isArray(p().value) ? (p().value as Date[])[0] : (p().value as Date | null)))
      : innerValue,
  );
  const currentSingle = $derived<Date | null>(
    Array.isArray(current) ? (current[0] ?? null) : current,
  );

  let innerRange = $state<RangeValue>(untrack(() => toRangePair(getProps().defaultValue)));
  const currentRange = $derived<RangeValue>(
    isValueControlled ? toRangePair(p().value) : innerRange,
  );

  // ===================== 序列化（对齐 Semi localeFormat / disposeCallbackArgs）=====================
  /** 当前生效 format token：显式 format 优先，否则按 type 取默认（对齐 Semi）。 */
  const activeFormatToken = $derived<string | undefined>(
    p().format ?? getDefaultFormatTokenByType(p().type),
  );

  /** localeFormat —— 对齐 Semi foundation.localeFormat：走 core localeFormat（date-fns format）。 */
  function localeFormat(date: Date, token: string): string {
    return coreLocaleFormat(date, token);
  }

  /**
   * disposeCallbackArgs —— 照搬 Semi foundation.disposeCallbackArgs。
   * 输入 state 值（墙上时间，single 或数组）。timeZone 有效时经 zonedTimeToUtc 还原成
   * 「本地字段呈现 UTC 墙上时间」的 Date（date-fns-tz 保证），再按 type/multiple 分派：
   * single 抛标量、multiple/range 抛数组。返回 { notifyValue（dateString/string[]）, notifyDate（Date/Date[]）}。
   */
  function disposeCallbackArgs(value: Date | Array<Date | null> | null): {
    notifyValue: string | string[] | undefined;
    notifyDate: Date | Date[] | undefined;
  } {
    // range 进入前已被 _notifyChange 完整性守卫拦截，故此处数组无 null（对齐 Semi）。
    let _value = (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean) as Date[];
    const timeZone = effectiveTimeZone;
    if (isValidTimeZone(timeZone)) {
      _value = _value.map((date) => zonedTimeToUtc(date, timeZone as string | number));
    }
    const t = p().type;
    const token = activeFormatToken;
    const fmt = (d: Date) => (d && token ? localeFormat(d, token) : d ? String(d) : '');

    let notifyValue: string | string[] | undefined;
    let notifyDate: Date | Date[] | undefined;
    switch (t) {
      case 'date':
      case 'dateTime':
      case 'month':
        if (!p().multiple) {
          notifyValue = _value[0] ? fmt(_value[0]) : undefined;
          [notifyDate] = _value;
        } else {
          notifyValue = _value.map(fmt);
          notifyDate = [..._value];
        }
        break;
      case 'dateRange':
      case 'dateTimeRange':
      case 'monthRange':
        notifyValue = _value.map(fmt);
        notifyDate = [..._value];
        break;
      default:
        break;
    }
    return { notifyValue, notifyDate };
  }

  /** formatShowText —— 触发器展示文案。state 已是墙上时间，直接按 token 序列化本地字段（对齐 Semi）。 */
  function formatShowText(value: Date | Date[] | null): string {
    const token = activeFormatToken;
    const one = (d: Date | null) => (d && token ? localeFormat(d, token) : '');
    if (Array.isArray(value)) return value.map((d) => one(d)).join(` ${p().rangeSeparator} `);
    return one(value);
  }

  const formattedValue = $derived(formatShowText(current));

  /** _isRangeType —— 对齐 Semi foundation._isRangeType。 */
  function _isRangeType(): boolean {
    return /range/i.test(p().type);
  }

  /** _isRangeValueComplete —— 对齐 Semi：range 两端皆非空才算完整；空数组视为完整。 */
  function _isRangeValueComplete(value: Array<Date | null>): boolean {
    return !value.some((d) => d == null);
  }

  // ===================== 提交（对齐 Semi _notifyChange / handleSelectedChange）=====================
  /**
   * _notifyChange —— 对齐 Semi foundation._notifyChange。
   * range 类型不完整则不通知；否则 disposeCallbackArgs 后按 onChangeWithDateFirst 决定顺序。
   */
  function _notifyChange(value: Date | Array<Date | null> | null) {
    const arr = (Array.isArray(value) ? value : value ? [value] : []) as Array<Date | null>;
    if (_isRangeType() && !_isRangeValueComplete(arr)) return;
    const onChange = p().onChange;
    if (!onChange) return;
    const { notifyValue, notifyDate } = disposeCallbackArgs(value);
    if (p().onChangeWithDateFirst) onChange(notifyDate as Date | Date[] | null, notifyValue as string);
    else (onChange as (a: unknown, b: unknown) => void)(notifyValue, notifyDate);
  }

  /** handleSelectedChange —— 单值/multiple 面板选择入口：更新内部墙上时间值并通知。 */
  function handleSelectedChange(value: Date | Date[] | null) {
    if (!isValueControlled) innerValue = value;
    _notifyChange(value);
  }

  /** handleRangeSelectedChange —— range 面板选择入口：全空清空、否则更新并通知（含完整性守卫）。 */
  function handleRangeSelectedChange(next: RangeValue) {
    const emptied = next[0] == null && next[1] == null;
    if (!isValueControlled) innerRange = next;
    _notifyChange(emptied ? [] : next);
  }

  // ===================== open 状态（受控/非受控）=====================
  const isOpenControlled = $derived(p().open !== undefined);
  let innerOpen = $state(untrack(() => getProps().defaultOpen));
  const isOpen = $derived(isOpenControlled ? !!p().open : innerOpen);

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    if (!isOpenControlled) innerOpen = next;
    p().onOpenChange?.(next);
  }

  return {
    // 派生分派
    get isRange() { return isRange; },
    get isDateTime() { return isDateTime; },
    get isMonth() { return isMonth; },
    get isYear() { return isYear; },
    // 值
    get current() { return current; },
    get currentSingle() { return currentSingle; },
    get currentRange() { return currentRange; },
    get formattedValue() { return formattedValue; },
    get effectiveTimeZone() { return effectiveTimeZone; },
    // 对齐 Semi 方法名
    localeFormat,
    disposeCallbackArgs,
    formatShowText,
    handleSelectedChange,
    handleRangeSelectedChange,
    // open
    get isOpen() { return isOpen; },
    setOpen,
  };
}

export type DatePickerState = ReturnType<typeof createDatePickerState>;
