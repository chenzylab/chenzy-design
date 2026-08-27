// SideBarCodeContent 组件测（P4）：codes 渲染 / isJson 分流 / 展开 onExpand / 受控 onChange。
// dom project 按默认 glob（*.test.ts）在 jsdom 下拾取。JsonViewer 内核依赖真实 Worker，
// jsdom 无 Worker → new 抛错被组件 .catch 降级（沿用 JsonViewer 既有 skip 策略）：
// 我们只断言「isJson=true 时挂载 JsonViewer 壳（.cd-json-viewer）、否则挂 CodeHighlight（.cd-code-highlight）」，
// 不测内核真实语法高亮/JSON DOM（那部分留给 Playwright）。
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import SideBarCodeContent from './SideBarCodeContent.svelte';
import type { CodeItemProps } from './SideBarCodeItem.svelte';

const CC = SideBarCodeContent as unknown as Parameters<typeof renderWithLocale>[0];

const CODES: CodeItemProps[] = [
  {
    key: 'cfg',
    name: 'config.json',
    isJson: true,
    content: '{"a":1,"b":[2,3]}',
  },
  {
    key: 'src',
    name: 'main.ts',
    language: 'typescript',
    content: 'const x: number = 1;',
  },
];

describe('SideBarCodeContent — 渲染 / 分流', () => {
  it('遍历 codes 渲染折叠面板，头部显示 name', () => {
    const { container } = renderWithLocale(CC, { props: { codes: CODES } });
    const root = container.querySelector('.cd-sidebar-collapse-code');
    expect(root).toBeTruthy();
    // 两个折叠面板。
    const items = container.querySelectorAll('.cd-collapse-item');
    expect(items.length).toBe(2);
    // 头部 name 文本。
    const texts = [...container.querySelectorAll('.cd-sidebar-collapse-header-text')].map(
      (n) => n.textContent,
    );
    expect(texts).toEqual(['config.json', 'main.ts']);
  });

  it('name 缺省时回退到 key', () => {
    const { container } = renderWithLocale(CC, {
      props: { codes: [{ key: 'only-key', content: 'x' }] as CodeItemProps[] },
    });
    expect(
      container.querySelector('.cd-sidebar-collapse-header-text')?.textContent,
    ).toBe('only-key');
  });

  it('isJson=true → 挂 JsonViewer 壳；isJson≠true → 挂 CodeHighlight', () => {
    const { container } = renderWithLocale(CC, { props: { codes: CODES } });
    // JsonViewer 壳（内核加载失败也会先渲染容器）。
    expect(container.querySelector('.cd-json-viewer')).toBeTruthy();
    // CodeHighlight 壳。
    expect(container.querySelector('.cd-code-highlight')).toBeTruthy();
  });

  it('CodeHighlight 收到 language（语法 class 为 language-<lang>）', () => {
    const { container } = renderWithLocale(CC, {
      props: { codes: [CODES[1]] as CodeItemProps[] },
    });
    const code = container.querySelector('.cd-code-highlight code');
    expect(code?.className).toContain('language-typescript');
  });

  it('空 codes 渲染空折叠列表，不抛错', () => {
    const { container } = renderWithLocale(CC, { props: { codes: [] } });
    expect(container.querySelector('.cd-sidebar-collapse-code')).toBeTruthy();
    expect(container.querySelectorAll('.cd-collapse-item').length).toBe(0);
  });
});

