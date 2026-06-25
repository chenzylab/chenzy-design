// TextArea a11y：原生 <textarea> + ariaLabel 可访问名；error 态 aria-invalid；
// showClear 清除按钮 locale 可访问名。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import TextArea from './TextArea.svelte';

describe('TextArea a11y', () => {
  it('默认渲染：ariaLabel 提供可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(TextArea, {
      props: { ariaLabel: 'Bio', placeholder: 'Tell us about yourself' },
    });
    const ta = container.querySelector('textarea');
    expect(ta).not.toBeNull();
    expect(ta?.getAttribute('aria-label')).toBe('Bio');
    await expectNoAxeViolations(container);
  });

  it('error 状态：aria-invalid=true', async () => {
    const { container } = renderWithLocale(TextArea, {
      props: { ariaLabel: 'Notes', status: 'error' },
    });
    const ta = container.querySelector('textarea');
    expect(ta?.getAttribute('aria-invalid')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('showClear + showCount：清除按钮 locale 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(TextArea, {
      props: {
        ariaLabel: 'Comment',
        defaultValue: 'hello',
        showClear: true,
        showCount: true,
        maxLength: 100,
      },
    });
    const clearBtn = container.querySelector('.cd-textarea__clear');
    expect(clearBtn).not.toBeNull();
    const label = clearBtn?.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('Textarea.clear');
    await expectNoAxeViolations(container);
  });
});
