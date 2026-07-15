// FloatButton / FloatButtonGroup — DOM 结构对齐 Semi 的最小回归。
// 严格对齐 Semi：纯 div + onClick（非 button/a），外层 div 带 size+shape class，
// body 带 shape+size(+colorful?+disabled?) class，Group 点击委托读 e.target.dataset.value。
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import FloatButton from './FloatButton.svelte';
import FloatButtonGroup from './FloatButtonGroup.svelte';

const icon = () => createRawSnippet(() => ({ render: () => `<svg data-testid="fb-icon"></svg>` }));

describe('FloatButton DOM（对齐 Semi）', () => {
  it('外层 div 带 size+shape class；body 带 shape+size class；非 button/a', () => {
    const { container } = render(FloatButton, { props: { icon: icon(), size: 'large', shape: 'square' } });
    const root = container.querySelector('.cd-floatButton') as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root.classList.contains('cd-floatButton-large')).toBe(true);
    expect(root.classList.contains('cd-floatButton-square')).toBe(true);
    const body = container.querySelector('.cd-floatButton-body') as HTMLElement;
    expect(body.classList.contains('cd-floatButton-square')).toBe(true);
    expect(body.classList.contains('cd-floatButton-large')).toBe(true);
    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
  });

  it('colorful / disabled 反映到 body class', () => {
    const { container } = render(FloatButton, { props: { icon: icon(), colorful: true, disabled: true } });
    const body = container.querySelector('.cd-floatButton-body') as HTMLElement;
    expect(body.classList.contains('cd-floatButton-colorful')).toBe(true);
    expect(body.classList.contains('cd-floatButton-disabled')).toBe(true);
  });

  it('disabled 时点击不触发 onClick', async () => {
    const onClick = vi.fn();
    const { container } = render(FloatButton, { props: { icon: icon(), disabled: true, onClick } });
    (container.querySelector('.cd-floatButton') as HTMLElement).click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('badge 时 body 外层包裹 Badge', () => {
    const { container } = render(FloatButton, { props: { icon: icon(), badge: { count: 3 } } });
    const badge = container.querySelector('.cd-badge');
    expect(badge).not.toBeNull();
    expect(badge?.querySelector('.cd-floatButton-body')).not.toBeNull();
  });
});

describe('FloatButtonGroup DOM（对齐 Semi）', () => {
  it('item 为 div，带 data-value；点击直接读 e.target.dataset.value 回传', async () => {
    const onClick = vi.fn();
    const { container } = render(FloatButtonGroup, {
      props: { items: [{ value: 'help', content: '帮助' }], onClick },
    });
    const item = container.querySelector('.cd-floatButtonGroup-item') as HTMLElement;
    expect(item.tagName).toBe('DIV');
    expect(item.getAttribute('data-value')).toBe('help');
    item.click();
    expect(onClick).toHaveBeenCalledWith('help', expect.anything());
  });

  it('disabled 组不触发点击', () => {
    const onClick = vi.fn();
    const { container } = render(FloatButtonGroup, {
      props: { items: [{ value: 'a', content: 'A' }], disabled: true, onClick },
    });
    (container.querySelector('.cd-floatButtonGroup-item') as HTMLElement).click();
    expect(onClick).not.toHaveBeenCalled();
    expect(container.querySelector('.cd-floatButtonGroup-disabled')).not.toBeNull();
  });
});
