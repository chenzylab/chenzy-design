// DragMove a11y + 渲染：默认 pointer-only（无把手语义），keyboard 开启时
// 把手 role=button + tabindex=0 + i18n aria-label + 方向键移动。
// jsdom 焦点/几何模型不完整，真实拖拽留给 core 单测 + Playwright；这里做
// axe + role/aria/class 静态断言 + 键盘 offset 写入验证。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import DragMoveFixture from './DragMoveA11yFixture.svelte';

describe('DragMove a11y', () => {
  it('默认渲染包裹壳，无 axe violations', async () => {
    const { container } = renderWithLocale(DragMoveFixture, {
      props: { keyboard: false },
    });
    const root = container.querySelector('.cd-drag-move');
    expect(root).not.toBeNull();
    // 默认无把手语义（pointer-only，对齐 Semi）
    expect(root!.getAttribute('role')).toBeNull();
    expect(root!.getAttribute('tabindex')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('keyboard 开启：role=button + tabindex=0 + i18n aria-label（en → "Drag to move"），无 axe violations', async () => {
    const { container } = renderWithLocale(DragMoveFixture, {
      props: { keyboard: true },
    });
    const root = container.querySelector('.cd-drag-move')!;
    expect(root.getAttribute('role')).toBe('button');
    expect(root.getAttribute('tabindex')).toBe('0');
    expect(root.getAttribute('aria-label')).toBe('Drag to move');
    await expectNoAxeViolations(container);
  });

  it('keyboard 方向键移动写入 style.left/top', () => {
    const { container } = renderWithLocale(DragMoveFixture, {
      props: { keyboard: true },
    });
    const root = container.querySelector('.cd-drag-move') as HTMLElement;
    // jsdom offsetLeft/Top === 0；ArrowRight 步长 10 → left = 10
    root.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    expect(root.style.left).toBe('10px');
    root.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    expect(root.style.top).toBe('10px');
  });
});
