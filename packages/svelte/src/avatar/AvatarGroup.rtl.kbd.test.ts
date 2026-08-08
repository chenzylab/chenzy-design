// AvatarGroup 的 RTL 层叠镜像 e2e（browser project / 真实 chromium）。
//
// 这批规则曾整段是死代码：写成 `[dir='rtl']` 属性选择器，
// 而 ConfigProvider（同 Semi）只注入 `class="cd-rtl"`、不设 dir 属性。
// 全库同类死写法共 28 处、分布在 8 个组件，已一并改为 `.cd-rtl` 并建闸门拦截。
//
// 钉的是**真实层叠顺序**：LTR 下第一个头像在最左，RTL 下应在最右。
import { describe, it, expect } from 'vitest';
import { renderKbd } from '../test-utils/kbd.js';
import AvatarGroupRtlFixture from './AvatarGroupRtlFixture.svelte';

/** 取组内各头像的左边缘 x（相对组容器）。 */
function itemLefts(group: Element): number[] {
  const g = group.getBoundingClientRect();
  return [...group.querySelectorAll('.cd-avatar')].map((el) =>
    Math.round(el.getBoundingClientRect().left - g.left),
  );
}

describe('AvatarGroup RTL 层叠镜像（真实布局坐标）', () => {
  it('LTR 首个头像在最左，RTL 首个头像在最右', async () => {
    const screen = renderKbd(AvatarGroupRtlFixture as never);
    const root = screen.baseElement;

    const ltrGroup = root.querySelector('[data-testid="ltr"] .cd-avatar-group');
    const rtlGroup = root.querySelector('[data-testid="rtl"] .cd-avatar-group');
    expect(ltrGroup, 'LTR group 应存在').toBeTruthy();
    expect(rtlGroup, 'RTL group 应存在').toBeTruthy();

    // 方向真的翻了（这条直接判死代码那个 bug）
    expect(getComputedStyle(rtlGroup as Element).direction, 'RTL 下组方向应为 rtl').toBe('rtl');

    const ltr = itemLefts(ltrGroup!);
    const rtl = itemLefts(rtlGroup!);
    expect(ltr).toHaveLength(3);
    expect(rtl).toHaveLength(3);

    // 头像必须有真实尺寸，否则三个坐标全为 0、下面的比较是空转
    expect(new Set(ltr).size, `LTR 三个头像坐标不应重合，实测 ${JSON.stringify(ltr)}`).toBe(3);

    // LTR：按 DOM 顺序自左向右递增
    expect(ltr[0]!).toBeLessThan(ltr[1]!);
    expect(ltr[1]!).toBeLessThan(ltr[2]!);

    // RTL：整体镜像 —— 按 DOM 顺序自右向左递减
    expect(rtl[0]!, `RTL 应自右向左排，实测 ${JSON.stringify(rtl)}`).toBeGreaterThan(rtl[1]!);
    expect(rtl[1]!).toBeGreaterThan(rtl[2]!);
  });
});
