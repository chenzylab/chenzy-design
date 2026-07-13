// List a11y：原生 ul/li 列表语义（对齐 Semi List DOM 结构）。
// cd-list-items(ul) > cd-list-item(li)；header/footer/empty 结构；无 axe violations。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import ListFixture from './ListA11yFixture.svelte';

describe('List a11y', () => {
  it('默认渲染：ul.cd-list-items > li.cd-list-item，无 axe violations', async () => {
    const { container } = renderWithLocale(ListFixture, {
      props: { bordered: true, header: 'Users', footer: 'End' },
    });
    const ul = container.querySelector('ul.cd-list-items');
    expect(ul).not.toBeNull();
    // 原生 list 语义：不设显式 role。
    expect(ul?.getAttribute('role')).toBeNull();
    expect(container.querySelectorAll('li.cd-list-item').length).toBe(3);
    // header/footer 结构就位。
    expect(container.querySelector('.cd-list-header')?.textContent).toContain('Users');
    expect(container.querySelector('.cd-list-footer')?.textContent).toContain('End');
    await expectNoAxeViolations(container);
  });

  it('Item body 结构：main/extra 就位（对齐 Semi item DOM）', async () => {
    const { container } = renderWithLocale(ListFixture, { props: {} });
    const first = container.querySelector('li.cd-list-item');
    expect(first?.querySelector('.cd-list-item-body-main')?.textContent).toContain('Alan Turing');
    expect(first?.querySelector('.cd-list-item-extra')?.textContent).toContain('Mathematician');
    // body 默认 flex-start 对齐类。
    expect(container.querySelector('.cd-list-item-body-flex-start')).not.toBeNull();
  });

  it('空态：无数据渲染 cd-list-empty，无 axe violations', async () => {
    const { container } = renderWithLocale(ListFixture, { props: { empty: true } });
    const empty = container.querySelector('.cd-list-empty');
    expect(empty).not.toBeNull();
    expect(empty?.textContent?.trim()).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
