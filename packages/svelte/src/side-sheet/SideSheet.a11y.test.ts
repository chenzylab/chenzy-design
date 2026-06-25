// SideSheet a11y：侧边滑出浮层（APG dialog/modal，与 Modal 同构）。
// role=dialog；mask=true 加 aria-modal=true；有 title 用 aria-labelledby，无则 aria-label。
// portal 到 body，故扫描 document.body（参照 Modal）。
// 不测真实 focus-trap/scroll-lock（jsdom 焦点模型不完整），只断言静态 ARIA + axe。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import SideSheet from './SideSheet.svelte';

describe('SideSheet a11y', () => {
  it('open + title：role=dialog / aria-modal / aria-labelledby，无 axe violations', async () => {
    renderWithLocale(SideSheet, {
      props: { open: true, title: 'Edit user' },
    });

    // portal 到 body —— 在 document 全局查询而非 container。
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog).not.toBeNull();
    // mask 默认 true → 模态。
    expect(dialog?.getAttribute('aria-modal')).toBe('true');

    // 有 title 时用 aria-labelledby 指向标题 h2，且该 id 存在。
    const labelledby = dialog?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const titleEl = labelledby ? document.getElementById(labelledby) : null;
    expect(titleEl?.textContent).toContain('Edit user');

    // 关闭按钮 aria-label 来自 en_US locale（验证 LocaleProvider 管线）。
    const closeBtn = document.querySelector('.cd-sidesheet__close') as HTMLElement | null;
    expect(closeBtn?.getAttribute('aria-label')).toBeTruthy();

    await expectNoAxeViolations(document.body);
  });

  it('无 title + ariaLabel：role=dialog 用 aria-label 提供可访问名', async () => {
    renderWithLocale(SideSheet, {
      props: { open: true, ariaLabel: 'Notification center', closable: false },
    });
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog?.getAttribute('aria-label')).toBe('Notification center');
    expect(dialog?.getAttribute('aria-labelledby')).toBeNull();
    await expectNoAxeViolations(document.body);
  });

  it('mask=false 非模态：不设 aria-modal（避免误导锁定语义）', async () => {
    renderWithLocale(SideSheet, {
      props: { open: true, title: 'Filters', mask: false },
    });
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBeNull();
    await expectNoAxeViolations(document.body);
  });
});
