import componentsJson from '@chenzy-design/svelte/components.json';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ params }) => {
  const name = params.name;

  const entry = Object.entries(componentsJson.components).find(
    ([, meta]) => (meta as any).name.toLowerCase() === name,
  );
  if (!entry) throw error(404, `Component "${name}" not found`);

  return { meta: entry[1] as any };
};
