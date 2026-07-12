// Skeleton a11y：镜像 Semi，占位根节点为纯 <div class="cd-skeleton">（无 role/aria）。
// 骨架块为纯装饰 div，不进入 Tab 序列；axe 对纯装饰 div 无异议。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Skeleton from './Skeleton.svelte';
import SkeletonAvatar from './SkeletonAvatar.svelte';

describe('Skeleton a11y', () => {
  it('loading：渲染 .cd-skeleton 占位容器（对齐 Semi，纯 div 无 role/aria）', () => {
    const { container } = renderWithLocale(Skeleton, {
      props: { loading: true },
    });
    const root = container.querySelector('.cd-skeleton');
    expect(root).not.toBeNull();
    expect(root?.getAttribute('role')).toBeNull();
    expect(root?.getAttribute('aria-busy')).toBeNull();
  });

  it('active：占位容器带 cd-skeleton--active 类', () => {
    const { container } = renderWithLocale(Skeleton, {
      props: { loading: true, active: true },
    });
    expect(container.querySelector('.cd-skeleton--active')).not.toBeNull();
  });

  it('loading：无 axe violations', async () => {
    const { container } = renderWithLocale(Skeleton, {
      props: { loading: true },
    });
    await expectNoAxeViolations(container);
  });

  it('骨架原子块：无 axe violations（纯装饰 div）', async () => {
    const { container } = render(SkeletonAvatar, { props: { size: 'medium' } });
    await expectNoAxeViolations(container);
  });
});
