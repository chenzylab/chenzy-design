// Space a11y + 渲染断言：间距 flex 容器。纯布局容器，不引入语义角色。
// axe 0 violations（透明保留子元素语义）+ 锁定 spacing/vertical/wrap/block/tag 映射。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import SpaceFixture from './SpaceA11yFixture.svelte';
import Space from './Space.svelte';

describe('Space a11y', () => {
  it('horizontal：纯布局无语义角色，子元素语义透明保留，无 axe violations', async () => {
    const { container } = renderWithLocale(SpaceFixture, {});
    expect(container.querySelector('.cd-space')).not.toBeNull();
    expect(container.querySelectorAll('button').length).toBe(2);
    await expectNoAxeViolations(container);
  });

  it('vertical：方向切换不引入语义变化，无 axe violations', async () => {
    const { container } = renderWithLocale(SpaceFixture, {
      props: { vertical: true },
    });
    expect(container.querySelector('.cd-space--vertical')).not.toBeNull();
    await expectNoAxeViolations(container);
  });
});

describe('Space 渲染映射', () => {
  const root = (c: HTMLElement) => c.querySelector('.cd-space') as HTMLElement;
  // jsdom 会把内联 style 规范化（分号/冒号后补空格），断言前统一去空格。
  const style = (c: HTMLElement) => (root(c).getAttribute('style') ?? '').replace(/\s/g, '');

  it('默认：horizontal + inline-flex，align 默认 center，spacing 默认 tight', () => {
    const { container } = render(Space, {});
    const el = root(container);
    expect(el.classList.contains('cd-space--horizontal')).toBe(true);
    expect(el.classList.contains('cd-space--vertical')).toBe(false);
    expect(style(container)).toContain('gap:var(--cd-space-tight)');
    expect(style(container)).toContain('align-items:center');
  });

  it('spacing 档位映射对应 token 变量', () => {
    const { container } = render(Space, { props: { spacing: 'loose' } });
    expect(style(container)).toContain('gap:var(--cd-space-loose)');
  });

  it('spacing=number → px', () => {
    const { container } = render(Space, { props: { spacing: 20 } });
    expect(style(container)).toContain('gap:20px');
  });

  it('spacing=[水平,垂直] → column-gap 取 [0]、row-gap 取 [1]（方向不反）', () => {
    const { container } = render(Space, { props: { spacing: [8, 24] } });
    expect(style(container)).toContain('column-gap:8px');
    expect(style(container)).toContain('row-gap:24px');
  });

  it('align=start/end → flex-start/flex-end', () => {
    const { container } = render(Space, { props: { align: 'start' } });
    expect(style(container)).toContain('align-items:flex-start');
  });

  it('wrap → cd-space--wrap；vertical 时强制不换行', () => {
    const { container: c1 } = render(Space, { props: { wrap: true } });
    expect(root(c1).classList.contains('cd-space--wrap')).toBe(true);
    const { container: c2 } = render(Space, { props: { wrap: true, vertical: true } });
    expect(root(c2).classList.contains('cd-space--wrap')).toBe(false);
  });

  it('block → cd-space--block', () => {
    const { container } = render(Space, { props: { block: true } });
    expect(root(container).classList.contains('cd-space--block')).toBe(true);
  });

  it('tag → 自定义根元素标签', () => {
    const { container } = render(Space, { props: { tag: 'nav' } });
    expect(root(container).tagName.toLowerCase()).toBe('nav');
  });

  it('style 透传拼接在生成样式之后', () => {
    const { container } = render(Space, { props: { style: 'color:red' } });
    expect(style(container)).toContain('color:red');
  });
});
