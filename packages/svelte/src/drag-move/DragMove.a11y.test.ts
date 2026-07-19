// DragMove a11y + 渲染：纯 pointer（对齐 Semi，无把手语义、无键盘）。
// jsdom 焦点/几何模型不完整，真实拖拽留给 core 单测 + Playwright；这里做
// axe + 无 role/tabindex 静态断言（对齐 Semi 透明包裹、无样式层）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import DragMoveFixture from './DragMoveA11yFixture.svelte';

describe('DragMove a11y', () => {
  it('渲染包裹壳，无把手语义（对齐 Semi pointer-only），无 axe violations', async () => {
    const { container } = renderWithLocale(DragMoveFixture, { props: {} });
    const root = container.querySelector('.cd-drag-move');
    expect(root).not.toBeNull();
    // 无 role/tabindex/aria-label（对齐 Semi：无把手语义、无键盘、无样式层）。
    expect(root!.getAttribute('role')).toBeNull();
    expect(root!.getAttribute('tabindex')).toBeNull();
    expect(root!.getAttribute('aria-label')).toBeNull();
    await expectNoAxeViolations(container);
  });
});
