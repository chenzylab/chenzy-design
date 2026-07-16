// IconButton 组件测：薄封装 Button，透传 props；icon/children/ariaLabel 均可选（对齐 Semi）。
// 放在 *.a11y.test.ts 命名下以进入 dom(jsdom) project（见根 vitest.config）。
import { describe, it, expect } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from '@testing-library/svelte';
import IconButton from './IconButton.svelte';

const icon = createRawSnippet(() => ({ render: () => '<svg data-testid="ic"></svg>' }));
const text = createRawSnippet(() => ({ render: () => '新增' }));

describe('IconButton', () => {
  it('渲染原生 <button>，透传 aria-label，纯图标为 icon-only（方形）', () => {
    const { container } = render(IconButton, { props: { icon, ariaLabel: '编辑' } });
    const btn = container.querySelector('button')!;
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-label')).toBe('编辑');
    expect(btn.classList.contains('cd-button-with-icon-only')).toBe(true);
  });

  it('不传 children 时仅有图标（icon-only）', () => {
    const { container } = render(IconButton, { props: { icon, ariaLabel: 'x' } });
    const btn = container.querySelector('button')!;
    expect(container.querySelector('[data-testid="ic"]')).not.toBeNull();
    expect(btn.textContent?.trim()).toBe('');
  });

  it('传 children（图标+文字）时非 icon-only', () => {
    const { container } = render(IconButton, { props: { icon, children: text } });
    const btn = container.querySelector('button')!;
    expect(container.querySelector('[data-testid="ic"]')).not.toBeNull();
    expect(btn.textContent?.trim()).toBe('新增');
    // 有文字 → with-icon 但非 with-icon-only
    expect(btn.classList.contains('cd-button-with-icon')).toBe(true);
    expect(btn.classList.contains('cd-button-with-icon-only')).toBe(false);
  });

  it('ariaLabel 可选：不提供时不设置 aria-label、无告警', () => {
    const { container } = render(IconButton, { props: { icon } });
    const btn = container.querySelector('button')!;
    expect(btn.hasAttribute('aria-label')).toBe(false);
  });

  it('转发 type / theme / size 到内部 Button', () => {
    const { container } = render(IconButton, {
      props: { icon, ariaLabel: 'x', type: 'danger', theme: 'solid', size: 'large' },
    });
    const btn = container.querySelector('button')!;
    expect(btn.classList.contains('cd-button-danger')).toBe(true);
    expect(btn.classList.contains('cd-button-solid')).toBe(true);
    expect(btn.classList.contains('cd-button-size-large')).toBe(true);
  });

  it('circle 加 cd-button-circle class', () => {
    const { container } = render(IconButton, { props: { icon, ariaLabel: 'x', circle: true } });
    const btn = container.querySelector('button')!;
    expect(btn.classList.contains('cd-button-circle')).toBe(true);
  });

  it('loading 时 aria-busy=true 且带 spin 图标', () => {
    const { container } = render(IconButton, { props: { icon, ariaLabel: 'x', loading: true } });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.classList.contains('cd-button-loading')).toBe(true);
    expect(container.querySelector('.cd-button-loading-spin')).not.toBeNull();
  });

  it('转发 class / style / disabled', () => {
    const { container } = render(IconButton, {
      props: { icon, ariaLabel: 'x', class: 'my-cls', style: 'opacity: 0.3', disabled: true },
    });
    const btn = container.querySelector('button')!;
    expect(btn.classList.contains('my-cls')).toBe(true);
    expect(btn.getAttribute('style')).toContain('opacity: 0.3');
    expect(btn.hasAttribute('disabled')).toBe(true);
  });
});
