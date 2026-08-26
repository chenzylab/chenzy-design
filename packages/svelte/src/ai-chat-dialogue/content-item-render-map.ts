// renderDialogueContentItem 的映射类型（对齐 Semi DialogueContentItemRendererMap）。
// 独立成文件供 AIChatDialogue.svelte / DialogueBox.svelte / ContentItemRenderer.svelte 共享——
// Svelte 组件文件（.svelte）里定义的类型无法被其它文件干净地 import type 复用。
import type { Snippet } from 'svelte';
import type { ContentItem, AIDialogueMessage } from '@chenzy-design/core';

/**
 * 单个 ContentItem 类型的渲染器。第二个参数 message 对齐 Semi dialogueContent.tsx:195
 * `renderer(item, message)`——一级/二级映射的所有渲染器真实都拿得到整条消息（不只是当前
 * 块），常见用法是按 message.role 分支渲染不同样式（Semi「自定义渲染消息内容」demo
 * 的 input_text 渲染器就是 `(item, message) => message.role === 'user' ? ... : ...`）。
 * 本库原来只有单参数，无法实现这种按角色分支的场景。
 */
export type ContentItemRenderer = Snippet<[ContentItem, AIDialogueMessage]>;

/**
 * `default` 键的渲染器（对齐 Semi `defaultRenderer(textContent, message)`）：第一个参数
 * 与其它 ContentItem 渲染器不同——是字符串（消息的纯文本内容），不是 ContentItem；
 * 第二个参数同样是完整 message（dialogueContent.tsx:350）。
 * 仅当消息顶层 content 是字符串、或 content 非字符串但 message.output_text 有值时生效
 * （dialogueContent.tsx:345 `typeof content === 'string' ? content : message.output_text`——
 * 后一种情况即便 content 是完整的 ContentItem[] 多块结构，只要 output_text 有值，Semi
 * 也会整条改用 default 渲染器接管，不再逐块渲染。本库如实复刻这个（略反直觉的）行为）。
 */
export type DefaultContentRenderer = Snippet<[string, AIDialogueMessage]>;

/**
 * 按类型覆盖渲染（对齐 Semi renderDialogueContentItem / DialogueContentItemRendererMap：
 * `Record<string, Renderer | Record<string, Renderer>>`）。
 *
 * 值可以是：
 * - 单个渲染器：按 ContentItem.type 一级匹配（本库原来唯一支持的形态）。
 * - 二级映射：仅工具调用类型（function_call / custom_tool_call / mcp_call，对齐 Semi
 *   TOOL_CALL_TYPES）生效，按 item.name（具体函数名）再细分渲染器，未命中的函数名
 *   落回一级（若一级本身是渲染器）或内置渲染（dialogueContent.tsx:171-199 customRenderer）。
 * - `default` 键：见 DefaultContentRenderer 说明，签名与其它键不同，故联合类型里单列。
 */
export type DialogueContentItemRendererMap = Record<
  string,
  ContentItemRenderer | Record<string, ContentItemRenderer> | DefaultContentRenderer
>;
