// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { useDismiss } from './dismiss.js';

function pressEscape(): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

function pointerDownOutside(): void {
  const target = document.createElement('div');
  document.body.appendChild(target);
  target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  target.remove();
}

function makeEl(): HTMLElement {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
}

describe('useDismiss', () => {
  it('单实例：Escape 触发 onDismiss(esc)，外部点击触发 onDismiss(outsideClick)', () => {
    const onDismiss = vi.fn();
    const el = makeEl();
    const cleanup = useDismiss(el, { onDismiss });

    pressEscape();
    expect(onDismiss).toHaveBeenCalledWith('esc', expect.any(KeyboardEvent));

    pointerDownOutside();
    expect(onDismiss).toHaveBeenCalledWith('outsideClick', expect.any(PointerEvent));

    cleanup();
  });

  it('cleanup 后不再响应 Escape', () => {
    const onDismiss = vi.fn();
    const el = makeEl();
    const cleanup = useDismiss(el, { onDismiss });
    cleanup();

    pressEscape();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('escape:false 时不消费 Escape，也不占用栈位', () => {
    const onDismiss = vi.fn();
    const el = makeEl();
    const cleanup = useDismiss(el, { onDismiss, escape: false });

    pressEscape();
    expect(onDismiss).not.toHaveBeenCalled();

    cleanup();
  });

  it('嵌套场景：两个实例（如 Modal 内嵌 DatePicker）按一次 Escape，只有后挂载（内层）的响应', () => {
    const outerDismiss = vi.fn(); // 模拟 Modal
    const innerDismiss = vi.fn(); // 模拟 DatePicker/Tooltip
    const outerEl = makeEl();
    const innerEl = makeEl();

    const cleanupOuter = useDismiss(outerEl, { onDismiss: outerDismiss });
    const cleanupInner = useDismiss(innerEl, { onDismiss: innerDismiss });

    pressEscape();

    expect(innerDismiss).toHaveBeenCalledTimes(1);
    expect(outerDismiss).not.toHaveBeenCalled();

    cleanupInner();
    cleanupOuter();
  });

  it('内层关闭（cleanup）后，再次 Escape 改由外层响应', () => {
    const outerDismiss = vi.fn();
    const innerDismiss = vi.fn();
    const outerEl = makeEl();
    const innerEl = makeEl();

    const cleanupOuter = useDismiss(outerEl, { onDismiss: outerDismiss });
    const cleanupInner = useDismiss(innerEl, { onDismiss: innerDismiss });

    pressEscape();
    expect(innerDismiss).toHaveBeenCalledTimes(1);
    expect(outerDismiss).not.toHaveBeenCalled();

    cleanupInner(); // 内层浮层关闭

    pressEscape();
    expect(outerDismiss).toHaveBeenCalledTimes(1);
    expect(innerDismiss).toHaveBeenCalledTimes(1); // 仍是之前那一次，未再触发

    cleanupOuter();
  });

  it('三层嵌套：Escape 严格按挂载顺序逆序响应（后进先出）', () => {
    const layer1 = vi.fn();
    const layer2 = vi.fn();
    const layer3 = vi.fn();

    const c1 = useDismiss(makeEl(), { onDismiss: layer1 });
    const c2 = useDismiss(makeEl(), { onDismiss: layer2 });
    const c3 = useDismiss(makeEl(), { onDismiss: layer3 });

    pressEscape();
    expect(layer3).toHaveBeenCalledTimes(1);
    expect(layer2).not.toHaveBeenCalled();
    expect(layer1).not.toHaveBeenCalled();

    c3();
    pressEscape();
    expect(layer2).toHaveBeenCalledTimes(1);
    expect(layer1).not.toHaveBeenCalled();

    c2();
    pressEscape();
    expect(layer1).toHaveBeenCalledTimes(1);

    c1();
  });

  it('outsideClick 不受嵌套栈影响：两个实例的外部点击各自独立判断', () => {
    const outerDismiss = vi.fn();
    const innerDismiss = vi.fn();
    const outerEl = makeEl();
    const innerEl = makeEl();

    const cleanupOuter = useDismiss(outerEl, { onDismiss: outerDismiss });
    const cleanupInner = useDismiss(innerEl, { onDismiss: innerDismiss });

    // 点击一个既不在 outerEl 也不在 innerEl 内的位置：两者都应判定为"外部点击"
    pointerDownOutside();
    expect(outerDismiss).toHaveBeenCalledWith('outsideClick', expect.any(PointerEvent));
    expect(innerDismiss).toHaveBeenCalledWith('outsideClick', expect.any(PointerEvent));

    cleanupInner();
    cleanupOuter();
  });
});
