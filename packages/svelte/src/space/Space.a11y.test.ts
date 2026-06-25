// Space a11y：间距 flex 容器。纯布局容器，不引入语义角色。
// 仅断言 axe 0 violations（透明保留子元素语义）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import SpaceFixture from './SpaceA11yFixture.svelte';

describe('Space a11y', () => {
  it('horizontal：纯布局无语义角色，子元素语义透明保留，无 axe violations', async () => {
    const { container } = renderWithLocale(SpaceFixture, {});
    expect(container.querySelector('.cd-space')).not.toBeNull();
    expect(container.querySelectorAll('button').length).toBe(2);
    await expectNoAxeViolations(container);
  });

  it('vertical：方向切换不引入语义变化，无 axe violations', async () => {
    const { container } = renderWithLocale(SpaceFixture, {
      props: { direction: 'vertical' },
    });
    expect(container.querySelector('.cd-space--vertical')).not.toBeNull();
    await expectNoAxeViolations(container);
  });
});
