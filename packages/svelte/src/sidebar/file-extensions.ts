/**
 * SideBar FileContent 自研 tiptap 扩展工厂（P5）。对齐 Semi imageSlot.js + file.js：
 *  - createImageUploadNode：`Node.create({ name:'imageUpload' })`，atom block 节点，
 *    NodeView 渲染 SideBarImageUploadNode.svelte（内嵌本库 Upload），成功后替换为 image 节点。
 *  - createSelectionMark：`Mark.create({ name:'selectionMark' })`，用于设链接时保持选区高亮
 *    （输入链接地址时富文本失焦仍可见选区，对齐 Semi）。
 *
 * 依赖（Node/Mark/mergeAttributes/SvelteNodeViewRenderer）由调用方动态 import 后注入，
 * 随 tiptap 内核懒加载，不进主 bundle（对齐 AIChatInput 的 input-slot-extension 范式）。
 */
import type { Node as TiptapNode, Mark as TiptapMark } from '@tiptap/core';
import type { SvelteNodeViewRenderer } from 'svelte-tiptap';
import SideBarImageUploadNode from './SideBarImageUploadNode.svelte';

/* eslint-disable @typescript-eslint/no-explicit-any */
type NodeCtor = typeof TiptapNode;
type MarkCtor = typeof TiptapMark;
type MergeAttributes = (...args: Record<string, unknown>[]) => Record<string, unknown>;
type SvelteNodeViewRendererFn = typeof SvelteNodeViewRenderer;

/** 图片上传配置（继承 UploadProps 子集 + getUploadImageSrc）。对齐 Semi ImageUploadNodeOptions。 */
export interface SideBarImageUploadOptions {
  /** 插入节点最终类型，默认 'image'。 */
  type?: string;
  /** 接受的文件类型，默认 'image/*'。 */
  accept?: string;
  /** 上传数上限，默认 1。 */
  limit?: number;
  /** 上传地址。 */
  action?: string;
  /** 由上传响应/预览地址派生最终图片 src。 */
  getUploadImageSrc?: (src: string) => string;
  /** 其余 UploadProps 透传给内嵌 Upload。 */
  [key: string]: unknown;
}

/** 自研图片上传节点：空占位 → 选文件成功后替换为 image 节点。 */
export function createImageUploadNode(
  Node: NodeCtor,
  mergeAttributes: MergeAttributes,
  svelteNodeViewRenderer: SvelteNodeViewRendererFn,
  options: SideBarImageUploadOptions = {},
): ReturnType<NodeCtor['create']> {
  // 泛型放宽为 any：options 是运行时透传的 UploadProps 联合，tiptap 的 addNodeView this.options
  // 强类型无法精确表达（同 AIChatInput 扩展工厂的做法）。
  return Node.create<any>({
    name: 'imageUpload',
    group: 'block',
    draggable: true,
    selectable: true,
    atom: true,

    addOptions() {
      return {
        type: 'image',
        accept: 'image/*',
        limit: 1,
        action: undefined,
        HTMLAttributes: {},
        ...options,
      };
    },

    parseHTML() {
      return [{ tag: 'div[data-type="image-upload"]' }];
    },

    renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
      return ['div', mergeAttributes({ 'data-type': 'image-upload' }, HTMLAttributes)];
    },

    addNodeView() {
      return svelteNodeViewRenderer(SideBarImageUploadNode as any) as never;
    },
  });
}

/** 选区高亮 Mark：设链接时保持选区可见（对齐 Semi SelectionMark）。 */
export function createSelectionMark(
  Mark: MarkCtor,
): ReturnType<MarkCtor['create']> {
  return Mark.create({
    name: 'selectionMark',
    inclusive: false,
    parseHTML() {
      return [{ tag: 'span.cd-sidebar-file-select' }];
    },
    renderHTML() {
      return ['span', { class: 'cd-sidebar-file-select' }, 0];
    },
  });
}
