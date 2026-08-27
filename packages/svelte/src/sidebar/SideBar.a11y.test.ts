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
    // 对齐 Semi options.tsx：每项是 Button（图标 + name 可见文字），name 不再是
    // 隐藏的 aria-label，而是可见 children——Button 自身以可见文字提供无障碍名。
    expect(active.textContent).toContain('Tools');
    expect(inactive.getAttribute('aria-selected')).toBe('false');
    // roving：非激活项 tabindex=-1（键盘只 Tab 到激活项，方向键在组内移动）。
    expect(inactive.getAttribute('tabindex')).toBe('-1');
    expect(inactive.textContent).toContain('References');

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
  // 对齐 Semi renderHeader（index.tsx:127-130）：renderDetailHeader 有返回值就直接 return，
  // 整个头部由消费方接管——连返回按钮一起替换，不是「在自带头部里插一段」。
  it('mode!=main + renderDetailHeader：整个头部被替换（无自带返回按钮）', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { mode: 'code' },
    });
    // main 视图的 Options tablist 不渲染。
    expect(container.querySelector('[role="tablist"]')).toBeNull();
    // 自定义头接管后，默认头部整块不出现。
    expect(container.querySelector('.cd-sidebar-detail-header')).toBeNull();
    expect(container.querySelector('.cd-sidebar-back')).toBeNull();
    // detail header / content 按 mode 渲染。
    expect(container.querySelector('[data-testid="detail-title"]')?.textContent).toContain(
      'code',
    );
    expect(container.querySelector('[data-testid="detail-content"]')?.textContent).toContain(
      'code',
    );
    await expectNoAxeViolations(container);
  });

  // 默认头部：Semi 是左右两个 span 分组——左 [关闭按钮 + 标题]，右 [复制按钮]。
  it('mode!=main 不传 renderDetailHeader：默认头部左右分组 + i18n 返回按钮', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { mode: 'code', customDetailHeader: false, detailContent: { name: '示例文件' } },
    });
    const header = container.querySelector('.cd-sidebar-detail-header');
    expect(header).not.toBeNull();
    const left = header!.querySelector('.cd-sidebar-detail-header-left');
    const right = header!.querySelector('.cd-sidebar-detail-header-right');
    expect(left).not.toBeNull();
    expect(right).not.toBeNull();
    // 返回按钮在左组里，aria-label 走 en_US locale（SideBar.back = "Back"）。
    const back = left!.querySelector('.cd-sidebar-back') as HTMLElement | null;
    expect(back?.getAttribute('aria-label')).toBe('Back');
    // 标题也在左组；复制按钮在右组。
    expect(left!.querySelector('.cd-sidebar-detail-header-title')?.textContent).toBe('示例文件');
    expect(right!.querySelector('.cd-sidebar-detail-header-copy')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('点击返回按钮触发 onBackWard(mode)', () => {
    const onBack = vi.fn();
    const { container } = renderWithLocale(Fixture, {
      props: { mode: 'code', customDetailHeader: false, onBackWard: onBack },
    });
    (container.querySelector('.cd-sidebar-back') as HTMLElement).click();
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onBack.mock.calls[0]?.[1]).toBe('code');
  });

  // Semi 标记的是「未选中」（-options-normal）而非「选中」——选中态即 Button 默认
  // primary/light 外观，不叠加任何标记类；未选中态才叠加 -options-normal 压回常规文本色。
  it('Options：未选中项带 -options-normal，选中项不带', () => {
    const { container } = renderWithLocale(Fixture, {
      props: { mode: 'main', activeKey: 'tools' },
    });
    const buttons = container.querySelectorAll('.cd-sidebar-options-button');
    expect(buttons.length).toBe(2);
    // activeKey=tools → 第一个选中、第二个未选中。
    expect(buttons[0]!.classList.contains('cd-sidebar-options-normal')).toBe(false);
    expect(buttons[1]!.classList.contains('cd-sidebar-options-normal')).toBe(true);
  });

  // Semi 在根节点按 mode 打 -main / -detail 标记（index.tsx:163-164），本库原来一个都没有。
  // 注意 -detail 是**根节点的 mode 标记**，不是详情内容区——内容区那层本库自有，
  // 已改名 -detail-content（Semi renderDetail 直接返回 CodeItem/FileItem，没有这层 div）。
  it('根节点按 mode 打 -main / -detail 标记', () => {
    const main = renderWithLocale(Fixture, { props: { mode: 'main' } });
    const mainRoot = main.container.querySelector('.cd-sidebar')!;
    expect(mainRoot.classList.contains('cd-sidebar-main')).toBe(true);
    expect(mainRoot.classList.contains('cd-sidebar-detail')).toBe(false);

    const detail = renderWithLocale(Fixture, { props: { mode: 'code' } });
    const detailRoot = detail.container.querySelector('.cd-sidebar')!;
    expect(detailRoot.classList.contains('cd-sidebar-detail')).toBe(true);
    expect(detailRoot.classList.contains('cd-sidebar-main')).toBe(false);
    // 内容区那层不再叫 -detail（否则与根标记同名相撞）。
    expect(detailRoot.querySelector('.cd-sidebar-detail-content')).not.toBeNull();
  });

  // Semi options.tsx:15-17：renderOptionItem 命中即**整项接管**，不再渲染默认按钮。
  // 本库此前完全没有这个 prop（props 审计一直报缺，之前只顾着核类名）。
  it('renderOptionItem：整项接管，默认按钮不再渲染，onChange 仍可用', async () => {
    const onChange = vi.fn();
    const { container } = renderWithLocale(Fixture, {
      props: { mode: 'main', customOptionItem: true, onActiveOptionChange: onChange },
    });
    const custom = container.querySelectorAll('[data-testid="custom-option"]');
    expect(custom.length, '两个 option 都走自定义渲染').toBe(2);
    // 默认按钮整项被替换。
    expect(container.querySelector('.cd-sidebar-options-button')).toBeNull();
    // 回传的 onChange 仍能切换（点第二项，第一项是当前激活项会被 setActive 提前 return）。
    (custom[1] as HTMLElement).click();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[1]).toBe('refs');
  });

  // Semi renderMain：-main-content-wrapper 包住 options + -main-content 两部分。
  it('main 视图：-main-content-wrapper 包住 options 与 -main-content', () => {
    const { container } = renderWithLocale(Fixture, { props: { mode: 'main' } });
    const wrapper = container.querySelector('.cd-sidebar-main-content-wrapper');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.querySelector('[role="tablist"]')).not.toBeNull();
    const content = wrapper!.querySelector('.cd-sidebar-main-content');
    expect(content).not.toBeNull();
    expect(content!.querySelector('[data-testid="main-content"]')).not.toBeNull();
  });
});
