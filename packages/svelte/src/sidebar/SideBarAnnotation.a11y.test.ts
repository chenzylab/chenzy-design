// SideBarAnnotation a11y + 组件测（P2）：参考来源/引用溯源折叠列表。
// info 分组 → Collapse 折叠面板（header aria-expanded + role=region）；每条 video/text 卡片；
// 可点击卡片用 <button>（键盘可达 + focus 环）；video 时长 / text 序号有 i18n 可访问文本。
// renderItem 覆盖走 fixture（Snippet prop）。jsdom 焦点/委托事件不完整——静态 role/aria + axe。
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import SideBarAnnotation from './SideBarAnnotation.svelte';
import RenderItemFixture from './SideBarAnnotationRenderItemFixture.svelte';
import type { SideBarAnnotationGroup } from './types.js';

const info: SideBarAnnotationGroup[] = [
  {
    header: '视频来源',
    key: 'videos',
    annotations: [
      {
        type: 'video',
        title: 'Svelte 5 深入',
        url: 'https://example.com/v1',
        img: 'https://example.com/cover.jpg',
        siteName: 'YouTube',
        logo: 'https://example.com/logo.png',
        duration: 125,
        order: 1,
      },
    ],
  },
  {
    header: '文本来源',
    key: 'texts',
    annotations: [
      {
        type: 'text',
        title: 'Runes 文档',
        detail: '关于 $state / $derived 的说明。',
        siteName: 'svelte.dev',
        order: 2,
      },
      // 无 url / onClick → 非交互静态卡片。
      { type: 'text', title: '纯文本', detail: '无来源链接。' },
    ],
  },
];

