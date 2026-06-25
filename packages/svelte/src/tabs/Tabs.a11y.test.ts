// Tabs a11y：标签页。
// 容器 role=tablist，每个标签 role=tab + aria-selected，激活标签 aria-selected=true，
// 面板 role=tabpanel（aria-controls ↔ id 关联）。
// 用声明式 <Tabs.Pane> 夹具（TabsA11yFixture）渲染真实面板，使 aria-controls 不悬空。
import { describe, it, expect, beforeAll } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import TabsFixture from './TabsA11yFixture.svelte';

// jsdom 无 ResizeObserver（Tabs 用其检测标签栏溢出）。仅在本测试内补一个 no-op 桩，
// 不改基建/组件源码——溢出滚动行为不在静态 a11y 测试范围（留给 Playwright）。
beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  }
});

describe('Tabs a11y', () => {
  it('默认渲染：role=tablist + tab + tabpanel，无 axe violations', async () => {
    const { container } = renderWithLocale(TabsFixture, {});
    expect(container.querySelector('[role="tablist"]')).not.toBeNull();
    expect(container.querySelectorAll('[role="tab"]').length).toBe(3);
    expect(container.querySelector('[role="tabpanel"]')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('选中态：defaultValue 标签 aria-selected=true，其余 false', async () => {
    const { container } = renderWithLocale(TabsFixture, {
      props: { defaultValue: 'details' },
    });
    const selected = container.querySelectorAll('[role="tab"][aria-selected="true"]');
    expect(selected.length).toBe(1);
    expect(selected[0]?.textContent).toContain('Details');
    await expectNoAxeViolations(container);
  });

  it('card 类型：role 语义不变，无 axe violations', async () => {
    const { container } = renderWithLocale(TabsFixture, {
      props: { type: 'card' },
    });
    expect(container.querySelectorAll('[role="tab"]').length).toBe(3);
    await expectNoAxeViolations(container);
  });
});
