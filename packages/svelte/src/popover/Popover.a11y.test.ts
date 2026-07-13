// Popover a11y（封装 Tooltip 架构）：
//  - hover/focus 触发 → 浮层 role=tooltip，触发器 aria-describedby 关联浮层（span 上合法）。
//  - click/custom 触发 → 浮层 role=dialog，触发器 <span> 承载 role=button + aria-haspopup/expanded/controls。
// Popover 复用 Tooltip 浮层：DOM 为 .cd-tooltip__pop.cd-popover-host（承 role/aria），
//   内含 .cd-popover 卡片；触发器为 .cd-tooltip__trigger。
// 浮层经 use:floating portal 到 document.body。jsdom 触发不了真实 hover/click，故用受控 visible
//   强制打开再断言静态 ARIA。PopoverA11yFixture 提供非交互触发文案 children。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './PopoverA11yFixture.svelte';

describe('Popover a11y', () => {
  it('hover 触发 + open：浮层 role=tooltip + 触发器 aria-describedby 指向浮层，无 axe violations', async () => {
    render(Fixture, { props: { visible: true, content: 'Quick hint', trigger: 'hover' } });

    const pop = document.querySelector('.cd-tooltip__pop') as HTMLElement | null;
    expect(pop?.getAttribute('role')).toBe('tooltip');

    const trigger = document.querySelector('.cd-tooltip__trigger') as HTMLElement | null;
    const describedby = trigger?.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    expect(describedby).toBe(pop?.id);

    await expectNoAxeViolations(document.body);
  });

  it('hover 触发 + 收起：无浮层，无 axe violations', async () => {
    const { container } = render(Fixture, { props: { visible: false, trigger: 'hover' } });
    expect(document.querySelector('.cd-tooltip__pop[role="tooltip"]')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('open + title：role=dialog / aria-modal=false / aria-labelledby（触发器 role=button）', async () => {
    render(Fixture, { props: { visible: true, title: 'Confirm', content: 'Are you sure?', trigger: 'click' } });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog?.getAttribute('aria-modal')).toBe('false');
    const labelledby = dialog?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    expect(labelledby ? document.getElementById(labelledby)?.textContent : '').toContain('Confirm');

    await expectNoAxeViolations(document.body);
  });

  it('open 无 title：role=dialog 用 aria-label 兜底（触发器 role=button）', async () => {
    render(Fixture, { props: { visible: true, content: 'No title here', trigger: 'click' } });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog?.getAttribute('aria-labelledby')).toBeNull();
    expect(dialog?.getAttribute('aria-label')).toBeTruthy();

    await expectNoAxeViolations(document.body);
  });
});
