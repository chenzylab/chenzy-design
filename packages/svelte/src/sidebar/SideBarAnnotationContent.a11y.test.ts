// SideBarAnnotationContent a11y + 组件测：参考来源纯内容层（对齐 Semi
// Annotation.AnnotationContent 静态属性），可脱离 SideBarContainer 独立使用
// （例如嵌入 SideBar 的 renderMainContent）。渲染细节已在 SideBarAnnotation.a11y.test.ts
// 逐条覆盖（组合层内部即渲染本组件），这里只补「不含 Container」这条新能力的断言。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import SideBarAnnotationContent from './SideBarAnnotationContent.svelte';
import type { SideBarAnnotationGroup } from './types.js';

const info: SideBarAnnotationGroup[] = [
  {
    header: '视频来源',
    key: 'videos',
    annotations: [
      { type: 'video', title: 'Svelte 5 深入', url: 'https://example.com/v1', order: 1 },
    ],
  },
];

describe('SideBarAnnotationContent — 脱离 Container 独立使用', () => {
  it('不渲染 role=dialog / 关闭按钮等 Container 结构，直接渲染折叠列表', async () => {
    const { container } = renderWithLocale(SideBarAnnotationContent, {
      props: { info, activeKey: 'videos' },
    });
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(container.querySelector('.cd-sidebar-container-header-closeBtn')).toBeNull();
    expect(container.querySelector('.cd-collapse-header')).not.toBeNull();
    expect(container.textContent).toContain('视频来源');
    await expectNoAxeViolations(container);
  });

  it('根节点不带裸 cd-sidebar-annotation 类（该类只在 Container 面板上，对齐 Semi content.tsx 不挂裸类）', () => {
    const { container } = renderWithLocale(SideBarAnnotationContent, {
      props: { info, activeKey: 'videos' },
    });
    const root = container.firstElementChild;
    expect(root?.classList.contains('cd-sidebar-annotation')).toBe(false);
  });

  it('空 info：对齐 Semi content.tsx，渲染空 Collapse，无任何提示文案', () => {
    const { container } = renderWithLocale(SideBarAnnotationContent, {
      props: { info: [] },
    });
    expect(container.querySelector('.cd-collapse')).not.toBeNull();
    expect(container.querySelectorAll('.cd-collapse-header').length).toBe(0);
    expect(container.textContent?.trim()).toBe('');
  });
});
