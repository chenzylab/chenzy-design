// Icon a11y：对齐 Semi 基类——恒 role=img；aria-label 来自 type（无 type 时为 undefined）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import { Icon } from '@chenzy-design/icons';

const SVG =
  '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>';

describe('Icon a11y', () => {
  it('提供 type：role=img + aria-label（来自 type），无 axe violations', async () => {
    const { container } = renderWithLocale(Icon, { props: { svg: SVG, type: '首页' } });
    const root = container.querySelector('.cd-icon');
    expect(root?.getAttribute('role')).toBe('img');
    expect(root?.getAttribute('aria-label')).toBe('首页');
    await expectNoAxeViolations(container);
  });

  it('未提供 type：role=img 但 aria-label 为空（装饰性图标应由消费方处理可访问名）', () => {
    const { container } = renderWithLocale(Icon, { props: { svg: SVG } });
    const root = container.querySelector('.cd-icon');
    expect(root?.getAttribute('role')).toBe('img');
    expect(root?.getAttribute('aria-label')).toBeNull();
  });
});
