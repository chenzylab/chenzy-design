// Switch a11y：原生 role="switch" 按钮，受控/非受控。
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
    expect(sw?.getAttribute('aria-checked')).toBe('false');
    expect(sw?.getAttribute('aria-label')).toBe('Dark mode');
    await expectNoAxeViolations(container);
  });

  it('选中：value=true → aria-checked=true', async () => {
    const { container } = renderWithLocale(Switch, {
      props: { 'aria-label':'Wifi', value: true },
    });
    const sw = container.querySelector('[role="switch"]');
    expect(sw?.getAttribute('aria-checked')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('禁用：disabled，无 axe violations', async () => {
    const { container } = renderWithLocale(Switch, {
      props: { 'aria-label':'Bluetooth', disabled: true },
    });
    const sw = container.querySelector('[role="switch"]');
    expect(sw).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('loading：aria-busy=true', async () => {
    const { container } = renderWithLocale(Switch, {
      props: { 'aria-label':'Sync', loading: true },
    });
    const sw = container.querySelector('[role="switch"]');
    expect(sw?.getAttribute('aria-busy')).toBe('true');
    await expectNoAxeViolations(container);
  });
});
