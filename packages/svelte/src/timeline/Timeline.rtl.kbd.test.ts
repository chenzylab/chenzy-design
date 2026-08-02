// Timeline 的 RTL 镜像几何 e2e（browser project / 真实 chromium）。
//
// 钉「轴线落在容器哪一侧」这个真实布局结果：
//   LTR 轴线贴左（Semi `.item-tail { left: 4px }`）；
//   RTL 应贴右（Semi rtl.scss `left:auto; right: 4px`）。
// 只写 `direction: rtl` 是**不够的** —— tail/head 是绝对定位，
// direction 不影响 left/right 的解析，必须显式换边。这条用例正是钉这个。
import { describe, it, expect } from 'vitest';
import { renderKbd } from '../test-utils/kbd.js';
import TimelineRtlFixture from './TimelineRtlFixture.svelte';

interface Side {
  fromLeft: number;
  fromRight: number;
}

/** 元素相对其定位容器（.cd-timeline-item）左右边缘的距离。 */
function sideOf(container: Element, sel: string): Side {
  const el = container.querySelector(sel);
  if (!el) throw new Error(`找不到 ${sel}`);
  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { fromLeft: Math.round(r.left - c.left), fromRight: Math.round(c.right - r.right) };
}

describe('Timeline RTL 镜像（真实布局坐标）', () => {
  it('轴线与圆点在 RTL 下应整体翻到右侧', async () => {
    const screen = renderKbd(TimelineRtlFixture as never);
    const root = screen.baseElement;

    expect(root.querySelector('.cd-rtl'), '.cd-rtl 作用域应存在').toBeTruthy();

    const ltrItem = root.querySelector('[data-testid="ltr"] .cd-timeline-item');
    const rtlItem = root.querySelector('[data-testid="rtl"] .cd-timeline-item');
    expect(ltrItem, 'LTR item 应存在').toBeTruthy();
    expect(rtlItem, 'RTL item 应存在').toBeTruthy();

    // 夹具宽 400px，item 必须有真实宽度，否则下面的左右比较是空转
    expect(ltrItem!.getBoundingClientRect().width).toBeGreaterThan(100);

    // 圆点与轴线是两条独立的规则，必须分别断言 ——
    // 只测 head 时，把 tail 的换边覆盖删掉用例照样绿（实测过，故补上 tail）。
    const ltrTail = sideOf(ltrItem!, '.cd-timeline-item-tail');
    const rtlTail = sideOf(rtlItem!, '.cd-timeline-item-tail');
    expect(ltrTail.fromLeft, `LTR 轴线应贴左，实测 ${JSON.stringify(ltrTail)}`).toBeLessThan(
      ltrTail.fromRight,
    );
    expect(rtlTail.fromRight, `RTL 轴线应贴右，实测 ${JSON.stringify(rtlTail)}`).toBeLessThan(
      rtlTail.fromLeft,
    );
    expect(rtlTail.fromRight).toBe(ltrTail.fromLeft);

    const ltrHead = sideOf(ltrItem!, '.cd-timeline-item-head');
    const rtlHead = sideOf(rtlItem!, '.cd-timeline-item-head');

    // LTR：圆点贴左
    expect(ltrHead.fromLeft, `LTR 圆点应贴左，实测 ${JSON.stringify(ltrHead)}`).toBeLessThan(
      ltrHead.fromRight,
    );
    // RTL：圆点贴右（这条在只写 direction:rtl 时会失败）
    expect(rtlHead.fromRight, `RTL 圆点应贴右，实测 ${JSON.stringify(rtlHead)}`).toBeLessThan(
      rtlHead.fromLeft,
    );

    // 且左右距离恰好互换 —— 精确镜像
    expect(rtlHead.fromRight).toBe(ltrHead.fromLeft);
  });
});
