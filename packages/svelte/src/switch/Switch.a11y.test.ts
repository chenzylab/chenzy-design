// Switch a11y：对齐 Semi DOM 结构，role="switch" 挂在隐藏的 <input type=checkbox> 上。
// 只断言静态 ARIA（role/aria-checked/aria-disabled）+ axe 0 violations，
// 不测真实键盘/焦点（jsdom 限制，见 test-utils/a11y.ts 说明）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Switch from './Switch.svelte';

describe('Switch a11y', () => {
  it('默认：role=switch / aria-checked=false / ariaLabel 提供可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(Switch, {
      props: { 'aria-label':'Dark mode' },
    });
    const sw = container.querySelector('[role="switch"]');
    expect(sw).not.toBeNull();
    expect(sw?.tagName).toBe('INPUT');
    expect(sw?.getAttribute('aria-checked')).toBe('false');
    expect(sw?.getAttribute('aria-label')).toBe('Dark mode');
    await expectNoAxeViolations(container);
  });

  it('选中：checked=true → aria-checked=true', async () => {
    const { container } = renderWithLocale(Switch, {
      props: { 'aria-label':'Wifi', checked: true },
    });
    const sw = container.querySelector('[role="switch"]');
    expect(sw?.getAttribute('aria-checked')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('禁用：disabled，input 原生禁用 + aria-disabled，无 axe violations', async () => {
    const { container } = renderWithLocale(Switch, {
      props: { 'aria-label':'Bluetooth', disabled: true },
    });
    const sw = container.querySelector('[role="switch"]') as HTMLInputElement | null;
    expect(sw).not.toBeNull();
    expect(sw?.disabled).toBe(true);
    expect(sw?.getAttribute('aria-disabled')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('loading：input 原生禁用（阻断交互，对齐 Semi），无 axe violations', async () => {
    const { container } = renderWithLocale(Switch, {
      props: { 'aria-label':'Sync', loading: true },
    });
    const sw = container.querySelector('[role="switch"]') as HTMLInputElement | null;
    expect(sw?.disabled).toBe(true);
    await expectNoAxeViolations(container);
  });
});
