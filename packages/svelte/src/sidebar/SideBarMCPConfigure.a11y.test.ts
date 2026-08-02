// SideBarMCPConfigure 组件测（P3）：两模式切换 / 搜索过滤 / 启用开关 role=switch /
// 动作按钮 i18n / 受控 onStatusChange 不回写 / 空态与无结果。
//
// 对齐 Semi mcpConfigure/content：头部 RadioGroup 在 INNER（内置 MCP Servers）与
// CUSTOM（自定义）之间切换，**同一时刻只渲染一份列表**。本库早期是两组同屏堆叠，
// 这批用例原来也按「两组同时可见」写，已随实现一起改。
// 命名 *.a11y.test.ts → 落 dom(jsdom) vitest project（红线：*.test.ts 会落 node project 缺 DOM 崩溃）。
import { describe, it, expect, vi } from 'vitest';
import { fireEvent } from '@testing-library/svelte';
import { renderWithLocale } from '../test-utils/a11y.js';
import SideBarMCPConfigure from './SideBarMCPConfigure.svelte';
import type { SideBarMCPOption } from './types.js';

const MC = SideBarMCPConfigure as unknown as Parameters<typeof renderWithLocale>[0];

const OPTIONS: SideBarMCPOption[] = [
  { value: 'fs', label: 'File System', desc: '读写本地文件', active: true, configure: true },
  { value: 'git', label: 'Git', desc: '版本控制', active: false },
  { value: 'preset', label: 'Preset Search', active: true, disabled: true },
];

const CUSTOM: SideBarMCPOption[] = [
  { value: 'my', label: 'My Tool', active: false },
];

function base(props: Record<string, unknown> = {}) {
  return renderWithLocale(MC, {
    props: { visible: true, options: OPTIONS, customOptions: CUSTOM, ...props },
  });
}

/** 切到 CUSTOM 模式：点头部 RadioGroup 的第二个 radio。 */
async function switchToCustom(container: Element) {
  const radios = container.querySelectorAll(
    '.cd-sidebar-mcp-configure-content-header input[type="radio"]',
  );
  expect(radios.length, '头部应有两个模式 radio').toBe(2);
  await fireEvent.click(radios[1] as HTMLElement);
}

function labelsOf(container: Element) {
  return [
    ...container.querySelectorAll('.cd-sidebar-mcp-configure-content-item-content-label'),
  ].map((n) => n.textContent);
}

describe('SideBarMCPConfigure — 两模式切换', () => {
  it('默认 INNER 模式：只渲染内置列表，不渲染自定义项', () => {
    const { container } = base();
    expect(container.querySelector('.cd-sidebar-mcp')).toBeTruthy();
    expect(labelsOf(container)).toEqual(['File System', 'Git', 'Preset Search']);
    const descs = [...container.querySelectorAll('.cd-sidebar-mcp-configure-content-item-content-desc')].map(
      (n) => n.textContent,
    );
    expect(descs).toContain('读写本地文件');
  });

  it('切到 CUSTOM 模式：只渲染自定义列表，且搜索框旁出现新增按钮', async () => {
    const { container } = base();
    await switchToCustom(container);
    expect(labelsOf(container)).toEqual(['My Tool']);
    // CUSTOM 且已有自定义项 → 搜索区里多一个新增按钮。
    const searchArea = container.querySelector(
      '.cd-sidebar-mcp-configure-content-search-container',
    )!;
    expect(searchArea.querySelector('button')).not.toBeNull();
  });

  it('切模式清空搜索词（否则会误以为新模式里没有匹配项）', async () => {
    const { container } = base();
    const input = container.querySelector('input[type="text"], input:not([type])') as HTMLInputElement;
    await fireEvent.input(input, { target: { value: 'git' } });
    expect(labelsOf(container)).toEqual(['Git']);
    await switchToCustom(container);
    // 搜索词已清空 → 自定义列表整份可见，而不是被 'git' 过滤成空。
    expect(labelsOf(container)).toEqual(['My Tool']);
  });

  // 对齐 Semi `{locale.activeMCPNumber} {n}/{总数}`：文案不含占位符，计数拼在后面。
  it('计数显示「已激活 MCP 数: n/总数」（en_US: "Number of activated MCPs: 2/4"）', () => {
    const { container } = base();
    expect(container.querySelector('.cd-sidebar-mcp-configure-content-header-count')?.textContent).toBe(
      'Number of activated MCPs: 2/4',
    );
  });

  // INNER 模式只渲染 3 个内置项（自定义那份要切模式才可见）。
  it('每项启用开关为原生 role=switch + aria-checked 反映 active', () => {
    const { container } = base();
    const switches = [...container.querySelectorAll('[role="switch"]')];
    // INNER 模式只渲染 3 个内置项（自定义那份要切模式才可见）。
    expect(switches.length).toBe(3);
    // File System active → checked。
    expect(switches[0]?.getAttribute('aria-checked')).toBe('true');
    // Git inactive。
    expect(switches[1]?.getAttribute('aria-checked')).toBe('false');
  });

  it('disabled 预设项开关被禁用（不可切换）', () => {
    const { container } = base();
    const switches = [...container.querySelectorAll('[role="switch"]')];
    // preset 项（第 3 个）disabled。
    expect((switches[2] as HTMLButtonElement).disabled).toBe(true);
  });

  it('configure=true 内置项显示配置按钮', () => {
    const { container } = base();
    expect(container.querySelector('[aria-label="Configure File System"]')).toBeTruthy();
    // INNER 模式下自定义项不渲染，编辑按钮自然也不在。
    expect(container.querySelector('[aria-label="Edit My Tool"]')).toBeNull();
  });

  it('切到 CUSTOM 模式后自定义项显示编辑按钮', async () => {
    const { container } = base();
    await switchToCustom(container);
    expect(container.querySelector('[aria-label="Edit My Tool"]')).toBeTruthy();
  });

  it('搜索框有 aria-label（en_US mcpSearchLabel）', () => {
    const { container } = base();
    const input = container.querySelector('.cd-sidebar-mcp-configure-content-search input');
    expect(input?.getAttribute('aria-label')).toBe('Search MCP tools');
  });
});

