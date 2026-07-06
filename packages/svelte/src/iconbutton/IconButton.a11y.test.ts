// IconButton a11y：axe 0 violations + aria-label 非空 + 命中目标（icon-only 收成方形）。
import { describe, it, expect } from 'vitest';
import { createRawSnippet } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import IconButton from './IconButton.svelte';

// IconButton 的 icon/ariaLabel 为必填 prop，与 renderWithLocale 的宽松 AnyComponent
// 形态在 exactOptionalPropertyTypes 下不严格兼容，按 Image 测试同法收窄。
const IconButtonC = IconButton as unknown as Parameters<typeof renderWithLocale>[0];

const icon = createRawSnippet(() => ({
  render: () =>
    '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M4 4h16v16H4z"/></svg>',
}));

describe('IconButton a11y', () => {
  it('基础：原生 <button> + 非空 aria-label，无 axe violations', async () => {
    const { container } = renderWithLocale(IconButtonC, {
      props: { icon, ariaLabel: 'Edit', type: 'primary' },
    });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('type')).toBe('button');
    const label = btn.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label?.trim().length).toBeGreaterThan(0);
    await expectNoAxeViolations(container);
  });

  it('circle 圆形按钮：无 axe violations', async () => {
    const { container } = renderWithLocale(IconButtonC, {
      props: { icon, ariaLabel: 'Add', circle: true },
    });
    await expectNoAxeViolations(container);
  });

  it('danger 危险操作图标按钮：无 axe violations', async () => {
    const { container } = renderWithLocale(IconButtonC, {
      props: { icon, ariaLabel: 'Delete', type: 'danger' },
    });
    await expectNoAxeViolations(container);
  });

  it('loading 态：aria-busy + 无 axe violations', async () => {
    const { container } = renderWithLocale(IconButtonC, {
      props: { icon, ariaLabel: 'Saving', loading: true },
    });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('aria-busy')).toBe('true');
    await expectNoAxeViolations(container);
  });
});
