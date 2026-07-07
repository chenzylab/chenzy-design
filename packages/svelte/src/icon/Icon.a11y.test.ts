// Icon a11y：默认装饰性(aria-hidden，无 role)；提供 label 后 role=img + aria-label。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Icon from './Icon.svelte';

const SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>';

describe('Icon a11y', () => {
  it('默认装饰性：aria-hidden=true、无 role/aria-label，无 axe violations', async () => {
    const { container } = renderWithLocale(Icon, { props: { svg: SVG } });
    const root = container.querySelector('.cd-icon');
    expect(root?.getAttribute('aria-hidden')).toBe('true');
    expect(root?.getAttribute('role')).toBeNull();
    expect(root?.getAttribute('aria-label')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('提供 label：role=img + aria-label，且不再 aria-hidden，无 axe violations', async () => {
    const { container } = renderWithLocale(Icon, {
      props: { svg: SVG, label: '首页' },
    });
    const root = container.querySelector('.cd-icon');
    expect(root?.getAttribute('role')).toBe('img');
    expect(root?.getAttribute('aria-label')).toBe('首页');
    expect(root?.getAttribute('aria-hidden')).toBeNull();
    await expectNoAxeViolations(container);
  });
});
