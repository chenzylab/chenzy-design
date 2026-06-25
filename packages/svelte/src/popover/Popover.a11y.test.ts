// Popover a11y：
//  - hover/focus 触发 → 浮层 role=tooltip，触发器 aria-describedby 关联浮层（span 上合法）。
//  - click/custom 触发 → 浮层 role=dialog，触发器 <span> 承载 role=button + aria-haspopup/expanded/controls。
// 浮层经 use:floating portal 到 document.body —— 参照 Modal.a11y.test.ts 全局查询。
// jsdom 触发不了真实 hover/click，故用受控 open 强制打开再断言静态 ARIA。
// PopoverA11yFixture 提供非交互触发文案 children（自带 LocaleProvider，故直接 render）。
//
// a11y 修复（原 axe [aria-allowed-attr] 已消除）：dialog 模式触发包裹 span 现承载
//   role=button + tabindex=0 + Enter/Space 激活（对齐 Dropdown），aria-haspopup/expanded/
//   controls 挂在合法 button 宿主上。tooltip 模式仍为纯 span + aria-describedby（合法）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './PopoverA11yFixture.svelte';

describe('Popover a11y', () => {
  it('hover 触发 + open：浮层 role=tooltip + 触发器 aria-describedby 指向浮层，无 axe violations', async () => {
    render(Fixture, { props: { open: true, content: 'Quick hint', trigger: 'hover' } });

    const pop = document.querySelector('.cd-popover__pop') as HTMLElement | null;
    expect(pop?.getAttribute('role')).toBe('tooltip');

    const trigger = document.querySelector('.cd-popover__trigger') as HTMLElement | null;
    const describedby = trigger?.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    expect(describedby).toBe(pop?.id);

    await expectNoAxeViolations(document.body);
  });

  it('hover 触发 + 收起：无浮层，无 axe violations', async () => {
    const { container } = render(Fixture, { props: { open: false, trigger: 'hover' } });
    expect(document.querySelector('.cd-popover__pop[role="tooltip"]')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('open + title：role=dialog / aria-modal=false / aria-labelledby（触发器 role=button 修复后）', async () => {
    render(Fixture, { props: { open: true, title: 'Confirm', content: 'Are you sure?', trigger: 'click' } });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog?.getAttribute('aria-modal')).toBe('false');
    const labelledby = dialog?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    expect(labelledby ? document.getElementById(labelledby)?.textContent : '').toContain('Confirm');

    await expectNoAxeViolations(document.body);
  });

  it('open 无 title：role=dialog 用 aria-label 兜底（触发器 role=button 修复后）', async () => {
    render(Fixture, { props: { open: true, content: 'No title here', trigger: 'click' } });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog?.getAttribute('aria-labelledby')).toBeNull();
    expect(dialog?.getAttribute('aria-label')).toBeTruthy();

    await expectNoAxeViolations(document.body);
  });
});
