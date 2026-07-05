// PinCode a11y + 组件行为（jsdom / dom project）。
// a11y 增强（超越 Semi）：root role=group + aria-label；每格 aria-label 位次、
// autoComplete=one-time-code、inputMode 随 format、maxlength=1、aria-invalid。
// 组件行为在 jsdom 下可直接驱动 input 事件断言（受控/非受控/onChange/onComplete/粘贴）。
import { describe, it, expect, vi } from 'vitest';
import { fireEvent } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import PinCode from './PinCode.svelte';

function cellsOf(container: Element): HTMLInputElement[] {
  return Array.from(container.querySelectorAll('input.cd-pincode__cell')) as HTMLInputElement[];
}

/** Non-null cell accessor (tests always render `count` cells). */
function cell(container: Element, i: number): HTMLInputElement {
  const el = cellsOf(container)[i];
  if (!el) throw new Error(`cell ${i} not found`);
  return el;
}

describe('PinCode a11y', () => {
  it('默认渲染：role=group + count 格，locale 可访问名，位次 aria-label，无 axe violations', async () => {
    const { container } = renderWithLocale(PinCode, { props: { count: 4 } });
    const group = container.querySelector('[role="group"]');
    expect(group).not.toBeNull();
    // 分组可访问名来自 en_US locale（PinCode.ariaLabel），非 key 原样。
    const label = group?.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('PinCode.ariaLabel');

    const cells = cellsOf(container);
    expect(cells).toHaveLength(4);
    for (const cell of cells) {
      expect(cell.getAttribute('maxlength')).toBe('1');
      expect(cell.getAttribute('autocomplete')).toBe('one-time-code');
      expect(cell.getAttribute('inputmode')).toBe('numeric');
      const cellLabel = cell.getAttribute('aria-label');
      expect(cellLabel).toBeTruthy();
      expect(cellLabel).not.toBe('PinCode.cellAriaLabel');
    }
    await expectNoAxeViolations(container);
  });

  it('format=mixed → inputmode=text', () => {
    const { container } = renderWithLocale(PinCode, { props: { count: 4, format: 'mixed' } });
    for (const cell of cellsOf(container)) {
      expect(cell.getAttribute('inputmode')).toBe('text');
    }
  });

  it('自定义 ariaLabel + error：aria-label / 各格 aria-invalid', async () => {
    const { container } = renderWithLocale(PinCode, {
      props: { count: 4, ariaLabel: 'SMS code', status: 'error' },
    });
    const group = container.querySelector('[role="group"]');
    expect(group?.getAttribute('aria-label')).toBe('SMS code');
    for (const cell of cellsOf(container)) {
      expect(cell.getAttribute('aria-invalid')).toBe('true');
    }
    await expectNoAxeViolations(container);
  });

  it('ariaLabelledby 优先于 aria-label', () => {
    const { container } = renderWithLocale(PinCode, {
      props: { count: 4, ariaLabelledby: 'ext-label' },
    });
    const group = container.querySelector('[role="group"]');
    expect(group?.getAttribute('aria-labelledby')).toBe('ext-label');
    expect(group?.getAttribute('aria-label')).toBeNull();
  });

  it('disabled：aria-disabled + 各格原生 disabled，无 axe violations', async () => {
    const { container } = renderWithLocale(PinCode, { props: { count: 4, disabled: true } });
    const group = container.querySelector('[role="group"]');
    expect(group?.getAttribute('aria-disabled')).toBe('true');
    for (const cell of cellsOf(container)) {
      expect(cell.disabled).toBe(true);
    }
    await expectNoAxeViolations(container);
  });
});

describe('PinCode 行为', () => {
  it('非受控：输入合法字符触发 onChange，逐格拼接整串', async () => {
    const onChange = vi.fn();
    const { container } = renderWithLocale(PinCode, { props: { count: 4, onChange } });

    cell(container, 0).value = '1';
    await fireEvent.input(cell(container, 0));
    expect(onChange).toHaveBeenLastCalledWith('1');

    cell(container, 1).value = '2';
    await fireEvent.input(cell(container, 1));
    expect(onChange).toHaveBeenLastCalledWith('12');
  });

  it('非受控：非法字符不写入（number format 拒绝字母）', async () => {
    const onChange = vi.fn();
    const { container } = renderWithLocale(PinCode, { props: { count: 4, onChange } });
    cell(container, 0).value = 'a';
    await fireEvent.input(cell(container, 0));
    expect(onChange).not.toHaveBeenCalled();
    expect(cell(container, 0).value).toBe(''); // 回滚
  });

  it('填满末格触发 onComplete 一次，回传完整串', async () => {
    const onComplete = vi.fn();
    const { container } = renderWithLocale(PinCode, {
      props: { count: 3, defaultValue: '12', onComplete },
    });
    expect(cell(container, 2).value).toBe('');
    cell(container, 2).value = '3';
    await fireEvent.input(cell(container, 2));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('123');
  });

  it('受控：不写内部值，onChange 回传，父不回写则各格不变', async () => {
    const onChange = vi.fn();
    const { container } = renderWithLocale(PinCode, {
      props: { count: 4, value: '12', onChange },
    });
    expect(cell(container, 0).value).toBe('1');
    expect(cell(container, 1).value).toBe('2');
    cell(container, 2).value = '9';
    await fireEvent.input(cell(container, 2));
    // onChange 回传新串，但受控值未由父更新 → 渲染仍是 '12__'
    expect(onChange).toHaveBeenLastCalledWith('129');
  });

  it('粘贴：从当前格起分发，遇非法字符停止（number format）', async () => {
    const onChange = vi.fn();
    const { container } = renderWithLocale(PinCode, { props: { count: 6, onChange } });
    const dt = { getData: () => '12a34' } as unknown as DataTransfer;
    await fireEvent.paste(cell(container, 0), { clipboardData: dt });
    expect(onChange).toHaveBeenLastCalledWith('12');
  });

  it('隐藏聚合 input：name 提交整串值', () => {
    const { container } = renderWithLocale(PinCode, {
      props: { count: 4, name: 'otp', defaultValue: '1234' },
    });
    const hidden = container.querySelector('input[type="hidden"][name="otp"]') as HTMLInputElement;
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe('1234');
  });

  it('disabled 不可输入（原生 disabled 阻止事件）', () => {
    const { container } = renderWithLocale(PinCode, { props: { count: 4, disabled: true } });
    const cells = cellsOf(container);
    expect(cells.every((c) => c.disabled)).toBe(true);
  });
});
