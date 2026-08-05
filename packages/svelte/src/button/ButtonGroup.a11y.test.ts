// ButtonGroup 分隔线（对齐 Semi getInnerWithLine 两层结构）：非末尾且非 outline 主题的
// 子按钮之后插入 .cd-button-group-line，theme=outline 时不插；混用 theme 时按每个按钮自身判定。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ButtonGroupLineFixture from './ButtonGroupLineFixture.svelte';

describe('ButtonGroup 分隔线', () => {
  it('3 个 light 主题子按钮 → 2 条分隔线（末尾不画），class 含 type/theme', () => {
    const { container } = render(ButtonGroupLineFixture, {
      props: { themes: ['light', 'light', 'light'] },
    });
    const lines = container.querySelectorAll('.cd-button-group-line');
    expect(lines.length).toBe(2);
    lines.forEach((line) => {
      expect(line.classList.contains('cd-button-group-line-primary')).toBe(true);
      expect(line.classList.contains('cd-button-group-line-light')).toBe(true);
    });
  });

  it('中间按钮 theme=outline → 该按钮后不画线（混用 theme 按自身判定）', () => {
    const { container } = render(ButtonGroupLineFixture, {
      props: { themes: ['light', 'outline', 'light'] },
    });
    const lines = container.querySelectorAll('.cd-button-group-line');
    // A(light)→B(outline)：A 后画线；B(outline)→C：B 后不画线。共 1 条。
    expect(lines.length).toBe(1);
  });

  it('全部 outline → 0 条分隔线', () => {
    const { container } = render(ButtonGroupLineFixture, {
      props: { themes: ['outline', 'outline', 'outline'] },
    });
    expect(container.querySelectorAll('.cd-button-group-line').length).toBe(0);
  });

  it('分隔线元素 aria-hidden，不进入可访问树', () => {
    const { container } = render(ButtonGroupLineFixture, {
      props: { themes: ['light', 'light', 'light'] },
    });
    container.querySelectorAll('.cd-button-group-line').forEach((line) => {
      expect(line.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
