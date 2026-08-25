/**
 * 自定义 Placeholder 扩展 —— 对齐 Semi `aiChatInput/richTextInput.tsx` 的 `custom-placeholder` 插件。
 *
 * 为什么不能直接用 tiptap 官方 Placeholder：
 *   官方插件把「段落里有 skillSlot 节点」判为**非空**，于是选中技能后 placeholder 立刻消失。
 *   Semi 的 `showPlaceholderWhenSkillOnly` 要的是「只选了技能、还没输入正文」时**仍显示** placeholder，
 *   且显示在 skill 后方 —— 这需要替换空文档/空段落的判定，官方插件无此扩展点。
 *
 * 判定规则（逐条对齐 Semi）：
 *   - `isDocActuallyEmpty`：忽略 skillSlot 与零宽字符后，整篇文档是否无内容；
 *   - `isParagraphActuallyEmpty`：同上，但作用于单个段落；
 *   - `paragraphHasSkillSlot`：段落是否含 skillSlot —— 命中则加 `has-skill-slot` 类，
 *     由 CSS 改用 `::after` 把 placeholder 排到 skill 之后（见 AIChatInput.svelte 样式）。
 *
 * 工厂形态：ProseMirror / tiptap 依赖由调用方在动态 import 链内注入，
 * 避免把编辑器内核拖进主 bundle（同 skill-slot-extension.ts）。
 */
import type { Extension } from '@tiptap/core';
import { AI_CHAT_INPUT_ZERO_WIDTH } from '@chenzy-design/core';

/** ProseMirror 节点的最小结构（只用到这几项，避免引 @tiptap/pm 类型进主 bundle）。 */
interface PMNode {
  type: { name: string };
  isLeaf: boolean;
  isText: boolean;
  text?: string | undefined;
  nodeSize: number;
  content?: { size: number };
  descendants(fn: (node: PMNode, pos: number) => boolean | void): void;
}

type PMDoc = PMNode;

/** 调用方注入的 ProseMirror 依赖。 */
export interface PlaceholderDeps {
  Plugin: new (spec: Record<string, unknown>) => unknown;
  PluginKey: new (name: string) => unknown;
  Decoration: {
    node(from: number, to: number, attrs: Record<string, unknown>): unknown;
  };
  DecorationSet: {
    create(doc: unknown, decorations: unknown[]): unknown;
  };
}

export interface CustomPlaceholderOptions {
  placeholder: string;
  /** 仅选中技能（无其他内容）时是否仍显示 placeholder（对齐 Semi）。 */
  showPlaceholderWhenSkillOnly: boolean;
  emptyEditorClass: string;
  emptyNodeClass: string;
  /**
   * 判定为可能需要装饰的节点后是否继续下探子节点（对齐官方 tiptap Placeholder
   * options.includeChildren，默认 false：段落层级已经够用，不必再往文本节点里下探）。
   */
  includeChildren: boolean;
}

/** 去掉零宽字符后是否还有内容。 */
function hasRealText(node: PMNode): boolean {
  const raw = node.text ?? '';
  return raw.split(AI_CHAT_INPUT_ZERO_WIDTH).join('').length > 0;
}

/**
 * 忽略 skillSlot 与零宽字符后，节点是否「实际为空」。
 * 对齐 Semi 的 isDocActuallyEmpty / isParagraphActuallyEmpty（两者逻辑一致，作用范围不同）。
 */
export function isActuallyEmpty(root: PMNode): boolean {
  let empty = true;
  root.descendants((node) => {
    if (!empty) return false;
    // 跳过 skillSlot 及其子树
    if (node.type.name === 'skillSlot') return false;
    if (node.isText) {
      if (hasRealText(node)) {
        empty = false;
        return false;
      }
      return true;
    }
    // 其余自定义节点视为有内容；paragraph 本身继续下探
    if (node.type.name !== 'paragraph') {
      empty = false;
      return false;
    }
    return true;
  });
  return empty;
}

/** 段落是否含 skillSlot（对齐 Semi paragraphHasSkillSlot）。 */
export function paragraphHasSkillSlot(paragraph: PMNode): boolean {
  let has = false;
  paragraph.descendants((node) => {
    if (node.type.name === 'skillSlot') {
      has = true;
      return false;
    }
    return true;
  });
  return has;
}

/** 官方 Placeholder 的默认空判定（节点无内容）。 */
function isNodeEmpty(node: PMNode): boolean {
  return (node.content?.size ?? 0) === 0;
}

/**
 * 创建自定义 Placeholder 扩展。
 * @param Extension @tiptap/core 的 Extension
 * @param deps ProseMirror 依赖（Plugin / PluginKey / Decoration / DecorationSet）
 */
export function createPlaceholderExtension(
  Extension: { create(config: Record<string, unknown>): unknown },
  deps: PlaceholderDeps,
): Extension {
  const { Plugin, PluginKey, Decoration, DecorationSet } = deps;

  return Extension.create({
    name: 'customPlaceholder',

    addOptions() {
      return {
        placeholder: '',
        showPlaceholderWhenSkillOnly: false,
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-empty',
        includeChildren: false,
      } satisfies CustomPlaceholderOptions;
    },

    addProseMirrorPlugins(this: {
      options: CustomPlaceholderOptions;
      editor: { isEditable: boolean; isEmpty: boolean };
    }) {
      const options = this.options;
      const editor = this.editor;

      return [
        new Plugin({
          key: new PluginKey('cd-custom-placeholder'),
          props: {
            decorations: ({ doc, selection }: { doc: PMDoc; selection: { anchor: number } }) => {
              if (!editor.isEditable) return null;

              const skillOnly = options.showPlaceholderWhenSkillOnly;
              // 开启时用「忽略 skillSlot」的判定，否则沿用 tiptap 的 isEmpty
              const isEmptyDoc = editor.isEmpty || (skillOnly && isActuallyEmpty(doc));
              const { anchor } = selection;
              const decorations: unknown[] = [];

              doc.descendants((node, pos) => {
                const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize;
                const isParagraph = node.type.name === 'paragraph';
                const isEmpty =
                  !node.isLeaf &&
                  (isParagraph && skillOnly ? isActuallyEmpty(node) : isNodeEmpty(node));

                if (hasAnchor && isEmpty) {
                  const classes = [options.emptyNodeClass];
                  if (isEmptyDoc) classes.push(options.emptyEditorClass);
                  // 段落含 skillSlot 时加特殊类，CSS 改用 ::after 把 placeholder 排到 skill 后方
                  if (skillOnly && isParagraph && paragraphHasSkillSlot(node)) {
                    classes.push('has-skill-slot');
                  }
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: classes.join(' '),
                      'data-placeholder': options.placeholder,
                    }),
                  );
                }
                return options.includeChildren;
              });

              return DecorationSet.create(doc, decorations);
            },
          },
        }),
      ];
    },
  }) as Extension;
}
