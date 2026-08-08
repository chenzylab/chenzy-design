// colorful 具名图标 fill 注入（对齐 Semi iconButton multipleColor/twoColor 判定）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import IconButtonFillFixture from './IconButtonFillFixture.svelte';

function readFill(container: HTMLElement): unknown {
  const probe = container.querySelector('[data-testid="fill-probe"]')!;
  return JSON.parse(probe.getAttribute('data-fill')!);
}

describe('IconButton colorful fill 注入', () => {
  it('multipleColor（primary + light）→ 4 色数组', () => {
    const { container } = render(IconButtonFillFixture, { props: { type: 'primary', theme: 'light' } });
    const fill = readFill(container);
    expect(Array.isArray(fill)).toBe(true);
    expect((fill as string[]).length).toBe(4);
  });

  it('multipleColor（primary + borderless）→ 4 色数组', () => {
    const { container } = render(IconButtonFillFixture, {
      props: { type: 'primary', theme: 'borderless' },
    });
    expect((readFill(container) as string[]).length).toBe(4);
  });

  it('multipleColor（tertiary + solid）→ 4 色数组', () => {
    const { container } = render(IconButtonFillFixture, { props: { type: 'tertiary', theme: 'solid' } });
    expect((readFill(container) as string[]).length).toBe(4);
  });

  it('twoColor（tertiary + light）→ 2 色数组', () => {
    const { container } = render(IconButtonFillFixture, { props: { type: 'tertiary', theme: 'light' } });
    expect((readFill(container) as string[]).length).toBe(2);
  });

  it('twoColor（tertiary + outline）→ 2 色数组', () => {
    const { container } = render(IconButtonFillFixture, { props: { type: 'tertiary', theme: 'outline' } });
    expect((readFill(container) as string[]).length).toBe(2);
  });

  it('未命中 multipleColor/twoColor（primary + solid）→ 不传 fill', () => {
    const { container } = render(IconButtonFillFixture, { props: { type: 'primary', theme: 'solid' } });
    expect(readFill(container)).toBeNull();
  });

  it('未命中（primary + outline）→ 不传 fill（Semi 该组合走单色紫，非 fill 注入）', () => {
    const { container } = render(IconButtonFillFixture, { props: { type: 'primary', theme: 'outline' } });
    expect(readFill(container)).toBeNull();
  });

  it('disabled 时 multipleColor 落到禁用灰（4 色但值相同）', () => {
    const { container } = render(IconButtonFillFixture, {
      props: { type: 'primary', theme: 'light', disabled: true },
    });
    const fill = readFill(container) as string[];
    expect(fill.length).toBe(4);
    expect(new Set(fill).size).toBe(1);
    expect(fill[0]).toContain('disabled');
  });

  it('disabled 时 twoColor 落到禁用灰（2 色但值相同）', () => {
    const { container } = render(IconButtonFillFixture, {
      props: { type: 'tertiary', theme: 'light', disabled: true },
    });
    const fill = readFill(container) as string[];
    expect(fill.length).toBe(2);
    expect(new Set(fill).size).toBe(1);
  });
});
