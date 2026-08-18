// Breadcrumb 键盘 e2e（browser project / 真实 chromium），折叠触发器就地展开。
// maxItemCount + 5 个路由 → 中间折叠为 … 触发器：role=button + tabindex=0 + aria-label
// （对齐 Semi handleCollapse），Enter 激活「就地展开全部项」（对齐 Semi handleExpand /
// handleExpandEnterPress，与 moreType 无关——moreType 只影响触发器内部渲染内容）。
//   1. 折叠触发器真实聚焦。
//   2. Enter 就地展开：折叠触发器消失，此前隐藏的中间项渲染出来。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import BreadcrumbKbdFixture from './BreadcrumbKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

describe('Breadcrumb 键盘 e2e（折叠触发器就地展开）', () => {
  it('Enter 就地展开全部项，折叠触发器消失', async () => {
    const { baseElement } = renderKbdFixture(BreadcrumbKbdFixture);

    const trigger = baseElement.querySelector('.cd-breadcrumb-item-more') as HTMLElement;
    expect(trigger).not.toBeNull();
    expect(trigger.getAttribute('role')).toBe('button');
    expect(trigger.getAttribute('tabindex')).toBe('0');
    expect(trigger.getAttribute('aria-label')).toBeTruthy();

    // 折叠态下，被折叠的中间项（Library/Data）不在 DOM 中。
    expect(baseElement.textContent).not.toContain('Library');

    // 1. 触发器真实聚焦（可达 tabindex=0）。
    trigger.focus();
    await expect.element(loc(trigger)).toHaveFocus();

    // 2. Enter 就地展开：触发器移除，隐藏项渲染出来。
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByText('Library')).toBeInTheDocument();
    expect(baseElement.querySelector('.cd-breadcrumb-item-more')).toBeNull();
  });
});
