import { describe, it, expect } from 'vitest';
import {
  buildGridCols,
  nextGridCoord,
  isFocusCell,
  rovingTabindexAt,
  type GridCoord,
} from './grid-nav.js';

// Table 交互态 Grid Pattern 二维漫游纯逻辑用例（WAI-ARIA APG Grid）。
// 渲染层把 row=-1 当表头、0..n-1 当数据行，col 索引进 buildGridCols 扁平表。
// 委托键盘事件无法可靠合成（红线），故对纯坐标算法做穷尽边界测试。

const params = (over: Partial<Parameters<typeof nextGridCoord>[2]> = {}) => ({
  current: { row: 0, col: 0 } as GridCoord,
  rowCount: 5,
  colCount: 4,
  pageRows: 3,
  ...over,
});

const move = (
  key: string,
  current: GridCoord,
  over: Partial<Parameters<typeof nextGridCoord>[2]> = {},
  mods: { ctrl?: boolean; meta?: boolean } = {},
) => nextGridCoord(key, mods, params({ ...over, current }));

describe('buildGridCols — 网格列扁平表', () => {
  it('仅数据列时 1:1 映射', () => {
    const cols = buildGridCols({ hasExpand: false, hasSelection: false, dataColumnCount: 3 });
    expect(cols).toEqual([
      { kind: 'data', dataCol: 0 },
      { kind: 'data', dataCol: 1 },
      { kind: 'data', dataCol: 2 },
    ]);
  });

  it('expand + selection 前置占位列在数据列之前', () => {
    const cols = buildGridCols({ hasExpand: true, hasSelection: true, dataColumnCount: 2 });
    expect(cols.map((c) => c.kind)).toEqual(['expand', 'selection', 'data', 'data']);
    // 第一个数据列的网格列索引 = 2（前置 2 列）
    expect(cols.findIndex((c) => c.kind === 'data')).toBe(2);
  });

  it('仅 selection 时占位 1 列', () => {
    const cols = buildGridCols({ hasExpand: false, hasSelection: true, dataColumnCount: 1 });
    expect(cols.map((c) => c.kind)).toEqual(['selection', 'data']);
  });
});

describe('roving tabindex — 单一 Tab 停靠点派生', () => {
  it('未聚焦时表头首格 (-1,0) 为唯一 tabindex=0', () => {
    const focus = { row: 0, col: 0, hasFocused: false };
    expect(isFocusCell(-1, 0, focus)).toBe(true);
    expect(rovingTabindexAt(-1, 0, focus)).toBe(0);
    // 其余全部 -1
    expect(rovingTabindexAt(0, 0, focus)).toBe(-1);
    expect(rovingTabindexAt(-1, 1, focus)).toBe(-1);
    expect(rovingTabindexAt(2, 3, focus)).toBe(-1);
  });

  it('聚焦后仅当前焦点坐标 tabindex=0，其余 -1', () => {
    const focus = { row: 2, col: 1, hasFocused: true };
    expect(rovingTabindexAt(2, 1, focus)).toBe(0);
    // 同行不同列 / 同列不同行 / 表头 均 -1（整 grid 单一停靠点）
    expect(rovingTabindexAt(2, 0, focus)).toBe(-1);
    expect(rovingTabindexAt(1, 1, focus)).toBe(-1);
    expect(rovingTabindexAt(-1, 0, focus)).toBe(-1);
  });

  it('聚焦后表头首格不再是停靠点', () => {
    const focus = { row: 0, col: 0, hasFocused: true };
    expect(isFocusCell(-1, 0, focus)).toBe(false);
    expect(isFocusCell(0, 0, focus)).toBe(true);
  });
});

