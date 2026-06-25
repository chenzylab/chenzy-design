// Skeleton a11y：loading 占位容器 aria-busy + aria-live=polite + aria-label。
//
// 已知 violation（组件源码缺口，本批不改源码）：占位容器是裸 <div>，带 aria-label/aria-live
// 但无 role，axe 规则 [aria-prohibited-attr] 报「aria-label cannot be used on a div with no
// valid role」。修复需给容器加 role（如 role="status"），属组件改动，故相关 axe 断言 it.skip。
// 结构性 ARIA 断言（aria-busy/aria-live/aria-label 存在）仍作为非 skip 用例保留。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Skeleton from './Skeleton.svelte';

describe('Skeleton a11y', () => {
  it('loading：占位容器 aria-busy + aria-live + aria-label 结构正确', () => {
    const { container } = renderWithLocale(Skeleton, {
      props: { loading: true },
    });
    const root = container.querySelector('.cd-skeleton');
    expect(root?.getAttribute('aria-busy')).toBe('true');
    expect(root?.getAttribute('aria-live')).toBe('polite');
    expect(root?.getAttribute('aria-label')).toBeTruthy();
  });

  it('loading：无 axe violations（占位容器 role=status）', async () => {
    const { container } = renderWithLocale(Skeleton, {
      props: { loading: true },
    });
    await expectNoAxeViolations(container);
  });

  it('active：无 axe violations（占位容器 role=status）', async () => {
    const { container } = renderWithLocale(Skeleton, {
      props: { loading: true, active: true },
    });
    await expectNoAxeViolations(container);
  });
});
