// Button a11y 试点：纯展示组件（无 useLocale）。验证 axe 0 violations + 基础 role/aria。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Button from './Button.svelte';

describe('Button a11y', () => {
  it('按钮：原生 <button>，type=button，无 axe violations', async () => {
    // 无默认插槽文字时用 ariaLabel 提供可访问名（否则 axe button-name 报错）。
    const { container } = renderWithLocale(Button, {
      props: { type: 'primary', ariaLabel: 'Confirm' },
    });
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute('type')).toBe('button');
    await expectNoAxeViolations(container);
  });

  it('icon-only 按钮：用 ariaLabel 提供可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(Button, {
      props: { ariaLabel: 'Close panel' },
    });
    const btn = container.querySelector('button');
    expect(btn?.getAttribute('aria-label')).toBe('Close panel');
    await expectNoAxeViolations(container);
  });

  it('disabled 按钮：原生 disabled 属性', async () => {
    const { container } = renderWithLocale(Button, {
      props: { ariaLabel: 'Submit', disabled: true },
    });
    const btn = container.querySelector('button');
    expect(btn?.hasAttribute('disabled')).toBe(true);
    await expectNoAxeViolations(container);
  });

  it('loading 按钮：aria-busy=true', async () => {
    const { container } = renderWithLocale(Button, {
      props: { ariaLabel: 'Saving', loading: true },
    });
    const btn = container.querySelector('button');
    expect(btn?.getAttribute('aria-busy')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('链接按钮（href）：role=button 的 <a>，无 axe violations', async () => {
    const { container } = renderWithLocale(Button, {
      props: { href: 'https://example.com', ariaLabel: 'Open docs' },
    });
    const link = container.querySelector('a');
    expect(link?.getAttribute('role')).toBe('button');
    expect(link?.getAttribute('href')).toBe('https://example.com');
    await expectNoAxeViolations(container);
  });
});
