// Progress a11y：role=progressbar + aria-valuenow/min/max；indeterminate 省略 valuenow 并设 aria-busy。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Progress from './Progress.svelte';

describe('Progress a11y', () => {
  it('line：role=progressbar + aria-valuenow，无 axe violations', async () => {
    const { container } = renderWithLocale(Progress, {
      props: { percent: 42, ariaLabel: 'Upload progress' },
    });
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute('aria-valuenow')).toBe('42');
    expect(bar?.getAttribute('aria-valuemin')).toBe('0');
    expect(bar?.getAttribute('aria-valuemax')).toBe('100');
    await expectNoAxeViolations(container);
  });

  it('circle：role=progressbar，无 axe violations', async () => {
    const { container } = renderWithLocale(Progress, {
      props: { type: 'circle', percent: 70, ariaLabel: 'Task' },
    });
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-valuenow')).toBe('70');
    await expectNoAxeViolations(container);
  });

  it('indeterminate：省略 aria-valuenow 并设 aria-busy，无 axe violations', async () => {
    const { container } = renderWithLocale(Progress, {
      props: { indeterminate: true, ariaLabel: 'Loading' },
    });
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-valuenow')).toBeNull();
    expect(bar?.getAttribute('aria-busy')).toBe('true');
    await expectNoAxeViolations(container);
  });
});
