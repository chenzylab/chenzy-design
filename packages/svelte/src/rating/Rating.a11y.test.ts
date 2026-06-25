// Rating a11y：APG slider 模式（role=slider + aria-valuenow/min/max/valuetext）。
// 可访问名走 i18n（Rating.ariaLabel）；error 态 aria-invalid。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Rating from './Rating.svelte';

describe('Rating a11y', () => {
  it('默认渲染：role=slider + aria-valuenow/min/max，locale 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(Rating, { props: { defaultValue: 3 } });
    const slider = container.querySelector('[role="slider"]');
    expect(slider).not.toBeNull();
    expect(slider?.getAttribute('aria-valuenow')).toBe('3');
    expect(slider?.getAttribute('aria-valuemin')).toBe('0');
    expect(slider?.getAttribute('aria-valuemax')).toBe('5');
    // 可访问名来自 en_US locale（Rating.ariaLabel），非 key 原样。
    const label = slider?.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('Rating.ariaLabel');
    expect(slider?.getAttribute('aria-valuetext')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('自定义 ariaLabel + error：aria-label / aria-invalid', async () => {
    const { container } = renderWithLocale(Rating, {
      props: { defaultValue: 2, ariaLabel: 'Difficulty', status: 'error' },
    });
    const slider = container.querySelector('[role="slider"]');
    expect(slider?.getAttribute('aria-label')).toBe('Difficulty');
    expect(slider?.getAttribute('aria-invalid')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('readonly：aria-readonly=true，无 axe violations', async () => {
    const { container } = renderWithLocale(Rating, {
      props: { defaultValue: 4, readonly: true },
    });
    const slider = container.querySelector('[role="slider"]');
    expect(slider?.getAttribute('aria-readonly')).toBe('true');
    await expectNoAxeViolations(container);
  });
});
