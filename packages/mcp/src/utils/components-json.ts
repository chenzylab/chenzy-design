/**
 * components.json（@chenzy-design/svelte 随包发布的组件 manifest）的获取与
 * 组件名归一化。这是本库相对 semi-mcp 的结构性优势：组件列表与 API 表都
 * 来自机器可读的 manifest，而非扫目录猜测。
 */
import { fetchFileContent } from './fetch.js';

export const SVELTE_PACKAGE = '@chenzy-design/svelte';
export const CORE_PACKAGE = '@chenzy-design/core';

export interface MetaField {
  name: string;
  type?: string;
  default?: string;
  desc?: string;
}

export interface ComponentMeta {
  name: string;
  category?: string;
  description?: string;
  exports?: string[];
  props?: MetaField[];
  events?: MetaField[];
  slots?: MetaField[];
  methods?: { name: string; signature?: string; desc?: string }[];
  a11y?: Record<string, unknown> | string;
  tokens?: string[];
  examples?: { title?: string; code?: string }[];
  /** 大多为对象；个别 meta 是字符串（如 List 的 "List.Item"）——消费方需兼容 */
  subComponents?: (({ name: string } & Partial<ComponentMeta>) | string)[];
}

export interface ComponentsManifest {
  version: string;
  count: number;
  components: Record<string, ComponentMeta>;
}

export async function getComponentsManifest(
  version: string,
): Promise<ComponentsManifest> {
  const raw = await fetchFileContent(
    SVELTE_PACKAGE,
    version,
    'dist/components.json',
  );
  return JSON.parse(raw) as ComponentsManifest;
}

/** 归一化键：去连字符/下划线全小写。Button/button/back-top/BackTop → 同一键 */
export function flatName(name: string): string {
  return name.replace(/[-_\s]/g, '').toLowerCase();
}

export interface ResolvedComponent {
  /** manifest 里的 Pascal 名 */
  metaName: string;
  meta: ComponentMeta;
  /** 文档产物文件名（全小写压平，同 docs md 惯例） */
  docName: string;
  /** 传入名命中的是 subComponent 时给出归属提示 */
  viaSubComponent?: string;
}

/**
 * 组件名解析：精确 → 压平匹配 → subComponents 反查（ButtonGroup → Button）。
 * 找不到返回 null。
 */
export function resolveComponent(
  manifest: ComponentsManifest,
  inputName: string,
): ResolvedComponent | null {
  const flat = flatName(inputName);

  for (const [metaName, meta] of Object.entries(manifest.components)) {
    if (flatName(metaName) === flat) {
      return { metaName, meta, docName: flatName(metaName) };
    }
  }

  for (const [metaName, meta] of Object.entries(manifest.components)) {
    const sub = meta.subComponents?.find((s) => {
      const subName = typeof s === 'string' ? s : s.name;
      // "List.Item" 这类点号形态按去点归一化（listitem）匹配
      return flatName(subName.replace(/\./g, '')) === flat;
    });
    if (sub) {
      const subName = typeof sub === 'string' ? sub : sub.name;
      return {
        metaName,
        meta,
        docName: flatName(metaName),
        viaSubComponent: subName,
      };
    }
  }

  return null;
}

/** 组件列表摘要（description 取首句） */
export function renderComponentList(manifest: ComponentsManifest): string {
  const lines = Object.values(manifest.components)
    .sort(
      (a, b) =>
        (a.category ?? '').localeCompare(b.category ?? '') ||
        a.name.localeCompare(b.name),
    )
    .map((c) => {
      const firstSentence = (c.description ?? '').split(/[。\n]/)[0];
      return `- ${c.name} (${c.category ?? 'other'})${firstSentence ? `: ${firstSentence}` : ''}`;
    });
  return `chenzy-design 组件列表（版本 ${manifest.version}，共 ${manifest.count} 个）：\n\n${lines.join('\n')}`;
}
