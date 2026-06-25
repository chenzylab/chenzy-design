// Notification a11y：命令式单例 API（notification.open）经惰性挂载容器渲染。
// 这里直接渲染纯展示的 NotificationItem（接收一个完整 item），断言静态 ARIA：
//  - error/warning → role=alert + aria-live=assertive；其余 → role=status + aria-live=polite。
//  - title/content 经 useId 关联 aria-labelledby / aria-describedby。
//  - 视觉隐藏类型前缀（如「Error:」）令屏幕阅读器先播报极性语义。
// jsdom 只断言静态 ARIA + axe（定时器 / hover 暂停留给真实浏览器）。
import { describe, it, expect } from 'vitest';
import type { Component } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import NotificationItemRaw from './NotificationItem.svelte';
import type { NotificationItem as NotificationItemData } from '@chenzy-design/core';

// NotificationItem 有必填 props（item/onClose/...）；测试帮手用宽松 Record 构造器签名，
// 故在此把组件转为宽松类型（props 实际值在调用处提供，运行时安全）。
const NotificationItem = NotificationItemRaw as unknown as Component<Record<string, unknown>>;

const noop = () => {};

function makeItem(overrides: Partial<NotificationItemData> = {}): NotificationItemData {
  return {
    id: 'n1',
    title: 'Saved',
    content: 'Your changes were saved.',
    type: 'success',
    duration: 4.5,
    placement: 'topRight',
    closable: true,
    pauseOnHover: true,
    showProgress: false,
    theme: 'light',
    direction: 'ltr',
    footer: undefined,
    onClose: undefined,
    ...overrides,
  };
}

describe('Notification a11y', () => {
  it('success：role=status + aria-live=polite + aria-labelledby/describedby，无 axe violations', async () => {
    const { container } = renderWithLocale(NotificationItem, {
      props: { item: makeItem(), onClose: noop, onPause: noop, onResume: noop },
    });
    const card = container.querySelector('.cd-notification-item');
    expect(card?.getAttribute('role')).toBe('status');
    expect(card?.getAttribute('aria-live')).toBe('polite');
    const labelledby = card?.getAttribute('aria-labelledby');
    const describedby = card?.getAttribute('aria-describedby');
    expect(labelledby ? container.querySelector(`#${labelledby}`)?.textContent : '').toContain('Saved');
    expect(
      describedby ? container.querySelector(`#${describedby}`)?.textContent : '',
    ).toContain('changes');
    // 关闭按钮可访问名来自 locale。
    expect(container.querySelector('.cd-notification-item__close')?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('error：role=alert + aria-live=assertive + 视觉隐藏类型前缀，无 axe violations', async () => {
    const { container } = renderWithLocale(NotificationItem, {
      props: {
        item: makeItem({ type: 'error', title: 'Upload failed', content: 'Try again.' }),
        onClose: noop,
        onPause: noop,
        onResume: noop,
      },
    });
    const card = container.querySelector('.cd-notification-item');
    expect(card?.getAttribute('role')).toBe('alert');
    expect(card?.getAttribute('aria-live')).toBe('assertive');
    // 类型前缀（如「Error:」）以视觉隐藏文本注入，非空。
    expect(container.querySelector('.cd-sr-only')?.textContent?.trim()).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
