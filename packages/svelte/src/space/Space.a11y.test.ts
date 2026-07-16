// Space a11y + 渲染断言：间距 flex 容器。纯布局容器，不引入语义角色（对齐 Semi）。
// axe 0 violations（透明保留子元素语义）+ 锁定 gap/align 的 class 驱动映射与 number/array inline gap。
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
    expect(container.querySelector('.cd-space-vertical')).not.toBeNull();
    await expectNoAxeViolations(container);
  });
});

describe('Space 渲染映射（class 驱动，对齐 Semi）', () => {
  const root = (c: HTMLElement) => c.querySelector('.cd-space') as HTMLElement;
  const classes = (c: HTMLElement) => root(c).classList;
  // jsdom 会把内联 style 规范化（分号/冒号后补空格），断言前统一去空格。
  const style = (c: HTMLElement) => (root(c).getAttribute('style') ?? '').replace(/\s/g, '');

  it('根恒 div', () => {
    const { container } = render(Space, {});
    expect(root(container).tagName.toLowerCase()).toBe('div');
  });

  it('默认：horizontal + align-center + tight 档 class（无 inline gap）', () => {
    const { container } = render(Space, {});
    const cl = classes(container);
    expect(cl.contains('cd-space-horizontal')).toBe(true);
    expect(cl.contains('cd-space-vertical')).toBe(false);
    expect(cl.contains('cd-space-align-center')).toBe(true);
    expect(cl.contains('cd-space-tight-horizontal')).toBe(true);
    expect(cl.contains('cd-space-tight-vertical')).toBe(true);
    // 档位走 class，不写 inline gap
    expect(root(container).getAttribute('style')).toBeNull();
  });

  it('spacing 档位 → 对应 -horizontal/-vertical class', () => {
    const { container } = render(Space, { props: { spacing: 'loose' } });
    const cl = classes(container);
    expect(cl.contains('cd-space-loose-horizontal')).toBe(true);
    expect(cl.contains('cd-space-loose-vertical')).toBe(true);
  });

  it('spacing=number → inline column-gap/row-gap（px），无档位 class', () => {
    const { container } = render(Space, { props: { spacing: 20 } });
    expect(style(container)).toContain('column-gap:20px');
    expect(style(container)).toContain('row-gap:20px');
    expect(classes(container).contains('cd-space-tight-horizontal')).toBe(false);
  });

  it('spacing=[水平,垂直] → column-gap 取 [0]、row-gap 取 [1]（方向不反）', () => {
    const { container } = render(Space, { props: { spacing: [8, 24] } });
    expect(style(container)).toContain('column-gap:8px');
    expect(style(container)).toContain('row-gap:24px');
  });

  it('spacing=[档位, number] → 档位走 class、number 走 inline', () => {
    const { container } = render(Space, { props: { spacing: ['medium', 24] } });
    expect(classes(container).contains('cd-space-medium-horizontal')).toBe(true);
    expect(classes(container).contains('cd-space-medium-vertical')).toBe(false);
    expect(style(container)).toContain('row-gap:24px');
  });

  it('align=start/end/baseline → 对应 align class', () => {
    const { container: c1 } = render(Space, { props: { align: 'start' } });
    expect(classes(c1).contains('cd-space-align-start')).toBe(true);
    const { container: c2 } = render(Space, { props: { align: 'baseline' } });
    expect(classes(c2).contains('cd-space-align-baseline')).toBe(true);
  });

  it('wrap → cd-space-wrap；vertical 时强制不换行', () => {
    const { container: c1 } = render(Space, { props: { wrap: true } });
    expect(classes(c1).contains('cd-space-wrap')).toBe(true);
    const { container: c2 } = render(Space, { props: { wrap: true, vertical: true } });
    expect(classes(c2).contains('cd-space-wrap')).toBe(false);
  });

  it('style 透传拼接在生成样式之后', () => {
    const { container } = render(Space, { props: { spacing: 8, style: 'color:red' } });
    expect(style(container)).toContain('color:red');
  });

  it('...rest 透传 data-*/aria-* 到根 div', () => {
    const { container } = render(Space, {
      props: { 'data-testid': 'sp', 'aria-label': '组' },
    });
    const el = root(container);
    expect(el.getAttribute('data-testid')).toBe('sp');
    expect(el.getAttribute('aria-label')).toBe('组');
  });
});
