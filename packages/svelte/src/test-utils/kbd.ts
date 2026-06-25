// 键盘 e2e 测试基建（仅 browser project / 真实 chromium 下使用）。
//
// 与 a11y.ts（jsdom + axe）的关键区别：本套件在真实 chromium 里 mount 组件，
// 用 vitest browser 的 userEvent 触发真实键盘/Tab，并用 page locator 的
// `.toHaveFocus()` 断言真实 document.activeElement。jsdom 测不了的焦点陷阱、
// roving 漫游、焦点归还都在这里覆盖。
//
// 渲染走 vitest-browser-svelte 的 render（基于 @testing-library/svelte-core，
// 真实 mount 到 document.body），外层用 LocaleHarness 包一层 LocaleProvider
// （复用 a11y 套件的同一 harness），使 useLocale() 可用。
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import type { Component } from 'svelte';
import LocaleHarness from './LocaleHarness.svelte';

// 被测组件的宽松构造器类型——props 形态各异，帮手不关心精确 prop 签名。
type AnyComponent = Component<Record<string, unknown>>;

export interface RenderKbdOptions {
  /** 透传给被测组件的 props。 */
  props?: Record<string, unknown>;
  /** 语言码，默认 en_US。 */
  locale?: string;
}

/**
 * 在真实浏览器里把组件包进 LocaleProvider 渲染。
 * 返回 vitest-browser-svelte 的 RenderResult（含 baseElement / container / 各 locator 查询）。
 *
 * 用法：
 *   const screen = renderKbd(Modal, { props: { open: true, title: '...' } });
 *   const dialog = screen.baseElement.querySelector('[role="dialog"]');
 */
export function renderKbd(component: AnyComponent, options: RenderKbdOptions = {}) {
  const { props = {}, locale = 'en_US' } = options;
  return render(LocaleHarness as unknown as AnyComponent, {
    props: { component, props, locale },
  });
}

/**
 * 直接渲染一个已自带 LocaleProvider/不需要 locale 的 fixture 组件。
 * fixture 通常无 props（构造器类型为 Component<Record<string, never>>），
 * 故入参用宽松的 Component<any> 接收，避免与具体 fixture 的精确 props 类型冲突。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderKbdFixture(component: Component<any>, props: Record<string, unknown> = {}) {
  return render(component as AnyComponent, { props });
}

// 重新导出 userEvent，键盘 e2e 统一从这里取（tab()/keyboard()/click()）。
export { userEvent };
