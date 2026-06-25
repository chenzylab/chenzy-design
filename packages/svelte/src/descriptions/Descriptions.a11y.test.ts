// Descriptions a11y：dl/dt/dd 描述列表语义，data 驱动。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Descriptions from './Descriptions.svelte';

describe('Descriptions a11y', () => {
  it('data 驱动：dl/dt/dd 语义，无 axe violations', async () => {
    const { container } = renderWithLocale(Descriptions, {
      props: {
        title: 'Account',
        data: [
          { key: 'name', label: 'Name', value: 'Jane' },
          { key: 'email', label: 'Email', value: 'jane@example.com' },
        ],
      },
    });
    expect(container.querySelector('dl')).not.toBeNull();
    expect(container.querySelectorAll('dt').length).toBe(2);
    expect(container.querySelectorAll('dd').length).toBe(2);
    await expectNoAxeViolations(container);
  });

  it('bordered + vertical：无 axe violations', async () => {
    const { container } = renderWithLocale(Descriptions, {
      props: {
        bordered: true,
        direction: 'vertical',
        data: [{ key: 'a', label: 'A', value: '1' }],
      },
    });
    await expectNoAxeViolations(container);
  });
});
