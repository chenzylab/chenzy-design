import componentsJson from '@chenzy-design/svelte/components.json';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = true;

// components.json 字段众多、各组件并非全字段必有；详情页 .svelte 按需深取嵌套字段
// （meta.props / meta.a11y.role / meta.subComponents …），这里在数据加载边界保留 any，
// 由消费侧做存在性判断。eslint-disable 仅限此 JSON 边界。
/* eslint-disable @typescript-eslint/no-explicit-any */
export const load: PageLoad = ({ params }) => {
  const name = params.name;

  const entry = Object.entries(componentsJson.components).find(
    ([, meta]) => (meta as any).name.toLowerCase() === name,
  );
  if (!entry) throw error(404, `Component "${name}" not found`);

  return { meta: entry[1] as any };
};