describe('nextGridCoord — 行向漫游（↑↓）', () => {
  it('ArrowDown 逐行下移', () => {
    expect(move('ArrowDown', { row: 0, col: 1 })).toEqual({ row: 1, col: 1 });
  });

  it('ArrowDown 到最后一行后 clamp（不环绕）', () => {
    expect(move('ArrowDown', { row: 4, col: 1 })).toEqual({ row: 4, col: 1 });
  });

  it('ArrowUp 从首数据行回到表头行(-1)', () => {
    expect(move('ArrowUp', { row: 0, col: 2 })).toEqual({ row: -1, col: 2 });
  });

  it('ArrowUp 在表头行 clamp 到 -1（不越过表头）', () => {
    expect(move('ArrowUp', { row: -1, col: 2 })).toEqual({ row: -1, col: 2 });
  });

  it('ArrowDown 从表头进入首数据行', () => {
    expect(move('ArrowDown', { row: -1, col: 0 })).toEqual({ row: 0, col: 0 });
  });
});

describe('nextGridCoord — 列向漫游（←→）', () => {
  it('ArrowRight 逐列右移', () => {
    expect(move('ArrowRight', { row: 2, col: 0 })).toEqual({ row: 2, col: 1 });
  });

  it('ArrowRight 到末列 clamp（不环绕）', () => {
    expect(move('ArrowRight', { row: 2, col: 3 })).toEqual({ row: 2, col: 3 });
  });

  it('ArrowLeft 到首列 clamp（不环绕）', () => {
    expect(move('ArrowLeft', { row: 2, col: 0 })).toEqual({ row: 2, col: 0 });
  });
});

describe('nextGridCoord — Home / End（行内）', () => {
  it('Home 跳行内首列，行不变', () => {
    expect(move('Home', { row: 3, col: 2 })).toEqual({ row: 3, col: 0 });
  });

  it('End 跳行内末列，行不变', () => {
    expect(move('End', { row: 3, col: 1 })).toEqual({ row: 3, col: 3 });
  });
});

describe('nextGridCoord — Ctrl/Cmd+Home / End（表格首末）', () => {
  it('Ctrl+Home 跳表头首格 (-1,0)', () => {
    expect(move('Home', { row: 4, col: 3 }, {}, { ctrl: true })).toEqual({ row: -1, col: 0 });
  });

  it('Cmd+End 跳末数据行末格', () => {
    expect(move('End', { row: 0, col: 0 }, {}, { meta: true })).toEqual({ row: 4, col: 3 });
  });
});

describe('nextGridCoord — PageUp / PageDown（翻屏）', () => {
  it('PageDown 下翻 pageRows 行', () => {
    expect(move('PageDown', { row: 0, col: 1 }, { pageRows: 3 })).toEqual({ row: 3, col: 1 });
  });

  it('PageDown 越界 clamp 到末行', () => {
    expect(move('PageDown', { row: 3, col: 1 }, { pageRows: 3 })).toEqual({ row: 4, col: 1 });
  });

  it('PageUp 上翻 pageRows 行', () => {
    expect(move('PageUp', { row: 4, col: 2 }, { pageRows: 3 })).toEqual({ row: 1, col: 2 });
  });

  it('PageUp 越界 clamp 到表头行(-1)', () => {
    expect(move('PageUp', { row: 1, col: 2 }, { pageRows: 3 })).toEqual({ row: -1, col: 2 });
  });

  it('PageDown 从表头落到首屏末行', () => {
    expect(move('PageDown', { row: -1, col: 0 }, { pageRows: 3 })).toEqual({ row: 2, col: 0 });
  });
});

describe('nextGridCoord — 非漫游键 / 边界', () => {
  it('非漫游键返回 null（不拦截）', () => {
    expect(move('a', { row: 0, col: 0 })).toBeNull();
    expect(move('Tab', { row: 0, col: 0 })).toBeNull();
    expect(move('Enter', { row: 0, col: 0 })).toBeNull();
  });

  it('空数据表（rowCount=0）下移仍 clamp 到表头行', () => {
    expect(move('ArrowDown', { row: -1, col: 0 }, { rowCount: 0 })).toEqual({ row: -1, col: 0 });
  });

  it('不修改入参坐标对象（纯函数）', () => {
    const cur = { row: 0, col: 0 };
    nextGridCoord('ArrowDown', {}, params({ current: cur }));
    expect(cur).toEqual({ row: 0, col: 0 });
  });
});
