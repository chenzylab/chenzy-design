// 验证对齐 Semi 新增/调整的 props：class/style 透传、noHorizontalPadding 去内距、
// ButtonGroup colorful/class/style、href 已移除。
// 放在 *.a11y.test.ts 命名下以进入 dom(jsdom) project（见根 vitest.config）。
import { describe, it, expect } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from '@testing-library/svelte';
import Button from './Button.svelte';
import ButtonGroup from './ButtonGroup.svelte';

describe('Button props（对齐 Semi）', () => {
  it('class / style 透传到根 button', () => {
    const { container } = render(Button, {
      props: { ariaLabel: 'x', class: 'my-cls', style: 'opacity: 0.3' },
    });
    const btn = container.querySelector('button')!;
    expect(btn.classList.contains('my-cls')).toBe(true);
    expect(btn.classList.contains('cd-button')).toBe(true);
    expect(btn.getAttribute('style')).toContain('opacity: 0.3');
  });

  it('noHorizontalPadding=true（有 icon）加去内距 class', () => {
    const icon = createRawSnippet(() => ({ render: () => '<svg></svg>' }));
    const { container } = render(Button, {
      props: { ariaLabel: 'x', icon, noHorizontalPadding: true },
    });
    const btn = container.querySelector('button')!;
    expect(btn.classList.contains('cd-button--no-pad-left')).toBe(true);
    expect(btn.classList.contains('cd-button--no-pad-right')).toBe(true);
  });

  it('noHorizontalPadding 无 icon 时不生效', () => {
    const { container } = render(Button, {
      props: { ariaLabel: 'x', noHorizontalPadding: true },
    });
    const btn = container.querySelector('button')!;
    expect(btn.classList.contains('cd-button--no-pad-left')).toBe(false);
  });

  it('circle 加 cd-button--circle class（含与 icon-only 组合）', () => {
    const icon = createRawSnippet(() => ({ render: () => '<svg></svg>' }));
    const { container } = render(Button, {
      props: { ariaLabel: 'x', icon, circle: true },
    });
    const btn = container.querySelector('button')!;
    expect(btn.classList.contains('cd-button--circle')).toBe(true);
    expect(btn.classList.contains('cd-button--icon-only')).toBe(true);
  });

  it('circle 默认关闭', () => {
    const { container } = render(Button, { props: { ariaLabel: 'x' } });
    expect(container.querySelector('button')!.classList.contains('cd-button--circle')).toBe(false);
  });

  it('已移除 href：不再渲染 <a>', () => {
    const { container } = render(Button, {
      // @ts-expect-error href 已从 Props 移除
      props: { href: 'https://x.com', ariaLabel: 'x' },
    });
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('button')).not.toBeNull();
  });
});

describe('ButtonGroup（对齐 Semi）', () => {
  it('colorful prop 渲染不报错，并透传 class/style/aria-label', () => {
    const { container } = render(ButtonGroup, {
      props: { colorful: true, class: 'grp', style: 'gap: 4px', ariaLabel: 'g' },
    });
    const root = container.querySelector('.cd-button-group')!;
    expect(root.classList.contains('grp')).toBe(true);
    expect(root.getAttribute('style')).toContain('gap: 4px');
    expect(root.getAttribute('aria-label')).toBe('g');
  });
});
