// Banner a11y：内嵌反馈横幅。role/aria-live 由 core resolveBannerRole(type, dynamic) 推断：
//  - 非 dynamic（默认）→ role=region（landmark，需可访问名：title 或 ariaLabel）。
//  - dynamic + danger/warning → role=alert + aria-live=assertive。
//  - dynamic + info/success → role=status + aria-live=polite。
// 注意：region landmark 必须有可访问名，否则触发 axe [region]/[landmark]，故测试均提供 title。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Banner from './Banner.svelte';

describe('Banner a11y', () => {
  it('默认 info：role=region + title 提供可访问名（aria-labelledby），无 axe violations', async () => {
    const { container } = renderWithLocale(Banner, {
      props: { type: 'info', title: 'System notice', description: 'All good.' },
    });
    const banner = container.querySelector('.cd-banner');
    expect(banner?.getAttribute('role')).toBe('region');
    // region 可访问名来自 title（aria-labelledby 指向标题元素）。
    const labelledby = banner?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    expect(labelledby ? container.querySelector(`#${labelledby}`)?.textContent : '').toContain(
      'System notice',
    );
    await expectNoAxeViolations(container);
  });

  it('dynamic + danger：role=alert + aria-live=assertive，无 axe violations', async () => {
    const { container } = renderWithLocale(Banner, {
      props: { type: 'danger', dynamic: true, title: 'Failed', closable: false },
    });
    const banner = container.querySelector('.cd-banner');
    expect(banner?.getAttribute('role')).toBe('alert');
    expect(banner?.getAttribute('aria-live')).toBe('assertive');
    await expectNoAxeViolations(container);
  });

  it('dynamic + success：role=status + aria-live=polite，无 axe violations', async () => {
    const { container } = renderWithLocale(Banner, {
      props: { type: 'success', dynamic: true, title: 'Saved' },
    });
    const banner = container.querySelector('.cd-banner');
    expect(banner?.getAttribute('role')).toBe('status');
    expect(banner?.getAttribute('aria-live')).toBe('polite');
    // 关闭按钮可访问名来自 locale（验证 LocaleProvider 管线）。
    const closeBtn = container.querySelector('.cd-banner__close');
    expect(closeBtn?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
