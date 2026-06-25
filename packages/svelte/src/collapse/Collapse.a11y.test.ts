// Collapse a11y：折叠面板（APG Accordion）。
// Header 外层 role=heading + aria-level；触发器为原生 button + aria-expanded；
// button aria-controls 指向内容 region，region aria-labelledby 指回 header。
// 用数据驱动夹具（CollapseA11yFixture）渲染真实 region，使 aria-controls 不悬空。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import CollapseFixture from './CollapseA11yFixture.svelte';

describe('Collapse a11y', () => {
  it('默认渲染：role=heading + button aria-expanded + region 关联，无 axe violations', async () => {
    const { container } = renderWithLocale(CollapseFixture, {});

    // 每个 panel 的 Header 外层为 role=heading + aria-level。
    const headings = container.querySelectorAll('[role="heading"]');
    expect(headings.length).toBe(3);
    expect(headings[0]?.getAttribute('aria-level')).toBe('3');

    // 触发器为原生 button，aria-expanded 标记展开态（默认全收起）。
    const headerBtns = container.querySelectorAll('button.cd-collapse__header');
    expect(headerBtns.length).toBe(3);
    expect(headerBtns[0]?.getAttribute('aria-expanded')).toBe('false');

    // aria-controls 指向真实存在的 region，region aria-labelledby 指回 header。
    const controls = headerBtns[0]?.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const region = controls ? container.ownerDocument.getElementById(controls!) : null;
    expect(region?.getAttribute('role')).toBe('region');
    expect(region?.getAttribute('aria-labelledby')).toBe(headerBtns[0]?.id);

    await expectNoAxeViolations(container);
  });

  it('defaultActiveKey 展开：对应 header aria-expanded=true，region 非 hidden', async () => {
    const { container } = renderWithLocale(CollapseFixture, {
      props: { defaultActiveKey: 'a' },
    });
    const headerBtns = container.querySelectorAll('button.cd-collapse__header');
    expect(headerBtns[0]?.getAttribute('aria-expanded')).toBe('true');
    const controls = headerBtns[0]?.getAttribute('aria-controls');
    const region = controls ? container.ownerDocument.getElementById(controls!) : null;
    expect(region?.hasAttribute('hidden')).toBe(false);
    await expectNoAxeViolations(container);
  });

  it('roving tabindex：仅一个 Header 为 Tab 停靠点（tabindex=0），其余 -1', async () => {
    const { container } = renderWithLocale(CollapseFixture, {});
    const headerBtns = [...container.querySelectorAll('button.cd-collapse__header')];
    const zero = headerBtns.filter((b) => b.getAttribute('tabindex') === '0');
    // 首个未禁用 Header 为停靠点；禁用项（第三个）从 roving 中排除。
    expect(zero.length).toBe(1);
    await expectNoAxeViolations(container);
  });
});
