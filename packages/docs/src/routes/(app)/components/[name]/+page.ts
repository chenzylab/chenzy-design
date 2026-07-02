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
}

// eager glob：demos.ts / content md 在构建时同步就绪（各 demos.ts 内部本就 eager）。
// 在 load 里挑出当前组件对应项，页面渲染时数据已就位——首帧即完整高度、TOC 完整、
// 锚点存在，原生 hash / 滚动恢复直接可用，无异步空窗。
const demoModules = import.meta.glob<{ demos: DemoEntry[] }>('../../../../demos/*/demos.ts', {
  eager: true,
});
const contentModules = import.meta.glob<{ default: Component }>(
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
  const Content = contentModules[`../../../../content/components/${name}.md`]?.default ?? null;

  return { meta: entry[1] as any, demos, Content };
};
