import { describe, it, expect, vi } from 'vitest';
import {
  createUserGuide,
  getSpotlightRect,
  DEFAULT_SPOTLIGHT_PADDING,
  type UserGuideStepData,
} from './user-guide.js';

function fakeTarget(rect: Partial<DOMRect> = {}): Element {
  return {
    getBoundingClientRect: () =>
      ({ left: 10, top: 20, width: 100, height: 40, ...rect }) as DOMRect,
  } as unknown as Element;
}

describe('createUserGuide — 步进状态机（对齐 Semi foundation）', () => {
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

    g.handleNext();
    expect(g.getCurrent()).toBe(1);
    expect(onNext).toHaveBeenLastCalledWith(1);
    expect(onChange).toHaveBeenLastCalledWith(1);

    g.handlePrev();
    expect(g.getCurrent()).toBe(0);
    expect(onPrev).toHaveBeenLastCalledWith(0);
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('末步 next 触发 finish 而非前进', () => {
    const onChange = vi.fn();
    const onFinish = vi.fn();
    const g = createUserGuide({ steps, onChange, onFinish });
    g.handleNext();
    g.handleNext();
    expect(g.getCurrent()).toBe(2);
    onChange.mockClear();
    g.handleNext();
    expect(g.getCurrent()).toBe(2);
    expect(onChange).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it('受控模式内部不改 current，仅通知', () => {
    const onChange = vi.fn();
    const g = createUserGuide({ steps, current: 1, onChange });
    expect(g.isControlled()).toBe(true);
    expect(g.getCurrent()).toBe(1);
    g.handleNext();
    // 内部不回写：仍读 options.current=1
    expect(g.getCurrent()).toBe(1);
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('reset 非受控回 0', () => {
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

  it('skip 触发 onSkip（不自动关闭）', () => {
    const onSkip = vi.fn();
    const g = createUserGuide({ steps, onSkip });
    g.handleSkip();
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it('导航不因缺 target 跳过（对齐 Semi：无 target 步仅不渲染）', () => {
    const gapped: UserGuideStepData[] = [
      { target: fakeTarget() },
      { target: null },
      { target: fakeTarget() },
    ];
    const g = createUserGuide({ steps: gapped });
    expect(g.getCurrent()).toBe(0);
    g.handleNext();
    expect(g.getCurrent()).toBe(1);
    g.handleNext();
    expect(g.getCurrent()).toBe(2);
  });
});

describe('getSpotlightRect — 矩形 + padding 三层覆盖', () => {
  it('默认 padding=5', () => {
    const rect = getSpotlightRect({ target: fakeTarget() });
    expect(rect).toEqual({ x: 5, y: 15, width: 110, height: 50 });
    expect(DEFAULT_SPOTLIGHT_PADDING).toBe(5);
  });

  it('props padding 覆盖默认', () => {
    const rect = getSpotlightRect({ target: fakeTarget() }, 10);
    expect(rect).toEqual({ x: 0, y: 10, width: 120, height: 60 });
  });

  it('step padding 覆盖 props', () => {
    const rect = getSpotlightRect(
      { target: fakeTarget(), spotlightPadding: 15 },
      10,
    );
    expect(rect).toEqual({ x: -5, y: 5, width: 130, height: 70 });
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
