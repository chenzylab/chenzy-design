// Input a11y 试点：使用 useLocale（clear/password 按钮的 aria-label 走 i18n）。
// 验证 LocaleProvider wrapper 管线：clear 按钮可访问名来自 en_US 语言包。
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Input from './Input.svelte';

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

  it('clearable：clear 按钮的 aria-label 来自 en_US locale（验证 LocaleProvider 管线）', async () => {
    const { container } = renderWithLocale(Input, {
      props: { ariaLabel: 'Search', showClear: true, defaultValue: 'hello' },
    });
    const clearBtn = container.querySelector('.cd-input-clearbtn');
    expect(clearBtn).not.toBeNull();
    // en_US 语言包里 Input.clear 应为非空可访问名（不是空串/key 原样）。
    const label = clearBtn?.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('Input.clear');
    await expectNoAxeViolations(container);
  });

  it('password：reveal 按钮 aria-pressed + locale 可访问名', async () => {
    const { container } = renderWithLocale(Input, {
      props: { ariaLabel: 'Password', mode: 'password' },
    });
    const revealBtn = container.querySelector('.cd-input-modebtn');
    expect(revealBtn?.getAttribute('aria-pressed')).toBe('false');
    expect(revealBtn?.getAttribute('aria-label')).toBeTruthy();
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
