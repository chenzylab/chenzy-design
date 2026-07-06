// ResizeObserver 组件：observeParent 行为 + 无 a11y 角色（透明容器）。
// jsdom 无原生 ResizeObserver；用一个可控桩记录 observe 的目标，
// 断言 observeParent 观测的是父节点（而非包裹元素本身）。
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render } from '@testing-library/svelte';
import ResizeObserver from './ResizeObserver.svelte';

// 记录所有被观测的元素（跨实例）。每个测试前清空。
const observedTargets: Element[] = [];
let originalRO: unknown;

class StubResizeObserver {
  observe(el: Element): void {
    observedTargets.push(el);
  }
  unobserve(): void {}
  disconnect(): void {}
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

  it('observeParent=true 观测父节点而非包裹元素', async () => {
    observedTargets.length = 0;
    // render 把组件挂到一个由 testing-library 提供的父容器（container 的子节点是 wrapper，
    // wrapper.parentElement 即该容器）。
    const { container } = render(ResizeObserver, { props: { observeParent: true } });
    await Promise.resolve();
    const wrapper = container.querySelector('.cd-resize-observer') as HTMLElement;
    expect(wrapper).not.toBeNull();
    const parent = wrapper.parentElement;
    expect(parent).not.toBeNull();
    // 观测的是父节点，不是包裹元素本身。
    expect(observedTargets).toContain(parent);
    expect(observedTargets).not.toContain(wrapper);
  });

  it('透明容器不设 role/tabindex（不进 a11y 树）', () => {
    const { container } = render(ResizeObserver, { props: {} });
    const wrapper = container.querySelector('.cd-resize-observer') as HTMLElement;
    expect(wrapper.getAttribute('role')).toBeNull();
    expect(wrapper.getAttribute('tabindex')).toBeNull();
  });
});
