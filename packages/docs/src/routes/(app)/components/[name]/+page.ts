import type { Component } from 'svelte';
import componentsJson from '@chenzy-design/svelte/components.json';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = true;

// eager glob：content md 在构建时同步就绪，load 里挑出当前组件对应项，
// 页面渲染时数据已就位——首帧即完整高度、TOC 完整、锚点存在，无异步空窗。
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

  const contentMod = contentModules[`../../../../content/components/${name}.md`];
  const Content = contentMod?.default ?? null;
  // 英文文档（对齐 Semi 双 md：index.md 中 / index-en-US.md 英）。命名约定 `{name}.en.md`。
  // 文档 prerender=true 且 locale 是客户端 $state，无法在 load 阶段按语言选文件，
  // 故两份都传，由 +page.svelte 按 locale.value 客户端切换（en 缺失时回退中文）。
  const ContentEn = contentModules[`../../../../content/components/${name}.en.md`]?.default ?? null;
  // 页面头部描述：优先用 md frontmatter 的 brief（简洁，对齐 Semi 头部简介），
  // 回退 components.json 的 description（后者是给 AI/文档消费的长技术说明，不宜作头部简介）。
  const brief = (contentMod?.metadata?.brief as string) ?? '';

  return { meta: entry[1] as any, Content, ContentEn, brief };
};
