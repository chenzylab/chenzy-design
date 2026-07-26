/**
 * DatePicker 常量 — 严格镜像 Semi semi-foundation/datePicker/constants.ts。
 * class 前缀 `cd-datepicker`（对齐 Semi `semi-datepicker`，无连字符）。
 * 从零重写（foundation 分层）时的 class 名 / 枚举 / format token 真源。
 */

const BASE_CLASS_PREFIX = 'cd';

/** 日期格状态类（对齐 Semi dayItemClasses，逐条镜像）。 */
export const dayItemClasses = {
  DAY_TODAY: `${BASE_CLASS_PREFIX}-datepicker-day-today`,
  DAY_IN_RANGE: `${BASE_CLASS_PREFIX}-datepicker-day-inrange`,
  DAY_HOVER: `${BASE_CLASS_PREFIX}-datepicker-day-inhover`,
  DAY_SELECTED: `${BASE_CLASS_PREFIX}-datepicker-day-selected`,
  DAY_SELECTED_START: `${BASE_CLASS_PREFIX}-datepicker-day-selected-start`,
  DAY_SELECTED_END: `${BASE_CLASS_PREFIX}-datepicker-day-selected-end`,
  DAY_DISABLED: `${BASE_CLASS_PREFIX}-datepicker-day-disabled`,
  DAY_HOVER_DAY: `${BASE_CLASS_PREFIX}-datepicker-day-hoverday`,
  DAY_HOVER_DAY_OFFSET: `${BASE_CLASS_PREFIX}-datepicker-day-hoverday-offset`,
  DAY_IN_OFFSET_RANGE: `${BASE_CLASS_PREFIX}-datepicker-day-inoffsetrange`,
  DAY_SELECTED_RANGE_HOVER: `${BASE_CLASS_PREFIX}-datepicker-day-selectedrange-hover`,
  DAY_OFFSET_RANGE_START: `${BASE_CLASS_PREFIX}-datepicker-day-offsetrange-start`,
  DAY_OFFSET_RANGE_END: `${BASE_CLASS_PREFIX}-datepicker-day-offsetrange-end`,
  DAY_SELECTED_START_AFTER_HOVER: `${BASE_CLASS_PREFIX}-datepicker-day-selected-start-afterhover`,
  DAY_SELECTED_END_BEFORE_HOVER: `${BASE_CLASS_PREFIX}-datepicker-day-selected-end-beforehover`,
  DAY_HOVER_DAY_BEFORE_RANGE: `${BASE_CLASS_PREFIX}-datepicker-day-hoverday-beforerange`,
  DAY_HOVER_DAY_AFTER_RANGE: `${BASE_CLASS_PREFIX}-datepicker-day-hoverday-afterrange`,
  DAY_HOVER_DAY_IN_RANGE: `${BASE_CLASS_PREFIX}-datepicker-day-hoverday-inrange`,
  DAY_HOVER_DAY_AROUND_SINGLE_SELECTED: `${BASE_CLASS_PREFIX}-datepicker-day-hoverday-around-singleselected`,
} as const;

/** 结构类（对齐 Semi cssClasses）。 */
export const cssClasses = {
  PREFIX: `${BASE_CLASS_PREFIX}-datepicker`,
  NAVIGATION: `${BASE_CLASS_PREFIX}-datepicker-navigation`,
  PANEL_YAM: `${BASE_CLASS_PREFIX}-datepicker-panel-yam`,
  MONTH: `${BASE_CLASS_PREFIX}-datepicker-month`,
  WEEKDAY: `${BASE_CLASS_PREFIX}-datepicker-weekday`,
  WEEKS: `${BASE_CLASS_PREFIX}-datepicker-weeks`,
  WEEK: `${BASE_CLASS_PREFIX}-datepicker-week`,
  DAY: `${BASE_CLASS_PREFIX}-datepicker-day`,
  ...dayItemClasses,
} as const;

/** format token（照搬 Semi formatToken，date-fns 小写语法）。 */
export const formatToken = {
  FORMAT_FULL_DATE: 'yyyy-MM-dd',
  FORMAT_TIME_PICKER: 'HH:mm:ss',
  FORMAT_DATE_TIME: 'yyyy-MM-dd HH:mm:ss',
  FORMAT_YEAR_MONTH: 'yyyy-MM',
} as const;

/**
 * 按 type 取默认 format token —— 对齐 Semi _utils/getDefaultFormatToken.ts。
 * date/dateRange=整日期；dateTime/dateTimeRange=日期+时间；month/monthRange=年月。
 * year 无默认 token（触发器走 Intl year 显示，与 Semi 一致）。
 */
const defaultFormatTokens: Record<string, string> = {
  date: formatToken.FORMAT_FULL_DATE,
  dateTime: formatToken.FORMAT_DATE_TIME,
  dateRange: formatToken.FORMAT_FULL_DATE,
  dateTimeRange: formatToken.FORMAT_DATE_TIME,
  month: formatToken.FORMAT_YEAR_MONTH,
  monthRange: formatToken.FORMAT_YEAR_MONTH,
};

export function getDefaultFormatTokenByType(type: string): string | undefined {
  return type ? defaultFormatTokens[type] : undefined;
}

/** 类型枚举与分隔符（对齐 Semi strings）。 */
export const strings = {
  DEFAULT_SEPARATOR_MULTIPLE: ',',
  DEFAULT_SEPARATOR_RANGE: ' ~ ',
  SIZE_SET: ['small', 'default', 'large'] as const,
  TYPE_SET: ['date', 'dateRange', 'year', 'month', 'monthRange', 'dateTime', 'dateTimeRange'] as const,
  PRESET_POSITION_SET: ['left', 'right', 'top', 'bottom'] as const,
  DENSITY_SET: ['default', 'compact'] as const,
  PANEL_TYPE_LEFT: 'left',
  PANEL_TYPE_RIGHT: 'right',
  POSITION_INLINE_INPUT: 'leftTopOver',
  ...formatToken,
} as const;

/** 数值常量（对齐 Semi numbers）。 */
export const numbers = {
  WEEK_START_ON: 0, // 一周首日：0=周日、1=周一…
  WEEK_HEIGHT: 36, // 日期行高 36px（对齐 $width-datepicker_day）
  SPACING: 4, // 浮层与触发器间距（对齐 Semi popover SPACING）
  SPACING_INSET_INPUT: 1,
} as const;

export type PickerType = (typeof strings.TYPE_SET)[number];
export type PickerSize = (typeof strings.SIZE_SET)[number];
export type PresetPosition = (typeof strings.PRESET_POSITION_SET)[number];
export type Density = (typeof strings.DENSITY_SET)[number];
export type PanelType = typeof strings.PANEL_TYPE_LEFT | typeof strings.PANEL_TYPE_RIGHT;
