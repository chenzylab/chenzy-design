// Switch 的 RTL 镜像几何 e2e（browser project / 真实 chromium）。
//
// 钉住的是「RTL 下 knob 落在哪」这个**真实布局结果**，不是「有没有写某条 CSS」。
// 起因：补 RTL 时只把 translateX 取负，结果 knob 被甩出轨道外
// （实测 off 态 fromLeft=-1、on 态 fromLeft=-17）——因为本库正向锚点用的是
// `inset-inline-start`，它在 RTL 下**自己已经翻过一次**，负位移是第二次翻转。
// 正解是像 Semi rtl.scss 那样用物理属性把锚点钉死（right:0; left:auto），
// 让负位移成为唯一那次翻转。
//
// 这类 bug 的特征：typecheck / 单测 / a11y 全绿，只有量真实坐标才暴露。
import { describe, it, expect } from 'vitest';
import { renderKbd } from '../test-utils/kbd.js';
import SwitchRtlFixture from './SwitchRtlFixture.svelte';

interface Geometry {
  fromLeft: number;
  fromRight: number;
  inside: boolean;
}

/** knob 相对轨道左右边缘的距离（四舍五入到整数像素）。 */
function knobGeometry(sw: Element): Geometry {
  const knob = sw.querySelector('.cd-switch-knob');
  if (!knob) throw new Error('找不到 .cd-switch-knob');
  const s = sw.getBoundingClientRect();
  const k = knob.getBoundingClientRect();
  const fromLeft = Math.round(k.left - s.left);
  const fromRight = Math.round(s.right - k.right);
  return { fromLeft, fromRight, inside: fromLeft >= 0 && fromRight >= 0 };
}

describe('Switch RTL 镜像（真实布局坐标）', () => {
  it('LTR：off 贴左、on 贴右；RTL 应恰好镜像', async () => {
    const screen = renderKbd(SwitchRtlFixture as never);
    const root = screen.baseElement;

    const ltr = root.querySelector('[data-testid="ltr"]');
    const rtl = root.querySelector('[data-testid="rtl"]');
    expect(ltr, 'LTR 容器应存在').toBeTruthy();
    expect(rtl, 'RTL 容器应存在').toBeTruthy();

    // ConfigProvider direction='rtl' 必须真的注入 .cd-rtl 作用域，否则本用例是空转
    expect(root.querySelector('.cd-rtl'), '.cd-rtl 作用域应存在').toBeTruthy();

    const ltrSw = [...ltr!.querySelectorAll('.cd-switch')];
    const rtlSw = [...rtl!.querySelectorAll('.cd-switch')];
    expect(ltrSw).toHaveLength(2);
    expect(rtlSw).toHaveLength(2);

    // 上面已断言各 2 个，这里用非空断言让类型收窄（exactOptionalPropertyTypes 下解构元素是可选的）
    const [ltrOff, ltrOn] = ltrSw.map(knobGeometry) as [Geometry, Geometry];
    const [rtlOff, rtlOn] = rtlSw.map(knobGeometry) as [Geometry, Geometry];

    // knob 永远不能跑出轨道（这条就是当初那个 bug 的直接判据）
    for (const [name, g] of [
      ['ltr-off', ltrOff], ['ltr-on', ltrOn],
      ['rtl-off', rtlOff], ['rtl-on', rtlOn],
    ] as const) {
      expect(g.inside, `${name} 的 knob 不应跑出轨道，实测 ${JSON.stringify(g)}`).toBe(true);
    }

    // LTR：未选中贴左、选中贴右
    expect(ltrOff.fromLeft).toBeLessThan(ltrOff.fromRight);
    expect(ltrOn.fromRight).toBeLessThan(ltrOn.fromLeft);

    // RTL：整体镜像 —— 未选中贴右、选中贴左
    expect(rtlOff.fromRight, 'RTL 未选中应贴右').toBeLessThan(rtlOff.fromLeft);
    expect(rtlOn.fromLeft, 'RTL 选中应贴左').toBeLessThan(rtlOn.fromRight);

    // 且是**精确**镜像：RTL 的左右距离应与 LTR 互换
    expect(rtlOff.fromRight).toBe(ltrOff.fromLeft);
    expect(rtlOff.fromLeft).toBe(ltrOff.fromRight);
    expect(rtlOn.fromLeft).toBe(ltrOn.fromRight);
    expect(rtlOn.fromRight).toBe(ltrOn.fromLeft);
  });
});
