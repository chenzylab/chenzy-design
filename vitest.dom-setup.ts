// dom project 的 setup：每个测试后清理 testing-library 挂载的组件与 DOM，
// 避免 mount() 的节点跨测试残留污染 axe 扫描结果。
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

afterEach(() => {
  cleanup();
  // 兜底：清空 body，移除 portal（Modal 等 appendChild 到 body 的节点）
  // 不归 testing-library 管，手动清掉避免下一个测试扫到上一个的浮层。
  document.body.innerHTML = '';
});
