/**
 * TimeInput foundation —— 照搬 Semi timePicker/inputFoundation.ts（方法名、职责一致）。
 * 纯逻辑（无 rune state，仅闭包 cursorIndex + input DOM 节点缓存），故 .ts。视图 TimeInput.svelte 消费。
 *
 * 唯一实质职责：受控回填后恢复光标位置（storeCursor/restoreCursor/clearCursor）——
 * 避免用户键入时间串时 input 受控更新把光标弹到末尾。focus/change 存光标，blur 清；
 * value 变化后由视图调 restoreCursor 还原。时间串解析/提交不在此（对齐 Semi：解析在 TimePicker 层）。
 */
export interface TimeInputAdapter {
  /** 取真实 input DOM 节点（视图通过 setInputNode 注入）。 */
  getInputNode: () => HTMLInputElement | null;
  notifyChange: (v: string) => void;
  notifyFocus: (e: FocusEvent) => void;
  notifyBlur: (e: FocusEvent) => void;
}

export function createTimeInputFoundation(adapter: TimeInputAdapter) {
  // 光标位置缓存（对齐 Semi getCache('cursorIndex')）。
  let cursorIndex: number | null = null;

  function storeCursor(): void {
    const inputNode = adapter.getInputNode();
    if (inputNode) {
      cursorIndex = inputNode.selectionStart;
    }
  }

  function restoreCursor(): void {
    const inputNode = adapter.getInputNode();
    if (inputNode && cursorIndex != null) {
      inputNode.selectionStart = cursorIndex;
      inputNode.selectionEnd = cursorIndex;
    }
  }

  function clearCursor(): void {
    cursorIndex = null;
  }

  function handleFocus(e: FocusEvent): void {
    storeCursor();
    adapter.notifyFocus(e);
  }

  function handleChange(v: string): void {
    storeCursor();
    adapter.notifyChange(v);
  }

  function handleBlur(e: FocusEvent): void {
    clearCursor();
    adapter.notifyBlur(e);
  }

  return { handleFocus, handleChange, handleBlur, storeCursor, restoreCursor, clearCursor };
}
