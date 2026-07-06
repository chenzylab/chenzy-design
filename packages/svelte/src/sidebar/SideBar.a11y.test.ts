// SideBar 主壳 a11y（P1）：mode 路由 + Options 图标 tab 组。
// main：Options role=tablist + roving tabindex（激活项 tabindex=0，其余 -1）+ 每项 aria-label(name)；
// detail：返回按钮 i18n aria-label + renderDetailHeader/Content 渲染。
// jsdom 委托事件/焦点不完整（真实键盘 roving 留给 Playwright），这里做 role/aria 静态断言 + axe。
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './SideBarA11yFixture.svelte';

describe('SideBar a11y — main / Options', () => {
  it('mode=main：Options role=tablist，roving tabindex，每项 aria-label=name，无 axe violations', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { mode: 'main', activeKey: 'tools' },
    });
    const tablist = container.querySelector('[role="tablist"]') as HTMLElement | null;
    expect(tablist).not.toBeNull();
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(2);

    const active = tabs[0]!;
    const inactive = tabs[1]!;
    expect(active.getAttribute('aria-selected')).toBe('true');
    expect(active.getAttribute('tabindex')).toBe('0');
    expect(active.getAttribute('aria-label')).toBe('Tools');
    expect(inactive.getAttribute('aria-selected')).toBe('false');
    // roving：非激活项 tabindex=-1（键盘只 Tab 到激活项，方向键在组内移动）。
    expect(inactive.getAttribute('tabindex')).toBe('-1');
    expect(inactive.getAttribute('aria-label')).toBe('References');

    // 主内容按 activeKey 渲染。
    expect(container.querySelector('[data-testid="main-content"]')?.textContent).toContain(
      'tools',
    );

    await expectNoAxeViolations(container);
  });

  it('点击非激活 Option 触发 onActiveOptionChange（受控，不回写）', async () => {
    const onChange = vi.fn();
    const { container } = renderWithLocale(Fixture, {
      props: { mode: 'main', activeKey: 'tools', onActiveOptionChange: onChange },
    });
    const tabs = container.querySelectorAll('[role="tab"]');
    (tabs[1] as HTMLElement).click();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[1]).toBe('refs');
    // 受控：activeKey 仍指向 tools（未回写），激活项不变。
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');
  });
});

describe('SideBar a11y — detail routing', () => {
  it('mode!=main：返回按钮 i18n aria-label + renderDetailHeader/Content，无 axe violations', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { mode: 'code' },
    });
    // main 视图的 Options tablist 不渲染。
    expect(container.querySelector('[role="tablist"]')).toBeNull();
    // 返回按钮 aria-label 来自 en_US locale（SideBar.back = "Back"）。
    const back = container.querySelector('.cd-sidebar__back') as HTMLElement | null;
    expect(back?.getAttribute('aria-label')).toBe('Back');
    // detail header / content 按 mode 渲染。
    expect(container.querySelector('[data-testid="detail-title"]')?.textContent).toContain(
      'code',
    );
    expect(container.querySelector('[data-testid="detail-content"]')?.textContent).toContain(
      'code',
    );
    await expectNoAxeViolations(container);
  });

  it('点击返回按钮触发 onBackWard(mode)', () => {
    const onBack = vi.fn();
    const { container } = renderWithLocale(Fixture, {
      props: { mode: 'code', onBackWard: onBack },
    });
    (container.querySelector('.cd-sidebar__back') as HTMLElement).click();
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onBack.mock.calls[0]?.[1]).toBe('code');
  });
});
