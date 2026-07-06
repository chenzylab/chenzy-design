// SideBarContainer a11y（P0）：可伸缩浮层壳（APG dialog）。
// role=dialog；有 title 用 aria-labelledby，无则 aria-label（关闭文案兜底）；
// resizable 时把手 role=separator + aria-orientation=vertical + aria-value* + i18n label。
// jsdom 焦点/委托事件模型不完整（真实 focus-trap/键盘留给 Playwright），这里做
// role/aria 静态断言 + axe。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import SideBarContainer from './SideBarContainer.svelte';

describe('SideBarContainer a11y', () => {
  it('visible + title：role=dialog / aria-labelledby，关闭按钮 i18n label，无 axe violations', async () => {
    const { container } = renderWithLocale(SideBarContainer, {
      props: { visible: true, title: 'Info panel' },
    });
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog).not.toBeNull();
    const labelledby = dialog?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const titleEl = labelledby ? document.getElementById(labelledby) : null;
    expect(titleEl?.textContent).toContain('Info panel');

    // 关闭按钮 aria-label 来自 en_US locale（SideBar.close = "Close"）。
    const closeBtn = container.querySelector(
      '.cd-sidebar-container__close',
    ) as HTMLElement | null;
    expect(closeBtn?.getAttribute('aria-label')).toBe('Close');

    await expectNoAxeViolations(container);
  });

  it('resizable 默认开：拖拽把手 role=separator + aria-orientation=vertical + i18n label', async () => {
    const { container } = renderWithLocale(SideBarContainer, {
      props: { visible: true, title: 'Resizable panel', minWidth: 200, maxWidth: 500 },
    });
    const handle = container.querySelector(
      '.cd-sidebar-container__handle',
    ) as HTMLElement | null;
    expect(handle).not.toBeNull();
    expect(handle?.getAttribute('role')).toBe('separator');
    expect(handle?.getAttribute('aria-orientation')).toBe('vertical');
    expect(handle?.getAttribute('tabindex')).toBe('0');
    // aria-label 来自 i18n（复用 Resizable.handleAriaLabel → "Resize"）。
    expect(handle?.getAttribute('aria-label')).toBe('Resize');
    expect(handle?.getAttribute('aria-valuemin')).toBe('200');
    expect(handle?.getAttribute('aria-valuemax')).toBe('500');
    await expectNoAxeViolations(container);
  });

  it('resizable=false：不渲染拖拽把手', () => {
    const { container } = renderWithLocale(SideBarContainer, {
      props: { visible: true, title: 'Static panel', resizable: false },
    });
    expect(container.querySelector('.cd-sidebar-container__handle')).toBeNull();
  });

  it('showClose=false + 无 title：dialog 用 aria-label 兜底提供可访问名', async () => {
    const { container } = renderWithLocale(SideBarContainer, {
      props: { visible: true, showClose: false },
    });
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog?.getAttribute('aria-labelledby')).toBeNull();
    expect(dialog?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('visible=false + 未开过：不渲染（关闭态零成本）', () => {
    const { container } = renderWithLocale(SideBarContainer, {
      props: { visible: false, title: 'Hidden' },
    });
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });
});
