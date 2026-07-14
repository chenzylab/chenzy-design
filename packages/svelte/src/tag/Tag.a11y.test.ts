// Tag a11y：纯展示 Tag 无 role；clickable（onClick/closable）时根 div role=button + tabindex；
// ariaLabel 透传根元素。经 TagA11yFixture 提供真实文本 children（自带 LocaleProvider，故直接 render）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import TagA11yFixture from './TagA11yFixture.svelte';

describe('Tag a11y', () => {
  it('基础：纯展示 Tag 渲染文本内容，无 role，无 axe violations', async () => {
    const { container } = render(TagA11yFixture, { props: { text: 'Done' } });
    const root = container.querySelector('.cd-tag');
    expect(root?.textContent).toContain('Done');
    expect(root?.getAttribute('role')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('closable：clickable 根 div role=button + tabindex，渲染关闭区，无 axe violations', async () => {
    const { container } = render(TagA11yFixture, {
      props: { text: 'Done', props: { closable: true, ariaLabel: 'Closable Tag: Done' } },
    });
    const root = container.querySelector('.cd-tag');
    expect(root?.getAttribute('role')).toBe('button');
    expect(root?.getAttribute('tabindex')).toBe('0');
    expect(container.querySelector('.cd-tag__close')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('onClick：传入后变可交互（role=button + tabindex），无 axe violations', async () => {
    const { container } = render(TagA11yFixture, {
      props: { text: 'Clickable', props: { onClick: () => {}, ariaLabel: 'Clickable Tag' } },
    });
    const root = container.querySelector('.cd-tag');
    expect(root?.getAttribute('role')).toBe('button');
    expect(root?.getAttribute('tabindex')).toBe('0');
    await expectNoAxeViolations(container);
  });

  it('ariaLabel：透传到根元素，给纯符号 Tag 命名', async () => {
    const { container } = render(TagA11yFixture, {
      props: { text: '+3', props: { ariaLabel: '还有 3 项' } },
    });
    const root = container.querySelector('.cd-tag');
    expect(root?.getAttribute('aria-label')).toBe('还有 3 项');
    await expectNoAxeViolations(container);
  });
});
