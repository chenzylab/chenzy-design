// 视觉回归测试基建（仅 visual project / 真实 chromium + toMatchScreenshot）。
//
// 与 kbd.ts（焦点/键盘 e2e）的区别：本套件只关心「渲染长什么样」。
// 在真实 chromium 里 mount 组件 → 用 vitest browser 的 page.elementLocator
// 取容器 → expect.element(...).toMatchScreenshot('name') 做像素对比。
// 首次跑生成基线到测试文件同目录的 __screenshots__/，后续跑做差异比对。
//
// 渲染同样走 vitest-browser-svelte 的 render，外层包 LocaleProvider
// （复用 a11y/kbd 套件的 LocaleHarness），使 useLocale() 可用、文案稳定。
//
// token CSS 由全局 setup（vitest.visual-setup.ts）注入，helper 不重复注入。
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import type { Component } from 'svelte';
import LocaleHarness from './LocaleHarness.svelte';

// 被测组件/fixture 的宽松构造器类型——props 形态各异，帮手不关心精确签名。
type AnyComponent = Component<Record<string, unknown>>;

export interface RenderVisualOptions {
  /** 透传给被测组件的 props。 */
  props?: Record<string, unknown>;
  /** 语言码，默认 en_US。 */
  locale?: string;
}

/**
 * 在真实浏览器里把组件包进 LocaleProvider 渲染，用于视觉回归截图。
 * 返回 vitest-browser-svelte 的 RenderResult（含 baseElement / container）。
 *
 * 用法：
 *   const { container } = renderVisual(Button, { props: { type: 'primary' } });
 *   await expect.element(locate(container)).toMatchScreenshot('button-default');
 */
export function renderVisual(component: AnyComponent, options: RenderVisualOptions = {}) {
  const { props = {}, locale = 'en_US' } = options;
  return render(LocaleHarness as unknown as AnyComponent, {
    props: { component, props, locale },
  });
}

/**
 * 直接渲染一个已自带变体布局的 fixture 组件（无需 locale 透传）。
 * fixture 通常无 props，入参用宽松 Component<any> 接收。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderVisualFixture(component: Component<any>, props: Record<string, unknown> = {}) {
  return render(component as AnyComponent, { props });
}

/** 取某元素的 page locator（截图/断言用）。 */
export function locate(el: Element) {
  return page.elementLocator(el);
}

// 重新导出 page，visual 测试统一从这里取（elementLocator 等）。
export { page };
