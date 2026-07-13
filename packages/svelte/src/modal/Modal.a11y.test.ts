// Modal a11y 试点：复杂浮层组件（portal 到 body、focus-trap、scroll-lock）。
// 验证复杂组件能在 jsdom 渲染 + axe 扫描通过。
//
// 注意：本套件不测真实焦点移动/focus-trap 行为（jsdom 焦点模型不完整），
// 只断言静态 ARIA（role=dialog / aria-modal / aria-labelledby）+ axe 0 violations。
// Modal 用 use:portal 把面板 appendChild 到 document.body，故扫描 document.body。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Modal from './Modal.svelte';

describe('Modal a11y', () => {
  it('visible + title：role=dialog / aria-modal / aria-labelledby，无 axe violations', async () => {
    renderWithLocale(Modal, {
      props: { visible: true, title: 'Delete item' },
    });

    // portal 到 body —— 在 document 全局查询而非 container。
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');

    // 有 title 时用 aria-labelledby 指向标题（Typography.Title），且该 id 存在。
    const labelledby = dialog?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const titleEl = labelledby ? document.getElementById(labelledby) : null;
    expect(titleEl?.textContent).toContain('Delete item');

    // 关闭按钮（IconButton）有可访问名。
    const closeBtn = document.querySelector('.cd-modal-close') as HTMLElement | null;
    expect(closeBtn?.getAttribute('aria-label')).toBeTruthy();

    await expectNoAxeViolations(document.body);
  });

  it('无 title + ariaLabel：role=dialog 用 aria-label 提供可访问名', async () => {
    renderWithLocale(Modal, {
      props: { visible: true, ariaLabel: 'Settings dialog', closable: false, footer: null },
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog?.getAttribute('aria-label')).toBe('Settings dialog');
    expect(dialog?.getAttribute('aria-labelledby')).toBeNull();

    await expectNoAxeViolations(document.body);
  });
});
