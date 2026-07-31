// Tag 的 RTL 镜像 e2e（browser project / 真实 chromium）。
//
// 钉「关闭叉落在标签哪一侧」：LTR 在右、RTL 在左。
// 这依赖 `direction: rtl` 真的作用到 .cd-tag 上（`.cd-rtl` 本身不带样式，
// 方向要各组件自己声明），以及 close 的 padding 换边。
import { describe, it, expect } from 'vitest';
import { renderKbd } from '../test-utils/kbd.js';
import TagRtlFixture from './TagRtlFixture.svelte';

describe('Tag RTL 镜像（真实布局坐标）', () => {
  it('关闭叉在 LTR 靠右、RTL 靠左', async () => {
    const screen = renderKbd(TagRtlFixture as never);
    const root = screen.baseElement;

    const ltrTag = root.querySelector('[data-testid="ltr"] .cd-tag') as HTMLElement;
    const rtlTag = root.querySelector('[data-testid="rtl"] .cd-tag') as HTMLElement;
    expect(ltrTag, 'LTR tag 应存在').toBeTruthy();
    expect(rtlTag, 'RTL tag 应存在').toBeTruthy();

    // 方向真的翻了（这条同时守住「别忘了写 direction: rtl」）
    expect(getComputedStyle(ltrTag).direction).toBe('ltr');
    expect(getComputedStyle(rtlTag).direction, 'RTL 下 tag 方向应为 rtl').toBe('rtl');

    const closeOf = (tag: HTMLElement) => {
      const close = tag.querySelector('.cd-tag-close');
      if (!close) throw new Error('找不到 .cd-tag-close');
      const t = tag.getBoundingClientRect();
      const c = close.getBoundingClientRect();
      // tag 必须有真实宽度，否则左右比较是空转
      expect(t.width).toBeGreaterThan(20);
      return { fromLeft: Math.round(c.left - t.left), fromRight: Math.round(t.right - c.right) };
    };

    const ltr = closeOf(ltrTag);
    const rtl = closeOf(rtlTag);

    expect(ltr.fromRight, `LTR 关闭叉应靠右，实测 ${JSON.stringify(ltr)}`).toBeLessThan(ltr.fromLeft);
    expect(rtl.fromLeft, `RTL 关闭叉应靠左，实测 ${JSON.stringify(rtl)}`).toBeLessThan(rtl.fromRight);
  });
});
