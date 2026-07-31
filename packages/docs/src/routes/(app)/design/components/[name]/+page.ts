import componentsJson from '@chenzy-design/svelte/components.json';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = true;

/* eslint-disable @typescript-eslint/no-explicit-any */

// 显式声明预渲染入口，不依赖爬虫从别处的链接发现本路由。
// 历史教训：本页原先只靠组件文档页 tab 栏那个「设计」链接被爬到；
// 收尾清理删掉双 tab 渲染路径后链接随之消失，prerender 直接报
// 「marked as prerenderable, but were not prerendered」构建失败（dev 模式不暴露）。
export const entries = () =>
  Object.values(componentsJson.components).map((meta) => ({
    name: (meta as any).name.toLowerCase(),
  }));

// 同 components/[name]/+page.ts：JSON 数据加载边界保留 any，由设计页 .svelte 按需取用。
export const load: PageLoad = ({ params }) => {
  const name = params.name;

  const entry = Object.entries(componentsJson.components).find(
    ([, meta]) => (meta as any).name.toLowerCase() === name,
  );
  if (!entry) throw error(404, `Component "${name}" not found`);

  return { meta: entry[1] as any };
};
