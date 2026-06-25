// Drawer a11y：浮层 portal 到 document.body（复用 Modal 基建），role=dialog / aria-modal。
// 参照 Modal.a11y.test.ts：扫描 document.body，不测真实焦点陷阱/键盘（jsdom 限制）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Drawer from './Drawer.svelte';

describe('Drawer a11y', () => {
  it('open + title：role=dialog / aria-modal / aria-labelledby，无 axe violations', async () => {
    renderWithLocale(Drawer, {
      props: { open: true, title: 'Filters' },
    });

    // use:portal 命令式挂到 document.body —— 全局查询。
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');

    const labelledby = dialog?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const titleEl = labelledby ? document.getElementById(labelledby) : null;
    expect(titleEl?.textContent).toContain('Filters');

    // close 按钮可访问名来自 en_US locale（验证 LocaleProvider 管线）。
    const closeBtn = document.querySelector('.cd-drawer__close') as HTMLElement | null;
    expect(closeBtn?.getAttribute('aria-label')).toBeTruthy();

    await expectNoAxeViolations(document.body);
  });

  it('无 title + ariaLabel：role=dialog 用 aria-label 提供可访问名', async () => {
    renderWithLocale(Drawer, {
      props: { open: true, ariaLabel: 'Side sheet', closable: false, footer: null },
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog?.getAttribute('aria-label')).toBe('Side sheet');
    expect(dialog?.getAttribute('aria-labelledby')).toBeNull();

    await expectNoAxeViolations(document.body);
  });
});
