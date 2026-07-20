// Input a11y 试点：使用 useLocale（clear/password 按钮的 aria-label 走 i18n）。
// 验证 LocaleProvider wrapper 管线：clear 按钮可访问名来自 en_US 语言包。
import { describe, it, expect, vi } from 'vitest';
import { fireEvent } from '@testing-library/svelte';
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
