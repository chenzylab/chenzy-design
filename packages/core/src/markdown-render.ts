/**
 * MarkdownRender headless — framework-agnostic Markdown → hast compilation.
 *
 * Semi Design 用 `@mdx-js/mdx` evaluate 产出 React 组件；Svelte 无 JSX runtime 无法复用。
 * 本模块改用 unified 管线把 Markdown `raw` 编译成 **hast**（HTML AST），
 * 渲染层再递归 hast 渲染成 Svelte 组件 / 原生标签。
 *
 * 管线：`remark-parse` → 条件 `remark-gfm` → 透传 remarkPlugins → `remark-rehype`
 *       → 透传 rehypePlugins → hast root。
 *
 * 体积治理（对齐 spec §9）：unified / remark / rehype 编译器体积大，
 * 全部用**动态 import** 惰性加载，避免拖累主包首屏。
 *
 * 安全：默认**不**渲染 raw HTML（对齐 Semi format='md' 剥离行为）。
 * remark-rehype 的 `allowDangerousHtml` 默认 false，raw HTML 会被丢弃；
 * 使用方若要保留 HTML，须自行传入 `rehype-raw` 并自负 XSS。
 */

import type { Root as HastRoot } from 'hast';

export type { HastRoot };

/** unified 插件条目：插件本身，或 [插件, 选项] 元组。框架无关，值透传给 unified。 */
export type UnifiedPluginEntry = unknown;

export interface CompileToHastOptions {
  /**
   * 是否启用 GitHub Flavored Markdown（表格 / 任务列表 / 删除线 / 自动链接）。
   * @default true
   */
  remarkGfm?: boolean | undefined;
  /** 追加的 remark 插件（作用于 mdast，在 gfm 之后、remark-rehype 之前）。 */
  remarkPlugins?: UnifiedPluginEntry[] | undefined;
  /** 追加的 rehype 插件（作用于 hast，在 remark-rehype 之后）。 */
  rehypePlugins?: UnifiedPluginEntry[] | undefined;
  /**
   * 是否允许通过 raw HTML 节点。默认 false（对齐 Semi format='md' 剥离行为）。
   * 置 true 仅让 remark-rehype 透传 raw 节点；真正解析/渲染 HTML 仍需使用方
   * 在 `rehypePlugins` 里加 `rehype-raw`，并自负 XSS 风险。
   */
  allowDangerousHtml?: boolean | undefined;
}

/**
 * 把 Markdown 源码编译为 hast root（纯函数，框架无关）。
 *
 * 编译器经动态 import 惰性加载；首次调用会触发 chunk 加载。
 *
 * @param raw Markdown 源码字符串
 * @param opts 编译选项
 * @returns hast 根节点，供渲染层递归消费
 */
export async function compileToHast(
  raw: string,
  opts: CompileToHastOptions = {},
): Promise<HastRoot> {
  const {
    remarkGfm: enableGfm = true,
    remarkPlugins = [],
    rehypePlugins = [],
    allowDangerousHtml = false,
  } = opts;

  const [{ unified }, { default: remarkParse }, { default: remarkRehype }] =
    await Promise.all([
      import('unified'),
      import('remark-parse'),
      import('remark-rehype'),
    ]);

  // unified 的 Processor 泛型会随每次 .use() 变更实例化参数；这里用一个宽松的
  // 链式接口承载，避免不同实例化间的赋值冲突（运行时行为不变）。
  interface LooseProcessor {
    use(plugin: unknown, options?: unknown): LooseProcessor;
    parse(raw: string): unknown;
    run(tree: unknown): Promise<unknown>;
  }

  let processor = unified().use(remarkParse) as unknown as LooseProcessor;

  if (enableGfm) {
    const { default: remarkGfm } = await import('remark-gfm');
    processor = processor.use(remarkGfm);
  }

  for (const entry of remarkPlugins) {
    processor = applyPlugin(processor, entry);
  }

  processor = processor.use(remarkRehype, { allowDangerousHtml });

  for (const entry of rehypePlugins) {
    processor = applyPlugin(processor, entry);
  }

  const mdast = processor.parse(raw);
  const hast = (await processor.run(mdast)) as HastRoot;
  return hast;

  /**
   * 归一化插件条目并 use 到 processor。
   * 支持 `plugin` 或 `[plugin, options]` 元组两种记法（对齐 unified 惯例）。
   */
  function applyPlugin(p: LooseProcessor, entry: UnifiedPluginEntry): LooseProcessor {
    if (Array.isArray(entry)) {
      const [plugin, options] = entry as [unknown, unknown];
      return p.use(plugin, options);
    }
    return p.use(entry);
  }
}
