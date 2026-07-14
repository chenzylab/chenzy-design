// Notification a11y：命令式单例 API（notification.open）经惰性挂载容器渲染。
// 这里直接渲染纯展示的 NotificationItem（接收一个完整 item），断言静态 ARIA（对齐 Semi）：
//  - role=alert（所有类型统一，对齐 Semi notice.tsx）。
//  - title 经 useId 关联 aria-labelledby。
//  - 关闭按钮为 IconButton，带可访问名（来自 locale）。
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
    duration: 3,
    position: 'topRight',
    showClose: true,
    theme: 'normal',
    icon: undefined,
    zIndex: undefined,
    direction: 'ltr',
    onClick: undefined,
    onClose: undefined,
    onCloseClick: undefined,
    ...overrides,
  };
}

describe('Notification a11y', () => {
  it('success：role=alert + aria-labelledby 关联标题，无 axe violations', async () => {
    const { container } = renderWithLocale(NotificationItem, {
      props: { item: makeItem(), onClose: noop, onPause: noop, onResume: noop },
    });
    const card = container.querySelector('.cd-notification-notice');
    expect(card?.getAttribute('role')).toBe('alert');
    const labelledby = card?.getAttribute('aria-labelledby');
    expect(labelledby ? container.querySelector(`#${labelledby}`)?.textContent : '').toContain('Saved');
    // 关闭按钮（IconButton）可访问名来自 locale。
    const close = container.querySelector('.cd-notification-notice-icon-close');
    expect(close?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('error：role=alert，内容与标题正常渲染，无 axe violations', async () => {
    const { container } = renderWithLocale(NotificationItem, {
      props: {
        item: makeItem({ type: 'error', title: 'Upload failed', content: 'Try again.' }),
        onClose: noop,
        onPause: noop,
        onResume: noop,
      },
    });
    const card = container.querySelector('.cd-notification-notice');
    expect(card?.getAttribute('role')).toBe('alert');
    expect(container.querySelector('.cd-notification-notice-title')?.textContent).toContain('Upload failed');
    expect(container.querySelector('.cd-notification-notice-content')?.textContent).toContain('Try again');
    await expectNoAxeViolations(container);
  });

  it('theme=light：多色填充 class 生效，无 axe violations', async () => {
    const { container } = renderWithLocale(NotificationItem, {
      props: {
        item: makeItem({ type: 'warning', theme: 'light' }),
        onClose: noop,
        onPause: noop,
        onResume: noop,
      },
    });
    const card = container.querySelector('.cd-notification-notice');
    expect(card?.classList.contains('cd-notification-notice-light')).toBe(true);
    expect(card?.classList.contains('cd-notification-notice-warning')).toBe(true);
    await expectNoAxeViolations(container);
  });
});
