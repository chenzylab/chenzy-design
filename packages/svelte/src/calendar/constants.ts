/**
 * Calendar 常量 — 对应 Semi 的 `semi-foundation/calendar/constants.ts`
 * 以及散在 `semi-ui/calendar/*.tsx` 顶部的模块级常量。
 */

/** class 前缀（对齐 Semi cssClasses.PREFIX = `${BASE_CLASS_PREFIX}-calendar`） */
export const PREFIX = 'cd-calendar';

/** 视图模式（对齐 Semi strings.MODE） */
export const MODE = ['day', 'week', 'month', 'range'] as const;

export type CalendarMode = (typeof MODE)[number];

/**
 * 月视图每格可容纳事件条数的动态计算参数
 * （对齐 Semi monthCalendar.tsx 顶部的 `contentPadding` / `contentHeight`）。
 */
export const MONTH_CONTENT_PADDING = 60;
export const MONTH_CONTENT_HEIGHT = 24;

/** 时间列小时数（对齐 Semi timeCol：`[...Array(24).keys()]`） */
export const HOURS_IN_DAY = 24;

/**
 * 单日列骨架行数（对齐 Semi dayCol renderGrid：`[...Array(25).keys()]`，
 * 每行再拆整点 / 半点两个半小时格）。
 */
export const DAY_GRID_ROWS = 25;
