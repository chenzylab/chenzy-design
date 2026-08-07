// TimePicker 的 RTL 镜像 e2e（browser project / 真实 chromium）。
//
// 钉触发器根节点 direction 在 RTL 下真的翻转（对齐 Semi timePicker/rtl.scss `.semi-timepicker { direction: rtl }`）。
// 面板部分 Semi 挂在 `.semi-portal-rtl`（portal 到 body 后脱离 rtl 祖先，上游从未真正赋值该类），
// 故不在此钉面板几何，只钉触发器可达范围。
import { describe, it, expect } from 'vitest';
import { renderKbd } from '../test-utils/kbd.js';
import TimePickerRtlFixture from './TimePickerRtlFixture.svelte';

describe('TimePicker RTL 镜像（真实布局坐标）', () => {
  it('触发器 direction 在 LTR 为 ltr、RTL 为 rtl', async () => {
    const screen = renderKbd(TimePickerRtlFixture as never);
    const root = screen.baseElement;

    expect(root.querySelector('.cd-rtl'), '.cd-rtl 作用域应存在').toBeTruthy();

    const ltrPicker = root.querySelector('[data-testid="ltr"] .cd-time-picker') as HTMLElement;
    const rtlPicker = root.querySelector('[data-testid="rtl"] .cd-time-picker') as HTMLElement;
    expect(ltrPicker, 'LTR TimePicker 应存在').toBeTruthy();
    expect(rtlPicker, 'RTL TimePicker 应存在').toBeTruthy();

    expect(getComputedStyle(ltrPicker).direction).toBe('ltr');
    expect(getComputedStyle(rtlPicker).direction, 'RTL 下 TimePicker 应为 rtl').toBe('rtl');
  });
});
