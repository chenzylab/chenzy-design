// Button 系列的 RTL 镜像 e2e（browser project / 真实 chromium）。
// 钉住真实布局结果：icon-only padding 互换、ButtonGroup outline 叠边挪边、首末圆角互换。
import { describe, it, expect } from 'vitest';
import { renderKbd } from '../test-utils/kbd.js';
import ButtonRtlFixture from './ButtonRtlFixture.svelte';

describe('Button RTL 镜像（真实布局坐标）', () => {
  it('.cd-rtl 作用域存在（否则用例空转）', () => {
    const screen = renderKbd(ButtonRtlFixture as never);
    const root = screen.baseElement;
    expect(root.querySelector('.cd-rtl')).toBeTruthy();
  });

  it('icon-only 按钮：LTR/RTL padding 左右互换（含左右不等时才有意义）', () => {
    const screen = renderKbd(ButtonRtlFixture as never);
    const root = screen.baseElement;
    const ltrBtn = root.querySelector('[data-testid="ltr"] .cd-button-with-icon-only')!;
    const rtlBtn = root.querySelector('[data-testid="rtl"] .cd-button-with-icon-only')!;
    const ltrStyle = getComputedStyle(ltrBtn);
    const rtlStyle = getComputedStyle(rtlBtn);
    // icon-only 三档 padding 目前左右同值，故此断言核心是「规则生效不报错」+ 数值一致（互换后仍相等）。
    expect(rtlStyle.paddingLeft).toBe(ltrStyle.paddingRight);
    expect(rtlStyle.paddingRight).toBe(ltrStyle.paddingLeft);
  });

  it('outline ButtonGroup：LTR 首末圆角在左右，RTL 应精确互换', () => {
    const screen = renderKbd(ButtonRtlFixture as never);
    const root = screen.baseElement;
    const ltrButtons = [...root.querySelectorAll('[data-testid="ltr"] .cd-button-group .cd-button')];
    const rtlButtons = [...root.querySelectorAll('[data-testid="rtl"] .cd-button-group .cd-button')];
    expect(ltrButtons).toHaveLength(3);
    expect(rtlButtons).toHaveLength(3);

    const ltrFirst = getComputedStyle(ltrButtons[0]!);
    const ltrLast = getComputedStyle(ltrButtons[2]!);
    const rtlFirst = getComputedStyle(rtlButtons[0]!);
    const rtlLast = getComputedStyle(rtlButtons[2]!);

    // LTR：首个左侧有圆角、右侧无；末个右侧有圆角、左侧无。
    expect(ltrFirst.borderTopLeftRadius).not.toBe('0px');
    expect(ltrFirst.borderTopRightRadius).toBe('0px');
    expect(ltrLast.borderTopRightRadius).not.toBe('0px');
    expect(ltrLast.borderTopLeftRadius).toBe('0px');

    // RTL：镜像——首个右侧有圆角、左侧无；末个左侧有圆角、右侧无。
    expect(rtlFirst.borderTopRightRadius).not.toBe('0px');
    expect(rtlFirst.borderTopLeftRadius).toBe('0px');
    expect(rtlLast.borderTopLeftRadius).not.toBe('0px');
    expect(rtlLast.borderTopRightRadius).toBe('0px');
  });

  it('outline ButtonGroup：叠边挪到镜像侧（LTR 右侧透明，RTL 左侧透明）', () => {
    const screen = renderKbd(ButtonRtlFixture as never);
    const root = screen.baseElement;
    const ltrFirst = root.querySelectorAll('[data-testid="ltr"] .cd-button-group .cd-button')[0]!;
    const rtlFirst = root.querySelectorAll('[data-testid="rtl"] .cd-button-group .cd-button')[0]!;
    const ltrStyle = getComputedStyle(ltrFirst);
    const rtlStyle = getComputedStyle(rtlFirst);

    const TRANSPARENT = 'rgba(0, 0, 0, 0)';

    // LTR：非末尾 outline 按钮右边框透明（叠边），左边框保留描边色。
    expect(ltrStyle.borderRightColor).toBe(TRANSPARENT);
    expect(ltrStyle.borderLeftColor).not.toBe(TRANSPARENT);

    // RTL：镜像——左边框透明，右边框保留描边色。
    expect(rtlStyle.borderLeftColor).toBe(TRANSPARENT);
    expect(rtlStyle.borderRightColor).not.toBe(TRANSPARENT);
  });
});
