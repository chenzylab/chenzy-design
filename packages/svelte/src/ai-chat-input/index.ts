export { default as AIChatInput } from './AIChatInput.svelte';
export { meta as aiChatInputMeta } from './meta.js';
// headless 逻辑与类型从 core 透传，供消费方直接从 svelte 包使用。
export {
  isSendHotKey,
  resolveCanSend,
  buildMessageContent,
  transformDocToContents,
  suggestionContent,
  nextSuggestionIndex,
  referenceLabel,
  isImageReference,
  type AIChatInputContent,
  type AIChatInputAttachment,
  type AIChatInputReference,
  type AIChatInputMessageContent,
  type AIChatInputSendHotKey,
  type AIChatInputChangePayload,
  type AIChatInputSuggestion,
} from '@chenzy-design/core';
