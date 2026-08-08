/**
 * status-extension —— 1:1 对齐 Semi `aiChatInput/extension/statusExtension.tsx`。
 *
 * 为什么需要这个扩展：
 * 用于管理与 AIChatInput 有关的状态，避免 AIChatInput 与其他扩展的行为冲突。举例：
 * 自定义扩展若也用 Enter 做快捷操作，会和 AIChatInput 的发送热键冲突。于是把
 * `allowHotKeySend` 存进 editor.storage，扩展可自行设置它，提示 AIChatInput
 * 当前是否应该响应发送热键。
 *
 * 与 Semi 的唯一差异是命名空间：Semi 用 `SemiAIChatInput`，本库用 `CdAIChatInput`
 * （storage key 与命令名都是面向用户的公开契约，需跟随本库前缀）。
 */
import { Extension, type RawCommands } from '@tiptap/core';
import {
  AI_CHAT_INPUT_STORAGE_KEY,
  type AIChatInputStatusStorage,
} from './status-storage.js';

export { AI_CHAT_INPUT_STORAGE_KEY, type AIChatInputStatusStorage };

export const StatusExtension = Extension.create({
  name: AI_CHAT_INPUT_STORAGE_KEY,

  addStorage(): AIChatInputStatusStorage {
    return { allowHotKeySend: true };
  },

  addCommands() {
    return {
      setAllowHotKeySendForAIChatInput(allow: boolean) {
        return ({ storage }: { storage: Record<string, AIChatInputStatusStorage> }) => {
          const ns = storage[AI_CHAT_INPUT_STORAGE_KEY];
          if (ns) ns.allowHotKeySend = allow;
          // 返回 false：本命令只改 storage、不产生文档事务，避免多余的 undo 步骤。
          return false;
        };
      },
    } as Partial<RawCommands>;
  },
});
