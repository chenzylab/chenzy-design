// InputGroup a11y：单层 span role=group（对齐 Semi）；label 经 for/id 关联；
// size/disabled 经 context 回退透传给子 Input。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './InputGroupA11yFixture.svelte';

describe('InputGroup a11y', () => {
  it('无 label：根为 span role=group，两个 input 拼接渲染，无 axe violations', async () => {
    const { container } = renderWithLocale(Fixture, { props: {} });
    const group = container.querySelector('.cd-input-group');
    expect(group?.getAttribute('role')).toBe('group');
    expect(container.querySelectorAll('.cd-input-group input').length).toBe(2);
    await expectNoAxeViolations(container);
  });

  it('有 label：label for 指向 group id，label 文本正确，无 axe violations', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { label: 'Price range' },
    });
    const labelEl = container.querySelector('.cd-input-group-label');
    const group = container.querySelector('.cd-input-group');
    expect(labelEl?.textContent).toContain('Price range');
    // label[for] 与 group[id] 关联（WAI-ARIA 首选 for/id 对）。
    const forId = labelEl?.getAttribute('for');
    expect(forId).toBeTruthy();
    expect(group?.getAttribute('id')).toBe(forId);
    await expectNoAxeViolations(container);
  });

  it('组级 size：经 context 回退透传给子 Input（子控件未显式 size）', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { size: 'large' },
    });
    const wrappers = container.querySelectorAll('.cd-input-wrapper');
    expect(wrappers.length).toBe(2);
    wrappers.forEach((el) => {
      expect(el.classList.contains('cd-input-wrapper-large')).toBe(true);
    });
  });

  it('组级 disabled：经 context 回退透传给子 Input', async () => {
    const { container } = renderWithLocale(Fixture, {
      props: { disabled: true },
    });
    const wrappers = container.querySelectorAll('.cd-input-wrapper');
    wrappers.forEach((el) => {
      expect(el.classList.contains('cd-input-wrapper-disabled')).toBe(true);
    });
  });
});
