// OverflowList a11y：溢出列表。
// 根容器 role=group 透明保留子项语义 + aria-label 提供可访问名；
// 离屏测量层 aria-hidden（不进可达性树）。
// jsdom 无布局，不会真实折叠出 +N 节点；本套件只断言静态 ARIA + axe（折叠行为留给 Playwright）。
import { describe, it, expect, beforeAll } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import OverflowListFixture from './OverflowListA11yFixture.svelte';

// jsdom 无 ResizeObserver（OverflowList 用其测量溢出）。仅在本测试内补一个 no-op 桩，
// 不改基建/组件源码——溢出测量/折叠不在静态 a11y 测试范围（留给 Playwright）。
beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  }
});

describe('OverflowList a11y', () => {
  it('collapse 模式：根 role=group + aria-label，离屏测量层 aria-hidden，无 axe violations', async () => {
    const { container } = renderWithLocale(OverflowListFixture, {});
    const group = container.querySelector('[role="group"]');
    expect(group).not.toBeNull();
    expect(group?.getAttribute('aria-label')).toBe('Toolbar');

    // 离屏测量层移出可达性树。
    const measure = container.querySelector('.cd-overflow-list__measure');
    expect(measure?.getAttribute('aria-hidden')).toBe('true');

    await expectNoAxeViolations(container);
  });

  it('scroll 模式：可见层可聚焦 + role=group + 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(OverflowListFixture, {
      props: { mode: 'scroll', ariaLabel: 'Scrollable tags' },
    });
    const visible = container.querySelector('.cd-overflow-list__visible');
    // scroll 模式可见层为可聚焦滚动容器（tabindex=0）+ group + 可访问名。
    expect(visible?.getAttribute('tabindex')).toBe('0');
    expect(visible?.getAttribute('role')).toBe('group');
    expect(visible?.getAttribute('aria-label')).toBe('Scrollable tags');
    await expectNoAxeViolations(container);
  });
});
