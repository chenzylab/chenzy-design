// Badge a11y：独立状态点 role=status；count 模式 <sup aria-label>。
// 经 BadgeA11yFixture（不注入 children，使 standalone 形态生效；harness 会恒注入空 children）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import BadgeA11yFixture from './BadgeA11yFixture.svelte';

describe('Badge a11y', () => {
  it('独立状态点：role=status，无 axe violations', async () => {
    const { container } = render(BadgeA11yFixture, {
      props: { props: { status: 'success', count: 'Online' } },
    });
    const root = container.querySelector('.cd-badge--status');
    expect(root?.getAttribute('role')).toBe('status');
    await expectNoAxeViolations(container);
  });

  it('count 角标：sup 带 aria-label（计数文本），无 axe violations', async () => {
    const { container } = render(BadgeA11yFixture, {
      props: { props: { count: 5 } },
    });
    const sup = container.querySelector('.cd-badge__sup');
    expect(sup?.getAttribute('aria-label')).toBe('5');
    await expectNoAxeViolations(container);
  });

  it('overflow 角标：超出 overflowCount 显示 99+，无 axe violations', async () => {
    const { container } = render(BadgeA11yFixture, {
      props: { props: { count: 200, overflowCount: 99 } },
    });
    const sup = container.querySelector('.cd-badge__sup');
    expect(sup?.getAttribute('aria-label')).toBe('99+');
    await expectNoAxeViolations(container);
  });
});
