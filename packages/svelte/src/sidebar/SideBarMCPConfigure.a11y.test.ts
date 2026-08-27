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

/**
 * 对齐 Semi updateShowOptions 的 lodash throttle(300)：组件挂载首次运行的
 * $effect 已经占用节流的「首次立即执行」名额，之后 300ms 内的输入/切模式变化
 * 要等节流窗口过去才会反映到 showOptions。测试里等够时长再断言。
 */
function flushThrottle(): Promise<void> {
  return new Promise((r) => setTimeout(r, 320));
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
    await flushThrottle();
    expect(labelsOf(container)).toEqual(['My Tool']);
    // CUSTOM 且已有自定义项 → 搜索区里多一个新增按钮。
    const searchArea = container.querySelector(
      '.cd-sidebar-mcp-configure-content-search-container',
    )!;
    expect(searchArea.querySelector('button')).not.toBeNull();
  });

  it('切模式保留搜索词，沿用它过滤新模式源列表（对齐 Semi handleModeChange 不清空 inputValue）', async () => {
    const { container } = base();
    const input = container.querySelector('input[type="text"], input:not([type])') as HTMLInputElement;
    await fireEvent.input(input, { target: { value: 'git' } });
    await flushThrottle();
    expect(labelsOf(container)).toEqual(['Git']);
    await switchToCustom(container);
    await flushThrottle();
    // 搜索词未清空 → 'git' 过滤 CUSTOM 源列表（仅 'My Tool'）不匹配，结果为空。
    expect(labelsOf(container)).toEqual([]);
  });

  // 对齐 Semi `{locale.activeMCPNumber} {n}/{总数}`：文案不含占位符，计数拼在后面。
  it('计数显示「已激活 MCP 数: n/总数」（en_US: "Number of activated MCPs: 2/4"）', () => {
    const { container } = base();
    expect(container.querySelector('.cd-sidebar-mcp-configure-content-header-count')?.textContent).toBe(
      'Number of activated MCPs: 2/4',
    );
  });

  // 对齐 Semi renderStatusButton：Button(theme=active?light:solid type=primary +
  // IconMinus/IconPlus)，非开关组件。激活态用 theme=light（cd-button-light）表达，
  // 未激活态用 theme=solid（cd-button-solid）表达。
  it('每项启用按钮 theme 反映 active（light=已启用/solid=未启用）', () => {
    const { container } = base();
    const buttons = [
      ...container.querySelectorAll('[aria-label^="Enable "]'),
    ] as HTMLButtonElement[];
    // INNER 模式只渲染 3 个内置项（自定义那份要切模式才可见）。
    expect(buttons.length).toBe(3);
    // File System active → light。
    expect(buttons[0]?.classList.contains('cd-button-light')).toBe(true);
    // Git inactive → solid。
    expect(buttons[1]?.classList.contains('cd-button-solid')).toBe(true);
  });

  it('disabled 预设项启用按钮被禁用（不可切换）', () => {
    const { container } = base();
    const buttons = [
      ...container.querySelectorAll('[aria-label^="Enable "]'),
    ] as HTMLButtonElement[];
    // preset 项（第 3 个）disabled。
    expect(buttons[2]?.disabled).toBe(true);
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
    await flushThrottle();
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
    await flushThrottle();
    const labels = [...container.querySelectorAll('.cd-sidebar-mcp-configure-content-item-content-label')].map(
      (n) => n.textContent,
    );
    expect(labels).toEqual(['Git']);
  });

  it('无匹配时列表为空，不渲染任何提示文案（对齐 Semi renderContent：空数组即空列表）', async () => {
    const { container } = base();
    const input = container.querySelector(
      '.cd-sidebar-mcp-configure-content-search input',
    ) as HTMLInputElement;
    input.value = 'zzz-none';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flushThrottle();
    expect(
      container.querySelectorAll('.cd-sidebar-mcp-configure-content-item').length,
    ).toBe(0);
    expect(container.querySelector('.cd-sidebar-mcp-empty')).toBeNull();
  });
});

describe('SideBarMCPConfigure — 交互回调（受控不回写）', () => {
  it('点击启用按钮触发 onStatusChange(下一份数组, custom=false)，不回写 prop', () => {
    const onStatusChange = vi.fn();
    const { container } = base({ onStatusChange });
    const buttons = [
      ...container.querySelectorAll('[aria-label^="Enable "]'),
    ] as HTMLButtonElement[];
    // 点 Git（第 2 个，当前 false）。
    buttons[1]!.click();
    expect(onStatusChange).toHaveBeenCalledTimes(1);
    const [nextList, custom] = onStatusChange.mock.calls[0] ?? [];
    expect(custom).toBe(false);
    expect(nextList.find((o: SideBarMCPOption) => o.value === 'git')?.active).toBe(true);
    // 受控不回写：原选项 active 仍 false，DOM theme 未变（仍 solid）。
    const stillButtons = [
      ...container.querySelectorAll('[aria-label^="Enable "]'),
    ] as HTMLButtonElement[];
    expect(stillButtons[1]?.classList.contains('cd-button-solid')).toBe(true);
  });

  it('disabled 项启用按钮点击不触发 onStatusChange', () => {
    const onStatusChange = vi.fn();
    const { container } = base({ onStatusChange });
    const buttons = [
      ...container.querySelectorAll('[aria-label^="Enable "]'),
    ] as HTMLButtonElement[];
    buttons[2]!.click();
    expect(onStatusChange).not.toHaveBeenCalled();
  });

  it('自定义项启用按钮 custom=true', async () => {
    const onStatusChange = vi.fn();
    const { container } = base({ onStatusChange });
    await switchToCustom(container);
    await flushThrottle();
    // CUSTOM 模式只有一项自定义工具，故取第 0 个启用按钮。
    const buttons = [
      ...container.querySelectorAll('[aria-label^="Enable "]'),
    ] as HTMLButtonElement[];
    buttons[0]!.click();
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
    await flushThrottle();
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
