// Input a11y 试点：使用 useLocale（clear/password 按钮的 aria-label 走 i18n）。
// 验证 LocaleProvider wrapper 管线：clear 按钮可访问名来自 en_US 语言包。
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Input from './Input.svelte';
import ControlledFixture from './InputControlledFixture.svelte';

const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const graphemeLength = (s: string) => [...seg.segment(s)].length;

describe('Input a11y', () => {
  it('基础 input：ariaLabel 提供可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(Input, {
      props: { ariaLabel: 'Username' },
    });
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    expect(input?.getAttribute('aria-label')).toBe('Username');
    await expectNoAxeViolations(container);
  });

  it('error 状态：aria-invalid=true', async () => {
    const { container } = renderWithLocale(Input, {
      props: { ariaLabel: 'Email', validateStatus: 'error' },
    });
    const input = container.querySelector('input');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('required：aria-required=true', async () => {
    const { container } = renderWithLocale(Input, {
      props: { ariaLabel: 'Name', ariaRequired: true },
    });
    const input = container.querySelector('input');
    expect(input?.getAttribute('aria-required')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('clearable：clear 按钮聚焦后才渲染，且严格对齐 Semi（无 aria-label/role 的 div）', async () => {
    const { container } = renderWithLocale(Input, {
      props: { ariaLabel: 'Search', showClear: true, defaultValue: 'hello' },
    });
    // 有内容但未 hover/focus 时清除按钮不渲染（对齐 Semi isAllowClear）。
    expect(container.querySelector('.cd-input-clearbtn')).toBeNull();
    // 聚焦后清除按钮出现。fireEvent.focus 正确触发 Svelte 事件并 flush。
    const input = container.querySelector('input')!;
    await fireEvent.focus(input);
    const clearBtn = container.querySelector('.cd-input-clearbtn');
    expect(clearBtn).not.toBeNull();
    // 对齐 Semi：clearbtn 是无 aria-label / role 的 div。
    expect(clearBtn?.getAttribute('aria-label')).toBeNull();
    expect(clearBtn?.getAttribute('role')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('password：reveal 按钮严格对齐 Semi（role=button + tabindex + aria-label，无 aria-pressed）', async () => {
    const { container } = renderWithLocale(Input, {
      props: { ariaLabel: 'Password', mode: 'password' },
    });
    const revealBtn = container.querySelector('.cd-input-modebtn');
    // 对齐 Semi：div role=button + tabindex=0 + aria-label（Show/Hidden password），无 aria-pressed。
    expect(revealBtn?.getAttribute('role')).toBe('button');
    expect(revealBtn?.getAttribute('tabindex')).toBe('0');
    expect(revealBtn?.getAttribute('aria-label')).toBeTruthy();
    expect(revealBtn?.getAttribute('aria-pressed')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('autoFocus：挂载后输入框获得焦点（inputEl 经 $state 绑定，effect 正确触发）', async () => {
    const { container } = renderWithLocale(Input, {
      props: { ariaLabel: 'Focused', autoFocus: true },
    });
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    // autoFocus 经 tick()+requestAnimationFrame 命令式 focus，异步等待焦点落定。
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
  });
});

// 受控数据流回归：锁住「受控回写不清空用户输入」，保护受控回写重构不破坏基本数据流。
describe('Input 受控数据流', () => {
  it('受控输入：键入后值正常更新，不被回写清空', async () => {
    const { container, getByTestId } = render(ControlledFixture, { props: { initialValue: '' } });
    const input = container.querySelector('input')!;
    await fireEvent.input(input, { target: { value: 'hello' } });
    expect(input.value).toBe('hello');
    expect(getByTestId('mirror').textContent).toBe('hello');
  });

  it('受控输入：连续多次输入累积正确', async () => {
    const { container, getByTestId } = render(ControlledFixture, { props: { initialValue: 'a' } });
    const input = container.querySelector('input')!;
    await fireEvent.input(input, { target: { value: 'ab' } });
    await fireEvent.input(input, { target: { value: 'abc' } });
    expect(input.value).toBe('abc');
    expect(getByTestId('mirror').textContent).toBe('abc');
  });

  it('受控初始值：渲染即回显 value', () => {
    const { container } = render(ControlledFixture, { props: { initialValue: 'preset' } });
    expect(container.querySelector('input')!.value).toBe('preset');
  });

  it('maxLength + getValueLength：emoji 超长截断到可见长度', async () => {
    const { container } = render(ControlledFixture, {
      props: { initialValue: '', maxLength: 3, getValueLength: graphemeLength },
    });
    const input = container.querySelector('input')!;
    await fireEvent.input(input, { target: { value: '💖'.repeat(5) } });
    expect(graphemeLength(input.value)).toBe(3);
    expect(input.value).toBe('💖'.repeat(3));
  });

  it('minLength：无 getValueLength 时直接下发原生 minlength', () => {
    const { container } = render(ControlledFixture, { props: { minLength: 4 } });
    expect(container.querySelector('input')!.getAttribute('minlength')).toBe('4');
  });

  it('minLength + getValueLength：按可见长度换算下发 minlength', () => {
    const { container } = render(ControlledFixture, {
      props: { initialValue: '💖💖💖', minLength: 4, getValueLength: graphemeLength },
    });
    // 3 个 💖：visible 3, utf16 6, minLength 4 → 下发 6 + (4-3) = 7
    expect(container.querySelector('input')!.getAttribute('minlength')).toBe('7');
  });
});
