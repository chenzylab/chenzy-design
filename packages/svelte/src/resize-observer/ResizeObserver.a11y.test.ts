// ResizeObserver 组件：observeParent 行为 + 无 a11y 角色（透明容器）。
// jsdom 无原生 ResizeObserver；用一个可控桩记录 observe 的目标，
// 断言 observeParent 观测的是父节点（而非包裹元素本身）。
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from '@testing-library/svelte';
import ResizeObserver from './ResizeObserver.svelte';

// 记录所有被观测的元素（跨实例）。每个测试前清空。
const observedTargets: Element[] = [];
let originalRO: unknown;
// 最近一个桩实例的回调，供测试手动投递 entry（jsdom 无真实布局，无法自然触发）。
// 存在容器对象里：直接用 let + 赋 null 会被 TS 在赋值后窄化成 never（构造器内的写入它看不到）。
type ROCallback = (entries: ResizeObserverEntry[]) => void;
const trigger: { fn: ROCallback | undefined } = { fn: undefined };

/** 取当前桩回调（断言已装配），避免 TS 对可选属性的 never 窄化。 */
function fire(entries: ResizeObserverEntry[]): void {
  const cb = trigger.fn;
  if (!cb) throw new Error('StubResizeObserver 尚未装配回调');
  cb(entries);
}

class StubResizeObserver {
  constructor(cb: ROCallback) {
    trigger.fn = cb;
  }
  observe(el: Element): void {
    observedTargets.push(el);
  }
  unobserve(): void {}
  disconnect(): void {}
}

/** 最小 children snippet：渲染一个真实子元素，供 observeChild 测试取 firstElementChild。 */
const childSnippet = createRawSnippet(() => ({
  render: () => '<span data-testid="ro-child">child</span>',
}));

/** 造一个最小 ResizeObserverEntry（组件走 contentRect 回退路径）。 */
function entryFor(target: Element, width: number, height: number): ResizeObserverEntry {
  return {
    target,
    contentRect: { width, height } as DOMRectReadOnly,
    borderBoxSize: [],
    contentBoxSize: [],
    devicePixelContentBoxSize: [],
  } as unknown as ResizeObserverEntry;
}

beforeAll(() => {
  originalRO = (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = StubResizeObserver;
});

afterAll(() => {
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = originalRO;
});

describe('ResizeObserver observeParent', () => {
  it('默认观测包裹元素自身', async () => {
    observedTargets.length = 0;
    const { container } = render(ResizeObserver, { props: {} });
    // effect 挂载后 observe 已执行。
    await Promise.resolve();
    const wrapper = container.querySelector('.cd-resize-observer');
    expect(wrapper).not.toBeNull();
    expect(observedTargets).toContain(wrapper);
  });

  it('observeParent=true 同时观测包裹元素与其父节点（严格对齐 Semi，非互斥替代）', async () => {
    observedTargets.length = 0;
    // render 把组件挂到一个由 testing-library 提供的父容器（container 的子节点是 wrapper，
    // wrapper.parentElement 即该容器）。
    const { container } = render(ResizeObserver, { props: { observeParent: true } });
    await Promise.resolve();
    const wrapper = container.querySelector('.cd-resize-observer') as HTMLElement;
    expect(wrapper).not.toBeNull();
    const parent = wrapper.parentElement;
    expect(parent).not.toBeNull();
    // Semi ReactResizeObserver.observeElement：element 与 element.parentNode 都 observe，
    // 两个目标共用同一 observer 实例，回调按 entry.target 分别触发。
    expect(observedTargets).toContain(parent);
    expect(observedTargets).toContain(wrapper);
  });

  it('observerProperty 透传到 core：width 模式下仅高度变化不回调（对齐 Semi）', async () => {
    observedTargets.length = 0;
    trigger.fn = undefined;
    const seen: Array<{ width: number; height: number }> = [];
    const { container } = render(ResizeObserver, {
      props: {
        observerProperty: 'width',
        onResize: (e: { width: number; height: number }) =>
          seen.push({ width: e.width, height: e.height }),
      },
    });
    await Promise.resolve();
    const wrapper = container.querySelector('.cd-resize-observer') as HTMLElement;
    expect(trigger.fn).toBeTypeOf('function');

    // 首帧放行。
    fire([entryFor(wrapper, 100, 50)]);
    expect(seen).toHaveLength(1);

    // 仅高度变化 → 被 observerProperty 过滤掉。
    fire([entryFor(wrapper, 100, 80)]);
    expect(seen).toHaveLength(1);

    // 宽度变化 → 放行。
    fire([entryFor(wrapper, 140, 80)]);
    expect(seen).toHaveLength(2);
    expect(seen[1]?.width).toBe(140);
  });

  it("默认 observerProperty='all'：任何维度变化都回调（无回归）", async () => {
    observedTargets.length = 0;
    trigger.fn = undefined;
    let calls = 0;
    const { container } = render(ResizeObserver, {
      props: { onResize: () => (calls += 1) },
    });
    await Promise.resolve();
    const wrapper = container.querySelector('.cd-resize-observer') as HTMLElement;
    fire([entryFor(wrapper, 100, 50)]);
    fire([entryFor(wrapper, 100, 80)]);
    expect(calls).toBe(2);
  });

  it('observeChild=true 观测 children 首个元素（对齐 Semi cloneElement 注入 ref）', async () => {
    observedTargets.length = 0;
    const { container } = render(ResizeObserver, {
      props: { observeChild: true, children: childSnippet },
    });
    await Promise.resolve();
    const wrapper = container.querySelector('.cd-resize-observer') as HTMLElement;
    const child = wrapper.firstElementChild;
    expect(child).not.toBeNull();
    // 观测的是子元素本身，不是包裹元素（与 Semi 直接观测 child 语义一致）。
    expect(observedTargets).toContain(child);
    expect(observedTargets).not.toContain(wrapper);
  });

  it('observeChild=true 但无子元素时回退观测包裹元素（不静默失效）', async () => {
    observedTargets.length = 0;
    const { container } = render(ResizeObserver, { props: { observeChild: true } });
    await Promise.resolve();
    const wrapper = container.querySelector('.cd-resize-observer');
    expect(observedTargets).toContain(wrapper);
  });

  it('observeChild + observeParent 叠加：同时观测子元素与其父节点', async () => {
    observedTargets.length = 0;
    const { container } = render(ResizeObserver, {
      props: { observeChild: true, observeParent: true, children: childSnippet },
    });
    await Promise.resolve();
    const wrapper = container.querySelector('.cd-resize-observer') as HTMLElement;
    const child = wrapper.firstElementChild as HTMLElement;
    expect(child).not.toBeNull();
    // child.parentElement === wrapper：叠加后应同时观测到子元素与其父节点（即 wrapper）。
    expect(observedTargets).toContain(child);
    expect(observedTargets).toContain(wrapper);
  });

  it('透明容器不设 role/tabindex（不进 a11y 树）', () => {
    const { container } = render(ResizeObserver, { props: {} });
    const wrapper = container.querySelector('.cd-resize-observer') as HTMLElement;
    expect(wrapper.getAttribute('role')).toBeNull();
    expect(wrapper.getAttribute('tabindex')).toBeNull();
  });
});
