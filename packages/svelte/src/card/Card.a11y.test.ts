// Card a11y：有 title 时 role=region + aria-labelledby；clickable 时 role=button + tabindex。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Card from './Card.svelte';

describe('Card a11y', () => {
  it('带 title：role=region + aria-labelledby 指向标题，无 axe violations', async () => {
    const { container } = renderWithLocale(Card, {
      props: { title: 'User profile' },
    });
    const root = container.querySelector('.cd-card');
    expect(root?.getAttribute('role')).toBe('region');
    const labelledby = root?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const titleEl = labelledby ? container.querySelector(`#${labelledby}`) : null;
    expect(titleEl?.textContent).toContain('User profile');
    await expectNoAxeViolations(container);
  });

  it('clickable：role=button + tabindex=0，无 axe violations', async () => {
    const { container } = renderWithLocale(Card, {
      props: { title: 'Clickable card', clickable: true, onClick: () => {} },
    });
    const root = container.querySelector('.cd-card');
    expect(root?.getAttribute('role')).toBe('button');
    expect(root?.getAttribute('tabindex')).toBe('0');
    await expectNoAxeViolations(container);
  });

  it('loading：aria-busy=true，无 axe violations', async () => {
    const { container } = renderWithLocale(Card, {
      props: { title: 'Loading card', loading: true },
    });
    const root = container.querySelector('.cd-card');
    expect(root?.getAttribute('aria-busy')).toBe('true');
    await expectNoAxeViolations(container);
  });
});
