// Divider 渲染 + a11y 断言：纯展示分隔线，对齐 Semi divider.test.js 的用例矩阵。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import Divider from './Divider.svelte';
import DividerContentFixture from './DividerContentFixture.svelte';

describe('Divider 渲染（对齐 Semi）', () => {
  it('默认渲染 cd-divider cd-divider-horizontal，根为纯 div 无 role', () => {
    const { container } = render(Divider, {});
    const root = container.querySelector('.cd-divider') as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.tagName.toLowerCase()).toBe('div');
    expect(root.classList.contains('cd-divider-horizontal')).toBe(true);
    expect(root.hasAttribute('role')).toBe(false);
  });

  it('class/style 透传到根元素', () => {
    const { container } = render(Divider, {
      props: { class: 'test', style: 'color:red;' },
    });
    const root = container.querySelector('.cd-divider.test') as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.style.color).toBe('red');
  });

  it('layout="vertical" 渲染 cd-divider-vertical，无 cd-divider-horizontal', () => {
    const { container } = render(Divider, { props: { layout: 'vertical' } });
    const root = container.querySelector('.cd-divider') as HTMLElement;
    expect(root.classList.contains('cd-divider-vertical')).toBe(true);
    expect(root.classList.contains('cd-divider-horizontal')).toBe(false);
  });

  it('dashed 切换 cd-divider-dashed', () => {
    const { container } = render(Divider, { props: { dashed: true } });
    expect(container.querySelector('.cd-divider.cd-divider-dashed')).not.toBeNull();
  });

  it('无 children 时不渲染 cd-divider_inner-text / cd-divider-with-text', () => {
    const { container } = render(Divider, {});
    expect(container.querySelector('.cd-divider_inner-text')).toBeNull();
    expect(container.querySelector('.cd-divider-with-text')).toBeNull();
  });

  it('有 children 时渲染 cd-divider_inner-text 与 cd-divider-with-text，文本正确', () => {
    const { container } = render(DividerContentFixture, {});
    const text = container.querySelector('.cd-divider_inner-text');
    expect(text).not.toBeNull();
    expect(text?.textContent).toBe('divider title');
    expect(container.querySelector('.cd-divider-with-text')).not.toBeNull();
  });

  it('layout="vertical" 时忽略 children，不渲染文字段', () => {
    const { container } = render(DividerContentFixture, { props: { layout: 'vertical' } });
    expect(container.querySelector('.cd-divider_inner-text')).toBeNull();
  });

  it('align 三值分别映射 cd-divider-with-text-left|center|right', () => {
    const left = render(DividerContentFixture, { props: { align: 'left' } });
    const center = render(DividerContentFixture, { props: {} });
    const right = render(DividerContentFixture, { props: { align: 'right' } });
    expect(left.container.querySelector('.cd-divider-with-text-left')).not.toBeNull();
    expect(center.container.querySelector('.cd-divider-with-text-center')).not.toBeNull();
    expect(right.container.querySelector('.cd-divider-with-text-right')).not.toBeNull();
  });

  it('margin：number 转 px 写入 style，layout=vertical 作用于左右', () => {
    const { container } = render(Divider, {
      props: { layout: 'vertical', margin: 12 },
    });
    const root = container.querySelector('.cd-divider') as HTMLElement;
    expect(root.style.marginLeft).toBe('12px');
    expect(root.style.marginRight).toBe('12px');
  });

  it('margin：layout=horizontal 作用于上下', () => {
    const { container } = render(Divider, { props: { margin: '12px' } });
    const root = container.querySelector('.cd-divider') as HTMLElement;
    expect(root.style.marginTop).toBe('12px');
    expect(root.style.marginBottom).toBe('12px');
  });
});

describe('Divider a11y', () => {
  it('纯线（无 children）零 axe violations', async () => {
    const { container } = render(Divider, {});
    await expectNoAxeViolations(container);
  });

  it('vertical 零 axe violations', async () => {
    const { container } = render(Divider, { props: { layout: 'vertical' } });
    await expectNoAxeViolations(container);
  });
});
