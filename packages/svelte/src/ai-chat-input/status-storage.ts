/**
 * status-storage —— 状态扩展的**纯读取侧**，刻意与 status-extension.ts 分文件。
 *
 * 原因：发送热键判定是同步的，必须静态 import；而 status-extension.ts 依赖
 * `@tiptap/core`，静态引它会把 tiptap 内核拖进主 bundle（见本组件 spec §0 的硬约束：
 * 内核全程动态 import）。故把「读 storage」这段无依赖的逻辑单独放这里。
 */

/** editor.storage 上的命名空间键（对齐 Semi 的 `SemiAIChatInput`，前缀随本库）。 */
export const AI_CHAT_INPUT_STORAGE_KEY = 'CdAIChatInput';

export interface AIChatInputStatusStorage {
  /** 当前是否允许 AIChatInput 响应发送热键。自定义扩展占用 Enter 时应置 false。 */
  allowHotKeySend: boolean;
}

/**
 * 读取当前 editor 是否允许发送热键。storage 缺失（未装扩展/旧实例）时按 true 兜底，
 * 与 Semi 的 `get(editor, 'storage.SemiAIChatInput.allowHotKeySend')` 落空即放行一致。
 */
export function isHotKeySendAllowed(editor: unknown): boolean {
  const storage = (editor as { storage?: Record<string, AIChatInputStatusStorage> } | undefined)
    ?.storage;
  return storage?.[AI_CHAT_INPUT_STORAGE_KEY]?.allowHotKeySend ?? true;
}
