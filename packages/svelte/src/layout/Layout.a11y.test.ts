// Layout a11y：页面级布局骨架（section + header/main/footer/aside 语义元素）。
// 纯布局，不引入额外 role；Sider collapsible 触发器为原生 button + aria-expanded/aria-controls/aria-label。
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
    await expectNoAxeViolations(container);
  });

  it('collapsible Sider：触发器 button aria-expanded/aria-controls/aria-label，无 axe violations', async () => {
    const { container } = renderWithLocale(LayoutFixture, {
      props: { collapsible: true },
    });
    const trigger = container.querySelector('button.cd-layout-sider__trigger');
    expect(trigger).not.toBeNull();
    // 展开态 aria-expanded=true。
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    // aria-controls 指向 Sider id（不悬空）。
    const controls = trigger?.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(container.ownerDocument.getElementById(controls!)).not.toBeNull();
    // aria-label 来自 i18n（验证 LocaleProvider 管线）。
    expect(trigger?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
