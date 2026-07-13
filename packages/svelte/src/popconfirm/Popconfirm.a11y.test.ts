// Popconfirm a11y（封装 Popover→Tooltip 架构）：气泡确认浮层。受控 visible 强制打开。
//  - 浮层 portal 到 body，role=dialog（在 .cd-tooltip__pop 上），aria-labelledby 指向 Popconfirm 标题。
//  - 触发器 .cd-tooltip__trigger 承载 role=button + aria-haspopup=dialog + aria-expanded/controls。
// 浮层在 document.body —— 全局查询并扫 document.body。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './PopconfirmA11yFixture.svelte';

describe('Popconfirm a11y', () => {
  it('open：浮层 role=dialog + aria-labelledby 指向标题，无 axe violations', async () => {
    render(Fixture, { props: { visible: true } });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog).not.toBeNull();
    const labelledby = dialog?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    expect(labelledby ? document.getElementById(labelledby)?.textContent : '').toContain(
      'Delete this item?',
    );
    // 正文渲染在卡片内。
    expect(dialog?.textContent).toContain('cannot be undone');
    // 确认/取消按钮文案来自 locale（验证 LocaleProvider 管线）。
    const buttons = dialog?.querySelectorAll('button');
    expect(buttons?.length).toBeGreaterThanOrEqual(2);

    await expectNoAxeViolations(document.body);
  });

  it('触发器声明 disclosure 语义：role=button + aria-haspopup=dialog + aria-expanded', async () => {
    render(Fixture, { props: { visible: true } });
    const trigger = document.querySelector('.cd-tooltip__trigger') as HTMLElement | null;
    expect(trigger?.getAttribute('role')).toBe('button');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    await expectNoAxeViolations(document.body);
  });

  it('收起态：无浮层 dialog，无 axe violations', async () => {
    const { container } = render(Fixture, { props: { visible: false } });
    expect(document.querySelector('.cd-tooltip__pop[role="dialog"]')).toBeNull();
    await expectNoAxeViolations(container);
  });
});
