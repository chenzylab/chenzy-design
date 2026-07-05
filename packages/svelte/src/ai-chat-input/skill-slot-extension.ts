/**
 * skillSlot tiptap 自定义节点（阶段 3）。对齐 Semi extension/skillSlot：
 * inline atom 节点，attrs（value/label/hasTemplate），parseHTML `<skill-slot>`，
 * NodeView 用 svelte-tiptap 的 SvelteNodeViewRenderer 渲染 SkillSlotNode.svelte。
 *
 * 工厂形态：@tiptap/core 与 svelte-tiptap 由调用方在动态 import 链内提供，避免把
 * tiptap 内核拖进主 bundle（见 AIChatInput.svelte 的懒加载）。
 */
import type { Node as TiptapNode, Extension } from '@tiptap/core';
import type { SvelteNodeViewRenderer } from 'svelte-tiptap';
import SkillSlotNode from './SkillSlotNode.svelte';

type NodeCtor = typeof TiptapNode;
type MergeAttributes = (...args: Record<string, unknown>[]) => Record<string, unknown>;
// svelte-tiptap SvelteNodeViewRenderer：接收 svelte 组件，返回 tiptap NodeViewRenderer。
type SvelteNodeViewRendererFn = typeof SvelteNodeViewRenderer;

/**
 * 创建 skillSlot 节点扩展。
 * @param Node @tiptap/core 的 Node
 * @param mergeAttributes @tiptap/core 的 mergeAttributes
 * @param svelteNodeViewRenderer svelte-tiptap 的 SvelteNodeViewRenderer
 */
export function createSkillSlotExtension(
  Node: NodeCtor,
  mergeAttributes: MergeAttributes,
  svelteNodeViewRenderer: SvelteNodeViewRendererFn,
): Extension | ReturnType<NodeCtor['create']> {
  return Node.create({
    name: 'skillSlot',
    inline: true,
    group: 'inline',
    atom: true,
    selectable: false,

    addAttributes() {
      return {
        value: {
          default: '',
          parseHTML: (el: HTMLElement) => el.getAttribute('data-value'),
          renderHTML: (attrs: Record<string, unknown>) => ({ 'data-value': attrs.value }),
        },
        label: {
          default: '',
          parseHTML: (el: HTMLElement) => el.getAttribute('data-label'),
          renderHTML: (attrs: Record<string, unknown>) => ({ 'data-label': attrs.label }),
        },
        hasTemplate: {
          default: false,
          parseHTML: (el: HTMLElement) => el.getAttribute('data-template') === 'true',
          renderHTML: (attrs: Record<string, unknown>) => ({ 'data-template': attrs.hasTemplate }),
        },
        // 光标处理 plugin 靠此标记识别自定义节点（与 input-slot/select-slot 共用锚点逻辑）。
        isCustomSlot: { default: true, rendered: false },
      };
    },

    parseHTML() {
      return [{ tag: 'skill-slot' }];
    },

    renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
      return ['skill-slot', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
      return svelteNodeViewRenderer(SkillSlotNode) as never;
    },
  });
}
