// Toast a11y：严格对齐 Semi（卡片 role=alert，无独立 live region）。
// Semi 的播报模型：每张 toast 卡片自身 role=alert + aria-label="{type} type"，屏幕阅读器
// 直接播报卡片内容（对齐 semi-ui/toast/toast.tsx）。关闭按钮 IconButton 带 locale 可访问名。
// jsdom 只断言静态 ARIA + axe。
import { describe, it, expect } from 'vitest';
import type { Component } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import ToastItemRaw from './ToastItem.svelte';
import type { ToastItem as ToastItemData } from '@chenzy-design/core';

// ToastItem 有必填 props（toast/onClose/...）；测试帮手用宽松 Record 构造器签名，
// 故在此把组件转为宽松类型（props 实际值在调用处提供，运行时安全）。
const ToastItem = ToastItemRaw as unknown as Component<Record<string, unknown>>;

const noop = () => {};

function makeToast(overrides: Partial<ToastItemData> = {}): ToastItemData {
  return {
    id: 't1',
    content: 'Copied to clipboard',
    type: 'success',
    duration: 3,
    showClose: true,
    textMaxWidth: 450,
    theme: 'normal',
    stack: false,
    direction: 'ltr',
    onClose: undefined,
    icon: undefined,
    ...overrides,
  };
}

describe('Toast a11y', () => {
  it('ToastItem 卡片：role=alert + aria-label + 关闭按钮 locale 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(ToastItem, {
      props: { toast: makeToast(), onClose: noop, onPause: noop, onResume: noop },
    });
    const card = container.querySelector('.cd-toast');
    expect(card?.getAttribute('role')).toBe('alert');
    expect(card?.getAttribute('aria-label')).toBe('success type');
    expect(
      container.querySelector('.cd-toast-close-button button')?.getAttribute('aria-label'),
    ).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('default 类型：aria-label="default type"，无内置图标', async () => {
    const { container } = renderWithLocale(ToastItem, {
      props: { toast: makeToast({ type: 'default' }), onClose: noop, onPause: noop, onResume: noop },
    });
    const card = container.querySelector('.cd-toast');
    expect(card?.getAttribute('aria-label')).toBe('default type');
    expect(container.querySelector('.cd-toast-icon')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('light 主题：卡片带 cd-toast-light class', async () => {
    const { container } = renderWithLocale(ToastItem, {
      props: {
        toast: makeToast({ type: 'warning', theme: 'light' }),
        onClose: noop,
        onPause: noop,
        onResume: noop,
      },
    });
    const card = container.querySelector('.cd-toast');
    expect(card?.classList.contains('cd-toast-light')).toBe(true);
    expect(card?.classList.contains('cd-toast-warning')).toBe(true);
    await expectNoAxeViolations(container);
  });
});
