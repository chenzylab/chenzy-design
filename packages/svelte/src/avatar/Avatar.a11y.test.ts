// Avatar a11y（对齐 Semi）：图片头像 <img alt>；文字头像内部 .cd-avatar-label role=img + aria-label。
// 可交互（onClick）时内部 img/label 加 tabindex=0 并响应键盘（对齐 Semi clickable Avatar）。
import { describe, it, expect } from 'vitest';
import { createRawSnippet } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Avatar from './Avatar.svelte';

// 文字头像内容用 children 传入（对齐 Semi：children 即文字，无独立 text prop）。
const textChildren = (s: string) => createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

describe('Avatar a11y', () => {
  it('图片头像：img 带 alt，无 axe violations', async () => {
    const { container } = renderWithLocale(Avatar, {
      props: { src: 'https://example.com/a.png', alt: 'Jane Doe' },
    });
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('Jane Doe');
    await expectNoAxeViolations(container);
  });

  it('文字头像：内部 label role=img + aria-label，无 axe violations', async () => {
    const { container } = renderWithLocale(Avatar, {
      props: { alt: 'Kim Lee', children: textChildren('KL') },
    });
    const label = container.querySelector('.cd-avatar-label');
    expect(label?.getAttribute('role')).toBe('img');
    expect(label?.getAttribute('aria-label')).toBe('Kim Lee');
    await expectNoAxeViolations(container);
  });

  it('可交互（onClick）：文字头像 label 可聚焦（tabindex=0，对齐 Semi），无 axe violations', async () => {
    const { container } = renderWithLocale(Avatar, {
      props: { alt: 'Settings', children: textChildren('S'), onClick: () => {} },
    });
    const label = container.querySelector('.cd-avatar-label');
    expect(label?.getAttribute('tabindex')).toBe('0');
    // clickable 时 aria-label 带前缀（对齐 Semi `clickable Avatar: ...`）
    expect(label?.getAttribute('aria-label')).toBe('clickable Avatar: Settings');
    await expectNoAxeViolations(container);
  });
});
