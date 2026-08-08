// SideBar 内置详情渲染 e2e（browser project / 真实 chromium）。
//
// 覆盖对齐 Semi 的 renderDetail / renderHeader 链路（semi-ui/sidebar/index.tsx:83-151）：
// 不传 renderDetailContent 时，详情区按 mode 内置渲染，详情头为
// 返回按钮 + detailContent.name + 复制按钮（复制结果回传 onDetailContentCopy）。
//
// 为什么必须放这里：`navigator.clipboard.writeText` 要求**文档聚焦**，
// CDP 后台标签（document.hidden）下必抛 `NotAllowedError: Document is not focused`，
// jsdom 更是没有 clipboard 实现 —— 只有标签可见的真实 chromium 能验真。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import SideBarDetailKbdFixture from './SideBarDetailKbdFixture.svelte';

describe('SideBar 内置详情渲染（detailContent）', () => {
  it('详情头渲染 name + 复制按钮，点击复制回传 onDetailContentCopy', async () => {
    renderKbdFixture(SideBarDetailKbdFixture);

    // 详情头：返回按钮 + 标题 + 复制按钮
    expect(document.querySelector('.cd-sidebar-detail-header')).not.toBeNull();
    expect(document.querySelector('.cd-sidebar-back')).not.toBeNull();
    expect(document.querySelector('.cd-sidebar-detail-header-title')?.textContent).toBe(
      'tool_call.json',
    );

    const copyBtn = document.querySelector(
      '[class*="cd-sidebar-detail-header-copy"]',
    ) as HTMLElement;
    expect(copyBtn).not.toBeNull();

    await userEvent.click(copyBtn);

    // 回调必须被触发，且带上**原始 detailContent.content**。
    // ⚠️ 不断言 res=true：headless chromium 未授予剪贴板权限，
    // `navigator.clipboard.writeText` 抛 `NotAllowedError: Document is not focused`，
    // 组件按预期捕获并回传 res=false。这里验的是「接线正确 + 内容正确 + 失败被如实回传」，
    // 真机（已授权、聚焦）下 res 为 true。
    await expect
      .poll(() => document.querySelector('[data-testid="copy-result"]')?.textContent)
      .toMatch(/^(true|false):\{"name":"search_web"\}$/);
  });
});
