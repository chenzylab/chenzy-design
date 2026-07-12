// dom project 的 setup：每个测试后清理 testing-library 挂载的组件与 DOM，
// 避免 mount() 的节点跨测试残留污染 axe 扫描结果。
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

// jsdom 缺口 polyfill：jsdom 未实现 Element.prototype.scrollIntoView，
// 而 TimePicker/DatePicker 等浮层打开时会调用它滚动选中项进入视口。
// 不打桩会抛 "scrollIntoView is not a function" 的 unhandled rejection（污染测试运行）。
// 这是 jsdom 的渲染/布局缺口，与组件逻辑无关，故在 dom setup 统一打无操作桩。
if (typeof Element !== 'undefined' && typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// jsdom 缺口 polyfill：jsdom 未实现 ResizeObserver，而 Typography 的 ellipsis 测量
// （Card string title 走 Typography.Title ellipsis）在 $effect 中 new ResizeObserver 观测尺寸。
// 不打桩会抛 "ResizeObserver is not defined"。同为布局缺口，统一打无操作桩。
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

afterEach(() => {
  cleanup();
  // 兜底：清空 body，移除 portal（Modal 等 appendChild 到 body 的节点）
  // 不归 testing-library 管，手动清掉避免下一个测试扫到上一个的浮层。
  document.body.innerHTML = '';
});
