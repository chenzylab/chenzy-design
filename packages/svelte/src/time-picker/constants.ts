/**
 * TimePicker 常量 — 严格镜像 Semi semi-foundation/timePicker/constants.ts。
 * class 前缀 `cd-time-picker`（本库组件目录 kebab-case，对应 Semi `semi-timepicker`）。
 * 默认 format / 分隔符 / 默认方位的真源，勿在组件里散写字面量。
 */

const BASE_CLASS_PREFIX = 'cd';

export const TYPE_TIME_PICKER = 'time';
export const TYPE_TIME_RANGE_PICKER = 'timeRange';

/** 结构类（对齐 Semi cssClasses）。 */
export const cssClasses = {
  PREFIX: `${BASE_CLASS_PREFIX}-time-picker`,
  RANGE_PICKER: `${BASE_CLASS_PREFIX}-time-picker-range-panel`,
  RANGE_PANEL_LISTS: `${BASE_CLASS_PREFIX}-time-picker-lists`,
  PANEL: `${BASE_CLASS_PREFIX}-time-picker-panel`,
} as const;

/** 枚举 / 默认值（对齐 Semi strings）。 */
export const strings = {
  TYPES: [TYPE_TIME_PICKER, TYPE_TIME_RANGE_PICKER],
  TYPE_TIME_PICKER,
  TYPE_TIME_RANGE_PICKER,
  DEFAULT_TYPE: TYPE_TIME_PICKER,
  DEFAULT_RANGE_SEPARATOR: ' ~ ',
  DEFAULT_MULTIPLE_SEPARATOR: ',',
  /** 24h 制默认格式（Semi DEFAULT_FORMAT）。 */
  DEFAULT_FORMAT: 'HH:mm:ss',
  /**
   * 12h 制默认格式（Semi DEFAULT_FORMAT_A）。
   * Semi 的 defaultProps **刻意不给 format 默认值**，靠 foundation.getDefaultFormatIfNeed()
   * 在 use12Hours 且未显式传 format 时返回本值——写死 DEFAULT_FORMAT 会让 use12Hours 失效。
   */
  DEFAULT_FORMAT_A: 'a h:mm:ss',
  /** 两种 type 的默认浮层方位都是 bottomLeft（Semi DEFAULT_POSITION，文档表格写 range 为 bottom 是滞后）。 */
  DEFAULT_POSITION: {
    [TYPE_TIME_PICKER]: 'bottomLeft',
    [TYPE_TIME_RANGE_PICKER]: 'bottomLeft',
  } as Record<string, string>,
} as const;

/** 面板位置（对齐 Semi PanelType）。 */
export type PanelType = 'left' | 'right';
