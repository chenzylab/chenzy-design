// Avatar a11y（对齐 Semi）：图片头像 <img alt>；文字头像内部 .cd-avatar-label role=img + aria-label。
// 可交互（onClick）时内部 img/label 加 tabindex=0 并响应键盘（对齐 Semi clickable Avatar）。
import { describe, it, expect } from 'vitest';
import { createRawSnippet, tick, type Component } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Avatar from './Avatar.svelte';
import AvatarGroupComposableFixture from './AvatarGroupComposableFixture.svelte';

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

describe('AvatarGroup 组合式折叠（对齐 Semi children + maxCount）', () => {
  it('组合式子 Avatar 超出 maxCount 的被折叠，组渲染「+N」', async () => {
    const { container } = renderWithLocale(
      AvatarGroupComposableFixture as unknown as Component<Record<string, unknown>>,
      { props: { maxCount: 2 } },
    );
    // 注册经 microtask bump 后组才知道总数，等一拍。
    await Promise.resolve();
    await tick();
    // 4 个成员、maxCount=2 → 可见 2 个 + 1 个「+2」溢出头像。
    const more = container.querySelector('.cd-avatar-item-more');
    expect(more).not.toBeNull();
    expect(more?.textContent?.trim()).toBe('+2');
    // 被折叠的成员自身不渲染：整组只剩 2 个普通头像 + 1 个 more。
    const labels = [...container.querySelectorAll('.cd-avatar-label')].map((e) =>
      e.textContent?.trim(),
    );
    expect(labels).toContain('LS');
    expect(labels).toContain('CA');
    expect(labels).not.toContain('ZK');
    expect(labels).not.toContain('YU');
  });

  it('maxCount 未设时组合式子项全渲染（无折叠，无回归）', async () => {
    const { container } = renderWithLocale(
      AvatarGroupComposableFixture as unknown as Component<Record<string, unknown>>,
      { props: { maxCount: undefined } },
    );
    await Promise.resolve();
    await tick();
    expect(container.querySelector('.cd-avatar-item-more')).toBeNull();
    const labels = [...container.querySelectorAll('.cd-avatar-label')].map((e) =>
      e.textContent?.trim(),
    );
    expect(labels).toEqual(['LS', 'CA', 'ZK', 'YU']);
  });
});
