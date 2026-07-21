// 组件的线性顺序（与侧边栏一致）：按 category 分组顺序展平，组内按 components.json 出现顺序。
// 供页脚「上一个 / 下一个」组件导航（PrevNextNav）复用，保证导航次序与侧边栏一致。
import componentsJson from '@chenzy-design/svelte/components.json';
import { componentNamesZh } from './component-names-zh';

export interface OrderedComponent {
  /** lowercase 组件名（路由用），如 'checkbox' */
  name: string;
  /** 原始驼峰组件名（图标匹配用），如 'Checkbox' */
  displayName: string;
  /** 组件分类，如 'input' */
  category: string;
  /** 中文名，如 '多选框'（缺省回退驼峰名） */
  zhName: string;
}

// 与 +layout.svelte 侧边栏一致的分类顺序。
const CATEGORY_ORDER = ['ai', 'basic', 'plus', 'input', 'navigation', 'show', 'feedback', 'other'];

const grouped = Object.values(
  componentsJson.components as Record<string, { name: string; category?: string }>,
).reduce<Record<string, { name: string; category?: string }[]>>((acc, meta) => {
  const cat = meta.category ?? 'other';
  (acc[cat] ??= []).push(meta);
  return acc;
}, {});

/** 展平后的有序组件列表（与侧边栏顺序一致）。 */
export const orderedComponents: OrderedComponent[] = CATEGORY_ORDER.flatMap((cat) =>
  (grouped[cat] ?? []).map((meta) => {
    const name = meta.name.toLowerCase();
    return {
      name,
      displayName: meta.name,
      category: meta.category ?? 'other',
      zhName: componentNamesZh[name] ?? meta.name,
    };
  }),
);

/** 取某组件在有序列表中的前一个 / 后一个（用于页脚导航）。找不到返回 null。 */
export function getPrevNext(lowerName: string): {
  prev: OrderedComponent | null;
  next: OrderedComponent | null;
} {
  const idx = orderedComponents.findIndex((c) => c.name === lowerName);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? orderedComponents[idx - 1] : null,
    next: idx < orderedComponents.length - 1 ? orderedComponents[idx + 1] : null,
  };
}
