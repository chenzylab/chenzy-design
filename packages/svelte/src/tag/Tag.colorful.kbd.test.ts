// AI 多彩标签配色 vs Semi 官网实测值（browser project / 真实 chromium）。
//
// 背景：本库 colorful 原先用的是**自造**的蓝→紫三色
// （#4d6bff / #7b5cff / #a64dff）+ 120° 三段渐变，
// 而 Semi 全部指向 AI 色板（278° 四段，洋红→蓝）——**既不同色也不同角度**。
// 这类偏差 a11y / 单测 / 元素计数全都测不出来，只有比对真实 computed 值才现形。
//
// 基线取自 Semi 官网实测（semi-metrics.ts，附源码依据与采集日期）。
import { describe, it, expect } from 'vitest';
import { renderKbd } from '../test-utils/kbd.js';
import TagColorfulMetricsFixture from './TagColorfulMetricsFixture.svelte';
import {
  TAG_COLORFUL_SOLID,
  TAG_COLORFUL_SOLID_GRADIENT,
  TAG_COLORFUL_LIGHT,
  TAG_COLORFUL_GHOST,
  type MetricBaseline,
} from '../test-utils/semi-metrics.js';

/** 逐条比对某元素的 computed 值与 Semi 基线。 */
function expectMatchesBaseline(el: Element, baseline: MetricBaseline, label: string): void {
  const cs = getComputedStyle(el);
  for (const [prop, expected] of Object.entries(baseline.computed)) {
    const actual = cs[prop as keyof CSSStyleDeclaration] as string;
    expect(actual, `${label} 的 ${prop} 应与 Semi 实测一致（基线采集于 ${baseline.measuredAt}）`).toBe(
      expected,
    );
  }
}

describe('Tag colorful 配色对齐 Semi AI 色板', () => {
  it('solid / light / ghost 三态与渐变态均与 Semi 实测逐项一致', async () => {
    const screen = renderKbd(TagColorfulMetricsFixture as never);
    const root = screen.baseElement;

    const cases: Array<[string, MetricBaseline]> = [
      ['solid-gradient', TAG_COLORFUL_SOLID_GRADIENT],
      ['solid', TAG_COLORFUL_SOLID],
      ['light', TAG_COLORFUL_LIGHT],
      ['ghost', TAG_COLORFUL_GHOST],
    ];

    for (const [testid, baseline] of cases) {
      const tag = root.querySelector(`[data-testid="${testid}"] .cd-tag`);
      expect(tag, `${testid} 标签应存在`).toBeTruthy();
      // 防夹具空转：token 没加载时颜色会读成 transparent / 空串
      expect(
        getComputedStyle(tag!).color,
        `${testid} 应读到真实颜色（读不到多半是没引 tokens.css）`,
      ).toMatch(/^rgb/);
      expectMatchesBaseline(tag!, baseline, testid);
    }
  });
});
