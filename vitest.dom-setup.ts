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

// jsdom 缺口 polyfill：jsdom 不做真实布局，document.documentElement.clientWidth/
// clientHeight 恒为 0（真实浏览器里是视口内容区，排除经典滚动条）。use-floating 用
// clientWidth/clientHeight 而非 window.innerWidth/innerHeight 做溢出边界判断（对齐
// Semi tooltip #3354，避免经典滚动条下弹层贴边被遮挡），但 jsdom 的 innerWidth/
// innerHeight 有可靠的模拟值（默认 1024×768）而 clientWidth/clientHeight 没有。
// 镜像过去，让浮层定位测试在 jsdom 下算出与真实浏览器一致的可用空间。
if (typeof document !== 'undefined' && document.documentElement.clientWidth === 0) {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    get: () => window.innerWidth,
  });
  Object.defineProperty(document.documentElement, 'clientHeight', {
    configurable: true,
    get: () => window.innerHeight,
  });
}

afterEach(() => {
  cleanup();
  // 兜底：清空 body，移除 portal（Modal 等 appendChild 到 body 的节点）
  // 不归 testing-library 管，手动清掉避免下一个测试扫到上一个的浮层。
  document.body.innerHTML = '';
});
