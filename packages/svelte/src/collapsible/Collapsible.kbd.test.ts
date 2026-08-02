// Collapsible 真实浏览器行为测试（browser project / 真实 chromium）。
//
// 为什么必须放这里：Collapsible 靠测量内容高度撑开 wrapper。
//   - jsdom 无布局，量不到真实高度；
//   - CDP 后台标签（document.hidden=true）下浏览器**冻结 ResizeObserver 投递**，
//     wrapper 高度恒 0、transitionend 不触发（收起也不卸载），真机联调判不了真
//     —— 判真法是同页挂裸 ResizeObserver 探针，实测同样 fired=0。
// 故把「展开真的撑开、收起真的归零并卸载」钉在标签可见的 browser project 里。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import CollapsibleKbdFixture from './CollapsibleKbdFixture.svelte';

describe('Collapsible 真实布局行为', () => {
  it('点击 Toggle：wrapper 由 0 撑开到内容高度，再点归零并卸载内容', async () => {
    renderKbdFixture(CollapsibleKbdFixture);

    const wrapper = document.querySelector('.cd-collapsible-wrapper') as HTMLElement;
    expect(wrapper).not.toBeNull();
    // 初始折叠：高度 0、内容未渲染（keepDOM 默认 false）
    expect(wrapper.getBoundingClientRect().height).toBe(0);
    expect(document.querySelector('[data-testid="content"]')).toBeNull();

    const toggle = document.querySelector('[data-testid="toggle"]') as HTMLElement;
    await userEvent.click(toggle);

    // 展开：内容渲染且 wrapper 被真实撑开到内容高度（120px）
    await expect
      .poll(() => document.querySelector('[data-testid="content"]') !== null)
      .toBe(true);
    await expect.poll(() => Math.round(wrapper.getBoundingClientRect().height)).toBe(120);

    await userEvent.click(toggle);

    // 收起：高度归零，且过渡结束后内容被卸载
    await expect.poll(() => Math.round(wrapper.getBoundingClientRect().height)).toBe(0);
    await expect
      .poll(() => document.querySelector('[data-testid="content"]') === null)
      .toBe(true);
  });
});
