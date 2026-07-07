// FloatButton / FloatButtonGroup 组件与逻辑测试。
//  - 尺寸/形状/badge/colorful class；href→<a>、无 href→<button> 分支。
//  - disabled 阻断 onClick；_blank 补 rel。
//  - Group 事件委托取 value；items 遍历与 content 渲染。
// 命名 *.a11y.test.ts 以进入 dom(jsdom) project（渲染 Svelte 组件需 jsdom + 编译）。
import { describe, it, expect, vi } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from '@testing-library/svelte';
import FloatButton from './FloatButton.svelte';
import FloatButtonGroup from './FloatButtonGroup.svelte';
import { renderWithLocale } from '../test-utils/a11y.js';

const iconSnippet = () => createRawSnippet(() => ({ render: () => '<svg data-testid="icon"></svg>' }));

describe('FloatButton 渲染分支', () => {
  it('无 href → 渲染 <button type=button>', () => {
    const { container } = render(FloatButton, { props: { ariaLabel: 'x', icon: iconSnippet() } });
    const btn = container.querySelector('button.cd-floatbutton');
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute('type')).toBe('button');
    expect(container.querySelector('a')).toBeNull();
  });

  it('有 href → 渲染 <a href>', () => {
    const { container } = render(FloatButton, {
      props: { ariaLabel: 'x', href: '/docs', icon: iconSnippet() },
    });
    const a = container.querySelector('a.cd-floatbutton');
    expect(a).not.toBeNull();
    expect(a?.getAttribute('href')).toBe('/docs');
    expect(container.querySelector('button')).toBeNull();
  });

  it('target=_blank 自动补 rel=noopener noreferrer', () => {
    const { container } = render(FloatButton, {
      props: { ariaLabel: 'x', href: '/docs', target: '_blank', icon: iconSnippet() },
    });
    const a = container.querySelector('a.cd-floatbutton')!;
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('非 _blank target 不补 rel', () => {
    const { container } = render(FloatButton, {
      props: { ariaLabel: 'x', href: '/docs', target: '_self', icon: iconSnippet() },
    });
    expect(container.querySelector('a')!.getAttribute('rel')).toBeNull();
  });

  it('三尺寸 class', () => {
    for (const size of ['small', 'default', 'large'] as const) {
      const { container } = render(FloatButton, { props: { ariaLabel: 'x', size, icon: iconSnippet() } });
      expect(container.querySelector('.cd-floatbutton')!.classList.contains(`cd-floatbutton--${size}`)).toBe(true);
    }
  });

  it('两形状 class（round 默认 / square）', () => {
    const { container: c1 } = render(FloatButton, { props: { ariaLabel: 'x', icon: iconSnippet() } });
    expect(c1.querySelector('.cd-floatbutton')!.classList.contains('cd-floatbutton--round')).toBe(true);
    const { container: c2 } = render(FloatButton, { props: { ariaLabel: 'x', shape: 'square', icon: iconSnippet() } });
    expect(c2.querySelector('.cd-floatbutton')!.classList.contains('cd-floatbutton--square')).toBe(true);
  });

  it('colorful class', () => {
    const { container } = render(FloatButton, { props: { ariaLabel: 'x', colorful: true, icon: iconSnippet() } });
    expect(container.querySelector('.cd-floatbutton')!.classList.contains('cd-floatbutton--colorful')).toBe(true);
  });

  it('badge：外层包裹 Badge（渲染 count）', () => {
    const { container } = render(FloatButton, {
      props: { ariaLabel: 'x', badge: { count: 3 }, icon: iconSnippet() },
    });
    // Badge 渲染计数 3
    expect(container.textContent).toContain('3');
    expect(container.querySelector('.cd-floatbutton')).not.toBeNull();
  });

  it('disabled（button）：原生 disabled，onClick 不触发', async () => {
    const onClick = vi.fn();
    const { container } = render(FloatButton, {
      props: { ariaLabel: 'x', disabled: true, onClick, icon: iconSnippet() },
    });
    const btn = container.querySelector('button')!;
    expect(btn.hasAttribute('disabled')).toBe(true);
    btn.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled（a）：aria-disabled + tabindex=-1，且 href 移除', () => {
    const { container } = render(FloatButton, {
      props: { ariaLabel: 'x', href: '/docs', disabled: true, icon: iconSnippet() },
    });
    const a = container.querySelector('a')!;
    expect(a.getAttribute('aria-disabled')).toBe('true');
    expect(a.getAttribute('tabindex')).toBe('-1');
    expect(a.getAttribute('href')).toBeNull();
  });

  it('onClick 正常触发并透传 MouseEvent', () => {
    const onClick = vi.fn();
    const { container } = render(FloatButton, { props: { ariaLabel: 'x', onClick, icon: iconSnippet() } });
    container.querySelector('button')!.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent);
  });

  it('class / style 透传到根节点', () => {
    const { container } = render(FloatButton, {
      props: { ariaLabel: 'x', class: 'my-fb', style: 'inset-inline-end:24px', icon: iconSnippet() },
    });
    const btn = container.querySelector('button')!;
    expect(btn.classList.contains('my-fb')).toBe(true);
    expect(btn.getAttribute('style')).toContain('inset-inline-end');
  });
});

describe('FloatButtonGroup', () => {
  const items = [
    { value: 'help', ariaLabel: '帮助', icon: iconSnippet() },
    { value: 'chat', ariaLabel: '客服', icon: iconSnippet() },
    { value: 'top', content: '顶部' },
  ];

  it('role=group + 遍历 items 渲染 N 个按钮', () => {
    const { container } = renderWithLocale(FloatButtonGroup, { props: { items } });
    const group = container.querySelector('.cd-floatbutton-group')!;
    expect(group.getAttribute('role')).toBe('group');
    expect(container.querySelectorAll('.cd-floatbutton-group__item').length).toBe(3);
  });

  it('content 为 string 时渲染文字', () => {
    const { container } = renderWithLocale(FloatButtonGroup, { props: { items } });
    expect(container.textContent).toContain('顶部');
  });

  it('事件委托：点击子项回传 value', () => {
    const onClick = vi.fn();
    const { container } = renderWithLocale(FloatButtonGroup, { props: { items, onClick } });
    const first = container.querySelector('.cd-floatbutton-group__item')! as HTMLElement;
    first.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0]?.[0]).toBe('help');
  });

  it('组级 disabled 透传到子项 + 加禁用 class', () => {
    const { container } = renderWithLocale(FloatButtonGroup, { props: { items, disabled: true } });
    expect(container.querySelector('.cd-floatbutton-group')!.classList.contains('cd-floatbutton-group--disabled')).toBe(true);
    // 子项 button 拿到 disabled
    expect(container.querySelector('button.cd-floatbutton-group__item')!.hasAttribute('disabled')).toBe(true);
  });

  it('class / style 透传到根节点', () => {
    const { container } = renderWithLocale(FloatButtonGroup, {
      props: { items, class: 'grp', style: 'inset-block-end:24px' },
    });
    const root = container.querySelector('.cd-floatbutton-group')!;
    expect(root.classList.contains('grp')).toBe(true);
    expect(root.getAttribute('style')).toContain('inset-block-end');
  });
});
