// SideBar 布局/动效实测值 vs Semi（browser project / 真实 chromium）。
//
// 为什么要真浏览器：这些值全靠 var(--cd-*) 解析，jsdom 不算样式。
// 本库此前 Container 出入场用的是通用 --cd-motion-duration-mid(200ms) 且额外做了
// 透明度渐变，而 Semi 是 180ms + cubic-bezier(0.25,0.46,0.45,0.94)、只动 transform。
// 类名一个不差，量出来却对不上，正是这种缺口需要机器盯住。
//
// 注意必须引 tokens.css：不引则 var(--cd-*) 全部失效，量出来是 0s / none，断言会假绿。
import '@chenzy-design/tokens/tokens.css';
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SideBarContainer from './SideBarContainer.svelte';
import SideBarA11yFixture from './SideBarA11yFixture.svelte';
import SideBarFileItem from './SideBarFileItem.svelte';

/** Semi sidebar/animation.scss + variables.scss 实测值。 */
const SEMI = {
  showDuration: '0.18s', // $animation_duration_sidebar_inner-show: 180ms
  hideDuration: '0.18s', // $animation_duration_sidebar_inner-hide: 180ms
  timingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  mainContentPadding: '12px', // $spacing-sidebar_main_content-padding
  detailHeaderPadding: '12px', // $spacing-sidebar_detail_header-padding
  detailHeaderLeftGap: '8px', // $spacing-sidebar_detail_header_left-columnGap
  detailHeaderRightGap: '4px', // $spacing-sidebar_detail_header_right-columnGap
} as const;

const settle = () => new Promise((r) => setTimeout(r, 120));

describe('SideBarContainer 动效实测（对齐 Semi）', () => {
  // 面板在「从未打开过」时不挂载，所以关闭态要先开再关。
  // （最初写成直接 visible:false，面板压根不存在，用例是空跑——已改成真实路径。）
  it('关闭后面板：过渡 180ms + Semi 曲线，且只动 transform 不做透明度渐变', async () => {
    const screen = render(SideBarContainer, { props: { visible: true, motion: true } });
    await settle();
    await screen.rerender({ visible: false, motion: true });
    const panel = document.querySelector('.cd-sidebar-container-panel') as HTMLElement | null;
    expect(panel, '开过之后关闭，面板应仍在 DOM 里做出场过渡').not.toBeNull();
    const cs = getComputedStyle(panel!);
    expect(cs.transitionDuration).toBe(SEMI.hideDuration);
    expect(cs.transitionTimingFunction).toBe(SEMI.timingFunction);
    // Semi 只动 transform，本库原来还淡入淡出。
    expect(cs.transitionProperty).toBe('transform');
  });

  it('打开态面板：位移归零，过渡时长走 show 档 180ms', async () => {
    render(SideBarContainer, { props: { visible: true, motion: true } });
    await settle();
    const panel = document.querySelector('.cd-sidebar-container-panel') as HTMLElement;
    expect(panel).not.toBeNull();
    const cs = getComputedStyle(panel);
    expect(cs.transitionDuration).toBe(SEMI.showDuration);
    expect(cs.transitionTimingFunction).toBe(SEMI.timingFunction);
    expect(cs.transitionProperty).toBe('transform');
  });

  // Semi 用 CSSAnimation 在动画元素上切 -animation-content_show / _hide 两个类。
  // 本库机制是 transition + -container-open 状态类，但把时长/曲线挂在这两个同名类上，
  // 保证类名契约一致且不是装饰性的空类。
  it('面板带 Semi 的 -animation-content_show / _hide 类，且各自承载对应档时长', async () => {
    const screen = render(SideBarContainer, { props: { visible: true, motion: true } });
    await settle();
    const panel = document.querySelector('.cd-sidebar-container-panel') as HTMLElement;
    expect(panel.classList.contains('cd-sidebar-animation-content_show')).toBe(true);
    expect(panel.classList.contains('cd-sidebar-animation-content_hide')).toBe(false);
    expect(getComputedStyle(panel).transitionDuration).toBe(SEMI.showDuration);

    await screen.rerender({ visible: false, motion: true });
    const closed = document.querySelector('.cd-sidebar-container-panel') as HTMLElement;
    expect(closed.classList.contains('cd-sidebar-animation-content_hide')).toBe(true);
    expect(closed.classList.contains('cd-sidebar-animation-content_show')).toBe(false);
    expect(getComputedStyle(closed).transitionDuration).toBe(SEMI.hideDuration);
  });
});

