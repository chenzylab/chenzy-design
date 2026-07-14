import { describe, expect, it } from 'vitest';
import {
  resolveItemText,
  centerOffset,
  nearestIndex,
  wrapIndex,
  easeOut,
  scrollFrame,
  shouldPrepend,
  shouldAppend,
  SCROLL_LIST_DEFAULT_ITEM_HEIGHT,
  SCROLL_LIST_DEFAULT_SCROLL_DURATION,
  type ScrollItemData,
} from './scroll-list.js';

const items: ScrollItemData[] = [
  { value: 0 },
  { value: 1, disabled: true },
  { value: 2, text: '两' },
  { value: 3 },
  { value: 4, disabled: true },
  { value: 5 },
];

describe('constants 对齐 Semi', () => {
  it('DEFAULT_ITEM_HEIGHT=36, DEFAULT_SCROLL_DURATION=120', () => {
    expect(SCROLL_LIST_DEFAULT_ITEM_HEIGHT).toBe(36);
    expect(SCROLL_LIST_DEFAULT_SCROLL_DURATION).toBe(120);
  });
});

describe('resolveItemText（对齐 Semi renderItemList transform）', () => {
  it('未选中用 text ?? value', () => {
    expect(resolveItemText({ value: 3 }, false)).toBe('3');
    expect(resolveItemText({ value: 2, text: '两' }, false)).toBe('两');
  });

  it('选中且有 item.transform 优先用之', () => {
    const item: ScrollItemData = { value: 8, transform: (v) => `${v}时` };
    expect(resolveItemText(item, true)).toBe('8时');
    // 未选中不变换
    expect(resolveItemText(item, false)).toBe('8');
  });

  it('选中用公共 transform（无 item.transform 时）', () => {
    expect(resolveItemText({ value: 8 }, true, (v) => `第${v}`)).toBe('第8');
  });

  it('item.transform 优先于公共 transform', () => {
    const item: ScrollItemData = { value: 8, transform: (v) => `A${v}` };
    expect(resolveItemText(item, true, (v) => `B${v}`)).toBe('A8');
  });
});

describe('centerOffset（对齐 Semi scrollToNode）', () => {
  it('把 index 居中所需 scrollTop = index*ih - (wrapperH - ih)/2', () => {
    // ih=36, wrapperH=300, index=0 → 0 - (300-36)/2 = -132
    expect(centerOffset(0, 36, 300)).toBe(-132);
    // index=5 → 180 - 132 = 48
    expect(centerOffset(5, 36, 300)).toBe(48);
  });

  it('含 topPadding 偏移', () => {
    expect(centerOffset(0, 36, 300, 132)).toBe(0); // padding 抵消
  });
});

describe('nearestIndex（对齐 getNearestNodeInfo，跳过禁用）', () => {
  it('中线对准第 i 项时返回 i（非禁用）', () => {
    const ih = 36;
    const wrapperH = 300;
    const isDisabled = (i: number) => Boolean(items[i]?.disabled);
    // scrollTop 使 index 3 居中：centerOffset(3) = 108 - 132 = -24
    const st = centerOffset(3, ih, wrapperH);
    expect(nearestIndex(st, ih, wrapperH, items.length, isDisabled)).toBe(3);
  });

  it('中线落在禁用项时选最近的非禁用', () => {
    const ih = 36;
    const wrapperH = 300;
    const isDisabled = (i: number) => Boolean(items[i]?.disabled);
    // 对准 index 1（禁用）→ 应回退到相邻非禁用（0 或 2，距离相等取先命中的 0）
    const st = centerOffset(1, ih, wrapperH);
    const idx = nearestIndex(st, ih, wrapperH, items.length, isDisabled);
    expect(idx === 0 || idx === 2).toBe(true);
  });

  it('全禁用或空返回 -1', () => {
    expect(nearestIndex(0, 36, 300, 0, () => false)).toBe(-1);
    expect(nearestIndex(0, 36, 300, 3, () => true)).toBe(-1);
    expect(nearestIndex(0, 0, 300, 3, () => false)).toBe(-1);
  });
});

describe('wrapIndex（cycled 取模，对齐 index % list.length）', () => {
  it('折回 [0,count)（含负值回正）', () => {
    expect(wrapIndex(0, 24)).toBe(0);
    expect(wrapIndex(24, 24)).toBe(0);
    expect(wrapIndex(25, 24)).toBe(1);
    expect(wrapIndex(-1, 24)).toBe(23);
    expect(wrapIndex(5, 0)).toBe(0);
  });
});

describe('缓动 easeOut / scrollFrame（对齐 Semi scrollTo.ts）', () => {
  it('easeOut 单调、端点 0/1、越界 clamp', () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeOut(-1)).toBe(0);
    expect(easeOut(2)).toBe(1);
    expect(easeOut(0.5)).toBeGreaterThan(0.5); // ease-out 前段更快
  });

  it('scrollFrame 起点=from、终点=to、duration<=0 直接落定', () => {
    expect(scrollFrame(0, 100, 0, 120)).toBe(0);
    expect(scrollFrame(0, 100, 120, 120)).toBe(100);
    expect(scrollFrame(0, 100, 200, 120)).toBe(100); // 超时 clamp
    expect(scrollFrame(0, 100, 50, 0)).toBe(100); // 无动画直接落定
    const mid = scrollFrame(0, 100, 60, 120);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(100);
  });
});

describe('shouldPrepend / shouldAppend（cycled 补份数，逐份 while 循环对齐 Semi）', () => {
  // 校准自 Semi 官方 demo 实测：hours(12项)→4 份(48 li)、minutes(60项)→2 份(120 li)。
  // init 基准份 selected(idx=1) 居中 → baseFirstTop=(300-36)/2 - 1*36=96。
  it('hours（count=12）init(ratio=2) 头 2 份 + 尾 1 份，合基准共 4 份（对齐 Semi 48 li）', () => {
    const firstTop = (300 - 36) / 2 - 1 * 36; // 96
    const lastTop = firstTop + (12 - 1) * 36; // 492
    expect(shouldPrepend(firstTop, 12, 36, 300, 2)).toBe(2);
    expect(shouldAppend(lastTop, 12, 36, 300, 2)).toBe(1);
    // 总份 = prepend + 1 基准 + append
    expect(2 + 1 + 1).toBe(4);
  });

  it('minutes（count=60）init(ratio=2) 头 1 份 + 尾 0 份，合基准共 2 份（对齐 Semi 120 li）', () => {
    const firstTop = (300 - 36) / 2 - 1 * 36; // 96
    const lastTop = firstTop + (60 - 1) * 36; // 2220
    expect(shouldPrepend(firstTop, 60, 36, 300, 2)).toBe(1);
    expect(shouldAppend(lastTop, 60, 36, 300, 2)).toBe(0);
    expect(1 + 1 + 0).toBe(2);
  });

  it('滚动调整用 ratio=1（缓冲收窄为 1× 视窗）', () => {
    // 首项恰在视窗顶（firstTop=0）：ratio=1 时上方需 1 份缓冲
    expect(shouldPrepend(0, 12, 36, 300, 1)).toBe(1);
  });

  it('退化输入返回 0', () => {
    expect(shouldPrepend(0, 0, 36, 300)).toBe(0);
    expect(shouldAppend(0, 12, 0, 300)).toBe(0);
  });
});
