// ScrollList 的 RTL 镜像 e2e（browser project / 真实 chromium）。
//
// 钉「列间描边落在哪一侧」：normal 模式 `:not(:last-child)` 列自带一条描边，
// `border-right`/`border-left` 不受 `direction` 影响，必须显式换边（对齐 Semi scrollList/rtl.scss）。
// 只写 `direction: rtl` 是不够的，这条用例正是钉这个。
import { describe, it, expect } from 'vitest';
import { renderKbd } from '../test-utils/kbd.js';
import ScrollListRtlFixture from './ScrollListRtlFixture.svelte';

describe('ScrollList RTL 镜像（真实布局坐标）', () => {
  it('列间描边 LTR 落在右侧、RTL 落在左侧', async () => {
    const screen = renderKbd(ScrollListRtlFixture as never);
    const root = screen.baseElement;

    expect(root.querySelector('.cd-rtl'), '.cd-rtl 作用域应存在').toBeTruthy();

    const ltrFirst = root.querySelector('[data-testid="ltr"] .cd-scrolllist-item') as HTMLElement;
    const rtlFirst = root.querySelector('[data-testid="rtl"] .cd-scrolllist-item') as HTMLElement;
    expect(ltrFirst, 'LTR 首列应存在').toBeTruthy();
    expect(rtlFirst, 'RTL 首列应存在').toBeTruthy();
    expect(ltrFirst.getBoundingClientRect().width, '首列应有真实宽度').toBeGreaterThan(20);

    const ltrStyle = getComputedStyle(ltrFirst);
    const rtlStyle = getComputedStyle(rtlFirst);

    expect(ltrStyle.direction).toBe('ltr');
    expect(rtlStyle.direction, 'RTL 下应为 rtl').toBe('rtl');

    // LTR：首列右边有描边、左边无。
    expect(parseFloat(ltrStyle.borderRightWidth), `LTR 首列右边应有描边`).toBeGreaterThan(0);
    expect(parseFloat(ltrStyle.borderLeftWidth), `LTR 首列左边不应有描边`).toBe(0);

    // RTL：首列左边有描边、右边无（对齐 Semi rtl.scss 换边）。
    expect(parseFloat(rtlStyle.borderLeftWidth), `RTL 首列左边应有描边`).toBeGreaterThan(0);
    expect(parseFloat(rtlStyle.borderRightWidth), `RTL 首列右边不应有描边`).toBe(0);

    // 描边宽度本身两侧一致，只是换了边。
    expect(parseFloat(rtlStyle.borderLeftWidth)).toBe(parseFloat(ltrStyle.borderRightWidth));
  });
});
