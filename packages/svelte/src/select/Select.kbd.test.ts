// Select 键盘 e2e（browser project / 真实 chromium），浮层方向键导航。
// Select 高亮走 aria-activedescendant 模式：焦点始终留在 role=combobox 触发器上
// （options tabindex=-1，从不真实聚焦），"高亮项"由触发器的 aria-activedescendant
// 指向的 option id 表达。故断言 activedescendant 指向的 option id 变化，而非 toHaveFocus。
// 浮层经 use:floating portal 到 document.body —— 在 document 范围查 listbox。
//   1. 打开后 ↓ 高亮首项（opt-0），再 ↓ 移到 opt-1；↑ 回到 opt-0。
//   2. Home/End 跳列表首/末。
//   3. Enter 选中当前高亮项（onChange 写入夹具 output）。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import SelectKbdFixture from './SelectKbdFixture.svelte';
import SelectSizeKbdFixture from './SelectSizeKbdFixture.svelte';
import SelectControlledKbdFixture from './SelectControlledKbdFixture.svelte';
import SelectDemo03RepoFixture from './SelectDemo03RepoFixture.svelte';

describe('Select 键盘 e2e（aria-activedescendant 浮层导航）', () => {
  it('打开后 ↑↓ 移高亮 + Home/End 首末 + Enter 选中', async () => {
    renderKbdFixture(SelectKbdFixture);

    const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
    expect(combobox).not.toBeNull();

    // 点击触发器打开浮层（焦点留在 combobox）。
    await userEvent.click(combobox);
    const listbox = document.querySelector('[role="listbox"]') as HTMLElement;
    expect(listbox).not.toBeNull();
    const listId = listbox.id;
    expect(listId).toBeTruthy();

    const options = Array.from(
      listbox.querySelectorAll<HTMLElement>('[role="option"]'),
    );
    expect(options.length).toBe(3);

    // 焦点在 combobox 上，options 不可真实聚焦（tabindex=-1）。
    expect(options.every((o) => o.tabIndex === -1)).toBe(true);

    // 1. ↓ 高亮首项（activeIndex -1 → 0），aria-activedescendant 指向 opt-0。
    await userEvent.keyboard('{ArrowDown}');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(`${listId}-opt-0`);
    expect(options[0]!.classList.contains('cd-select-option-active')).toBe(true);

    // 再 ↓ 移到 opt-1。
    await userEvent.keyboard('{ArrowDown}');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(`${listId}-opt-1`);

    // ↑ 回到 opt-0。
    await userEvent.keyboard('{ArrowUp}');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(`${listId}-opt-0`);

    // 2. End 跳末项（opt-2）；Home 回首项（opt-0）。
    await userEvent.keyboard('{End}');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(`${listId}-opt-2`);
    await userEvent.keyboard('{Home}');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(`${listId}-opt-0`);

    // 3. Enter 选中当前高亮项（opt-0 = Apple），onChange 写入夹具 output。
    await userEvent.keyboard('{Enter}');
    const out = document.querySelector('[data-testid="value"]') as HTMLElement;
    expect(out.textContent).toBe(JSON.stringify('apple'));
  });

  // 尺寸回归（真实 chromium 才有布局，jsdom 量不到）：三档高度对齐 Semi 官网实测值
  // small 24 / default 32 / large 40。历史 bug：小尺寸只写 min-block-size，
  // 被继承的 24.5px 行高顶穿成 26.5px（ColorPicker 的 dataPart 因此比 Semi 高 4px）。
  it('三档尺寸高度对齐 Semi（small 24 / default 32 / large 40）', async () => {
    renderKbdFixture(SelectSizeKbdFixture);

    const heightOf = (testid: string) => {
      const host = document.querySelector(`[data-testid="${testid}"]`) as HTMLElement;
      const trigger = host.querySelector('.cd-select-trigger') as HTMLElement;
      return Math.round(trigger.getBoundingClientRect().height);
    };

    expect(heightOf('small')).toBe(24);
    expect(heightOf('default')).toBe(32);
    expect(heightOf('large')).toBe(40);
  });

  // 受控 Select（value + onChange，无 bind:）在真实点击下的闭环。
  // 背景：docs 的 localeprovider demo03「切换语言」就是这个写法，真机排查时一度以为它坏了；
  // 实为 CDP 标签 document.hidden=true 导致合成点击根本没投递（裸按钮同样收不到事件），
  // 非组件问题。此用例把该组合钉在 browser project（真实 chromium、标签可见）里防回归。
  it('受控 value + onChange：真实点击选项后受控值被驱动更新', async () => {
    renderKbdFixture(SelectControlledKbdFixture);

    const out = document.querySelector('[data-testid="value"]') as HTMLElement;
    expect(out.textContent).toBe('zh_CN');

    const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
    await userEvent.click(combobox);

    const options = [...document.querySelectorAll('[role="option"]')] as HTMLElement[];
    const en = options.find((o) => o.textContent?.includes('英语'))!;
    expect(en).toBeTruthy();
    await userEvent.click(en);

    expect(out.textContent).toBe('en_US');
  });

  // demo03 的真实拓扑：Select 在 LocaleProvider **外面**，Provider 包着消费语言包的子树。
  // 上一个用例的夹具是简化版（Select 在 Provider 内、子树只有一个 output），
  // 不足以证明真实拓扑没问题，故这里按 demo03 原样复刻并断言子树文案真的跟着切。
  it('demo03 拓扑（Select 在 Provider 外）：切换后受控值与子树文案同步更新', async () => {
    renderKbdFixture(SelectDemo03RepoFixture);

    const code = document.querySelector('[data-testid="code"]') as HTMLElement;
    expect(code.textContent).toBe('zh_CN');
    // 中文语言包下 Pagination 的 showTotal 文案
    expect(document.body.textContent).toContain('共');

    const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
    await userEvent.click(combobox);
    const en = [...document.querySelectorAll('[role="option"]')].find((o) =>
      o.textContent?.includes('英语'),
    ) as HTMLElement;
    await userEvent.click(en);

    expect(code.textContent).toBe('en_US');
    // 切到英文后 Pagination 文案应变成英文（证明 Provider 子树真的重渲染）
    expect(document.body.textContent).toContain('pages in total');
  });

  // prefix 传字符串（对齐 Semi ReactNode）时正常渲染，不影响触发器点击。
  it('prefix 传字符串：渲染在 .cd-select-prefix 内且触发器仍可打开浮层', async () => {
    renderKbdFixture(SelectControlledKbdFixture);
    expect(document.querySelector('.cd-select-prefix')?.textContent?.trim()).toBe('切换语言');

    const combobox = document.querySelector('[role="combobox"]') as HTMLElement;
    await userEvent.click(combobox);
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
  });
});
