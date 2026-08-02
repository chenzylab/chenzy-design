/**
 * cdGlobal — 全局组件默认 props 覆盖（严格对齐 Semi `semiGlobal`）。
 *
 * 对齐来源：`semi-ui/_utils/semi-global.ts`（`semiGlobal.config.overrideDefaultProps`）
 * + `semi-ui/_utils/index.tsx` 的 `getDefaultPropsFromGlobalConfig`。
 *
 * 用途：在站点入口一次性改掉某个组件的默认 props（例如把所有 Button 默认设为
 * `theme='solid'`、所有 Select 的 `zIndex` 设为 2000），无需逐处传 prop、也无需包一层封装。
 *
 * 与 ConfigProvider 的分工（对齐 Semi 文档的说法）：
 * - **跨组件公共配置**（locale / direction / timeZone / getPopupContainer）→ `ConfigProvider`，
 *   作用于 context 子树，可嵌套、可局部覆盖。
 * - **单个组件的默认 props** → `cdGlobal`，**单例、全站生效、不随组件树变化**。
 *   只想覆盖局部就别用它，改用「包一层封装组件并传入新默认值」。
 *
 * 设计取舍（与 Semi 的实现差异，非语义差异）：
 * Semi 用 `Proxy` 包 React 的 `static defaultProps`（React 在渲染前会读 defaultProps 补齐 props）。
 * Svelte 5 的默认值写在 `let { x = 1 } = $props()` 的解构里，没有可被外部拦截的 defaultProps 对象，
 * 故本库改为**显式函数式读取**：组件把「无外部传值时的兜底」交给 `resolveDefault()`，
 * 它先查 cdGlobal 再回退组件内置默认值。语义与 Semi 一致（外部显式传值恒优先于全局默认）。
 *
 * 无 DOM、无框架依赖：纯模块级单例 + 纯函数，可单测。
 */

/** 一个组件的默认 props 覆盖表（键为 prop 名，值为该 prop 的新默认值）。 */
export type ComponentDefaultProps = Record<string, unknown>;

/** 全局配置对象（对齐 Semi `SemiGlobalConfig`）。 */
export interface GlobalConfig {
  /**
   * 按组件名覆盖默认 props。组件名用**公开导出名**（`'Button'` / `'Select'` / `'Toast'`…），
   * 与各组件 `meta.ts` 的 `name` 一致。
   */
  overrideDefaultProps?: Record<string, ComponentDefaultProps>;
}

/**
 * 全局单例（对齐 Semi `export default new SemiGlobal()`）。
 * 站点入口处赋值即可：`cdGlobal.config.overrideDefaultProps = { Button: { theme: 'solid' } }`。
 */
export const cdGlobal: { config: GlobalConfig } = { config: {} };

/**
 * 读取某组件某 prop 的全局默认值；未配置时返回 `undefined`。
 * 每次调用都实时读 `cdGlobal.config`（对齐 Semi Proxy 的 get 语义）。
 * ⚠️ 注意：「实时读」只保证**下次读取**拿到新值，**不会**主动触发已挂载组件重渲染
 * （cdGlobal 是普通对象，非 $state；Semi 的 semiGlobal 同样如此）。故须在站点入口赋值。
 */
export function getGlobalDefaultProp(componentName: string, propName: string): unknown {
  const table = cdGlobal.config.overrideDefaultProps?.[componentName];
  if (!table) return undefined;
  return Object.prototype.hasOwnProperty.call(table, propName) ? table[propName] : undefined;
}

/**
 * 解析一个 prop 的生效值，优先级（对齐 Semi）：
 * **外部显式传值 > cdGlobal 全局默认 > 组件内置默认**。
 *
 * 用法（组件内）：
 * ```ts
 * const theme = $derived(resolveDefault(themeProp, 'Button', 'theme', 'light'));
 * ```
 * 注意 `undefined` 才算「外部没传」；`null` / `false` / `0` / `''` 都是有效显式值。
 */
export function resolveDefault<T>(
  explicit: T | undefined,
  componentName: string,
  propName: string,
  builtinDefault: T,
): T {
  if (explicit !== undefined) return explicit;
  const global = getGlobalDefaultProp(componentName, propName);
  return global !== undefined ? (global as T) : builtinDefault;
}

/**
 * 取某组件的全局默认表（浅拷贝，避免调用方改到单例内部）。
 * 供命令式 API（Toast / Notification / Modal 的静态方法）在构造 options 时整体合并：
 * `{ ...getGlobalDefaults('Toast'), ...userOptions }`（对齐 Semi 命令式入口读 globalConfig 的做法）。
 */
export function getGlobalDefaults(componentName: string): ComponentDefaultProps {
  return { ...(cdGlobal.config.overrideDefaultProps?.[componentName] ?? {}) };
}

/** 清空全局配置（主要供测试 teardown 用，避免用例间互相污染）。 */
export function resetGlobalConfig(): void {
  cdGlobal.config = {};
}
