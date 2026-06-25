/**
 * Table 交互态 Grid Pattern — 纯函数二维漫游核心（与 DOM/Svelte 无关，可单测）。
 *
 * 焦点坐标用「逻辑索引」表示：
 * - row: -1 = 表头行；0..rowCount-1 = 数据行（逻辑序，与虚拟化是否渲染无关）。
 * - col: 索引进「网格列」扁平表 [expand?, selection?, ...dataColumns]。
 *
 * 渲染层持有 row/col 的 $state 与命令式 focus()，本模块只据按键算「下一坐标」
 * （WAI-ARIA APG Grid Pattern 二维漫游 + Home/End/Ctrl+Home/End/PageUp/PageDown）。
 *
 * See specs/components/show/Table.spec.md §6（无障碍 · grid 键盘）。
 */

import { nextRovingIndex } from '@chenzy-design/core';

export type GridColKind = 'expand' | 'selection' | 'data';
export interface GridCol {
  kind: GridColKind;
  /** data 列对应的原 columns 索引；非 data 列为 -1 */
  dataCol: number;
}

export interface GridCoord {
  /** -1 = 表头行；>=0 = 数据行逻辑索引 */
  row: number;
  /** 网格列索引 */
  col: number;
}

/**
 * 构建网格列扁平表：前置 expand / selection 占位列 + 数据列。
 * 仅用于焦点坐标 ↔ 实际列的换算。
 */
export function buildGridCols(opts: {
  hasExpand: boolean;
  hasSelection: boolean;
  dataColumnCount: number;
}): GridCol[] {
  const out: GridCol[] = [];
  if (opts.hasExpand) out.push({ kind: 'expand', dataCol: -1 });
  if (opts.hasSelection) out.push({ kind: 'selection', dataCol: -1 });
  for (let i = 0; i < opts.dataColumnCount; i++) {
    out.push({ kind: 'data', dataCol: i });
  }
  return out;
}

/**
 * 某 (row,col) 是否为当前 roving 焦点格（纯函数，render 期只读）。
 * 未聚焦过（hasFocused=false）时，首个 tab 停靠点固定为表头首格 (-1, 0)。
 */
export function isFocusCell(
  row: number,
  col: number,
  focus: { row: number; col: number; hasFocused: boolean },
): boolean {
  if (!focus.hasFocused) return row === -1 && col === 0;
  return row === focus.row && col === focus.col;
}

/**
 * 单元格 roving tabindex：焦点格 0，其余 -1（WAI-ARIA roving，单一 Tab 停靠点）。
 */
export function rovingTabindexAt(
  row: number,
  col: number,
  focus: { row: number; col: number; hasFocused: boolean },
): 0 | -1 {
  return isFocusCell(row, col, focus) ? 0 : -1;
}

export interface GridNavParams {
  /** 当前焦点坐标 */
  current: GridCoord;
  /** 数据行数（不含表头） */
  rowCount: number;
  /** 网格列数 */
  colCount: number;
  /** PageUp/PageDown 每次翻动的行数（>=1） */
  pageRows: number;
}

/**
 * 据键盘事件 key + 修饰键算出下一焦点坐标（纯函数，不改入参）。
 * 返回 null 表示该键不是漫游键（不处理）。
 *
 * 行向：ArrowUp/Down 逐行（表头 row=-1 为上界，最后数据行为下界，不环绕）。
 * 列向：ArrowLeft/Right 逐列（复用 core nextRovingIndex，clamp 不环绕）。
 * Home/End：行内首/末列；Ctrl/Cmd+Home/End：跳表头首格 / 末数据行末格。
 * PageUp/PageDown：上/下翻 pageRows 行（clamp 到 [-1, lastRow]）。
 */
export function nextGridCoord(
  key: string,
  modifiers: { ctrl?: boolean; meta?: boolean },
  params: GridNavParams,
): GridCoord | null {
  const { current, rowCount, colCount, pageRows } = params;
  const lastRow = rowCount - 1;
  const lastCol = colCount - 1;
  const ctrlOrMeta = !!modifiers.ctrl || !!modifiers.meta;
  let { row, col } = current;

  switch (key) {
    case 'ArrowUp':
      row = row <= -1 ? -1 : row - 1;
      break;
    case 'ArrowDown':
      row = row >= lastRow ? lastRow : row + 1;
      break;
    case 'ArrowLeft':
      col = nextRovingIndex(col, colCount, 'prev');
      break;
    case 'ArrowRight':
      col = nextRovingIndex(col, colCount, 'next');
      break;
    case 'Home':
      if (ctrlOrMeta) {
        row = -1;
        col = 0;
      } else {
        col = 0;
      }
      break;
    case 'End':
      if (ctrlOrMeta) {
        row = lastRow;
        col = lastCol;
      } else {
        col = lastCol;
      }
      break;
    case 'PageDown':
      row = row < 0 ? Math.min(lastRow, pageRows - 1) : Math.min(lastRow, row + pageRows);
      break;
    case 'PageUp':
      row = row < 0 ? -1 : Math.max(-1, row - pageRows);
      break;
    default:
      return null;
  }

  // colCount 为 0 时 col clamp 到 0；lastRow < -1（无数据行）时 row 不超过 -1。
  if (lastRow < -1) row = -1;
  if (row > lastRow && lastRow >= -1) row = Math.max(-1, lastRow);
  return { row, col };
}