describe('SideBarCodeContent — 交互回调', () => {
  it('点击展开（全屏）按钮触发 onExpand(e, code, "code")，不受折叠态影响', () => {
    const onExpand = vi.fn();
    const { container } = renderWithLocale(CC, { props: { codes: CODES, onExpand } });
    const btn = container.querySelector(
      '.cd-sidebar-collapse-header-expand-btn',
    ) as HTMLElement | null;
    expect(btn).toBeTruthy();
    btn!.click();
    expect(onExpand).toHaveBeenCalledTimes(1);
    // 第二参为对应 code，第三参 mode 固定 'code'。
    expect(onExpand.mock.calls[0]?.[1]?.key).toBe('cfg');
    expect(onExpand.mock.calls[0]?.[2]).toBe('code');
  });

  it('展开按钮 aria-label / title 走 i18n（en_US SideBar.expand = "Expand"）', () => {
    const { container } = renderWithLocale(CC, { props: { codes: CODES } });
    const btn = container.querySelector('.cd-sidebar-collapse-header-expand-btn');
    expect(btn?.getAttribute('aria-label')).toBe('Expand');
    expect(btn?.getAttribute('title')).toBe('Expand');
  });

  it('点击折叠箭头触发展开，onChange 收到 key 列表（受控不回写：DOM 展开态由传入 activeKey 决定）', () => {
    const onChange = vi.fn();
    const { container } = renderWithLocale(CC, {
      props: { codes: CODES, activeKey: [], onChange },
    });
    // 初始受控 activeKey=[] → 无面板展开。
    expect(container.querySelector('.cd-collapse-item-active')).toBeNull();
    // 对齐 Semi clickHeaderToExpand={false}（head 内还有展开全屏按钮，不能整个 header
    // 可点击）：只有折叠箭头图标能触发展开，点击 header 主体不行。
    const icon = container.querySelector('.cd-collapse-header-icon') as HTMLElement;
    icon.click();
    // onChange 通知（含被点击项 key）。
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toContain('cfg');
    // 受控：DOM 未回写，仍无展开项。
    expect(container.querySelector('.cd-collapse-item-active')).toBeNull();
  });

  it('点击折叠头主体（非箭头）不触发展开（对齐 Semi clickHeaderToExpand=false）', () => {
    const onChange = vi.fn();
    const { container } = renderWithLocale(CC, {
      props: { codes: CODES, activeKey: [], onChange },
    });
    const headerText = container.querySelector(
      '.cd-sidebar-collapse-header-text',
    ) as HTMLElement;
    headerText.click();
    expect(onChange).not.toHaveBeenCalled();
  });
});

// 折叠头图标。Semi widget/code.tsx:62/68 用的是具名图标（IconCodeStroked /
// IconFullScreenStroked），且图标**直接放在 -header-content 里**，没有 -header-icon
// 这层包裹。本库原来两处都是手写 svg，且多包了一层 span。
describe('SideBarCodeContent — 折叠头图标（对齐 Semi）', () => {
  const codes = [{ key: 'a', name: 'a.ts', content: 'const a = 1' }];

  // 注：这条的「反向断言」无法用「加回一层 span」来验红 —— Svelte 编译器会把
  // 没有任何 CSS 规则引用的 class 直接从产物里剥掉，加回去也渲染不出来。
  // 正向断言（图标是 -header-content 的直接子节点）可验红，见下一条。
  it('图标直接在 -header-content 下，无 -header-icon 包裹层', () => {
    const { container } = renderWithLocale(CC, { props: { codes } });
    const head = container.querySelector('.cd-sidebar-collapse-header-content');
    expect(head, '折叠头应渲染').not.toBeNull();
    expect(head!.querySelector('svg'), '应有图标').not.toBeNull();
    // 正向断言：图标容器是 -header-content 的**直接子节点**（Semi 的结构）。
    const firstEl = head!.firstElementChild;
    expect(firstEl?.querySelector('svg') ?? firstEl, '首个子节点应是图标本身').not.toBeNull();
    expect(firstEl?.classList.contains('cd-icon'), '首个子节点应是具名图标组件').toBe(true);
    expect(
      container.querySelector('.cd-sidebar-collapse-header-icon'),
      '-header-icon 是本库自造的包裹层，Semi 没有',
    ).toBeNull();
  });

  it('展开按钮内是图标（非手写 svg 的 path 串）', () => {
    const { container } = renderWithLocale(CC, { props: { codes } });
    const btn = container.querySelector('.cd-sidebar-collapse-header-expand-btn');
    expect(btn, '展开按钮应渲染').not.toBeNull();
    expect(btn!.querySelector('svg')).not.toBeNull();
  });
});
