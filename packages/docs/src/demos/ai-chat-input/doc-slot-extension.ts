/**
 * docSlot —— 用户自定义 tiptap 扩展示例，对齐 Semi docSlot.jsx 的 DocSlot：
 * inline atom 节点 + addPasteRules（nodePasteRule）自动把匹配正则的粘贴文本转换为节点。
 * 用于「自定义扩展」章节 AddPasteRule demo，演示自定义扩展如何接入 AIChatInput：
 * - isCustomSlot 属性对齐 getCustomSlotAttribute（光标高度/零宽字符处理需要它）。
 * - 与内置 skillSlot/selectSlot/inputSlot 不同，这是纯用户态扩展，不随 AIChatInput 懒加载。
 */
import { Node, mergeAttributes, nodePasteRule } from '@tiptap/core';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';
import { AIChatInput } from '@chenzy-design/svelte';
import DocSlotNode from './DocSlotNode.svelte';

const DocSlot = Node.create({
  name: 'docSlot',
  inline: true,
  group: 'inline',
  atom: true,
  selectable: false,

  // 自定义粘贴规则：粘贴匹配的飞书文档链接时，自动转换为 docSlot 节点。
  addPasteRules() {
    return [
      nodePasteRule({
        find: /^https:\/\/bytedance\.larkoffice\.com\/(docx|wiki)\/[A-Za-z0-9]{27}(?:\?[^\s]*)?/g,
        type: this.type,
        getAttributes: (match: RegExpMatchArray) => {
          console.log('match', match[0]);
          return { urlValue: match[0] };
        },
      }),
    ];
  },

  addAttributes() {
    return {
      value: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-value'),
        renderHTML: (attributes: Record<string, unknown>) => ({ 'data-value': attributes.value }),
      },
      urlValue: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-url-value'),
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-url-value': attributes.urlValue,
        }),
      },
      type: {
        default: 'url',
      },
      uniqueKey: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-unique-key'),
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-unique-key': attributes.uniqueKey,
        }),
      },
      isCustomSlot: AIChatInput.getCustomSlotAttribute(),
    };
  },

  parseHTML() {
    return [{ tag: 'doc-slot' }];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return ['doc-slot', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return SvelteNodeViewRenderer(DocSlotNode as never);
  },
});

export default DocSlot;
