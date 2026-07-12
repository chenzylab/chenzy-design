// Dropdown a11y（重写对齐 Semi 后）：触发器是用户提供的 children（包裹于 span.cd-dropdown-trigger）；
// ARIA（aria-haspopup=menu / aria-expanded / aria-controls）经 use:triggerAria 写到真实触发器元素本身
// （span 的首个 element child，对齐 Semi cloneElement 语义），而非无 role 的 span，故无 aria-allowed-attr /
// nested-interactive 违规——axe 全量校验，无需放开任何规则。
// 浮层菜单 portal 到 document.body（use:floating），ul[role=menu] + li[role=menuitem]。
// 不测真实键盘 roving/hover（jsdom 限制）；用 visible + trigger='custom' 受控强制打开再断言静态 ARIA。
// 经 DropdownA11yFixture 渲染（不经 LocaleHarness：新 API 下 children 是触发器插槽）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './DropdownA11yFixture.svelte';

describe('Dropdown a11y', () => {
  it('默认（收起）：ARIA 写在真实触发器元素上（aria-haspopup=menu），span 自身无 role/aria，无 axe violations', async () => {
    const { container } = render(Fixture, { props: { trigger: 'click' } });
    const trigger = container.querySelector('.cd-dropdown-trigger');
    expect(trigger).not.toBeNull();
    // 包裹 span 自身无 role/aria（避免 aria-allowed-attr / nested-interactive）。
    expect(trigger?.getAttribute('role')).toBeNull();
    expect(trigger?.getAttribute('aria-haspopup')).toBeNull();
    // ARIA 落在真实触发器元素本身（span 的首个 element child，对齐 Semi cloneElement）。
    const realTrigger = trigger?.firstElementChild as HTMLElement | null;
    expect(realTrigger).not.toBeNull();
    expect(realTrigger?.getAttribute('aria-haspopup')).toBe('menu');
    expect(realTrigger?.getAttribute('aria-expanded')).toBe('false');
    expect(realTrigger?.getAttribute('aria-controls')).toBeTruthy();
    // aria 已合法落在可交互触发器上，axe 全量校验无需放开任何规则。
    await expectNoAxeViolations(container);
  });

  it('visible=true：浮层 ul[role=menu] + 3 个 role=menuitem，disabled 项 aria-disabled=true，无 axe violations', async () => {
    render(Fixture, { props: { visible: true, trigger: 'custom' } });

    // 菜单 portal 到 body —— 全局查询。
    const menu = document.querySelector('[role="menu"]') as HTMLElement | null;
    expect(menu).not.toBeNull();
    expect(menu?.getAttribute('aria-orientation')).toBe('vertical');

    const items = document.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBe(3);

    // 每个 menuitem 带 tabindex=-1（roving）。
    for (const item of items) {
      expect(item.getAttribute('tabindex')).toBe('-1');
    }

    // 末项 disabled → aria-disabled=true。
    const last = items[items.length - 1] as HTMLElement;
    expect(last.getAttribute('aria-disabled')).toBe('true');

    await expectNoAxeViolations(document.body);
  });
});
