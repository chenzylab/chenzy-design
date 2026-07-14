// SplitTagGroup a11y：组容器 role=group + aria-label（ariaLabel prop）；子 Tag 连接渲染；无 axe violations。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import SplitTagGroupA11yFixture from './SplitTagGroupA11yFixture.svelte';

describe('SplitTagGroup a11y', () => {
  it('组容器 role=group + aria-label，子 Tag 连接渲染，无 axe violations', async () => {
    const { container } = render(SplitTagGroupA11yFixture, {
      props: { ariaLabel: 'Task status' },
    });
    const group = container.querySelector('.cd-tag-split');
    expect(group?.getAttribute('role')).toBe('group');
    expect(group?.getAttribute('aria-label')).toBe('Task status');
    expect(container.querySelectorAll('.cd-tag').length).toBe(3);
    await expectNoAxeViolations(container);
  });
});
