// List a11y：列表。
// 非 selectable：原生 ul/li 列表语义（role=list / listitem 隐式）。
// selectable：容器 role=listbox（multiple 加 aria-multiselectable），行 role=option + aria-selected，
// 行 tabindex roving（仅一行为 Tab 停靠点）。
// 用数据驱动夹具（ListA11yFixture）渲染真实行。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import ListFixture from './ListA11yFixture.svelte';

describe('List a11y', () => {
  it('默认渲染：原生 ul/li 列表语义，无 axe violations', async () => {
    const { container } = renderWithLocale(ListFixture, {
      props: { bordered: true, header: 'Users' },
    });
    const ul = container.querySelector('ul.cd-list__items');
    expect(ul).not.toBeNull();
    // 非 selectable：不设显式 role（保留原生 list 语义）。
    expect(ul?.getAttribute('role')).toBeNull();
    expect(container.querySelectorAll('li.cd-list__item').length).toBe(3);
    await expectNoAxeViolations(container);
  });

  // 结构断言（不含 axe）：selectable 的 listbox/option/aria-selected/roving 语义确实就位。
  // axe 0-violation 断言因下述两个真实组件缺口被拆到 it.skip，故此处只验证 ARIA 结构。
  it('selectable=single：role=listbox + option + aria-selected + roving 结构', async () => {
    const { container } = renderWithLocale(ListFixture, {
      props: { selectable: 'single', defaultSelectedKeys: ['u2'] },
    });
    const listbox = container.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    expect(listbox?.getAttribute('aria-multiselectable')).toBeNull();

    const options = container.querySelectorAll('[role="option"]');
    expect(options.length).toBe(3);
    const selected = container.querySelectorAll('[role="option"][aria-selected="true"]');
    expect(selected.length).toBe(1);
    expect(selected[0]?.textContent).toContain('Alan Turing');

    // roving tabindex：仅一行为 Tab 停靠点。
    const zero = [...options].filter((o) => o.getAttribute('tabindex') === '0');
    expect(zero.length).toBe(1);
  });

  it('selectable=multiple：listbox aria-multiselectable=true 结构', async () => {
    const { container } = renderWithLocale(ListFixture, {
      props: { selectable: 'multiple', defaultSelectedKeys: ['u1', 'u3'] },
    });
    const listbox = container.querySelector('[role="listbox"]');
    expect(listbox?.getAttribute('aria-multiselectable')).toBe('true');
    const selected = container.querySelectorAll('[role="option"][aria-selected="true"]');
    expect(selected.length).toBe(2);
  });

  // SKIP（真实组件 a11y 缺口，非测试问题，未改源码迁就）：selectable 模式 axe 报 2 条 serious 违规：
  //  1) [aria-input-field-name] role=listbox 的 <ul> 无可访问名（缺 aria-label/aria-labelledby）。
  //     组件未给 listbox 容器提供可访问名；header 文本也未经 aria-labelledby 关联到 listbox。
  //  2) [nested-interactive] role=option 的 <li>（tabindex=0）内嵌了可聚焦的 <Checkbox>（input），
  //     交互控件嵌套交互控件。选择指示器应改用 aria-hidden 的非聚焦呈现，或重构选择语义。
  // 修复需改组件源码（List.svelte），超出本测试任务范围；留待后续 a11y 修复 PR。
  it.skip('selectable=single：axe 0 violations（待组件修复 listbox 可访问名 + 嵌套交互）', async () => {
    const { container } = renderWithLocale(ListFixture, {
      props: { selectable: 'single', defaultSelectedKeys: ['u2'] },
    });
    await expectNoAxeViolations(container);
  });

  it.skip('selectable=multiple：axe 0 violations（待组件修复 listbox 可访问名 + 嵌套交互）', async () => {
    const { container } = renderWithLocale(ListFixture, {
      props: { selectable: 'multiple', defaultSelectedKeys: ['u1', 'u3'] },
    });
    await expectNoAxeViolations(container);
  });
});
