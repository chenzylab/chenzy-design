// Avatar a11y：展示原子，含可交互态（href→<a> / onClick→role=button）。
// 文字头像取 role=img + aria-label（来自 alt），避免逐字读缩写。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Avatar from './Avatar.svelte';

describe('Avatar a11y', () => {
  it('图片头像：img 带 alt，无 axe violations', async () => {
    const { container } = renderWithLocale(Avatar, {
      props: { src: 'https://example.com/a.png', alt: 'Jane Doe' },
    });
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('Jane Doe');
    await expectNoAxeViolations(container);
  });

  it('文字头像：role=img + aria-label，无 axe violations', async () => {
    const { container } = renderWithLocale(Avatar, {
      props: { alt: 'Kim Lee' },
    });
    const root = container.querySelector('.cd-avatar');
    expect(root?.getAttribute('role')).toBe('img');
    expect(root?.getAttribute('aria-label')).toBe('Kim Lee');
    await expectNoAxeViolations(container);
  });

  it('可交互（onClick）：role=button + tabindex=0 + aria-label，无 axe violations', async () => {
    const { container } = renderWithLocale(Avatar, {
      props: { alt: 'Settings', onClick: () => {} },
    });
    const root = container.querySelector('.cd-avatar');
    expect(root?.getAttribute('role')).toBe('button');
    expect(root?.getAttribute('tabindex')).toBe('0');
    expect(root?.getAttribute('aria-label')).toBe('Settings');
    await expectNoAxeViolations(container);
  });
});
