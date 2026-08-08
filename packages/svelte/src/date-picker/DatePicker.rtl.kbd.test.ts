// DatePicker 的 RTL 镜像 e2e（browser project / 真实 chromium）。
//
// 钉两件事：① 根节点 direction 在 RTL 下真的翻转（对齐 Semi datePicker/rtl.scss
// `.semi-datepicker { direction: rtl }`）；② range 触发器 prefix/suffix 的非对称
// padding 在 RTL 下正确互换（对齐 Semi rtl.scss &-range-input-prefix/-suffix）。
// 面板部分（Month/Switch/Navigation/YearAndMonth/Footer）portal 到 document.body 后
// 脱离 `.cd-rtl` 祖先（对齐 Semi `.semi-portal-rtl` 从未真正赋值的已知现状，见
// TimePicker RTL 处理），故不在此钉面板几何。
import { describe, it, expect } from 'vitest';
import { renderKbd } from '../test-utils/kbd.js';
import DatePickerRtlFixture from './DatePickerRtlFixture.svelte';

describe('DatePicker RTL 镜像（真实布局坐标）', () => {
  it('触发器 direction 在 LTR 为 ltr、RTL 为 rtl', async () => {
    const screen = renderKbd(DatePickerRtlFixture as never);
    const root = screen.baseElement;

    expect(root.querySelector('.cd-rtl'), '.cd-rtl 作用域应存在').toBeTruthy();

    const ltrPicker = root.querySelector('[data-testid="ltr"] .cd-datepicker-input') as HTMLElement;
    const rtlPicker = root.querySelector('[data-testid="rtl"] .cd-datepicker-input') as HTMLElement;
    expect(ltrPicker, 'LTR 触发器应存在').toBeTruthy();
    expect(rtlPicker, 'RTL 触发器应存在').toBeTruthy();

    expect(getComputedStyle(ltrPicker).direction).toBe('ltr');
    expect(getComputedStyle(rtlPicker).direction, 'RTL 下触发器应为 rtl').toBe('rtl');
  });

  it('range 触发器 prefix/suffix padding 在 RTL 下左右互换', async () => {
    const screen = renderKbd(DatePickerRtlFixture as never);
    const root = screen.baseElement;

    const ltrPrefix = root.querySelector('[data-testid="ltr"] .cd-datepicker-range-input-prefix') as HTMLElement;
    const rtlPrefix = root.querySelector('[data-testid="rtl"] .cd-datepicker-range-input-prefix') as HTMLElement;
    expect(ltrPrefix, 'LTR prefix 应存在').toBeTruthy();
    expect(rtlPrefix, 'RTL prefix 应存在').toBeTruthy();

    const ltrPrefixStyle = getComputedStyle(ltrPrefix);
    const rtlPrefixStyle = getComputedStyle(rtlPrefix);

    // LTR：prefix 左 12px 右 8px。
    expect(parseFloat(ltrPrefixStyle.paddingLeft)).toBe(12);
    expect(parseFloat(ltrPrefixStyle.paddingRight)).toBe(8);
    // RTL：换边，左 8px 右 12px。
    expect(parseFloat(rtlPrefixStyle.paddingLeft), 'RTL prefix 左内边距应换成 8px').toBe(8);
    expect(parseFloat(rtlPrefixStyle.paddingRight), 'RTL prefix 右内边距应换成 12px').toBe(12);

    const ltrSuffix = root.querySelector('[data-testid="ltr"] .cd-datepicker-range-input-suffix') as HTMLElement;
    const rtlSuffix = root.querySelector('[data-testid="rtl"] .cd-datepicker-range-input-suffix') as HTMLElement;
    expect(ltrSuffix, 'LTR suffix 应存在').toBeTruthy();
    expect(rtlSuffix, 'RTL suffix 应存在').toBeTruthy();

    const ltrSuffixStyle = getComputedStyle(ltrSuffix);
    const rtlSuffixStyle = getComputedStyle(rtlSuffix);

    // LTR：suffix 左 8px 右 12px。
    expect(parseFloat(ltrSuffixStyle.paddingLeft)).toBe(8);
    expect(parseFloat(ltrSuffixStyle.paddingRight)).toBe(12);
    // RTL：换边，左 12px 右 8px。
    expect(parseFloat(rtlSuffixStyle.paddingLeft), 'RTL suffix 左内边距应换成 12px').toBe(12);
    expect(parseFloat(rtlSuffixStyle.paddingRight), 'RTL suffix 右内边距应换成 8px').toBe(8);
  });
});
