// Tooltip a11y：浮层 role=tooltip，触发器 aria-describedby 关联浮层（打开时）。
// 浮层经 use:floating portal 到 document.body —— 参照 Modal.a11y.test.ts 全局查询。
// jsdom 触发不了真实 hover/focus，故用受控 open + trigger='custom' 强制打开再断言静态 ARIA。
// 经 TooltipA11yFixture 提供真实触发按钮 children（自带 LocaleProvider，故直接 render）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './TooltipA11yFixture.svelte';

describe('Tooltip a11y', () => {
  it('收起：仅触发器可见，无浮层，无 axe violations', async () => {
    const { container } = render(Fixture, { props: { open: false } });
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('open=true：浮层 role=tooltip + 触发器 aria-describedby 指向浮层，无 axe violations', async () => {
    render(Fixture, { props: { open: true, content: 'Helpful hint' } });

    const tip = document.querySelector('[role="tooltip"]') as HTMLElement | null;
    expect(tip).not.toBeNull();
    expect(tip?.textContent).toContain('Helpful hint');

    const trigger = document.querySelector('.cd-tooltip__trigger') as HTMLElement | null;
    const describedby = trigger?.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    expect(describedby).toBe(tip?.id);

    await expectNoAxeViolations(document.body);
  });

  it('status=error：语义图标有 role=img + 可访问名（locale），无 axe violations', async () => {
    render(Fixture, { props: { open: true, content: 'Invalid', status: 'error' } });

    const statusIcon = document.querySelector('.cd-tooltip__status') as HTMLElement | null;
    expect(statusIcon?.getAttribute('role')).toBe('img');
    expect(statusIcon?.getAttribute('aria-label')).toBeTruthy();

    await expectNoAxeViolations(document.body);
  });
});
