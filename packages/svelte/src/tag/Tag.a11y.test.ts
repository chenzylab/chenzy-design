// Tag a11y：closable 关闭按钮有可访问名（locale 派生）；checkable 取 role=checkbox + aria-checked。
// 经 TagA11yFixture 提供真实文本 children（自带 LocaleProvider，故直接 render）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import TagA11yFixture from './TagA11yFixture.svelte';

describe('Tag a11y', () => {
  it('基础：渲染文本内容，无 axe violations', async () => {
    const { container } = render(TagA11yFixture, { props: { text: 'Done' } });
    expect(container.querySelector('.cd-tag')?.textContent).toContain('Done');
    await expectNoAxeViolations(container);
  });

  it('closable：关闭按钮带 aria-label（来自 locale），无 axe violations', async () => {
    const { container } = render(TagA11yFixture, {
      props: { text: 'Done', props: { closable: true, tagText: 'Done' } },
    });
    const closeBtn = container.querySelector('.cd-tag__close');
    expect(closeBtn?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('checkable：role=checkbox + aria-checked，无 axe violations', async () => {
    const { container } = render(TagA11yFixture, {
      props: { text: 'Filter', props: { checkable: true, checked: true } },
    });
    const root = container.querySelector('.cd-tag');
    expect(root?.getAttribute('role')).toBe('checkbox');
    expect(root?.getAttribute('aria-checked')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('ariaLabel：透传到根元素（普通分支），给纯符号 Tag 命名', async () => {
    const { container } = render(TagA11yFixture, {
      props: { text: '+3', props: { ariaLabel: '还有 3 项' } },
    });
    const root = container.querySelector('.cd-tag');
    expect(root?.getAttribute('aria-label')).toBe('还有 3 项');
    await expectNoAxeViolations(container);
  });

  it('ariaLabel：透传到根元素（checkable 分支），与 role=checkbox 共存', async () => {
    const { container } = render(TagA11yFixture, {
      props: { text: '+3', props: { checkable: true, ariaLabel: '还有 3 项' } },
    });
    const root = container.querySelector('.cd-tag');
    expect(root?.getAttribute('role')).toBe('checkbox');
    expect(root?.getAttribute('aria-label')).toBe('还有 3 项');
    await expectNoAxeViolations(container);
  });
});
