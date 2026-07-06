// Resizable 家族 a11y：把手 role=separator + aria-orientation + aria-value* +
// i18n aria-label；enable 子集渲染对应把手；Handler disabled 语义。
// jsdom 焦点/委托事件模型不完整，键盘真实行为留给 Playwright（见项目教训）；
// 这里做 axe + role/aria 静态断言。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import ResizableFixture from './ResizableA11yFixture.svelte';
import GroupFixture from './ResizeGroupA11yFixture.svelte';

describe('Resizable (single) a11y', () => {
  it('enable 子集只渲染对应把手，separator 语义完整，无 axe violations', async () => {
    const { container } = renderWithLocale(ResizableFixture, {
      props: { enable: { right: true, bottom: true, bottomRight: true } },
    });
    const handles = container.querySelectorAll('.cd-resizable__handle');
    expect(handles.length).toBe(3);
    expect(container.querySelector('.cd-resizable__handle--right')).not.toBeNull();
    expect(container.querySelector('.cd-resizable__handle--bottom')).not.toBeNull();
    expect(container.querySelector('.cd-resizable__handle--bottomRight')).not.toBeNull();
    expect(container.querySelector('.cd-resizable__handle--left')).toBeNull();

    const right = container.querySelector('.cd-resizable__handle--right')!;
    expect(right.getAttribute('role')).toBe('separator');
    // 左右把手 = 竖直分隔线
    expect(right.getAttribute('aria-orientation')).toBe('vertical');
    expect(right.getAttribute('tabindex')).toBe('0');
    // aria-label 来自 i18n（en_US → "Resize"）
    expect(right.getAttribute('aria-label')).toBe('Resize');
    expect(right.getAttribute('aria-valuenow')).toBeTruthy();

    const bottom = container.querySelector('.cd-resizable__handle--bottom')!;
    expect(bottom.getAttribute('aria-orientation')).toBe('horizontal');

    await expectNoAxeViolations(container);
  });

  it('enable=false 时不渲染任何把手', () => {
    const { container } = renderWithLocale(ResizableFixture, {
      props: { enable: false },
    });
    expect(container.querySelectorAll('.cd-resizable__handle').length).toBe(0);
  });
});

describe('ResizeGroup / ResizeHandler a11y', () => {
  it('horizontal：handler separator=vertical orientation + i18n label，无 axe violations', async () => {
    const { container } = renderWithLocale(GroupFixture, {
      props: { direction: 'horizontal' },
    });
    expect(container.querySelector('.cd-resize-group--horizontal')).not.toBeNull();
    expect(container.querySelectorAll('.cd-resize-item').length).toBe(2);
    const handler = container.querySelector('.cd-resize-handler')!;
    expect(handler.getAttribute('role')).toBe('separator');
    expect(handler.getAttribute('aria-orientation')).toBe('vertical');
    expect(handler.getAttribute('aria-label')).toBe('Resize');
    expect(handler.getAttribute('tabindex')).toBe('0');
    await expectNoAxeViolations(container);
  });

  it('vertical：handler orientation=horizontal', () => {
    const { container } = renderWithLocale(GroupFixture, {
      props: { direction: 'vertical' },
    });
    expect(container.querySelector('.cd-resize-group--vertical')).not.toBeNull();
    const handler = container.querySelector('.cd-resize-handler')!;
    expect(handler.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('disabled handler：tabindex=-1 + aria-disabled', () => {
    const { container } = renderWithLocale(GroupFixture, {
      props: { direction: 'horizontal', disabled: true },
    });
    const handler = container.querySelector('.cd-resize-handler')!;
    expect(handler.getAttribute('tabindex')).toBe('-1');
    expect(handler.getAttribute('aria-disabled')).toBe('true');
    expect(handler.classList.contains('cd-resize-handler--disabled')).toBe(true);
  });
});
