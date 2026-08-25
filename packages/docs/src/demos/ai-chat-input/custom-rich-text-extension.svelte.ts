/**
 * 「自定义扩展」章节主 demo 用扩展：对齐 Semi content/ai/aiChatInput/index.md 的
 * CustomRichTextExtension —— @ 触发两级命令面板（Files & Folders / Git 两组，
 * 选中后插入 referSlot 节点），复用 tiptap 官方 Mention 扩展的 suggestion 机制。
 *
 * 与 Semi md 源码的一处工程差异：@tiptap/suggestion 这个版本（3.30.3）自带
 * `props.mount(element)` 托管挂载 + floating-ui 定位（见其类型声明 SuggestionProps.mount），
 * 比 Semi md 手写的 computePosition/posToDOMRect updatePosition 函数更简洁可靠，直接复用，
 * 效果等价（悬浮定位、flip、outside-click dismiss 均由插件托管）。
 */
import { Node, mergeAttributes } from '@tiptap/core';
import Mention from '@tiptap/extension-mention';
import type { SuggestionOptions } from '@tiptap/suggestion';
import { mount, unmount } from 'svelte';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';
import { getCustomSlotAttribute } from '@chenzy-design/svelte';
import MentionList from './MentionList.svelte';
import ReferSlotNode from './ReferSlotNode.svelte';

export interface TestActionItem {
  key: string;
  type: string;
  name: string;
  path?: string;
}

// 面板选项（对齐 Semi TestAction）。
export const TestAction: Record<string, TestActionItem[]> = {
  'Files & Folders': [
    { key: '1-1', type: 'file', name: 'TagInput.scss', path: 'package/semi-founctaion/TagInput.scss' },
    { key: '1-2', type: 'folder', name: 'package', path: '/package' },
    { key: '1-3', type: 'folder', name: 'semi-ui', path: '/package/semi-ui' },
  ],
  Git: [
    { key: '2-1', type: 'branch', name: 'fix/tag' },
    { key: '2-2', type: 'code', name: 'v2.86.0', path: '/package' },
    { key: '2-3', type: 'git', name: 'chore: publish' },
  ],
};

export const FirstLevel = Object.keys(TestAction);

// referSlot 节点（对齐 Semi ReferSlot）：inline atom，选中命令面板条目后插入。
export const ReferSlot = Node.create({
  name: 'referSlot',
  inline: true,
  group: 'inline',
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      value: {
        default: '输入内容',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-value'),
        renderHTML: (attributes: Record<string, unknown>) => ({ 'data-value': attributes.value }),
      },
      info: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-info'),
        renderHTML: (attributes: Record<string, unknown>) => ({ 'data-info': attributes.info }),
      },
      type: {
        default: 'text',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-type'),
        renderHTML: (attributes: Record<string, unknown>) => ({ 'data-type': attributes.type }),
      },
      uniqueKey: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-unique-key'),
        renderHTML: (attributes: Record<string, unknown>) => ({ 'data-unique-key': attributes.uniqueKey }),
      },
      // 与自定义扩展前后光标高度有关，务必添加（对齐 Semi 注释）。
      isCustomSlot: getCustomSlotAttribute(),
    };
  },

  parseHTML() {
    return [{ tag: 'refer-slot' }];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return ['refer-slot', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return SvelteNodeViewRenderer(ReferSlotNode as never);
  },
});

interface SuggestionCommandProps {
  item?: TestActionItem;
  allowHotKeySend?: boolean;
}

// suggestion 配置（对齐 Semi suggestion）：items 恒返回一级分组名，选中项时插入 referSlot。
export const suggestion: Partial<SuggestionOptions<TestActionItem | string, SuggestionCommandProps>> = {
  items: () => FirstLevel,
  command: ({ editor, range, props }) => {
    const { item, allowHotKeySend } = props;
    if (typeof allowHotKeySend === 'boolean') {
      const storage = editor.storage as Record<string, { allowHotKeySend?: boolean }>;
      const ns = storage.CdAIChatInput;
      if (ns) ns.allowHotKeySend = allowHotKeySend;
    }
    if (item) {
      editor
        .chain()
        .focus()
        .insertContentAt(range, {
          type: 'referSlot',
          attrs: {
            type: item.type,
            value: item.name || '',
            info: JSON.stringify({ path: item.path }),
            uniqueKey: item.key,
          },
        })
        .run();
    }
  },
  render: () => {
    let component: ReturnType<typeof mount> | undefined;
    let el: HTMLDivElement | undefined;
    let unmountPositioning: (() => void) | undefined;
    // 响应式 props 容器：mount 时把它的属性 getter 传给组件，之后每次 onUpdate 只更新
    // 这个对象本身（Svelte 5 $state 驱动重渲染），不重新 mount——避免丢失 MentionList
    // 内部的 selectedIndex/level 状态（对齐 Semi ReactRenderer.updateProps 的语义：
    // 更新 props 而不重建组件实例）。
    const liveProps: Record<string, unknown> = $state({});
    // MentionList 实例方法（对齐 Semi ref.current 的 onKeyDown 转发）。
    let listApi: { onKeyDown: (opts: { event: KeyboardEvent; exitCb: () => void }) => boolean } | undefined;

    return {
      onStart: (props) => {
        Object.assign(liveProps, props);
        el = document.createElement('div');
        component = mount(MentionList, {
          target: el,
          props: {
            get editor() {
              return liveProps.editor as never;
            },
            get items() {
              return liveProps.items as never;
            },
            get query() {
              return liveProps.query as never;
            },
            get command() {
              return liveProps.command as never;
            },
            registerApi: (api) => (listApi = api),
          },
        });
        if (!props.clientRect) return;
        unmountPositioning = props.mount(el);
      },
      onUpdate(props) {
        Object.assign(liveProps, props);
      },
      onKeyDown(props) {
        const exitCb = () => {
          if (component) unmount(component);
          unmountPositioning?.();
        };
        return listApi?.onKeyDown({ event: props.event, exitCb }) ?? false;
      },
      onExit() {
        if (component) unmount(component);
        unmountPositioning?.();
        el = undefined;
      },
    };
  },
};

// Mention 扩展工厂：复用官方扩展的 suggestion 机制触发 @ 命令面板。
// Mention 的类型声明把 suggestion 第二个泛型参数固定死为它自己的 MentionNodeAttrs
// （见 @tiptap/extension-mention 的 `Node<MentionOptions<any, MentionNodeAttrs>>`），
// 本 demo 的 command props 形状（{ item, allowHotKeySend }）与 mention 的
// { id, label } 语义完全不同——这是官方类型定义的限制，非本库实现有误，运行时不受
// 影响（suggestion.command 收到的就是 command() 调用时传入的原始对象），用 as never
// 绕过这条编译期约束。
export function createCustomExtensions() {
  return [
    ReferSlot,
    Mention.configure({
      HTMLAttributes: { class: 'mention' },
      suggestion: suggestion as never,
    }),
  ];
}
