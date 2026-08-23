// UserGuide 浮层首次定位精度（browser project / 真实 chromium）。
//
// 为什么必须真机：真正的 bug 只在真实浏览器渲染管线里出现——Popover 挂载时读取
// 触发盒（anchor span）的 getBoundingClientRect() 可能与 spotlightRect 状态更新的
// Svelte effect 调度顺序发生竞态。jsdom 的响应式/DOM 更新调度顺序与真实浏览器不同，
// 不会重现这个竞态（UserGuide.a11y.test.ts 里同等断言在退化为普通 $effect 后依然
// 通过，验证过 jsdom 测不出这个问题）。
//
// 回归背景：真机核实过，若 spotlightRect 的测量放在普通 $effect（在 DOM 更新之后
// 运行）而非 $effect.pre（DOM 更新前运行），{#key activeCurrent} 触发的 Popover
// 重新挂载会读到上一步残留的触发盒，首次箭头定位偏差可达 90px+，直到几百毫秒后
// 被 ResizeObserver 间接触发的二次定位才修正——用户可感知的箭头/挖洞对不上的跳变。
//
// 断言方式：不用 expect.poll（那会掩盖“首次错、后来才对”的问题——重试等待到通过
// 就会让这条回归测试失效），只等最小的渲染结算时间，然后一次性读取。若测出的位置
// 是错的就应该失败，不重试。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture } from '../test-utils/kbd.js';
import UserGuideMetricsFixture from './UserGuideMetricsFixture.svelte';

const settle = () => new Promise((r) => requestAnimationFrame(() => r(null)));

/** 浮层箭头实际指向的视口 x 坐标（对齐真机验证时用的口径：popup transform.x + arrow-offset-x）。 */
function arrowPointsToX(popover: HTMLElement): number {
  const m = popover.style.transform.match(/translate\(([\d.-]+)px/);
  const popX = m ? Number(m[1]) : NaN;
  const arrowOffset = Number(
    getComputedStyle(popover).getPropertyValue('--cd-tooltip-arrow-offset-x').replace('px', ''),
  );
  return popX + arrowOffset;
}

function centerXOf(el: Element): number {
  const r = el.getBoundingClientRect();
  return r.left + r.width / 2;
}

describe('UserGuide 浮层首次定位精度（对齐真实 spotlight target，不滞后一步）', () => {
  it('首次挂载：单帧结算后箭头立即精确对齐 step1 target（无需二次收敛等待）', async () => {
    renderKbdFixture(UserGuideMetricsFixture);
    (document.querySelector('[data-testid="start-guide"]') as HTMLButtonElement).click();
    await settle();

    const popover = document.querySelector('.cd-userGuide-popover') as HTMLElement;
    expect(popover).not.toBeNull();
    const target1 = document.querySelector('[data-testid="target-1"]') as HTMLElement;

    const diff = Math.abs(arrowPointsToX(popover) - centerXOf(target1));
    expect(diff, '首帧箭头指向应与 target-1 中心对齐（容差 2px，取整误差）').toBeLessThan(2);
  });

  it('切步后：单帧结算后箭头立即精确对齐新 target，不残留上一步位置', async () => {
    renderKbdFixture(UserGuideMetricsFixture);
    (document.querySelector('[data-testid="start-guide"]') as HTMLButtonElement).click();
    await settle();

    const target2 = document.querySelector('[data-testid="target-2"]') as HTMLElement;
    const target2CenterX = centerXOf(target2);

    const nextBtn = Array.from(
      document.querySelectorAll('.cd-userGuide-popup-content-buttons button'),
    ).find((b) => b.textContent?.trim() === 'Next') as HTMLButtonElement;
    nextBtn.click();
    await settle();

    const popover = document.querySelector('.cd-userGuide-popover') as HTMLElement;
    const diff = Math.abs(arrowPointsToX(popover) - target2CenterX);
    expect(diff, '切到 step2 后单帧箭头指向应与 target-2 中心对齐（不是残留 target-1 的位置）').toBeLessThan(2);
  });

  it('连续切三步：每步单帧结算后都立即对齐对应 target', async () => {
    renderKbdFixture(UserGuideMetricsFixture);
    (document.querySelector('[data-testid="start-guide"]') as HTMLButtonElement).click();
    await settle();

    const targets = ['target-1', 'target-2', 'target-3'].map(
      (id) => document.querySelector(`[data-testid="${id}"]`) as HTMLElement,
    );

    for (let step = 0; step < 3; step += 1) {
      const popover = document.querySelector('.cd-userGuide-popover') as HTMLElement;
      const diff = Math.abs(arrowPointsToX(popover) - centerXOf(targets[step]!));
      expect(diff, `step${step + 1} 单帧箭头指向应与 target-${step + 1} 中心对齐`).toBeLessThan(2);

      if (step < 2) {
        const nextBtn = Array.from(
          document.querySelectorAll('.cd-userGuide-popup-content-buttons button'),
        ).find((b) => b.textContent?.trim() === 'Next') as HTMLButtonElement;
        nextBtn.click();
        await settle();
      }
    }
  });
});
