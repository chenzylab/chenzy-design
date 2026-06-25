// a11y 渲染测试基建（仅 dom project / jsdom 下使用）。
//
// 提供两个帮手：
//  - renderWithLocale：用 testing-library 的 render 把组件挂到 jsdom，
//    并用 LocaleHarness 包一层 LocaleProvider（默认 en_US），使 useLocale() 可用。
//  - expectNoAxeViolations：对容器跑 axe-core，断言 0 violations。
//
// 设计取舍：本套件只做 axe 静态规则 + role/aria 断言，不测真实键盘/焦点行为
// （jsdom 焦点模型不完整、委托事件合成不可靠——见项目已知教训）。焦点陷阱/键盘
// 导航留给将来 Playwright。
import { render, type RenderResult } from '@testing-library/svelte';
import type { Component } from 'svelte';
import axe, { type RunOptions, type Result } from 'axe-core';

// 被测组件的宽松构造器类型——props 形态各异，测试帮手不关心其精确 prop 签名。
// 用 Record<string, unknown> 而非 any，既满足 eslint no-explicit-any，又能接收任意组件。
type AnyComponent = Component<Record<string, unknown>>;
import { expect } from 'vitest';
import LocaleHarness from './LocaleHarness.svelte';

export interface RenderWithLocaleOptions {
  /** 透传给被测组件的 props。 */
  props?: Record<string, unknown>;
  /** 语言码，默认 en_US。 */
  locale?: string;
}

/**
 * 把组件包进 LocaleProvider 渲染到 jsdom。
 * 返回 testing-library 的 RenderResult（含 container / baseElement / queries）。
 *
 * 用法：
 *   const { container } = renderWithLocale(Button, { props: { type: 'primary' } });
 *
 * 纯展示组件（无 useLocale）同样可用——Provider 包裹无副作用。
 */
export function renderWithLocale(
  component: AnyComponent,
  options: RenderWithLocaleOptions = {},
): RenderResult<AnyComponent> {
  const { props = {}, locale = 'en_US' } = options;
  return render(LocaleHarness as unknown as AnyComponent, {
    props: { component, props, locale },
  });
}

// jsdom 下不可靠 / 无意义、需禁用的 axe 规则及原因：
//  - color-contrast：jsdom 不做布局与渲染，拿不到真实计算后的颜色/尺寸，
//    对比度无法计算（axe 本就会 incomplete，这里显式关掉避免噪音）。对比度
//    交给将来的真实浏览器（Playwright）或专门的 token 对比度校验。
const JSDOM_DISABLED_RULES = ['color-contrast'] as const;

export interface AxeAssertOptions {
  /** 额外要禁用的规则 id（在默认禁用项之外追加）。 */
  disableRules?: string[];
  /** 覆盖默认 runOptions（一般不需要）。 */
  runOptions?: RunOptions;
}

function formatViolations(violations: Result[]): string {
  return violations
    .map((v) => {
      const nodes = v.nodes.map((n) => `      - ${n.html}\n        ${n.failureSummary ?? ''}`).join('\n');
      return `  [${v.id}] ${v.help} (${v.impact ?? 'n/a'})\n    ${v.helpUrl}\n${nodes}`;
    })
    .join('\n\n');
}

/**
 * 对容器跑 axe-core，断言 0 violations。
 * 默认规则集：WCAG 2.0/2.1 A & AA（axe tags wcag2a/wcag2aa/wcag21a/wcag21aa）。
 * 默认禁用 jsdom 下不可靠的规则（见 JSDOM_DISABLED_RULES）。
 *
 * 用法：await expectNoAxeViolations(container);
 */
export async function expectNoAxeViolations(
  container: Element,
  options: AxeAssertOptions = {},
): Promise<void> {
  const { disableRules = [], runOptions } = options;

  const rules: RunOptions['rules'] = {};
  for (const id of [...JSDOM_DISABLED_RULES, ...disableRules]) {
    rules[id] = { enabled: false };
  }

  const results = await axe.run(
    container,
    runOptions ?? {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
      rules,
    },
  );

  if (results.violations.length > 0) {
    throw new Error(
      `Expected no axe violations but found ${results.violations.length}:\n\n${formatViolations(
        results.violations,
      )}`,
    );
  }

  // 给 vitest 一个显式断言计数，便于报告/快照。
  expect(results.violations).toHaveLength(0);
}
