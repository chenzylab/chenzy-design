// Carousel 的 RTL 镜像 e2e（browser project / 真实 chromium）。
//
// 这个组件的 RTL 规则曾整段是**死代码**：写的是 `.cd-carousel:dir(rtl)`，
// 而 `:dir()` 只匹配 HTML `dir` 属性，ConfigProvider 注入的却是
// `<div class="cd-rtl">`（与 Semi 一致，不设 dir），全站 `[dir]` 实测为 0。
// 于是「箭头镜像 / 指示器 margin 换边 / 左右键镜像」三件事从来没发生过，
// 而 typecheck、单测、a11y 全绿 —— 只有量真实坐标才看得见。
import { describe, it, expect } from 'vitest';
import { renderKbd } from '../test-utils/kbd.js';
import CarouselRtlFixture from './CarouselRtlFixture.svelte';

/** 元素相对容器左右边缘的距离。 */
function side(container: Element, sel: string): { fromLeft: number; fromRight: number } {
  const el = container.querySelector(sel);
  if (!el) throw new Error(`找不到 ${sel}`);
  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { fromLeft: Math.round(r.left - c.left), fromRight: Math.round(c.right - r.right) };
}

describe('Carousel RTL 镜像（真实布局坐标）', () => {
  it('cd-rtl 作用域应真的把方向切成 rtl（而非依赖 dir 属性）', async () => {
    const screen = renderKbd(CarouselRtlFixture as never);
    const root = screen.baseElement;

    const ltr = root.querySelector('[data-testid="ltr"] .cd-carousel');
    const rtl = root.querySelector('[data-testid="rtl"] .cd-carousel');
    expect(ltr).toBeTruthy();
    expect(rtl).toBeTruthy();

    expect(getComputedStyle(ltr!).direction).toBe('ltr');
    // 这条就是 :dir() 那个 bug 的直接判据
    expect(getComputedStyle(rtl!).direction, 'RTL 下 carousel 根节点方向应为 rtl').toBe('rtl');
  });

  it('prev/next 箭头在 RTL 下应左右互换', async () => {
    const screen = renderKbd(CarouselRtlFixture as never);
    const root = screen.baseElement;

    const ltr = root.querySelector('[data-testid="ltr"] .cd-carousel') as HTMLElement;
    const rtl = root.querySelector('[data-testid="rtl"] .cd-carousel') as HTMLElement;

    // 夹具宽 400px，没有真实宽度则下面的左右比较是空转
    expect(ltr.getBoundingClientRect().width).toBeGreaterThan(100);

    const ltrPrev = side(ltr, '.cd-carousel-arrow-prev');
    const rtlPrev = side(rtl, '.cd-carousel-arrow-prev');

    // LTR：prev 在左
    expect(ltrPrev.fromLeft, `LTR prev 应在左，实测 ${JSON.stringify(ltrPrev)}`).toBeLessThan(
      ltrPrev.fromRight,
    );
    // RTL：prev 翻到右
    expect(rtlPrev.fromRight, `RTL prev 应在右，实测 ${JSON.stringify(rtlPrev)}`).toBeLessThan(
      rtlPrev.fromLeft,
    );
  });
});
