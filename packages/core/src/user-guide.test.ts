import { describe, it, expect, vi } from 'vitest';
import {
  createUserGuide,
  getSpotlightRect,
  isStepActive,
  nextActiveIndex,
  shouldShowSkip,
  shouldShowPrev,
  isLastStep,
  type UserGuideStepData,
} from './user-guide.js';

function fakeTarget(rect: Partial<DOMRect> = {}): Element {
  return {
    getBoundingClientRect: () =>
      ({ left: 10, top: 20, width: 100, height: 40, ...rect }) as DOMRect,
  } as unknown as Element;
}

describe('createUserGuide — 步进状态机', () => {
  const steps: UserGuideStepData[] = [
    { target: fakeTarget() },
    { target: fakeTarget() },
    { target: fakeTarget() },
  ];

  it('非受控 next/prev 推进并去重通知', () => {
    const onChange = vi.fn();
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const g = createUserGuide({ steps, onChange, onNext, onPrev });
    expect(g.getCurrent()).toBe(0);

    expect(g.handleNext()).toBe(true);
    expect(g.getCurrent()).toBe(1);
    expect(onNext).toHaveBeenLastCalledWith(1);
    expect(onChange).toHaveBeenLastCalledWith(1);

    expect(g.handlePrev()).toBe(true);
    expect(g.getCurrent()).toBe(0);
    expect(onPrev).toHaveBeenLastCalledWith(0);
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('首步 prev / 末步 next 不改变、不通知（去重）', () => {
    const onChange = vi.fn();
    const g = createUserGuide({ steps, onChange });
    expect(g.handlePrev()).toBe(false);
    expect(g.getCurrent()).toBe(0);
    g.handleNext();
    g.handleNext();
    expect(g.getCurrent()).toBe(2);
    onChange.mockClear();
    expect(g.handleNext()).toBe(false);
    expect(g.getCurrent()).toBe(2);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('受控模式内部不改 current，仅通知', () => {
    const onChange = vi.fn();
    const g = createUserGuide({ steps, current: 1, onChange });
    expect(g.isControlled()).toBe(true);
    expect(g.getCurrent()).toBe(1);
    expect(g.handleNext()).toBe(true);
    // 内部不回写：仍读 options.current=1
    expect(g.getCurrent()).toBe(1);
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('reset 非受控回 0（对齐首个有效步）', () => {
    const g = createUserGuide({ steps });
    g.handleNext();
    g.handleNext();
    expect(g.getCurrent()).toBe(2);
    g.reset();
    expect(g.getCurrent()).toBe(0);
  });

  it('reset 受控不改内部', () => {
    const g = createUserGuide({ steps, current: 2 });
    g.reset();
    expect(g.getCurrent()).toBe(2);
  });

  it('skip / finish 触发对应回调（不自动关闭）', () => {
    const onSkip = vi.fn();
    const onFinish = vi.fn();
    const g = createUserGuide({ steps, onSkip, onFinish });
    g.handleSkip();
    g.handleFinish();
    expect(onSkip).toHaveBeenCalledOnce();
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it('popup 模式跳过无 target 的步骤', () => {
    const gapped: UserGuideStepData[] = [
      { target: fakeTarget() },
      { target: null }, // 无 target → 跳过
      { target: fakeTarget() },
    ];
    const g = createUserGuide({ steps: gapped });
    expect(g.getCurrent()).toBe(0);
    g.handleNext();
    // 跳过 index 1，落到 index 2
    expect(g.getCurrent()).toBe(2);
    g.handlePrev();
    expect(g.getCurrent()).toBe(0);
  });

  it('起始步无 target 时对齐到首个有效步', () => {
    const gapped: UserGuideStepData[] = [
      { target: null },
      { target: fakeTarget() },
    ];
    const g = createUserGuide({ steps: gapped });
    expect(g.getCurrent()).toBe(1);
  });

  it('modal 模式不因缺 target 跳过', () => {
    const g = createUserGuide({
      steps: [{}, {}, {}],
      mode: 'modal',
    });
    expect(g.getCurrent()).toBe(0);
    g.handleNext();
    expect(g.getCurrent()).toBe(1);
  });
});

describe('getSpotlightRect — 矩形 + padding 三层覆盖', () => {
  it('默认 padding=5', () => {
    const rect = getSpotlightRect({ target: fakeTarget() });
    expect(rect).toEqual({ x: 5, y: 15, width: 110, height: 50 });
  });

  it('props padding 覆盖默认', () => {
    const rect = getSpotlightRect({ target: fakeTarget() }, 10);
    expect(rect).toEqual({ x: 0, y: 10, width: 120, height: 60 });
  });

  it('step padding 覆盖 props', () => {
    const rect = getSpotlightRect(
      { target: fakeTarget(), spotlightPadding: 0 },
      10,
    );
    expect(rect).toEqual({ x: 10, y: 20, width: 100, height: 40 });
  });

  it('无 target 返回 null', () => {
    expect(getSpotlightRect({ target: null })).toBeNull();
    expect(getSpotlightRect(undefined)).toBeNull();
  });

  it('函数式 target 解析', () => {
    const el = fakeTarget();
    const rect = getSpotlightRect({ target: () => el });
    expect(rect).not.toBeNull();
  });
});

describe('按钮显隐规则', () => {
  it('shouldShowSkip: 非末步显示', () => {
    expect(shouldShowSkip(0, 3)).toBe(true);
    expect(shouldShowSkip(1, 3)).toBe(true);
    expect(shouldShowSkip(2, 3)).toBe(false); // 末步隐藏
    expect(shouldShowSkip(0, 0)).toBe(false);
  });

  it('shouldShowPrev: 非首步显示', () => {
    expect(shouldShowPrev(0)).toBe(false);
    expect(shouldShowPrev(1)).toBe(true);
  });

  it('isLastStep', () => {
    expect(isLastStep(2, 3)).toBe(true);
    expect(isLastStep(1, 3)).toBe(false);
    expect(isLastStep(0, 0)).toBe(false);
  });
});

describe('helpers', () => {
  it('isStepActive popup 依赖 target；modal 恒真', () => {
    expect(isStepActive({ target: fakeTarget() }, 'popup')).toBe(true);
    expect(isStepActive({ target: null }, 'popup')).toBe(false);
    expect(isStepActive({ target: null }, 'modal')).toBe(true);
    expect(isStepActive(undefined, 'popup')).toBe(false);
  });

  it('nextActiveIndex 前后向找有效步', () => {
    const steps: UserGuideStepData[] = [
      { target: fakeTarget() },
      { target: null },
      { target: fakeTarget() },
    ];
    expect(nextActiveIndex(steps, 0, 1, 'popup')).toBe(2);
    expect(nextActiveIndex(steps, 2, -1, 'popup')).toBe(0);
    expect(nextActiveIndex(steps, 2, 1, 'popup')).toBe(-1);
    expect(nextActiveIndex(steps, 1, 1, 'popup', true)).toBe(2);
  });
});
