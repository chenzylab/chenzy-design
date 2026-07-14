// Feedback a11y + 行为（jsdom/dom project）：
//  - 外壳 role=dialog（modal→Modal / popup→SideSheet），axe 0 violations。
//  - type 五种渲染分发（text/emoji/radio/checkbox/custom）。
//  - emoji 评分为裸 span（role=button，对齐 Semi，无 radiogroup/radio），点击触发 onValueChange。
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

    // 对齐 Semi：3 档 emoji（😞😐😃），裸 span（本库补 role=button 键盘可达）。
    const items = document.querySelectorAll('.cd-feedback-emoji-item');
    expect(items.length).toBe(3);
    expect((items[0] as HTMLElement).dataset.value).toBe('😞');

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
