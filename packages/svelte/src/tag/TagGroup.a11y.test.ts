// TagGroup a11y：组容器 role=group；maxTagCount 折叠出 +N，带 aria-label（i18n）；无 axe violations。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import TagGroupA11yFixture from './TagGroupA11yFixture.svelte';

describe('TagGroup a11y', () => {
  it('基础：组容器 role=group，渲染全部标签，无 axe violations', async () => {
    const { container } = render(TagGroupA11yFixture);
    const group = container.querySelector('.cd-taggroup');
    expect(group?.getAttribute('role')).toBe('group');
    // 4 项数据全展示（无 maxTagCount）
    expect(container.querySelectorAll('.cd-tag').length).toBe(4);
    await expectNoAxeViolations(container);
  });

  it('maxTagCount：折叠出 +N 标签，带 aria-label（来自 locale），无 axe violations', async () => {
    const { container } = render(TagGroupA11yFixture, {
      props: { props: { maxTagCount: 2, showPopover: false } },
    });
    const plus = container.querySelector('.cd-taggroup__plus');
    expect(plus).not.toBeNull();
    expect(plus?.getAttribute('aria-label')).toBeTruthy();
    // 折叠后可见 2 项 + 1 个 +N
    expect(plus?.textContent).toContain('+2');
    await expectNoAxeViolations(container);
  });
});
