// Feedback a11y + 行为（jsdom/dom project）：
//  - 外壳 role=dialog（modal→Modal / popup→SideSheet），axe 0 violations。
//  - type 五种渲染分发（text/emoji/radio/checkbox/custom）。
//  - emoji 评分严格对齐 Semi：裸 span，无 role/tabindex/aria-label，键盘不可达（Semi 官方无障碍缺口，
//    真机核实 semi.design 亦如此，本库不自造键盘增强），点击触发 onValueChange。
//  - 选中 😞(bad) 时额外出可选 TextArea；提交 onOk 异步时 popup 按钮 loading。
import { describe, it, expect, vi } from 'vitest';
import { flushSync, tick, createRawSnippet } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Feedback from './Feedback.svelte';

describe('Feedback a11y', () => {
  it('mode=modal + emoji：外壳 role=dialog、emoji 为 3 档裸 span，无 axe violations', async () => {
    renderWithLocale(Feedback, {
      props: { visible: true, mode: 'modal', type: 'emoji', title: 'Feedback' },
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');

    // 对齐 Semi：3 档 emoji（😞😐😃），裸 span，无 role/tabindex（键盘不可达，对齐 Semi 原样）。
    const items = document.querySelectorAll('.cd-feedback-emoji-item');
    expect(items.length).toBe(3);
    expect((items[0] as HTMLElement).dataset.value).toBe('😞');
    expect(items[0]!.getAttribute('role')).toBeNull();
    expect(items[0]!.getAttribute('tabindex')).toBeNull();

    await expectNoAxeViolations(document.body);
  });

  it('mode=popup + text：外壳 role=dialog（SideSheet），渲染 textarea，无 axe violations', async () => {
    renderWithLocale(Feedback, {
      props: { visible: true, mode: 'popup', type: 'text', title: 'Feedback' },
    });
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog).not.toBeNull();
    expect(document.querySelector('textarea')).not.toBeNull();
    await expectNoAxeViolations(document.body);
  });

  it('type=radio：radioGroupProps.options 渲染单选（RadioGroup），无 axe violations', async () => {
    renderWithLocale(Feedback, {
      props: {
        visible: true,
        type: 'radio',
        title: 'Reason',
        radioGroupProps: {
          options: [
            { label: 'Slow', value: 'slow' },
            { label: 'Buggy', value: 'buggy' },
          ],
        },
      },
    });
    const radios = document.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBe(2);
    // 对齐 Semi DOM：容器 .cd-feedback-radio-container。
    expect(document.querySelector('.cd-feedback-radio-container')).not.toBeNull();
    await expectNoAxeViolations(document.body);
  });

  it('type=checkbox：checkboxGroupProps.options 渲染多选（CheckboxGroup），无 axe violations', async () => {
    renderWithLocale(Feedback, {
      props: {
        visible: true,
        type: 'checkbox',
        title: 'Tags',
        checkboxGroupProps: {
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        },
      },
    });
    const boxes = document.querySelectorAll('input[type="checkbox"]');
    expect(boxes.length).toBe(2);
    expect(document.querySelector('.cd-feedback-checkbox-container')).not.toBeNull();
    await expectNoAxeViolations(document.body);
  });

  it('emoji 点击：触发 onValueChange 归一化为 EmojiResult，选中项加 -selected', async () => {
    const onValueChange = vi.fn();
    renderWithLocale(Feedback, {
      props: { visible: true, type: 'emoji', title: 'F', onValueChange },
    });
    const items = document.querySelectorAll('.cd-feedback-emoji-item');
    (items[2] as HTMLElement).click();
    flushSync();
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]![0]).toEqual({ emoji: '😃' });
    // 选中项拿到 -selected 类（filter:none 去灰）。
    expect((items[2] as HTMLElement).classList.contains('cd-feedback-emoji-item-selected')).toBe(true);
  });

  it('emoji 选 😞(bad)：额外出可选 TextArea', async () => {
    renderWithLocale(Feedback, {
      props: { visible: true, type: 'emoji', title: 'F' },
    });
    // 初始无 textarea。
    expect(document.querySelector('textarea')).toBeNull();
    const items = document.querySelectorAll('.cd-feedback-emoji-item');
    (items[0] as HTMLElement).click(); // 😞
    flushSync();
    expect(document.querySelector('textarea')).not.toBeNull();
  });

  it('onOk 异步：popup 提交按钮 await 期间 loading', async () => {
    let resolveOk: () => void = () => {};
    const onOk = vi.fn(() => new Promise<void>((r) => { resolveOk = r; }));
    renderWithLocale(Feedback, {
      props: { visible: true, mode: 'popup', type: 'text', title: 'F', onOk },
    });
    // 先输入使提交可用。
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'x';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
    // footer 内第二个按钮为提交（primary solid）。
    const buttons = Array.from(document.querySelectorAll('.cd-feedback-footer button')) as HTMLButtonElement[];
    const submit = buttons[1]!;
    submit.click();
    flushSync();
    await tick();
    expect(submit.className).toContain('loading');
    resolveOk();
    await tick();
    flushSync();
    expect(submit.className).not.toContain('loading');
  });

  it('mode=popup + footer=null（对齐 Semi 反馈完成态）：隐藏默认底部按钮而非回退默认 footer', async () => {
    renderWithLocale(Feedback, {
      props: { visible: true, mode: 'popup', type: 'custom', title: ' ', footer: null },
    });
    // footer=null 须与「未传（undefined）」区分：undefined 才回退默认取消/提交按钮。
    expect(document.querySelector('.cd-sidesheet-footer')).toBeNull();
  });

  it('mode=modal + 传 okButtonProps（不含 disabled）：整体替换内置禁用值（对齐 Semi 展开顺序）', async () => {
    renderWithLocale(Feedback, {
      props: {
        visible: true,
        mode: 'modal',
        type: 'emoji',
        title: 'F',
        okButtonProps: { 'data-testid': 'ok-btn' },
      },
    });
    // Semi: okButtonProps={{disabled}} 在前、{...restProps} 在后，用户传 okButtonProps 时整体覆盖，
    // 即使不含 disabled 字段也会丢失内置禁用逻辑（未选 emoji 本应禁用，此处应变为不禁用）。
    const submit = document.querySelector('[data-testid="ok-btn"]') as HTMLButtonElement | null;
    expect(submit).not.toBeNull();
    expect(submit?.disabled).toBe(false);
  });

  it('type=custom：children 渲染自定义内容', async () => {
    renderWithLocale(Feedback, {
      props: {
        visible: true,
        type: 'custom',
        title: 'F',
        children: createRawSnippet(() => ({
          render: () => `<div data-testid="custom">custom</div>`,
        })),
      },
    });
    expect(document.querySelector('[data-testid="custom"]')).not.toBeNull();
  });
});
