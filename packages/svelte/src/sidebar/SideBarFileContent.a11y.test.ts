// SideBarFileContent a11y + 渲染（P5 · 富文本查看/编辑）。
//  - tiptap 内核 + 3 扩展动态 import，编辑区（.ProseMirror）异步挂载 → 断言前需等待。
//  - Collapse 折叠列表：每项折叠头（含展开按钮 aria-label i18n）+ 展开区一个富文本编辑器。
//  - 只读项：editable=false，编辑区 aria-readonly=true 且不渲染工具栏。
//  - 可编辑项：渲染 role=toolbar 格式工具栏（撤销/标题/对齐/加粗/图片等，aria-label i18n）。
//  - 编辑区 role=textbox / aria-multiline / aria-label 走 locale。
//  - axe 0 violations。
// jsdom 断言静态渲染 + ARIA + axe（真实编辑/光标/图片上传留浏览器，对齐 AIChatInput skip 策略）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import SideBarFileContent from './SideBarFileContent.svelte';
import SideBarFileItem from './SideBarFileItem.svelte';
import type { FileItemProps } from './SideBarFileContent.svelte';

// jsdom 对部分节点未实现 getClientRects/getBoundingClientRect —— tiptap/Collapse 可能调用。
// 无条件补空实现，避免挂载时抛 unhandled TypeError 污染测试输出（不影响断言）。
const emptyRects = () => [] as unknown as DOMRectList;
const emptyRect = () =>
  ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) }) as DOMRect;
for (const proto of [Element.prototype, Range.prototype]) {
  proto.getClientRects = emptyRects;
  proto.getBoundingClientRect = emptyRect;
}

// tiptap 内核动态 import + editor 创建异步。轮询等 .ProseMirror 挂载，避免固定 sleep 不足。
// 轮询等待 tiptap（.ProseMirror）挂载够 expected 个再返回。
// 满载并发时 tiptap 挂载会慢一拍——deadline 给足余量；若仍未达标则显式抛错，
// 避免静默返回导致后续断言报出误导性的 `expected +0 to be N`（曾偶发 flaky）。
async function flush(container: Element, expected = 1): Promise<void> {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (container.querySelectorAll('.ProseMirror').length >= expected) {
      await new Promise((r) => setTimeout(r, 30));
      return;
    }
    await new Promise((r) => setTimeout(r, 20));
  }
  const actual = container.querySelectorAll('.ProseMirror').length;
  throw new Error(
    `flush 超时：等待 ${expected} 个 .ProseMirror 挂载，8s 后仅 ${actual} 个`,
  );
}

const files: FileItemProps[] = [
  {
    key: 'a',
    name: 'a.md',
    editable: true,
    content: '<p>editable content</p>',
  },
  {
    key: 'b',
    name: 'b.html',
    content: '<p>readonly content</p>',
  },
];

describe('SideBarFileContent · 渲染 + 折叠列表', () => {
  it('挂载不抛错，渲染根容器 + 每项折叠头名', () => {
    const { container } = renderWithLocale(SideBarFileContent, {
      props: { files, activeKey: ['a', 'b'] },
    });
    expect(container.querySelector('.cd-sidebar-collapse-file')).not.toBeNull();
    expect(container.textContent).toContain('a.md');
    expect(container.textContent).toContain('b.html');
  });

  it('展开按钮暴露 i18n aria-label（Expand）', () => {
    const { container } = renderWithLocale(SideBarFileContent, {
      props: { files, activeKey: ['a', 'b'] },
    });
    const btn = container.querySelector('.cd-sidebar-collapse-header-expand-btn');
    expect(btn?.getAttribute('aria-label')).toBe('Expand');
  });

  it('files 为空时不渲染任何折叠项', () => {
    const { container } = renderWithLocale(SideBarFileContent, {
      props: { files: [] },
    });
    expect(container.querySelector('.cd-sidebar-file-item')).toBeNull();
  });
});

