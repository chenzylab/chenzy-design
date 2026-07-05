/**
 * selectSlot tiptap 自定义节点（可选补充）。对齐 Semi extension/selectSlot：
 * inline atom 节点，attrs（value/options[JSON]），parseHTML `<select-slot>`，
 * NodeView 用 svelte-tiptap 的 SvelteNodeViewRenderer 渲染 SelectSlotNode.svelte（内联下拉）。
 *
 * 工厂形态同 skill-slot-extension：@tiptap/core 与 svelte-tiptap 由调用方在动态 import 链内提供，
 * 避免把 tiptap 内核拖进主 bundle。
 */
import type { Node as TiptapNode, Extension } from '@tiptap/core';
import type { SvelteNodeViewRenderer } from 'svelte-tiptap';
import SelectSlotNode from './SelectSlotNode.svelte';

type NodeCtor = typeof TiptapNode;
type MergeAttributes = (...args: Record<string, unknown>[]) => Record<string, unknown>;
type SvelteNodeViewRendererFn = typeof SvelteNodeViewRenderer;

export function createSelectSlotExtension(
  Node: NodeCtor,
  mergeAttributes: MergeAttributes,
  svelteNodeViewRenderer: SvelteNodeViewRendererFn,
): Extension | ReturnType<NodeCtor['create']> {
  return Node.create({
    name: 'selectSlot',
    inline: true,
    group: 'inline',
    atom: true,
    selectable: false,

    addAttributes() {
      return {
        value: {
          default: '',
          parseHTML: (el: HTMLElement) => el.getAttribute('value'),
          renderHTML: (attrs: Record<string, unknown>) => ({ value: attrs.value }),
        },
        options: {
          default: '',
          parseHTML: (el: HTMLElement) => el.getAttribute('options') ?? '',
          renderHTML: (attrs: Record<string, unknown>) =>
            attrs.options ? { options: attrs.options } : {},
        },
      };
    },

    parseHTML() {
      return [{ tag: 'select-slot' }];
    },

    renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
      return ['select-slot', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
      return svelteNodeViewRenderer(SelectSlotNode) as never;
    },
  });
}
