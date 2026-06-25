// Spin a11y：role=status + aria-live=polite 公布加载。
// 经 SpinA11yFixture（不注入 children，使 inline 形态生效；harness 会恒注入空 children → wrapper）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import SpinA11yFixture from './SpinA11yFixture.svelte';

describe('Spin a11y', () => {
  it('inline：role=status + aria-live + aria-label（来自 locale），无 axe violations', async () => {
    const { container } = render(SpinA11yFixture, {
      props: { props: { spinning: true } },
    });
    const root = container.querySelector('.cd-spin');
    expect(root?.getAttribute('role')).toBe('status');
    expect(root?.getAttribute('aria-live')).toBe('polite');
    // 无 tip 时取 locale 的 Spin.loading 作为可访问名。
    expect(root?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('inline + tip：tip 文本作为可访问名，无 axe violations', async () => {
    const { container } = render(SpinA11yFixture, {
      props: { props: { spinning: true, tip: 'Loading data' } },
    });
    const tip = container.querySelector('.cd-spin__tip');
    expect(tip?.textContent).toContain('Loading data');
    await expectNoAxeViolations(container);
  });
});