describe('SideBarFileContent · tiptap 编辑器挂载', () => {
  it('展开后每项富文本编辑区挂载（role=textbox / aria-multiline / aria-label i18n）', async () => {
    const { container } = renderWithLocale(SideBarFileContent, {
      props: { files, activeKey: ['a', 'b'] },
    });
    await flush(container, 2);
    const editors = container.querySelectorAll('.ProseMirror');
    expect(editors.length).toBe(2);
    const first = editors[0]!;
    expect(first.getAttribute('role')).toBe('textbox');
    expect(first.getAttribute('aria-multiline')).toBe('true');
    expect(first.getAttribute('aria-label')).toBe('Rich text editor');
  });

  it('可编辑项渲染 role=toolbar 格式工具栏（i18n aria-label）；只读项不渲染工具栏', async () => {
    const { container } = renderWithLocale(SideBarFileContent, {
      props: { files, activeKey: ['a', 'b'] },
    });
    await flush(container, 2);
    const toolbars = container.querySelectorAll('[role="toolbar"]');
    // 仅可编辑项（a）有工具栏。
    expect(toolbars.length).toBe(1);
    expect(toolbars[0]!.getAttribute('aria-label')).toBe('Formatting toolbar');
    // 工具栏含加粗按钮（i18n aria-label）。
    const bold = container.querySelector('[aria-label="Bold"]');
    expect(bold).not.toBeNull();
  });

  it('只读项编辑区标注 aria-readonly=true', async () => {
    const { container } = renderWithLocale(SideBarFileContent, {
      props: { files: [files[1]!], activeKey: ['b'] },
    });
    await flush(container, 1);
    const pm = container.querySelector('.ProseMirror');
    expect(pm?.getAttribute('aria-readonly')).toBe('true');
  });

  it('content 初始渲染进编辑区', async () => {
    const { container } = renderWithLocale(SideBarFileContent, {
      props: { files: [files[0]!], activeKey: ['a'] },
    });
    await flush(container, 1);
    expect(container.querySelector('.ProseMirror')?.textContent).toContain('editable content');
  });
});

describe('SideBarFileItem · axe', () => {
  // 注：FileContent 整表的 axe 不单独断言 —— Collapse 折叠头把「展开」extra 按钮嵌套进 header
  // 触发按钮内部（nested-interactive），是 Collapse+extra 通用范式的既有限制（P4 CodeContent
  // 同样规避不测整表 axe）。此处对单个 FileItem 编辑器（含工具栏，无嵌套按钮问题）做 axe 断言。
  it('单个可编辑 FileItem（工具栏 + 编辑区）无 a11y 违规', async () => {
    const { container } = renderWithLocale(SideBarFileItem, {
      props: { content: '<p>hi</p>', editable: true },
    });
    await flush(container, 1);
    await expectNoAxeViolations(container);
  });

  it('单个只读 FileItem 无 a11y 违规', async () => {
    const { container } = renderWithLocale(SideBarFileItem, {
      props: { content: '<p>readonly</p>', editable: false },
    });
    await flush(container, 1);
    await expectNoAxeViolations(container);
  });
});

// 工具栏对齐 Semi MenuBar（21 项 + 4 条 Divider）。
// 本库原来 14 项、图标全是手写 svg，且缺 Hn 下拉 / 正文 / 代码块 / 分割线 / 两端对齐 / 链接。
describe('SideBarFileItem · 工具栏对齐 Semi', () => {
  it('按 Semi 顺序渲染各按钮，图标走具名图标（非手写 svg）', async () => {
    const { container } = renderWithLocale(SideBarFileItem, {
      props: { content: '<p>hi</p>', editable: true },
    });
    await flush(container, 1);

    const bar = container.querySelector('.cd-sidebar-file-menu-bar')!;
    expect(bar).not.toBeNull();

    // Semi 有本库此前缺的这几项。
    for (const label of ['Heading', 'Paragraph', 'Code block', 'Divider', 'Justify', 'Link']) {
      expect(
        bar.querySelector(`[aria-label="${label}"]`),
        `工具栏应有「${label}」按钮`,
      ).not.toBeNull();
    }

    // 图标是具名图标（cd-icon-*），不是内联手写 svg。
    expect(bar.querySelectorAll('[class*="cd-icon-"]').length).toBeGreaterThan(10);

    // 代码块按钮无图标、显示 "CB" 文字（对齐 Semi）。
    const cb = bar.querySelector('.cd-sidebar-file-menu-bar-btn-codeblock');
    expect(cb?.textContent?.trim()).toBe('CB');
  });

  // 对齐 Semi：菜单栏里有 4 条竖分隔线（本库原来是自绘 span.-item-sep）。
  it('用 Divider 组件分组，共 4 条', async () => {
    const { container } = renderWithLocale(SideBarFileItem, {
      props: { content: '<p>hi</p>', editable: true },
    });
    await flush(container, 1);
    const bar = container.querySelector('.cd-sidebar-file-menu-bar')!;
    expect(bar.querySelectorAll('.cd-divider-vertical')).toHaveLength(4);
    // 旧的自绘分隔符已移除。
    expect(bar.querySelector('.cd-sidebar-file-item-sep')).toBeNull();
  });

  it('工具栏无 a11y 违规（Dropdown 触发器不套裸 span）', async () => {
    const { container } = renderWithLocale(SideBarFileItem, {
      props: { content: '<p>hi</p>', editable: true },
    });
    await flush(container, 1);
    await expectNoAxeViolations(container);
  });
});
