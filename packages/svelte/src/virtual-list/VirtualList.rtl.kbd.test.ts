// VirtualList 的 RTL 镜像 e2e（browser project / 真实 chromium）。
//
// 钉「horizontal 模式首项真实定位」：LTR 首项贴视口左边，RTL 首项贴视口右边
// （direction:rtl 本身不会自动镜像 translateX 数值定位与 scrollLeft 语义，
// 必须显式探测方向、换算偏移符号与锚点 CSS，对齐 ScrollList.rtl.kbd.test.ts 同类写法）。
import { describe, it, expect } from 'vitest';
import { renderKbd } from '../test-utils/kbd.js';
import VirtualListRtlFixture from './VirtualListRtlFixture.svelte';

describe('VirtualList RTL 镜像（真实布局坐标）', () => {
  it('horizontal 首项 LTR 贴视口左边，RTL 贴视口右边', async () => {
    const screen = renderKbd(VirtualListRtlFixture as never);
    const root = screen.baseElement;

    expect(root.querySelector('.cd-rtl'), '.cd-rtl 作用域应存在').toBeTruthy();

    const ltrViewport = root.querySelector('[data-testid="ltr"] .cd-virtual-list') as HTMLElement;
    const rtlViewport = root.querySelector('[data-testid="rtl"] .cd-virtual-list') as HTMLElement;
    const ltrFirst = root.querySelector('[data-testid="ltr"] .cd-virtual-list-item') as HTMLElement;
    const rtlFirst = root.querySelector('[data-testid="rtl"] .cd-virtual-list-item') as HTMLElement;
    expect(ltrViewport, 'LTR 视口应存在').toBeTruthy();
    expect(rtlViewport, 'RTL 视口应存在').toBeTruthy();
    expect(ltrFirst, 'LTR 首项应存在').toBeTruthy();
    expect(rtlFirst, 'RTL 首项应存在').toBeTruthy();

    const ltrStyle = getComputedStyle(ltrViewport);
    const rtlStyle = getComputedStyle(rtlViewport);
    expect(ltrStyle.direction).toBe('ltr');
    expect(rtlStyle.direction, 'RTL 下应为 rtl').toBe('rtl');

    const ltrViewportRect = ltrViewport.getBoundingClientRect();
    const rtlViewportRect = rtlViewport.getBoundingClientRect();
    const ltrFirstRect = ltrFirst.getBoundingClientRect();
    const rtlFirstRect = rtlFirst.getBoundingClientRect();

    expect(ltrFirstRect.width, '首项应有真实宽度').toBeGreaterThan(20);

    // LTR：首项左边贴视口左边（偏移 ~0），右边留出后续项的空间。
    expect(
      Math.abs(ltrFirstRect.left - ltrViewportRect.left),
      'LTR 首项应贴视口左边',
    ).toBeLessThan(2);

    // RTL：首项右边贴视口右边（偏移 ~0），对齐阅读起始位置镜像到右侧。
    expect(
      Math.abs(rtlFirstRect.right - rtlViewportRect.right),
      'RTL 首项应贴视口右边',
    ).toBeLessThan(2);
  });
});
