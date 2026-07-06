// SideBarMcpConfigure 组件测（P3）：双列表渲染 / 搜索过滤 / 启用开关 role=switch /
// 动作按钮 i18n / 受控 onStatusChange 不回写 / 空态与无结果。
// 命名 *.a11y.test.ts → 落 dom(jsdom) vitest project（红线：*.test.ts 会落 node project 缺 DOM 崩溃）。
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import SideBarMcpConfigure from './SideBarMcpConfigure.svelte';
import type { SideBarMcpOption } from './types.js';

const MC = SideBarMcpConfigure as unknown as Parameters<typeof renderWithLocale>[0];

const OPTIONS: SideBarMcpOption[] = [
  { value: 'fs', label: 'File System', desc: '读写本地文件', active: true, configure: true },
  { value: 'git', label: 'Git', desc: '版本控制', active: false },
  { value: 'preset', label: 'Preset Search', active: true, disabled: true },
];

const CUSTOM: SideBarMcpOption[] = [
  { value: 'my', label: 'My Tool', active: false },
];

function base(props: Record<string, unknown> = {}) {
  return renderWithLocale(MC, {
    props: { visible: true, options: OPTIONS, customOptions: CUSTOM, ...props },
  });
}

describe('SideBarMcpConfigure — 渲染 / 双列表', () => {
  it('渲染内置 + 自定义两组列表，item 显示 label/desc', () => {
    const { container } = base();
    expect(container.querySelector('.cd-sidebar-mcp')).toBeTruthy();
    const labels = [...container.querySelectorAll('.cd-sidebar-mcp__label')].map(
      (n) => n.textContent,
    );
    expect(labels).toEqual(['File System', 'Git', 'Preset Search', 'My Tool']);
    const descs = [...container.querySelectorAll('.cd-sidebar-mcp__desc')].map(
      (n) => n.textContent,
    );
    expect(descs).toContain('读写本地文件');
  });

  it('计数显示已启用/总数（en_US: "2/4 enabled"）', () => {
    const { container } = base();
    expect(container.querySelector('.cd-sidebar-mcp__count')?.textContent).toBe(
      '2/4 enabled',
    );
  });

  it('每项启用开关为原生 role=switch + aria-checked 反映 active', () => {
    const { container } = base();
    const switches = [...container.querySelectorAll('[role="switch"]')];
    // 3 内置 + 1 自定义 = 4 个开关。
    expect(switches.length).toBe(4);
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

  it('configure=true 内置项显示配置按钮，自定义项显示编辑按钮', () => {
    const { container } = base();
    const configureBtn = container.querySelector(
      '[aria-label="Configure File System"]',
    );
    expect(configureBtn).toBeTruthy();
    const editBtn = container.querySelector('[aria-label="Edit My Tool"]');
    expect(editBtn).toBeTruthy();
  });

  it('搜索框有 aria-label（en_US mcpSearchLabel）', () => {
    const { container } = base();
    const input = container.querySelector('.cd-sidebar-mcp__search input');
    expect(input?.getAttribute('aria-label')).toBe('Search MCP tools');
  });
});

describe('SideBarMcpConfigure — 搜索过滤', () => {
  it('输入过滤两组列表（大小写不敏感，match label）', async () => {
    const { container } = base();
    const input = container.querySelector(
      '.cd-sidebar-mcp__search input',
    ) as HTMLInputElement;
    input.value = 'git';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await Promise.resolve();
    const labels = [...container.querySelectorAll('.cd-sidebar-mcp__label')].map(
      (n) => n.textContent,
    );
    expect(labels).toEqual(['Git']);
  });

  it('无匹配显示无结果提示（en_US mcpNoResult）', async () => {
    const { container } = base();
    const input = container.querySelector(
      '.cd-sidebar-mcp__search input',
    ) as HTMLInputElement;
    input.value = 'zzz-none';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await Promise.resolve();
    expect(container.textContent).toContain('No matching tools');
  });
});

describe('SideBarMcpConfigure — 交互回调（受控不回写）', () => {
  it('点击开关触发 onStatusChange(下一份数组, custom=false)，不回写 prop', () => {
    const onStatusChange = vi.fn();
    const { container } = base({ onStatusChange });
    const switches = [...container.querySelectorAll('[role="switch"]')];
    // 点 Git（第 2 个，当前 false）。
    (switches[1] as HTMLElement).click();
    expect(onStatusChange).toHaveBeenCalledTimes(1);
    const [nextList, custom] = onStatusChange.mock.calls[0] ?? [];
    expect(custom).toBe(false);
    expect(nextList.find((o: SideBarMcpOption) => o.value === 'git')?.active).toBe(true);
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

  it('自定义项开关 custom=true', () => {
    const onStatusChange = vi.fn();
    const { container } = base({ onStatusChange });
    const switches = [...container.querySelectorAll('[role="switch"]')];
    (switches[3] as HTMLElement).click();
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

  it('编辑按钮触发 onEditClick(e, option)', () => {
    const onEditClick = vi.fn();
    const { container } = base({ onEditClick });
    const btn = container.querySelector('[aria-label="Edit My Tool"]') as HTMLElement;
    btn.click();
    expect(onEditClick).toHaveBeenCalledTimes(1);
    expect(onEditClick.mock.calls[0]?.[1]?.value).toBe('my');
  });
});

describe('SideBarMcpConfigure — 空态', () => {
  it('自定义组为空显示添加按钮与空态文案（en_US mcpEmptyCustom）', () => {
    const onAddClick = vi.fn();
    const { container } = renderWithLocale(MC, {
      props: { visible: true, options: OPTIONS, customOptions: [], onAddClick },
    });
    expect(container.textContent).toContain('No custom tools yet');
    const cta = container.querySelector('.cd-sidebar-mcp__add-cta') as HTMLElement;
    expect(cta).toBeTruthy();
    cta.click();
    expect(onAddClick).toHaveBeenCalledTimes(1);
  });

  it('内置组为空显示空态文案（en_US mcpEmptyBuiltin）', () => {
    const { container } = renderWithLocale(MC, {
      props: { visible: true, options: [], customOptions: CUSTOM },
    });
    expect(container.textContent).toContain('No built-in tools');
  });
});