describe('SideBarAnnotation — 分组 / 卡片渲染', () => {
  it('info 分组渲染为 Collapse 折叠面板，展开态由 activeKey 控制，头部 aria-expanded 正确', async () => {
    const { container } = renderWithLocale(SideBarAnnotation, {
      props: { visible: true, info, activeKey: 'videos', motion: false },
    });
    const headers = container.querySelectorAll('.cd-collapse-header');
    // 两个分组 → 两个折叠头部。
    expect(headers.length).toBe(2);
    // 分组标题文本渲染。
    expect(container.textContent).toContain('视频来源');
    expect(container.textContent).toContain('文本来源');
    // activeKey=videos → 首个面板 aria-expanded=true，另一个 false。
    expect(headers[0]?.getAttribute('aria-expanded')).toBe('true');
    expect(headers[1]?.getAttribute('aria-expanded')).toBe('false');
    await expectNoAxeViolations(container);
  });

  it('video 卡片：封面 img + 时长本地化 mm:ss + i18n 可访问文本；恒用 <div>（对齐 Semi）', () => {
    const { container } = renderWithLocale(SideBarAnnotation, {
      props: { visible: true, info, activeKey: 'videos', motion: false },
    });
    const videoCard = container.querySelector(
      '.cd-sidebar-annotation-item-video',
    ) as HTMLElement | null;
    expect(videoCard).not.toBeNull();
    // 对齐 Semi annotation/item.tsx：VideoItem/Item 恒用 <div onClick>，不用 button。
    expect(videoCard?.tagName).toBe('DIV');
    // 封面图。
    expect(container.querySelector('.cd-sidebar-annotation-item-video-img')).not.toBeNull();
    // 时长 125s → 02:05（mm:ss），且 aria-label 走 i18n（en_US: "Video duration 02:05"）。
    const duration = container.querySelector(
      '.cd-sidebar-annotation-item-video-duration',
    ) as HTMLElement | null;
    expect(duration?.textContent).toContain('02:05');
    expect(duration?.getAttribute('aria-label')).toBe('Video duration 02:05');
  });

  it('text 卡片：标题/摘要/站点名/序号；序号有 i18n 可访问文本；无来源同样是 <div>（对齐 Semi 恒可点击）', () => {
    const { container } = renderWithLocale(SideBarAnnotation, {
      props: { visible: true, info, activeKey: ['texts'], motion: false },
    });
    // 第二个面板展开：文本卡片可见。
    expect(container.textContent).toContain('Runes 文档');
    expect(container.textContent).toContain('svelte.dev');
    // 序号 aria-label（en_US: "Citation 2"）。文本卡片的序号在 text 卡片内。
    const textCard = container.querySelector(
      '.cd-sidebar-annotation-item-text',
    ) as HTMLElement | null;
    const order = textCard?.querySelector(
      '.cd-sidebar-annotation-item-footer-order',
    ) as HTMLElement | null;
    expect(order?.getAttribute('aria-label')).toBe('Citation 2');
    // 对齐 Semi：无 url/onClick 的纯文本卡片也用同一种 <div onClick> 结构，
    // 不再区分「静态卡片」分支（Semi 没有这个概念）。
    const cards = container.querySelectorAll('.cd-sidebar-annotation-item-text');
    expect(cards.length).toBe(2);
    expect(cards[1]?.tagName).toBe('DIV');
  });

  it('点击卡片触发 onClick(e, item)（url 存在时不阻断回调）', () => {
    const onClick = vi.fn();
    // 屏蔽 jsdom window.open 未实现告警。
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { container } = renderWithLocale(SideBarAnnotation, {
      props: { visible: true, info, activeKey: 'videos', motion: false, onClick },
    });
    const videoCard = container.querySelector(
      '.cd-sidebar-annotation-item-video',
    ) as HTMLElement;
    videoCard.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0]?.[1]?.title).toBe('Svelte 5 深入');
    // url 存在 → window.open 被调用打开来源。
    expect(openSpy).toHaveBeenCalledWith(
      'https://example.com/v1',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });

  it('空 info：对齐 Semi，渲染空 Collapse，无提示文案，无 axe violations', async () => {
    const { container } = renderWithLocale(SideBarAnnotation, {
      props: { visible: true, info: [], motion: false },
    });
    expect(container.querySelector('.cd-collapse-header')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('默认标题走 i18n（en_US: References）；未传 title 时容器标题为其值', () => {
    const { container } = renderWithLocale(SideBarAnnotation, {
      props: { visible: true, info, motion: false },
    });
    const titleEl = container.querySelector('.cd-sidebar-container-header-title');
    expect(titleEl?.textContent?.trim()).toBe('References');
  });
});

describe('SideBarAnnotation — renderItem 覆盖', () => {
  it('传 renderItem 时用自定义渲染替换默认 video/text 卡片', () => {
    const { container } = renderWithLocale(RenderItemFixture, {
      props: { info, activeKey: 'videos' },
    });
    // 自定义渲染标记出现，默认卡片类不出现。
    expect(container.querySelector('[data-testid="custom-item"]')).not.toBeNull();
    expect(container.querySelector('.cd-sidebar-annotation-item')).toBeNull();
  });
});

// video 卡的「标题 + 页脚」包裹层。Semi 叫 -item-video-content（annotation/item.tsx:45），
// 本库原来复用了 -annotation-content —— 但那个类在分组网格上另有其义，
// 同名导致 <style> 里出现两个同名规则块、后者静默覆盖前者的 padding/gap。
describe('SideBarAnnotation — video 卡内层包裹（对齐 Semi -item-video-content）', () => {
  const videoInfo: SideBarAnnotationGroup[] = [
    {
      header: '视频',
      key: 'v',
      annotations: [
        { type: 'video', title: '标题', url: 'https://x/v', siteName: 'YT', order: 1 },
      ],
    },
  ];

  it('video 卡内层用 -item-video-content，且包住标题与页脚', () => {
    const { container } = renderWithLocale(SideBarAnnotation, {
      props: { visible: true, info: videoInfo, activeKey: 'v', motion: false },
    });
    const card = container.querySelector('.cd-sidebar-annotation-item-video')!;
    const inner = card.querySelector('.cd-sidebar-annotation-item-video-content');
    expect(inner, 'video 卡应有 -item-video-content 内层').not.toBeNull();
    expect(inner!.querySelector('.cd-sidebar-annotation-item-title')).not.toBeNull();
    expect(inner!.querySelector('.cd-sidebar-annotation-item-footer')).not.toBeNull();
  });

  it('-annotation-content 只用于分组网格，不再出现在卡片内部', () => {
    const { container } = renderWithLocale(SideBarAnnotation, {
      props: { visible: true, info: videoInfo, activeKey: 'v', motion: false },
    });
    // 分组网格那层仍在。
    expect(container.querySelector('.cd-sidebar-annotation-content')).not.toBeNull();
    // 但卡片内部不该再有同名节点（此前两处同名）。
    const card = container.querySelector('.cd-sidebar-annotation-item-video')!;
    expect(card.querySelector('.cd-sidebar-annotation-content')).toBeNull();
  });
});
