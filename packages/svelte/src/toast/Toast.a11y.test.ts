// Toast a11y：命令式单例 API（Toast.info 等）经惰性挂载容器渲染。
// Toast 的播报模型与多数库不同：卡片本身 role=presentation + aria-live=off（不充当 live
// region），所有文案播报统一走单例 live region（live-region.ts），避免每卡各自 region 的
// 重复/竞争。故拆两部分测：
//  1) ToastItem 纯展示卡片：role=presentation + aria-live=off，关闭按钮 locale 可访问名，axe 0。
//  2) live region：announce() 命令式写入 body 内 role=status（polite）/ role=alert（assertive）节点。
// jsdom 只断言静态 ARIA + axe。
import { describe, it, expect, afterEach } from 'vitest';
import type { Component } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import ToastItemRaw from './ToastItem.svelte';
import { announce, __resetLiveRegion } from './live-region.js';
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
    position: 'top',
    closable: true,
    pauseOnHover: true,
    theme: 'light',
    onClose: undefined,
    ...overrides,
  };
}

describe('Toast a11y', () => {
  afterEach(() => {
    __resetLiveRegion();
  });

  it('ToastItem 卡片：role=presentation + aria-live=off + 关闭按钮 locale 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(ToastItem, {
      props: { toast: makeToast(), onClose: noop, onPause: noop, onResume: noop },
    });
    const card = container.querySelector('.cd-toast-item');
    expect(card?.getAttribute('role')).toBe('presentation');
    expect(card?.getAttribute('aria-live')).toBe('off');
    expect(container.querySelector('.cd-toast-item__close')?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('live region：polite 文案写入 role=status / aria-live=polite 节点', async () => {
    announce('Saved', 'success');
    const polite = document.querySelector('.cd-toast-live-region[aria-live="polite"]');
    expect(polite?.getAttribute('role')).toBe('status');
    expect(polite?.textContent).toBe('Saved');
    await expectNoAxeViolations(document.body);
  });

  it('live region：error 文案写入 role=alert / aria-live=assertive 节点', async () => {
    announce('Failed', 'error');
    const assertive = document.querySelector('.cd-toast-live-region[aria-live="assertive"]');
    expect(assertive?.getAttribute('role')).toBe('alert');
    expect(assertive?.textContent).toBe('Failed');
    await expectNoAxeViolations(document.body);
  });
});
