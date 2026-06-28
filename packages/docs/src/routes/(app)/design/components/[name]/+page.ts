import componentsJson from '@chenzy-design/svelte/components.json';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = true;

// 同 components/[name]/+page.ts：JSON 数据加载边界保留 any，由设计页 .svelte 按需取用。
/* eslint-disable @typescript-eslint/no-explicit-any */
export const load: PageLoad = ({ params }) => {
  const name = params.name;

  const entry = Object.entries(componentsJson.components).find(
    ([, meta]) => (meta as any).name.toLowerCase() === name,
  );
  if (!entry) throw error(404, `Component "${name}" not found`);

  return { meta: entry[1] as any };
};