describe('SideBarMCPConfigure — 搜索过滤', () => {
  it('输入过滤两组列表（大小写不敏感，match label）', async () => {
    const { container } = base();
    const input = container.querySelector(
      '.cd-sidebar-mcp-configure-content-search input',
    ) as HTMLInputElement;
    input.value = 'git';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await Promise.resolve();
    const labels = [...container.querySelectorAll('.cd-sidebar-mcp-configure-content-item-content-label')].map(
      (n) => n.textContent,
    );
    expect(labels).toEqual(['Git']);
  });

  it('无匹配显示无结果提示（en_US mcpNoResult）', async () => {
    const { container } = base();
    const input = container.querySelector(
      '.cd-sidebar-mcp-configure-content-search input',
    ) as HTMLInputElement;
    input.value = 'zzz-none';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await Promise.resolve();
    expect(container.textContent).toContain('No matching tools');
  });
});

describe('SideBarMCPConfigure — 交互回调（受控不回写）', () => {
  it('点击开关触发 onStatusChange(下一份数组, custom=false)，不回写 prop', () => {
    const onStatusChange = vi.fn();
    const { container } = base({ onStatusChange });
    const switches = [...container.querySelectorAll('[role="switch"]')];
    // 点 Git（第 2 个，当前 false）。
    (switches[1] as HTMLElement).click();
    expect(onStatusChange).toHaveBeenCalledTimes(1);
    const [nextList, custom] = onStatusChange.mock.calls[0] ?? [];
    expect(custom).toBe(false);
    expect(nextList.find((o: SideBarMCPOption) => o.value === 'git')?.active).toBe(true);
    // 受控不回写：原选项 active 仍 false，DOM aria-checked 未变。
    expect(container.querySelectorAll('[role="switch"]')[1]?.getAttribute('aria-checked')).toBe('false');
  });

  it('disabled 项开关点击不触发 onStatusChange', () => {
    const onStatusChange = vi.fn();
    const { container } = base({ onStatusChange });
    const switches = [...container.querySelectorAll('[role="switch"]')];
    (switches[2] as HTMLElement).click();
    expect(onStatusChange).not.toHaveBeenCalled();
  });

  it('自定义项开关 custom=true', async () => {
    const onStatusChange = vi.fn();
    const { container } = base({ onStatusChange });
    await switchToCustom(container);
    // CUSTOM 模式只有一项自定义工具，故取第 0 个开关。
    const switches = [...container.querySelectorAll('[role="switch"]')];
    (switches[0] as HTMLElement).click();
    expect(onStatusChange.mock.calls[0]?.[1]).toBe(true);
  });

  it('配置按钮触发 onConfigureClick(e, option)', () => {
    const onConfigureClick = vi.fn();
    const { container } = base({ onConfigureClick });
    const btn = container.querySelector(
      '[aria-label="Configure File System"]',
    ) as HTMLElement;
    btn.click();
    expect(onConfigureClick).toHaveBeenCalledTimes(1);
    expect(onConfigureClick.mock.calls[0]?.[1]?.value).toBe('fs');
  });

  it('编辑按钮触发 onEditClick(e, option)', async () => {
    const onEditClick = vi.fn();
    const { container } = base({ onEditClick });
    await switchToCustom(container);
    const btn = container.querySelector('[aria-label="Edit My Tool"]') as HTMLElement;
    btn.click();
    expect(onEditClick).toHaveBeenCalledTimes(1);
    expect(onEditClick.mock.calls[0]?.[1]?.value).toBe('my');
  });
});

describe('SideBarMCPConfigure — 空态', () => {
  // 对齐 Semi renderSearch 的 else 分支：CUSTOM 模式且一条自定义都没有时，
  // 整块换成空态 + 新增按钮，此时连搜索框都不渲染。
  it('CUSTOM 模式无自定义项：空态文案 + 新增按钮，且不渲染搜索框', async () => {
    const onAddClick = vi.fn();
    const { container } = renderWithLocale(MC, {
      props: { visible: true, options: OPTIONS, customOptions: [], onAddClick },
    });
    await switchToCustom(container);
    const empty = container.querySelector(
      '.cd-sidebar-mcp-configure-content-custom-empty',
    );
    expect(empty).not.toBeNull();
    // 文案对齐 Semi emptyCustomMcpInfo。
    expect(container.textContent).toContain('No custom MCP yet');
    // 空态时不渲染搜索区。
    expect(container.querySelector('.cd-sidebar-mcp-configure-content-search')).toBeNull();
    (empty!.querySelector('button') as HTMLElement).click();
    expect(onAddClick).toHaveBeenCalledTimes(1);
  });
});
