/**
 * CodeHighlight 惰性探测（可降级封装）。
 *
 * 代码块默认交给 CodeHighlight 组件（packages/svelte/src/code-highlight/，导出 `CodeHighlight`），
 * 由另一 agent 并行实现。若尚未合并 / 加载失败，则降级为纯 <pre><code>。
 *
 * 实现要点：
 * - **非字面量 specifier**：用变量持有模块路径，让 TS/svelte-check 不做静态模块解析，
 *   从而在 code-highlight entry 尚未存在时也能通过 typecheck（返回 `unknown`）。
 * - **单例 promise**：全组件共享一次探测，避免每个代码块重复 import。
 * - **失败降级**：模块缺失 / 无 CodeHighlight 导出 → 返回 undefined，渲染层退化 <pre><code>。
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MaybeComponent = any;

let cached: Promise<MaybeComponent> | undefined;

/**
 * 探测并加载 CodeHighlight 组件。
 * @returns CodeHighlight 组件；不可用时 undefined（触发 <pre><code> 降级）。
 */
export function loadCodeHighlight(): Promise<MaybeComponent> {
  if (cached) return cached;
  // 非字面量 specifier：绕过静态模块解析（code-highlight 可能尚未合并）。
  const spec = '../code-highlight/index.js';
  cached = import(/* @vite-ignore */ spec)
    .then((mod: Record<string, unknown> | undefined) => mod?.CodeHighlight)
    .catch(() => undefined);
  return cached;
}

/** 测试用：重置探测缓存。 */
export function __resetCodeHighlightCache(): void {
  cached = undefined;
}
