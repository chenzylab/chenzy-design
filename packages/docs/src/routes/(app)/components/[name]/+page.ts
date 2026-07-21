import type { Component } from 'svelte';
import componentsJson from '@chenzy-design/svelte/components.json';
import { error } from '@sveltejs/kit';
import { nameToDir } from '$lib/component-dir';
import type { PageLoad } from './$types';

export const prerender = true;

type LocalizedText = string | { zh: string; en: string };
export interface DemoEntry {
  title: LocalizedText;
  description?: LocalizedText;
  component: Component;
  code: string;
  seeAlso?: { text: LocalizedText; component: string };
  /** 源码区高亮的重点参数行号（1-based），如 [12, 22]。 */
  highlightLines?: number[];
  /** 跳过 DemoBox（无源码框）裸渲染组件。用于图标列表这类浏览工具而非代码示例。 */
  raw?: boolean;
  /** 置于「如何引入」之前的页首区块（对齐 Semi 图标列表位置）。隐含 raw。 */
  pageHead?: boolean;
}

// eager glob：demos.ts / content md 在构建时同步就绪（各 demos.ts 内部本就 eager）。
// 在 load 里挑出当前组件对应项，页面渲染时数据已就位——首帧即完整高度、TOC 完整、
// 锚点存在，原生 hash / 滚动恢复直接可用，无异步空窗。
const demoModules = import.meta.glob<{ demos: DemoEntry[] }>('../../../../demos/*/demos.ts', {
  eager: true,
});
const contentModules = import.meta.glob<{ default: Component; metadata?: Record<string, unknown> }>(
  '../../../../content/components/*.md',
  { eager: true },
);

/* eslint-disable @typescript-eslint/no-explicit-any */
export const load: PageLoad = ({ params }) => {
  const name = params.name;

  const entry = Object.entries(componentsJson.components).find(
    ([, meta]) => (meta as any).name.toLowerCase() === name,
  );
  if (!entry) throw error(404, `Component "${name}" not found`);

  const dir = nameToDir[name] ?? name;
  const demos = demoModules[`../../../../demos/${dir}/demos.ts`]?.demos ?? [];
  const contentMod = contentModules[`../../../../content/components/${name}.md`];
  const Content = contentMod?.default ?? null;
  // 英文文档（对齐 Semi 双 md：index.md 中 / index-en-US.md 英）。命名约定 `{name}.en.md`。
  // 文档 prerender=true 且 locale 是客户端 $state，无法在 load 阶段按语言选文件，
  // 故两份都传，由 +page.svelte 按 locale.value 客户端切换（en 缺失时回退中文）。
  const ContentEn = contentModules[`../../../../content/components/${name}.en.md`]?.default ?? null;
  // docMode: 'inline' 的组件页由 md 自身内联驱动整页（demo/Notice/API 全写在 md 里，
  // 单页纵向流，复刻 Semi 无 tab 版式）；其余组件走 meta 驱动的 api/usage 双 tab。
  const docMode = (contentMod?.metadata?.docMode as string) ?? 'tabbed';
  // 页面头部描述：优先用 md frontmatter 的 brief（简洁，对齐 Semi 头部简介），
  // 回退 components.json 的 description（后者是给 AI/文档消费的长技术说明，不宜作头部简介）。
  const brief = (contentMod?.metadata?.brief as string) ?? '';

  return { meta: entry[1] as any, demos, Content, ContentEn, docMode, brief };
};
