// AIChatDialogue 自定义渲染配置（对齐 Semi dialogueRenderConfig）。
// 各覆盖点为 Snippet；参数带 message / role 与 default*（默认渲染 Snippet），
// 消费方可选择性复用默认节点，或整块替换。
import type { Snippet } from 'svelte';
import type { AIDialogueMessage, AIDialogueMetadata } from '@chenzy-design/core';

/** 头像区自定义渲染参数。 */
export interface RenderAvatarProps {
  message: AIDialogueMessage;
  role?: AIDialogueMetadata | undefined;
  /** 默认头像节点（未自定义时的渲染）。 */
  defaultAvatar: Snippet;
}

/** 标题区自定义渲染参数。 */
export interface RenderTitleProps {
  message: AIDialogueMessage;
  role?: AIDialogueMetadata | undefined;
  defaultTitle: Snippet;
}

/** 内容区自定义渲染参数。 */
export interface RenderContentProps {
  message: AIDialogueMessage;
  role?: AIDialogueMetadata | undefined;
  defaultContent: Snippet;
  /** 默认外层容器类名（气泡/角色/错误态修饰类，对齐 Semi RenderContentProps.className
   * 即 wrapCls）。提供 renderDialogueContent 时 Semi 完全跳过默认外层容器渲染，把这个
   * 类名交给消费方——想保留气泡外观就把它挂在自己的容器上，不想要就不用，从而做到
   * 完全自定义内容展示（如卡片样式）。 */
  className: string;
}

/** 操作栏各按钮节点集合（对齐 Semi DefaultActionNodeObj interface.ts:119-125）：真实只有
 * 这 5 个字段，shareNode/editNode 是 dialogueAction.tsx 内部私有方法（render() 直接调用），
 * 从未被赋值进 actionNodeObj 对外暴露——本库原来多实现了这两个字段，是自造超集。
 * 某个按钮当前不该显示时（如 showFeedback=false 时的 likeNode/dislikeNode），对应字段为 undefined。 */
export interface DefaultActionNodeObj {
  copyNode?: Snippet;
  resetNode?: Snippet;
  likeNode?: Snippet;
  dislikeNode?: Snippet;
  moreNode?: Snippet;
}

/** 操作栏自定义渲染参数。 */
export interface RenderActionProps {
  message: AIDialogueMessage;
  defaultAction: Snippet;
  /** 按钮节点列表（对齐 Semi RenderActionProps.defaultActions: ReactNode[]，interface.ts:129）：
   * React 侧数组元素是已渲染的节点实例，可直接按下标取用（如 defaultActions[0]）；Svelte
   * 没有节点实例概念，这里退化成 Snippet 数组，消费方需要 {@render defaultActions[0]()}
   * 才能渲染出对应按钮，语义等价。数组内容与 dialogueAction.tsx:270-292 actionNodes 一致：
   * completed 才有 copyNode，showFeedback 才有 like/dislikeNode，showReset 才有 resetNode，
   * moreNode 无条件包含，顺序也一致。本库原来完全没有这个字段，只有单数 defaultAction
   * （整块渲染），无法像 Semi demo 那样单独取某个按钮渲染。 */
  defaultActions: Snippet[];
  /** 操作栏外层类名（对齐 Semi RenderActionProps.className，值为 cd-ai-chat-dialogue-action，
   * 供自定义渲染时复用默认显隐样式）。 */
  className: string;
  /** 各按钮节点单独寻址（对齐 Semi RenderActionProps.defaultActionsObj），可用于自定义排序/取舍。 */
  defaultActionsObj: DefaultActionNodeObj;
}

/** 会话框各默认节点集合（供整块自定义时复用）。 */
export interface FullDialogueNodes {
  avatar: Snippet;
  title: Snippet;
  content: Snippet;
  action: Snippet;
}

/** 整块会话框自定义渲染参数。 */
export interface RenderFullDialogueProps {
  message: AIDialogueMessage;
  role?: AIDialogueMetadata | undefined;
  /** 默认的四个区块节点，可自由组合复用。 */
  defaultNodes: FullDialogueNodes;
}

/**
 * 自定义各区块渲染（对齐 Semi DialogueRenderConfig）。
 * 任一未提供则走默认渲染。renderFullDialogue 优先级最高，提供时整块交给它。
 */
export interface DialogueRenderConfig {
  /** 自定义渲染头像。 */
  renderDialogueAvatar?: Snippet<[RenderAvatarProps]>;
  /** 自定义渲染标题。 */
  renderDialogueTitle?: Snippet<[RenderTitleProps]>;
  /** 自定义渲染内容区。 */
  renderDialogueContent?: Snippet<[RenderContentProps]>;
  /** 自定义渲染操作栏。 */
  renderDialogueAction?: Snippet<[RenderActionProps]>;
  /** 完全自定义渲染整个会话框。 */
  renderFullDialogue?: Snippet<[RenderFullDialogueProps]>;
}
