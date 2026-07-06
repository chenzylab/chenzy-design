// IconButton 组件测：转发 Button props、不传 children、circle class、loading、缺 ariaLabel warn。
// 放在 *.a11y.test.ts 命名下以进入 dom(jsdom) project（见根 vitest.config）。
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from '@testing-library/svelte';
import IconButton from './IconButton.svelte';

const icon = createRawSnippet(() => ({ render: () => '<svg data-testid="ic"></svg>' }));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('IconButton', () => {
  it('渲染原生 <button>，带 aria-label，且为 icon-only（方形）', () => {
    const { container } = render(IconButton, { props: { icon, ariaLabel: '编辑' } });
    const btn = container.querySelector('button')!;
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-label')).toBe('编辑');
    expect(btn.classList.contains('cd-button--icon-only')).toBe(true);
  });

  it('不渲染文字内容（不传 children），仅有图标', () => {
    const { container } = render(IconButton, { props: { icon, ariaLabel: 'x' } });
    const btn = container.querySelector('button')!;
    // 仅图标 span，无文本节点
    expect(container.querySelector('[data-testid="ic"]')).not.toBeNull();
    expect(btn.textContent?.trim()).toBe('');
  });

  it('转发 type / theme / size 到内部 Button', () => {
    const { container } = render(IconButton, {
      props: { icon, ariaLabel: 'x', type: 'danger', theme: 'solid', size: 'large' },
    });
    const btn = container.querySelector('button')!;
    expect(btn.classList.contains('cd-button--danger')).toBe(true);
    expect(btn.classList.contains('cd-button--solid')).toBe(true);
    expect(btn.classList.contains('cd-button--large')).toBe(true);
  });

  it('circle 加 cd-button--circle class', () => {
    const { container } = render(IconButton, { props: { icon, ariaLabel: 'x', circle: true } });
    const btn = container.querySelector('button')!;
    expect(btn.classList.contains('cd-button--circle')).toBe(true);
  });

  it('loading 时 aria-busy=true 且带 spin 图标', () => {
    const { container } = render(IconButton, { props: { icon, ariaLabel: 'x', loading: true } });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(container.querySelector('.cd-button__icon--spin')).not.toBeNull();
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

  it('缺失 ariaLabel（空串）在 dev 下 console.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(IconButton, { props: { icon, ariaLabel: '' } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ariaLabel'));
  });

  it('提供 ariaLabel 时不告警', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(IconButton, { props: { icon, ariaLabel: '编辑' } });
    expect(warn).not.toHaveBeenCalled();
  });
});
