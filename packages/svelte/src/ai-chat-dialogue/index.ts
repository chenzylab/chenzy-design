export { default as AIChatDialogue } from './AIChatDialogue.svelte';
export { default as AIChatDialogueBox } from './DialogueBox.svelte';
export { default as AIChatDialogueContentItem } from './ContentItemRenderer.svelte';
export { meta as aiChatDialogueMeta } from './meta.js';
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
