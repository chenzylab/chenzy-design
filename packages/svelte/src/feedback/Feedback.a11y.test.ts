// Feedback a11y + 行为（jsdom/dom project）：
//  - 外壳 role=dialog（modal→Modal / popup→SideSheet），axe 0 violations。
//  - type 五种渲染分发（text/emoji/radio/checkbox/custom）。
//  - emoji 评分 role=radiogroup + 每 emoji role=radio + aria-label（i18n 语义）。
//  - emoji 选择触发 onValueChange，提交 onOk 异步时按钮 aria-busy。
// 注：真实焦点移动 / 方向键 roving 留给 *.kbd.test.ts（真浏览器）。
import { describe, it, expect, vi } from 'vitest';
import { flushSync, tick } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Feedback from './Feedback.svelte';

describe('Feedback a11y', () => {
  it('mode=modal + emoji：外壳 role=dialog、radiogroup + radio + i18n aria-label，无 axe violations', async () => {
    renderWithLocale(Feedback, {
      props: { open: true, mode: 'modal', type: 'emoji', title: 'Feedback' },
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');

    const group = document.querySelector('[role="radiogroup"]') as HTMLElement | null;
    expect(group).not.toBeNull();
    // 可访问名来自 en_US locale（Feedback.ratingLabel），非 key 原样。
    const groupLabel = group?.getAttribute('aria-label');
    expect(groupLabel).toBeTruthy();
    expect(groupLabel).not.toBe('Feedback.ratingLabel');

    const radios = document.querySelectorAll('[role="radio"]');
    expect(radios.length).toBe(5);
    const firstLabel = radios[0]?.getAttribute('aria-label');
    expect(firstLabel).toBeTruthy();
    expect(firstLabel).not.toContain('Feedback.emoji');

    await expectNoAxeViolations(document.body);
  });

  it('mode=popup：外壳 role=dialog（SideSheet），无 axe violations', async () => {
    renderWithLocale(Feedback, {
      props: { open: true, mode: 'popup', type: 'text', title: 'Feedback' },
    });
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog).not.toBeNull();
    // text 类型渲染 textarea
    expect(document.querySelector('textarea')).not.toBeNull();
    await expectNoAxeViolations(document.body);
  });

  it('type=radio：渲染 radiogroup（RadioGroup），无 axe violations', async () => {
    renderWithLocale(Feedback, {
      props: {
        open: true,
        type: 'radio',
        title: 'Reason',
        options: [
          { label: 'Slow', value: 'slow' },
          { label: 'Buggy', value: 'buggy' },
        ],
      },
    });
    const radios = document.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBe(2);
    await expectNoAxeViolations(document.body);
  });

  it('type=checkbox：渲染多选（CheckboxGroup），无 axe violations', async () => {
    renderWithLocale(Feedback, {
      props: {
        open: true,
        type: 'checkbox',
        title: 'Tags',
        value: ['a'],
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    });
    const boxes = document.querySelectorAll('input[type="checkbox"]');
    expect(boxes.length).toBe(2);
    await expectNoAxeViolations(document.body);
  });

  it('emoji 选择：点击触发 onValueChange 归一化为 EmojiResult', async () => {
    const onValueChange = vi.fn();
    renderWithLocale(Feedback, {
      props: { open: true, type: 'emoji', title: 'F', onValueChange },
    });
    const radios = document.querySelectorAll('[role="radio"]');
    (radios[4] as HTMLButtonElement).click();
    flushSync();
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const arg = onValueChange.mock.calls[0][0];
    expect(arg).toMatchObject({ emoji: expect.any(String) });
  });

  it('已选 emoji：aria-checked=true 且 roving tabindex=0', async () => {
    renderWithLocale(Feedback, {
      props: { open: true, type: 'emoji', title: 'F', value: { emoji: '😐' } },
    });
    const radios = Array.from(document.querySelectorAll('[role="radio"]'));
    const checked = radios.find((r) => r.getAttribute('aria-checked') === 'true');
    expect(checked).toBeTruthy();
    expect(checked?.getAttribute('tabindex')).toBe('0');
  });

  it('onOk 异步：提交按钮 aria-busy 在 await 期间为 true', async () => {
    let resolveOk: () => void = () => {};
    const onOk = vi.fn(() => new Promise<void>((r) => { resolveOk = r; }));
    renderWithLocale(Feedback, {
      props: { open: true, mode: 'popup', type: 'text', title: 'F', onOk },
    });
    const submit = document.querySelector('.cd-feedback__btn--primary') as HTMLButtonElement;
    expect(submit).not.toBeNull();
    submit.click();
    flushSync();
    await tick();
    expect(submit.getAttribute('aria-busy')).toBe('true');
    resolveOk();
    await tick();
    flushSync();
    expect(submit.getAttribute('aria-busy')).toBe('false');
  });

  it('type=custom：renderContent 渲染自定义内容', async () => {
    renderWithLocale(Feedback, {
      props: {
        open: true,
        type: 'custom',
        title: 'F',
        renderContent: createSnippet(),
      },
    });
    expect(document.querySelector('[data-testid="custom"]')).not.toBeNull();
  });
});

// 一个最小 Snippet：渲染带 data-testid 的节点。用 svelte 的 createRawSnippet。
import { createRawSnippet } from 'svelte';
function createSnippet() {
  return createRawSnippet(() => ({
    render: () => `<div data-testid="custom">custom</div>`,
  }));
}
