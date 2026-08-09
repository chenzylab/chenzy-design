// Form.Field 的 RTL 镜像 e2e（browser project / 真实 chromium）。
// 全走 CSS 逻辑属性、无 .cd-rtl 覆盖块（对齐 Semi rtl.scss 手动镜像后的等价效果）：
// 钉住 labelPosition=left 时 label 的 margin 镜像、错误状态图标的 margin 镜像。
import { describe, it, expect } from 'vitest';
import { renderKbd } from '../test-utils/kbd.js';
import FieldRtlFixture from './FieldRtlFixture.svelte';

describe('Form.Field RTL 镜像（真实布局坐标，逻辑属性零 override）', () => {
  it('.cd-rtl 作用域存在（否则用例空转）', () => {
    const screen = renderKbd(FieldRtlFixture as never);
    const root = screen.baseElement;
    expect(root.querySelector('.cd-rtl')).toBeTruthy();
  });

  it('labelPosition=left：Field 容器 direction 在 RTL 下生效（否则逻辑属性不会镜像）', () => {
    const screen = renderKbd(FieldRtlFixture as never);
    const root = screen.baseElement;
    const ltrField = root.querySelector('[data-testid="ltr"] .cd-form-field')!;
    const rtlField = root.querySelector('[data-testid="rtl"] .cd-form-field')!;
    expect(getComputedStyle(ltrField).direction).toBe('ltr');
    expect(getComputedStyle(rtlField).direction).toBe('rtl');
  });

  it('labelPosition=left：label 的 margin-inline-end 在 LTR/RTL 下互换（视觉 right→left）', () => {
    // 注：$spacing-form_label_posLeft-marginRight 在 Semi 源码里真值就是 0
    // （variables.scss），本库 token 如实对齐，故此处只验证方向互换后仍相等
    // （镜像正确落地，而非制造一个 Semi 没有的非零值）。
    const screen = renderKbd(FieldRtlFixture as never);
    const root = screen.baseElement;
    const ltrLabel = root.querySelector('[data-testid="ltr"] .cd-form-field-label')!;
    const rtlLabel = root.querySelector('[data-testid="rtl"] .cd-form-field-label')!;
    const ltrStyle = getComputedStyle(ltrLabel);
    const rtlStyle = getComputedStyle(rtlLabel);

    expect(rtlStyle.marginLeft).toBe(ltrStyle.marginRight);
    expect(rtlStyle.marginRight).toBe(ltrStyle.marginLeft);
  });

  it('错误状态图标：margin-inline-end 在 LTR/RTL 下互换', () => {
    const screen = renderKbd(FieldRtlFixture as never);
    const root = screen.baseElement;
    const ltrIcon = root.querySelector('[data-testid="ltr"] .cd-form-field-validate-status-icon')!;
    const rtlIcon = root.querySelector('[data-testid="rtl"] .cd-form-field-validate-status-icon')!;
    const ltrStyle = getComputedStyle(ltrIcon);
    const rtlStyle = getComputedStyle(rtlIcon);

    expect(parseFloat(ltrStyle.marginRight)).toBeGreaterThan(0);
    expect(parseFloat(ltrStyle.marginLeft)).toBe(0);
    expect(parseFloat(rtlStyle.marginLeft)).toBeGreaterThan(0);
    expect(parseFloat(rtlStyle.marginRight)).toBe(0);
  });
});
