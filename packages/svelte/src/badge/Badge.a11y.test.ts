// Badge a11y：对齐 Semi。count/dot 徽标为纯展示 span；独立使用（无 children）走 block 形态。
// 经 BadgeA11yFixture（不注入 children，使 block 形态生效；harness 会恒注入空 children）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import BadgeA11yFixture from './BadgeA11yFixture.svelte';

describe('Badge a11y', () => {
  it('独立使用 count：block 形态渲染计数文本，无 axe violations', async () => {
    const { container } = render(BadgeA11yFixture, {
      props: { props: { count: 5 } },
    });
    const wrapper = container.querySelector('.cd-badge-count');
    expect(wrapper?.classList.contains('cd-badge-block')).toBe(true);
    expect(wrapper?.textContent?.trim()).toBe('5');
    await expectNoAxeViolations(container);
  });

  it('overflow：超出 overflowCount 显示 99+，无 axe violations', async () => {
    const { container } = render(BadgeA11yFixture, {
      props: { props: { count: 200, overflowCount: 99 } },
    });
    const wrapper = container.querySelector('.cd-badge-count');
    expect(wrapper?.textContent?.trim()).toBe('99+');
    await expectNoAxeViolations(container);
  });

  it('dot：仅渲染圆点、无文本，无 axe violations', async () => {
    const { container } = render(BadgeA11yFixture, {
      props: { props: { dot: true } },
    });
    const dot = container.querySelector('.cd-badge-dot');
    expect(dot).not.toBeNull();
    expect(dot?.textContent?.trim()).toBe('');
    await expectNoAxeViolations(container);
  });
});
