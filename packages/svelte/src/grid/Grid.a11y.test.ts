// Grid a11y：Row + Col 24 栅格。纯布局容器，不引入语义角色。
// 仅断言 axe 0 violations（无特殊 ARIA）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import GridFixture from './GridA11yFixture.svelte';

describe('Grid a11y', () => {
  it('Row + Col：纯布局无语义角色，无 axe violations', async () => {
    const { container } = renderWithLocale(GridFixture, {});
    expect(container.querySelector('.cd-row')).not.toBeNull();
    expect(container.querySelectorAll('.cd-col').length).toBe(2);
    await expectNoAxeViolations(container);
  });
});
