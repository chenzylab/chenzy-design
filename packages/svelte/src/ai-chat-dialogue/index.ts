import AIChatDialogueComponent from './AIChatDialogue.svelte';
import DialogueStep from './DialogueStep.svelte';
import DialogueReasoning from './DialogueReasoning.svelte';
import DialogueAnnotation from './DialogueAnnotation.svelte';
import DialogueCode from './DialogueCode.svelte';

/**
 * 对齐 Semi 的静态子组件（index.tsx:37-40 `static Reasoning/Step/Annotation/defaultComponents`）：
 * renderDialogueContentItem 自定义渲染时可直接复用这些内置块组件手动组装节点
 * （如 Semi demo 把自定义类型 plan 映射成 `<AIChatDialogue.Step steps={steps}/>`）。
 * Svelte 组件本身是函数，可挂静态成员，用 Object.assign 复合导出（同 Lottie.getLottie 的模式）。
 */
export const AIChatDialogue: typeof AIChatDialogueComponent & {
  Step: typeof DialogueStep;
  Reasoning: typeof DialogueReasoning;
  Annotation: typeof DialogueAnnotation;
  defaultComponents: { code: typeof DialogueCode };
} = Object.assign(AIChatDialogueComponent, {
  Step: DialogueStep,
  Reasoning: DialogueReasoning,
  Annotation: DialogueAnnotation,
  defaultComponents: { code: DialogueCode },
});
export { default as AIChatDialogueBox } from './DialogueBox.svelte';
export { default as AIChatDialogueContentItem } from './ContentItemRenderer.svelte';
export { meta as aiChatDialogueMeta } from './meta.js';
export type {
  DialogueRenderConfig,
  RenderAvatarProps,
  RenderTitleProps,
  RenderContentProps,
  RenderActionProps,
  DefaultActionNodeObj,
  RenderFullDialogueProps,
  FullDialogueNodes,
} from './render-config.js';
export type { AnnotationItem } from './DialogueAnnotation.svelte';
// 数据 Adapter 与 helpers 从 core 透传，供消费方直接从 svelte 包使用。
export {
  responseToMessage,
  chatCompletionToMessage,
  streamingResponseToMessage,
  streamingChatCompletionToMessage,
  dialogueMessageToInput,
  contentItemType,
  normalizeDialogueContent,
} from '@chenzy-design/core';
export type {
  AIDialogueMessage,
  AIDialogueMetadata,
  AIDialogueRoleConfig,
  AIDialogueReference,
  ContentItem,
  AIMessageStatus,
  OpenAIResponseObject,
  ChatCompletionObject,
  ResponseStreamChunk,
  StreamingResponseState,
  ChatCompletionStreamChunk,
  StreamingChatCompletionState,
} from '@chenzy-design/core';
