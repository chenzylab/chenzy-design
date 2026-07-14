import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Fixture from './NumeralStyleFixture.svelte';

describe('Numeral style prop (Semi alignment verify)', () => {
  it('applies inline style to the rendered element alongside class', () => {
    const { container } = render(Fixture);
    const el = container.querySelector('.verify-numeral') as HTMLElement;
    expect(el).toBeTruthy();
    // style 生效
    expect(el.style.color).toBe('rgb(255, 0, 0)');
    expect(el.style.marginLeft).toBe('20px');
    // class 与 style 并存
    expect(el.classList.contains('cd-typography')).toBe(true);
  });
});
