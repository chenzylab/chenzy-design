// Spin a11y：loading 时 .cd-spin-wrapper 使用 role=status + aria-live=polite 公布加载。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import SpinA11yFixture from './SpinA11yFixture.svelte';

describe('Spin a11y', () => {
  it('role=status + aria-live + aria-label（来自 locale），无 axe violations', async () => {
    const { container } = render(SpinA11yFixture, {
      props: { props: { spinning: true } },
    });
    const wrapper = container.querySelector('.cd-spin-wrapper');
    expect(wrapper?.getAttribute('role')).toBe('status');
    expect(wrapper?.getAttribute('aria-live')).toBe('polite');
    // 无 tip 时取 locale 的 Spin.loading 作为可访问名。
    expect(wrapper?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('带 tip：tip 文本渲染于 wrapper 内，无 axe violations', async () => {
    const { container } = render(SpinA11yFixture, {
      props: { props: { spinning: true, tip: 'Loading data' } },
    });
    const wrapper = container.querySelector('.cd-spin-wrapper');
    expect(wrapper?.textContent).toContain('Loading data');
    await expectNoAxeViolations(container);
  });
});
