// SideBarCodeContent 组件测（P4）：codes 渲染 / isJson 分流 / 展开 onExpand / 受控 onChange。
// dom project 按默认 glob（*.test.ts）在 jsdom 下拾取。JsonViewer 内核依赖真实 Worker，
// jsdom 无 Worker → new 抛错被组件 .catch 降级（沿用 JsonViewer 既有 skip 策略）：
// 我们只断言「isJson=true 时挂载 JsonViewer 壳（.cd-json-viewer）、否则挂 CodeHighlight（.cd-code-highlight）」，
// 不测内核真实语法高亮/JSON DOM（那部分留给 Playwright）。
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import SideBarCodeContent, { type CodeItemProps } from './SideBarCodeContent.svelte';

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
    const root = container.querySelector('.cd-sidebar-code-content');
    expect(root).toBeTruthy();
    // 两个折叠面板。
    const items = container.querySelectorAll('.cd-collapse-item');
    expect(items.length).toBe(2);
    // 头部 name 文本。
    const texts = [...container.querySelectorAll('.cd-sidebar-code-content__head-text')].map(
      (n) => n.textContent,
    );
    expect(texts).toEqual(['config.json', 'main.ts']);
  });

  it('name 缺省时回退到 key', () => {
    const { container } = renderWithLocale(CC, {
      props: { codes: [{ key: 'only-key', content: 'x' }] as CodeItemProps[] },
    });
    expect(
      container.querySelector('.cd-sidebar-code-content__head-text')?.textContent,
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
    expect(container.querySelector('.cd-sidebar-code-content')).toBeTruthy();
    expect(container.querySelectorAll('.cd-collapse-item').length).toBe(0);
  });
});

describe('SideBarCodeContent — 交互回调', () => {
  it('点击展开（全屏）按钮触发 onExpand(e, code, "code")，不受折叠态影响', () => {
    const onExpand = vi.fn();
    const { container } = renderWithLocale(CC, { props: { codes: CODES, onExpand } });
    const btn = container.querySelector(
      '.cd-sidebar-code-content__expand',
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
    const btn = container.querySelector('.cd-sidebar-code-content__expand');
    expect(btn?.getAttribute('aria-label')).toBe('Expand');
    expect(btn?.getAttribute('title')).toBe('Expand');
  });

  it('点击折叠头触发展开，onChange 收到 key 列表（受控不回写：DOM 展开态由传入 activeKey 决定）', () => {
    const onChange = vi.fn();
    const { container } = renderWithLocale(CC, {
      props: { codes: CODES, activeKey: [], onChange },
    });
    // 初始受控 activeKey=[] → 无面板展开。
    expect(container.querySelector('.cd-collapse-item-active')).toBeNull();
    const header = container.querySelector('.cd-collapse-header') as HTMLElement;
    header.click();
    // onChange 通知（含被点击项 key）。
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toContain('cfg');
    // 受控：DOM 未回写，仍无展开项。
    expect(container.querySelector('.cd-collapse-item-active')).toBeNull();
  });
});
