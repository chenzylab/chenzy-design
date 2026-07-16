// Rating a11y（对齐 Semi）：每颗星 role=radio 双层（first 半星 / second 整星），
// 额外空评分项承载 0 分焦点；根 <ul> 承载 aria-label。可访问名走 i18n（Rating.valueText）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Rating from './Rating.svelte';

describe('Rating a11y', () => {
  it('默认渲染：radio 星 + roving tabindex + count+1 个 second 星，locale 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(Rating, { props: { defaultValue: 3, count: 5 } });
    const root = container.querySelector('ul.cd-rating');
    expect(root).not.toBeNull();

    // 每颗星 second 层 role=radio；额外空项 → count+1 个 second radio。
    const seconds = container.querySelectorAll('[data-star="second"][role="radio"]');
    expect(seconds.length).toBe(6);

    // 当前值=3 → 第 3 颗（index=2）的 second 星 aria-checked=true 且 tabindex=0。
    const checked = container.querySelector('[data-star="second"][aria-checked="true"]');
    expect(checked).not.toBeNull();
    expect(checked?.getAttribute('tabindex')).toBe('0');

    // 其余 radio tabindex=-1（roving）。
    const roving = [...seconds].filter((el) => el !== checked);
    expect(roving.every((el) => el.getAttribute('tabindex') === '-1')).toBe(true);

    // 根可访问名来自 en_US locale（非 key 原样）。
    const label = root?.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('Rating.valueText');

    await expectNoAxeViolations(container);
  });

  it('allowHalf：first 层 radio 出现 + aria-setsize = count*2+1', async () => {
    const { container } = renderWithLocale(Rating, {
      props: { defaultValue: 2.5, count: 5, allowHalf: true },
    });
    const firsts = container.querySelectorAll('[data-star="first"][role="radio"]');
    // 半星层每颗星一个（空项不渲染 first）→ count 个。
    expect(firsts.length).toBe(5);

    // 2.5 → index=2 的 first 星 aria-checked=true。
    const checkedHalf = container.querySelector('[data-star="first"][aria-checked="true"]');
    expect(checkedHalf).not.toBeNull();
    expect(checkedHalf?.getAttribute('tabindex')).toBe('0');

    const anyRadio = container.querySelector('[role="radio"]');
    expect(anyRadio?.getAttribute('aria-setsize')).toBe(String(5 * 2 + 1));

    await expectNoAxeViolations(container);
  });

  it('空态（value=0）：空项 second 星 aria-checked=true 且可聚焦', async () => {
    const { container } = renderWithLocale(Rating, { props: { defaultValue: 0, count: 5 } });
    const emptyRadio = container.querySelector('[data-empty] [data-star="second"]');
    expect(emptyRadio?.getAttribute('aria-checked')).toBe('true');
    expect(emptyRadio?.getAttribute('tabindex')).toBe('0');
    await expectNoAxeViolations(container);
  });

  it('自定义 aria-label + aria-invalid 直传', async () => {
    const { container } = renderWithLocale(Rating, {
      props: { defaultValue: 2, 'aria-label': 'Difficulty', 'aria-invalid': true },
    });
    const root = container.querySelector('ul.cd-rating');
    expect(root?.getAttribute('aria-label')).toBe('Difficulty');
    expect(root?.getAttribute('aria-invalid')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('disabled：radio aria-disabled + 根 tabindex=-1，无 axe violations', async () => {
    const { container } = renderWithLocale(Rating, {
      props: { defaultValue: 4, disabled: true },
    });
    const root = container.querySelector('ul.cd-rating');
    expect(root?.getAttribute('tabindex')).toBe('-1');
    const radio = container.querySelector('[role="radio"]');
    expect(radio?.getAttribute('aria-disabled')).toBe('true');
    // disabled 时所有 radio tabindex=-1。
    const radios = container.querySelectorAll('[role="radio"]');
    expect([...radios].every((el) => el.getAttribute('tabindex') === '-1')).toBe(true);
    await expectNoAxeViolations(container);
  });
});
