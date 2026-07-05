/**
 * inputSlot tiptap 自定义节点（可编辑填空，全功能）。对齐 Semi extension/inputSlot：
 * inline 非 atom 节点，content='inline*'（可编辑子文本），attrs（placeholder + isCustomSlot），
 * parseHTML `<input-slot>`，NodeView 渲染 InputSlotNode.svelte（NodeViewContent + placeholder），
 * addProseMirrorPlugins 挂 ensureTrailingText + keyDownHandlePlugin（零宽锚点 + 光标处理全套）。
 *
 * 工厂注入 @tiptap/core（Node/mergeAttributes）+ svelte-tiptap（SvelteNodeViewRenderer）+
 * @tiptap/pm/state（Plugin/PluginKey/TextSelection），随内核懒加载不进主 bundle。
 */
import type { Node as TiptapNode, Extension } from '@tiptap/core';
import type { SvelteNodeViewRenderer } from 'svelte-tiptap';
import InputSlotNode from './InputSlotNode.svelte';
import {
  createEnsureTrailingText,
  createKeyDownHandlePlugin,
  type InputSlotPluginDeps,
} from './input-slot-plugins.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
type NodeCtor = typeof TiptapNode;
type MergeAttributes = (...args: Record<string, unknown>[]) => Record<string, unknown>;
type SvelteNodeViewRendererFn = typeof SvelteNodeViewRenderer;

export function createInputSlotExtension(
  Node: NodeCtor,
  mergeAttributes: MergeAttributes,
  svelteNodeViewRenderer: SvelteNodeViewRendererFn,
  pmDeps: InputSlotPluginDeps,
): Extension | ReturnType<NodeCtor['create']> {
  return Node.create({
    name: 'inputSlot',
    group: 'inline',
    inline: true,
    content: 'inline*',
    atom: false,
    selectable: true,
    draggable: false,

    addAttributes() {
      return {
        placeholder: {
          default: '',
          parseHTML: (el: HTMLElement) => el.getAttribute('placeholder') || '',
          renderHTML: (attrs: Record<string, unknown>) => ({ placeholder: attrs.placeholder }),
        },
        // 光标处理 plugin 靠此标记识别自定义节点（inputSlot/selectSlot/skillSlot 共用）。
        isCustomSlot: {
          default: true,
          rendered: false,
        },
      };
    },

    parseHTML() {
      return [
        {
          tag: 'input-slot',
          getAttrs: (el: HTMLElement) => ({ placeholder: el.getAttribute('placeholder') || '' }),
        },
      ];
    },

    renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
      // 第三元 0 = content hole，保留可编辑子内容。
      return ['input-slot', mergeAttributes(HTMLAttributes), 0];
    },

    addNodeView() {
      return svelteNodeViewRenderer(InputSlotNode as any, {
        // IME 合成期跳过 update，避免 placeholder 覆盖实时输入（对齐 Semi）。
        update: ({ oldNode, newNode, updateProps }: any) => {
          if (newNode.type !== oldNode.type) return false;
          if ((this as any).editor.view.composing) return true;
          updateProps();
          return true;
        },
      } as any) as never;
    },

    addProseMirrorPlugins() {
      return [createEnsureTrailingText(pmDeps), createKeyDownHandlePlugin(pmDeps)];
    },
  });
}