describe('SideBar 主壳/详情头布局实测（对齐 Semi）', () => {
  it('main-content：12px 内边距（Semi $spacing-sidebar_main_content-padding）', async () => {
    render(SideBarA11yFixture, { props: { mode: 'main' } });
    await settle();
    const content = document.querySelector('.cd-sidebar-main-content') as HTMLElement;
    expect(content).not.toBeNull();
    const cs = getComputedStyle(content);
    expect(cs.paddingTop).toBe(SEMI.mainContentPadding);
    expect(cs.paddingLeft).toBe(SEMI.mainContentPadding);
  });

  it('detail-header：12px 内边距 + space-between，左右两组各自列间距 8/4px', async () => {
    render(SideBarA11yFixture, {
      props: { mode: 'code', customDetailHeader: false, detailContent: { name: 'x' } },
    });
    await settle();
    const header = document.querySelector('.cd-sidebar-detail-header') as HTMLElement;
    expect(header).not.toBeNull();
    const hs = getComputedStyle(header);
    expect(hs.paddingTop).toBe(SEMI.detailHeaderPadding);
    expect(hs.justifyContent).toBe('space-between');

    const left = document.querySelector('.cd-sidebar-detail-header-left') as HTMLElement;
    const right = document.querySelector('.cd-sidebar-detail-header-right') as HTMLElement;
    expect(getComputedStyle(left).columnGap).toBe(SEMI.detailHeaderLeftGap);
    expect(getComputedStyle(right).columnGap).toBe(SEMI.detailHeaderRightGap);
  });
});

// 富文本编辑器正文内容样式。Semi sidebar.scss:455-520 给 .tiptap 定了字号/行高/
// 段落/引用块/行内代码/代码块/分割线/placeholder 共 21 条变量；
// 本库此前只写了容器/focus/img/select 四条，正文全靠浏览器默认样式。
describe('SideBarFileItem 正文内容样式实测（对齐 Semi）', () => {
  /** 等编辑器把内容渲染出来（tiptap 内核动态 import，时机有波动）。 */
  async function waitFor(sel: string): Promise<HTMLElement> {
    const deadline = Date.now() + 3000;
    let el: HTMLElement | null = null;
    while (!el && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 40));
      el = document.querySelector(sel) as HTMLElement | null;
    }
    expect(el, `应渲染出 ${sel}`).not.toBeNull();
    return el!;
  }

  it('正文 14px/24px；引用块 3px 左边框 + 16px 左内距', async () => {
    render(SideBarFileItem, {
      props: {
        content: '<p>正文</p><blockquote><p>引用</p></blockquote>',
        editable: false,
      },
    });
    const pm = await waitFor('.cd-sidebar-file-editor .ProseMirror');
    const cs = getComputedStyle(pm);
    expect(cs.fontSize).toBe('14px');
    expect(cs.lineHeight).toBe('24px');

    const bq = pm.querySelector('blockquote') as HTMLElement;
    expect(bq, '应渲染引用块').not.toBeNull();
    const bs = getComputedStyle(bq);
    expect(bs.borderLeftWidth).toBe('3px');
    expect(bs.paddingLeft).toBe('16px');
  });

  it('代码块 4px 圆角 + 1px 边框 + 非透明底；块内 code 不叠底色', async () => {
    render(SideBarFileItem, {
      props: { content: '<pre><code>const a = 1</code></pre>', editable: false },
    });
    const pre = await waitFor('.cd-sidebar-file-editor .ProseMirror pre');
    const ps = getComputedStyle(pre);
    expect(ps.borderRadius).toBe('4px');
    expect(ps.borderTopWidth).toBe('1px');
    expect(ps.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    // Semi 显式把块内 code 的底色置 transparent（否则会叠两层）。
    const code = pre.querySelector('code') as HTMLElement;
    expect(getComputedStyle(code).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });
});
