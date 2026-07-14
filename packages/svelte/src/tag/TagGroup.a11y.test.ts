// TagGroup a11y：maxTagCount 折叠出 +N，带 aria-label（i18n）；无 axe violations。
// 对齐 Semi：组容器为普通 div（无 role），+N 标签带 aria-label。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import TagGroupA11yFixture from './TagGroupA11yFixture.svelte';

describe('TagGroup a11y', () => {
  it('基础：无 maxTagCount 时全部展示，无 axe violations', async () => {
    const { container } = render(TagGroupA11yFixture);
    const group = container.querySelector('.cd-tag-group');
    expect(group).not.toBeNull();
    // 4 项数据全展示（无 maxTagCount）
    expect(container.querySelectorAll('.cd-tag').length).toBe(4);
    await expectNoAxeViolations(container);
  });

  it('maxTagCount：折叠出 +N 标签，带 aria-label（来自 locale），无 axe violations', async () => {
    const { container } = render(TagGroupA11yFixture, {
      props: { props: { maxTagCount: 2, showPopover: false } },
    });
    const n = container.querySelector('.cd-tag-group__n');
    expect(n).not.toBeNull();
    // +N 标签的 aria-label 挂在内部 Tag 根上
    expect(n?.querySelector('.cd-tag')?.getAttribute('aria-label')).toBeTruthy();
    // 折叠后可见 2 项 + 1 个 +N
    expect(n?.textContent).toContain('+2');
    await expectNoAxeViolations(container);
  });
});
