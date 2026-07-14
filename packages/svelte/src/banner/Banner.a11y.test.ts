// Banner a11y：通知横幅，严格对齐 Semi。role 固定为 "alert"（live region）。
// 关闭按钮由 IconButton 渲染，aria-label 来自 locale（验证 LocaleProvider 管线）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Banner from './Banner.svelte';

describe('Banner a11y', () => {
  it('默认 info：role=alert，无 axe violations', async () => {
    const { container } = renderWithLocale(Banner, {
      props: { type: 'info', title: 'System notice', description: 'All good.' },
    });
    const banner = container.querySelector('.cd-banner');
    expect(banner?.getAttribute('role')).toBe('alert');
    await expectNoAxeViolations(container);
  });

  it('danger：role=alert，无 axe violations', async () => {
    const { container } = renderWithLocale(Banner, {
      props: { type: 'danger', title: 'Failed', closeIcon: null },
    });
    const banner = container.querySelector('.cd-banner');
    expect(banner?.getAttribute('role')).toBe('alert');
    await expectNoAxeViolations(container);
  });

  it('关闭按钮由 IconButton 渲染，aria-label 来自 locale', async () => {
    const { container } = renderWithLocale(Banner, {
      props: { type: 'success', title: 'Saved' },
    });
    const closeBtn = container.querySelector('.cd-banner-close');
    expect(closeBtn?.tagName.toLowerCase()).toBe('button');
    expect(closeBtn?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
