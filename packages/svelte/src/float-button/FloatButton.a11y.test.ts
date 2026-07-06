// FloatButton / FloatButtonGroup a11y：语义元素 + 可访问名 + axe 0 violations。
//  - 无 href → button[type=button]；有 href → <a>；_blank 补 rel。
//  - icon-only 必须 aria-label（有则 axe button/link-name 通过）。
//  - Group role=group + locale aria-label；各子项独立 button/a。
// jsdom 只断言静态 ARIA + axe（真实键盘/焦点留给 Playwright）。
import { describe, it, expect } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import FloatButton from './FloatButton.svelte';
import FloatButtonGroup from './FloatButtonGroup.svelte';

const iconSnippet = () => createRawSnippet(() => ({ render: () => '<svg aria-hidden="true"></svg>' }));

describe('FloatButton a11y', () => {
  it('icon-only + ariaLabel：button 有可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(FloatButton, {
      props: { ariaLabel: 'AI 编辑', icon: iconSnippet() },
    });
    const btn = container.querySelector('button.cd-floatbutton')!;
    expect(btn.getAttribute('type')).toBe('button');
    expect(btn.getAttribute('aria-label')).toBe('AI 编辑');
    await expectNoAxeViolations(container);
  });

  it('有 href：渲染 <a>，可访问名 + 无 axe violations', async () => {
    const { container } = renderWithLocale(FloatButton, {
      props: { ariaLabel: '文档', href: '/docs', icon: iconSnippet() },
    });
    const a = container.querySelector('a.cd-floatbutton')!;
    expect(a.getAttribute('aria-label')).toBe('文档');
    await expectNoAxeViolations(container);
  });

  it('_blank 链接：rel=noopener noreferrer，无 axe violations', async () => {
    const { container } = renderWithLocale(FloatButton, {
      props: { ariaLabel: '外部文档', href: 'https://x.com', target: '_blank', icon: iconSnippet() },
    });
    const a = container.querySelector('a.cd-floatbutton')!;
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    await expectNoAxeViolations(container);
  });

  it('带文字（children）：文字渲染进按钮内容区，可访问名来自文字，无 axe violations', async () => {
    // 直接用 render 传 children（LocaleHarness 的 props.children 会被其自身默认插槽遮蔽）。
    // FloatButton 为纯展示组件，不依赖 locale，无需 LocaleProvider 包裹。
    const { container } = render(FloatButton, {
      props: {
        children: createRawSnippet(() => ({ render: () => '<span>返回顶部</span>' })),
      },
    });
    expect(container.querySelector('.cd-floatbutton__content')!.textContent).toContain('返回顶部');
    await expectNoAxeViolations(container);
  });

  it('disabled button：原生 disabled，无 axe violations', async () => {
    const { container } = renderWithLocale(FloatButton, {
      props: { ariaLabel: '不可用', disabled: true, icon: iconSnippet() },
    });
    expect(container.querySelector('button')!.hasAttribute('disabled')).toBe(true);
    await expectNoAxeViolations(container);
  });
});

describe('FloatButtonGroup a11y', () => {
  const items = [
    { value: 'help', ariaLabel: '帮助', icon: iconSnippet() },
    { value: 'chat', ariaLabel: '客服', icon: iconSnippet() },
  ];

  it('role=group + locale 可访问名（非 key 原样），无 axe violations', async () => {
    const { container } = renderWithLocale(FloatButtonGroup, { props: { items } });
    const group = container.querySelector('.cd-floatbutton-group')!;
    expect(group.getAttribute('role')).toBe('group');
    const label = group.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('FloatButton.groupAriaLabel');
    await expectNoAxeViolations(container);
  });

  it('自定义 ariaLabel 覆盖组可访问名', async () => {
    const { container } = renderWithLocale(FloatButtonGroup, {
      props: { items, ariaLabel: '快捷入口' },
    });
    expect(container.querySelector('.cd-floatbutton-group')!.getAttribute('aria-label')).toBe('快捷入口');
    await expectNoAxeViolations(container);
  });
});
