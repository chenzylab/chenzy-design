// Divider a11y：纯展示分隔符 role=separator；vertical 含 aria-orientation。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Divider from './Divider.svelte';

describe('Divider a11y', () => {
  it('horizontal：role=separator，无 axe violations', async () => {
    const { container } = renderWithLocale(Divider, {});
    const root = container.querySelector('.cd-divider');
    expect(root?.getAttribute('role')).toBe('separator');
    await expectNoAxeViolations(container);
  });

  it('vertical：role=separator + aria-orientation=vertical，无 axe violations', async () => {
    const { container } = renderWithLocale(Divider, {
      props: { layout: 'vertical' },
    });
    const root = container.querySelector('.cd-divider');
    expect(root?.getAttribute('role')).toBe('separator');
    expect(root?.getAttribute('aria-orientation')).toBe('vertical');
    await expectNoAxeViolations(container);
  });
});
