// Layout a11y：页面级布局骨架（section + header/main/footer/aside 语义元素）。
// 对齐 Semi：纯布局容器，不引入额外 role；Sider 可传 aria-label 描述其作用。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import LayoutFixture from './LayoutA11yFixture.svelte';

describe('Layout a11y', () => {
  it('默认渲染：语义布局元素齐全，无 axe violations', async () => {
    const { container } = renderWithLocale(LayoutFixture, {});
    expect(container.querySelector('section.cd-layout')).not.toBeNull();
    expect(container.querySelector('header.cd-layout-header')).not.toBeNull();
    expect(container.querySelector('main.cd-layout-content')).not.toBeNull();
    expect(container.querySelector('footer.cd-layout-footer')).not.toBeNull();
    expect(container.querySelector('aside.cd-layout-sider')).not.toBeNull();
    // Sider 内含 children 容器（对齐 Semi DOM 结构）。
    expect(container.querySelector('aside.cd-layout-sider > .cd-layout-sider-children')).not.toBeNull();
    // 存在 Sider 时 Layout 切换为 row 方向。
    expect(container.querySelector('section.cd-layout.cd-layout-has-sider')).not.toBeNull();
    await expectNoAxeViolations(container);
  });
});
