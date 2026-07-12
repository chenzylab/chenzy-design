// Collapse a11y：折叠面板（DOM 对齐 Semi collapse）。
// Header 触发器为 role=button + tabindex=0 + aria-expanded + aria-owns（指向 content id）；
// content 容器 id 与 aria-owns 一致、aria-hidden 随展开态切换；disabled 面板 aria-disabled=true。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import CollapseFixture from './CollapseA11yFixture.svelte';

describe('Collapse a11y', () => {
  it('默认渲染：role=button + tabindex=0 + aria-expanded=false，无 axe violations', async () => {
    const { container } = renderWithLocale(CollapseFixture, {});

    // 每个 panel 的 Header 为 role=button（对齐 Semi，非原生 button/heading 包裹）。
    const headers = [...container.querySelectorAll<HTMLElement>('.cd-collapse-header')];
    expect(headers.length).toBe(3);
    expect(headers[0]?.getAttribute('role')).toBe('button');
    expect(headers[0]?.getAttribute('tabindex')).toBe('0');
    expect(headers[0]?.getAttribute('aria-expanded')).toBe('false');
    // aria-owns 存在（对齐 Semi；默认收起且 keepDOM=false 时 content 不挂载，展开后由 id 匹配）。
    expect(headers[0]?.getAttribute('aria-owns')).toBeTruthy();

    await expectNoAxeViolations(container);
  });

  it('defaultActiveKey 展开：对应 header aria-expanded=true，content aria-hidden=false', async () => {
    const { container } = renderWithLocale(CollapseFixture, { props: { defaultActiveKey: 'a' } });

    const headers = [...container.querySelectorAll<HTMLElement>('.cd-collapse-header')];
    expect(headers[0]?.getAttribute('aria-expanded')).toBe('true');
    const owns = headers[0]?.getAttribute('aria-owns');
    const content = container.querySelector(`#${owns}`);
    expect(content?.getAttribute('aria-hidden')).toBe('false');
    await expectNoAxeViolations(container);
  });

  it('disabled 面板：header aria-disabled=true 且带 -disabled 类', async () => {
    const { container } = renderWithLocale(CollapseFixture, {});
    const headers = [...container.querySelectorAll<HTMLElement>('.cd-collapse-header')];
    // 夹具第三个面板 disabled。
    const last = headers[2];
    expect(last?.getAttribute('aria-disabled')).toBe('true');
    expect(last?.classList.contains('cd-collapse-header-disabled')).toBe(true);
    await expectNoAxeViolations(container);
  });
});
