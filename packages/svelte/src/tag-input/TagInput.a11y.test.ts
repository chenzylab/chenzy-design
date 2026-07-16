// TagInput a11y：role=group + ariaLabel 容器可访问名；输入框可访问名；
// 标签删除按钮 locale 可访问名。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import TagInput from './TagInput.svelte';

describe('TagInput a11y', () => {
  it('默认渲染：role=group + ariaLabel，输入框有可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(TagInput, {
      props: { ariaLabel: 'Tags', placeholder: 'Add tag' },
    });
    const group = container.querySelector('[role="group"]');
    expect(group).not.toBeNull();
    expect(group?.getAttribute('aria-label')).toBe('Tags');
    // 输入框同样以 ariaLabel 暴露可访问名（无可见 label）。
    const input = container.querySelector('input');
    expect(input?.getAttribute('aria-label')).toBe('Tags');
    await expectNoAxeViolations(container);
  });

  it('已有标签：复用 Tag 渲染，标签有可关闭可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(TagInput, {
      props: { ariaLabel: 'Skills', defaultValue: ['svelte', 'a11y'] },
    });
    // 标签复用 Tag 组件（.cd-tag），关闭按钮由 Tag 提供（.cd-tag__close）。
    const tags = container.querySelectorAll('.cd-tag-input-wrapper-tag');
    expect(tags.length).toBe(2);
    const closeBtns = container.querySelectorAll('.cd-tag__close');
    expect(closeBtns.length).toBe(2);
    expect(tags[0]?.getAttribute('aria-label')).toContain('svelte');
    await expectNoAxeViolations(container);
  });

  it('disabled：aria-disabled=true，无 axe violations', async () => {
    const { container } = renderWithLocale(TagInput, {
      props: { ariaLabel: 'Tags', defaultValue: ['a'], disabled: true },
    });
    const group = container.querySelector('[role="group"]');
    expect(group?.getAttribute('aria-disabled')).toBe('true');
    await expectNoAxeViolations(container);
  });
});
