/**
 * inputSlot 光标处理 ProseMirror plugin 集（全功能移植自 Semi extension/plugins）。
 * 纯 ProseMirror 逻辑（依赖 @tiptap/pm/state，无 Svelte）——由主组件在动态 import 链内注入
 * Plugin/PluginKey/TextSelection，随 tiptap 内核懒加载，不进主 bundle。
 *
 * 核心：自定义内联节点（inputSlot/selectSlot/skillSlot，均带 attrs.isCustomSlot）在 contenteditable
 * 里会造成光标陷阱/高度异常。用零宽字符（ZW）作锚点 + 一组 keydown/paste/composition 处理来保证：
 *  - 自定义节点作为段落首/末节点时光标可移入移出；
 *  - 可编辑的 inputSlot 内容为空时保留 ZW 锚点、显示 placeholder；
 *  - ArrowLeft/Right/Backspace 在自定义节点前后各种边界正确；
 *  - IME 合成期 ProseMirror 的 synthetic Backspace replay 不误删 slot。
 * 对齐 Semi，行为逐条保真。
 */
import { AI_CHAT_INPUT_ZERO_WIDTH as ZW } from '@chenzy-design/core';

/* eslint-disable @typescript-eslint/no-explicit-any */
type PMPlugin = new (spec: any) => any;
type PMPluginKey = new (name: string) => any;
type PMTextSelectionCtor = { create: (doc: any, from: number, to?: number) => any };

export interface InputSlotPluginDeps {
  Plugin: PMPlugin;
  PluginKey: PMPluginKey;
  TextSelection: PMTextSelectionCtor;
}

/**
 * handleZeroWidthCharLogic —— 遍历文档，为自定义节点前后 / 空 inputSlot 内部 / 相邻自定义节点之间
 * 补齐或清理零宽字符锚点。返回一个待 dispatch 的 transaction（无改动返回 null）。
 * 保证光标高度正常、可编辑 inline 节点在末位时光标可落其后。
 */
export function handleZeroWidthCharLogic(newState: any): any {
  const todoPositions: Array<number | ['remove', number]> = [];
  let { tr } = newState;
  newState.doc.descendants((node: any, pos: number, parent: any) => {
    if (node.type.name === 'paragraph' && node.childCount > 0) {
      const { lastChild, firstChild } = node;
      if (firstChild && firstChild.attrs.isCustomSlot) {
        // 首 child 是自定义节点：其前补 ZW，保证光标能移到第一个自定义节点前。
        todoPositions.push(pos + 1);
      }
      if (lastChild && lastChild.attrs.isCustomSlot) {
        // 末 child 是自定义节点：段落末补 ZW，避免自定义节点为末节点时光标无法移出。
        const paragraphEndPos = pos + node.nodeSize - 1;
        const prevChar = tr.doc.textBetween(paragraphEndPos - 1, paragraphEndPos, '', '');
        if (prevChar !== ZW) todoPositions.push(paragraphEndPos);
      }
      if (lastChild === firstChild && lastChild.isText && lastChild.text === ZW) {
        todoPositions.push(['remove', pos + 1]);
      }
    }
    // undo / setContent 后，空 inputSlot 内部补 ZW，保证节点可正常显示。
    if (node.type.name === 'inputSlot' && node.content.size === 0) {
      todoPositions.push(pos + 1);
    }
    // 连续两个自定义节点之间补 ZW（inputSlot 间光标可落、其它 slot 光标高度正确）。
    if (node.attrs.isCustomSlot) {
      let nodeIndex = -1;
      parent.forEach((child: any, _offset: number, i: number) => {
        if (child === node) nodeIndex = i;
      });
      if (nodeIndex > -1 && nodeIndex < parent.childCount - 1) {
        const nextSibling = parent.child(nodeIndex + 1);
        if (nextSibling.attrs.isCustomSlot) todoPositions.push(pos + node.nodeSize);
      }
    }
  });
  if (todoPositions.length > 0) {
    // 从后往前应用，避免前面的插入改变后面记录的位置。
    todoPositions
      .sort((a, b) => {
        const aOrder = Array.isArray(a) ? a[1] : a;
        const bOrder = Array.isArray(b) ? b[1] : b;
        return bOrder - aOrder;
      })
      .forEach((insertPos) => {
        if (Array.isArray(insertPos) && insertPos[0] === 'remove') {
          tr = tr.delete(insertPos[1], insertPos[1] + 1);
        } else {
          tr = tr.insertText(ZW, insertPos as number, insertPos as number);
        }
      });
    return tr;
  }
  return null;
}

/** DELETABLE meta key（对齐 Semi strings.DELETABLE，跳过 appendTransaction 重入）。 */
const DELETABLE = 'skipCustomTransactionPlugin';

/**
 * ProseMirror 在 readDOMChange() 里遇到「看似删除」的 DOM diff 时会用 document.createEvent 合成一个
 * Backspace 走 handleKeyDown。它不是真实 KeyboardEvent。IME 合成期这个 replay 会误删 inputSlot。
 */
function isSyntheticBackspaceEvent(event: any): boolean {
  return (
    event?.type === 'keydown' &&
    event?.key === 'Backspace' &&
    event?.keyCode === 8 &&
    (event.isTrusted === false || !(event instanceof KeyboardEvent))
  );
}

/** monkey-patch view.someProp('handleKeyDown')，仅在 IME 合成 + 位于 inputSlot 时忽略 synthetic Backspace。 */
function installSyntheticBackspaceGuard(view: any): void {
  const patchedView = view;
  if (patchedView._cdSyntheticBackspaceGuard) return;
  const origSomeProp = view.someProp.bind(view);
  patchedView._cdSyntheticBackspaceGuard = true;
  patchedView._cdOrigSomeProp = origSomeProp;
  view.someProp = function (propName: string, f: any) {
    if (propName !== 'handleKeyDown' || typeof f !== 'function') return origSomeProp(propName, f);
    return origSomeProp(propName, (prop: any) => {
      if (typeof prop !== 'function') return f(prop);
      return f((innerView: any, event: any) => {
        if (
          innerView.composing &&
          innerView.state.selection.$from.parent.type.name === 'inputSlot' &&
          isSyntheticBackspaceEvent(event)
        ) {
          return false;
        }
        return prop(innerView, event);
      });
    });
  };
}

function removeSyntheticBackspaceGuard(view: any): void {
  const patchedView = view;
  if (!patchedView._cdSyntheticBackspaceGuard || !patchedView._cdOrigSomeProp) return;
  view.someProp = patchedView._cdOrigSomeProp;
  delete patchedView._cdOrigSomeProp;
  delete patchedView._cdSyntheticBackspaceGuard;
}

/**
 * ensureTrailingText —— 文档变更后追加 transaction 维护零宽字符锚点（handleZeroWidthCharLogic），
 * 并安装 synthetic-backspace guard。
 */
export function createEnsureTrailingText(deps: InputSlotPluginDeps): any {
  const { Plugin } = deps;
  return new Plugin({
    view(view: any) {
      installSyntheticBackspaceGuard(view);
      return { destroy: () => removeSyntheticBackspaceGuard(view) };
    },
    appendTransaction(transactions: any[], _oldState: any, newState: any) {
      if (transactions.some((tr) => tr.getMeta('composition'))) return null;
      if (transactions.some((tr) => tr.getMeta(DELETABLE))) return null;
      if (!transactions.some((tr) => tr.docChanged)) return null;
      return handleZeroWidthCharLogic(newState);
    },
  });
}

/**
 * keyDownHandlePlugin —— 处理 ArrowLeft/Right/Backspace 在自定义节点前后各种边界的光标移动/删除，
 * 保证零宽锚点、slot 完整性、placeholder 恢复。全功能移植自 Semi，逐分支保真。
 */
export function createKeyDownHandlePlugin(deps: InputSlotPluginDeps): any {
  const { Plugin, PluginKey, TextSelection } = deps;
  return new Plugin({
    key: new PluginKey('cd-prevent-empty-inline-node'),
    props: {
      handleKeyDown(view: any, event: any) {
        if (view.composing) return false;
        const { state, dispatch } = view;
        const { selection } = state;
        const { $from } = selection;
        const node = $from.node();

        // —— ArrowLeft：光标跨越 ZW 进入/越过自定义节点 ——
        if (event.key === 'ArrowLeft' && node.type.name !== 'inputSlot') {
          if ($from.nodeBefore && $from.nodeBefore.isText && $from.nodeBefore.text) {
            if ($from.nodeBefore.text === ZW) {
              const parent = $from.parent;
              const index = $from.index();
              if (index >= 2) {
                const secondBeforeCursorNode = parent.child(index - 2);
                if (secondBeforeCursorNode.attrs.isCustomSlot) {
                  const nextCursorPos = $from.pos - 2;
                  dispatch(state.tr.setSelection(TextSelection.create(state.doc, nextCursorPos)));
                  event.preventDefault();
                  return true;
                }
              } else if (index === 1 && $from.pos !== 0) {
                const nextCursorPos = $from.before() - 1;
                if (nextCursorPos > 0)
                  dispatch(state.tr.setSelection(TextSelection.create(state.doc, nextCursorPos)));
                event.preventDefault();
                return true;
              }
            } else if ($from.nodeBefore.text.endsWith(ZW)) {
              const nextCursorPos = $from.pos - 2;
              dispatch(state.tr.setSelection(TextSelection.create(state.doc, nextCursorPos)));
              event.preventDefault();
              return true;
            }
          }
        }

        // —— ArrowRight：对称处理 ——
        if (event.key === 'ArrowRight' && node.type.name !== 'inputSlot') {
          if ($from.nodeAfter && $from.nodeAfter.isText) {
            if ($from.nodeAfter.text === ZW) {
              const parent = $from.parent;
              const index = $from.index();
              if (index < parent.children.length - 1) {
                const secondAfterCursorNode = parent.child(index + 1);
                if (secondAfterCursorNode.attrs.isCustomSlot) {
                  const newPos = $from.pos + 2;
                  dispatch(state.tr.setSelection(TextSelection.create(state.doc, newPos)));
                  event.preventDefault();
                  return true;
                }
              } else if (index === parent.children.length - 1 && state.doc.lastChild !== node) {
                const nextCursorPos = $from.after() + 1;
                dispatch(state.tr.setSelection(TextSelection.create(state.doc, nextCursorPos)));
                event.preventDefault();
                return true;
              }
            } else if (
              $from.nodeBefore &&
              $from.nodeBefore.isText &&
              $from.nodeBefore.text.startsWith(ZW)
            ) {
              const nextCursorPos = $from.pos + 2;
              dispatch(state.tr.setSelection(TextSelection.create(state.doc, nextCursorPos)));
              event.preventDefault();
              return true;
            }
          }
        }

        // —— Backspace（空选区）：自定义节点前后删除的多种边界 ——
        if (event.key === 'Backspace' && selection.empty) {
          const beforeNode = $from.nodeBefore;
          const afterNode = $from.nodeAfter;
          // [长度1文本、光标、customSlot] → [光标、customSlot]（防单字符文本删不掉）
          if (
            beforeNode &&
            beforeNode.isText &&
            beforeNode.text?.length === 1 &&
            beforeNode.text !== ZW &&
            afterNode &&
            afterNode.attrs.isCustomSlot
          ) {
            const begin = $from.pos - beforeNode.nodeSize;
            const end = $from.pos;
            let tr = state.tr.delete(begin, end);
            tr = tr.insertText(ZW, begin, begin);
            dispatch(tr);
            event.preventDefault();
            return true;
          }
          // [ZW?、customSlot、光标、ZW?] → [光标]
          if (beforeNode && beforeNode.attrs.isCustomSlot) {
            const parent = $from.parent;
            const index = $from.index();
            const initalStart = $from.pos - beforeNode.nodeSize;
            const intialEnd = $from.pos;
            let deleteStart = initalStart;
            let deleteEnd = intialEnd;
            if (index > 1) {
              const prevPrevNode = parent.child(index - 2);
              if (prevPrevNode && prevPrevNode.isText && prevPrevNode.text.endsWith(ZW)) {
                deleteStart -= 1;
              }
            }
            if (afterNode && afterNode.isText && afterNode.text.startsWith(ZW)) deleteEnd += 1;
            if (deleteStart !== initalStart || deleteEnd !== intialEnd) {
              dispatch(state.tr.delete(deleteStart, deleteEnd));
              event.preventDefault();
              return true;
            }
          }
          if (afterNode && afterNode.isText && afterNode.text === ZW) {
            const index = $from.index();
            if (index === 0 && $from.pos !== 1) {
              const startPos = selection.from - 2;
              dispatch(state.tr.delete(startPos, selection.to + 1));
              event.preventDefault();
              return true;
            }
          }
          if (beforeNode && beforeNode.isText && beforeNode.text === ZW) {
            const parent = $from.parent;
            const index = $from.index();
            if (index > 1) {
              const prevPrevNode = parent.child(index - 2);
              if (prevPrevNode.attrs.isCustomSlot) {
                const deleteStart = $from.pos - beforeNode.nodeSize - prevPrevNode.nodeSize;
                dispatch(state.tr.delete(deleteStart, $from.pos));
                event.preventDefault();
                return true;
              }
            } else if (index === 1 && node.type.name !== 'inputSlot') {
              if ($from.pos !== 1) {
                const startPos = selection.from - 1 - 2;
                dispatch(state.tr.delete(startPos, selection.to));
                event.preventDefault();
                return true;
              }
            }
          } else if (node.type.name === 'inputSlot' && $from.pos === $from.start()) {
            // 光标在 inputSlot 首位按 Backspace：前有 ZW 则移到 ZW 前，否则插 ZW 再移。
            const grandParent = $from.node($from.depth - 1);
            const parentIndex = $from.index($from.depth - 1);
            if (parentIndex > 0) {
              const parentPrevNode = grandParent.child(parentIndex - 1);
              if (parentPrevNode && parentPrevNode.isText && parentPrevNode.text.endsWith(ZW)) {
                const pos = $from.pos - 2;
                dispatch(state.tr.setSelection(TextSelection.create(state.doc, pos)));
                event.preventDefault();
                return true;
              }
            }
            const pos = $from.pos - 1;
            let tr = state.tr.insertText(ZW, pos, pos + 1);
            tr = tr.setSelection(TextSelection.create(tr.doc, pos));
            dispatch(tr);
            event.preventDefault();
            return true;
          }
        }

        // —— Backspace（非空选区）：吞掉选区两端邻接的 ZW ——
        if (event.key === 'Backspace' && !selection.empty) {
          let startPos = selection.from;
          let endPos = selection.to;
          const nodeBefore = $from.nodeBefore;
          const nodeAfter = $from.nodeAfter;
          if (nodeBefore && nodeBefore.isText && nodeBefore.text.endsWith(ZW)) startPos -= 1;
          if (nodeAfter && nodeAfter.isText && nodeAfter.text.startsWith(ZW)) endPos += 1;
          if (startPos !== selection.from || endPos !== selection.to) {
            dispatch(state.tr.delete(startPos, endPos));
            event.preventDefault();
            return true;
          }
        }

        // —— 光标在 inputSlot 内部 ——
        if (node.type.name === 'inputSlot') {
          const zeroWidthRegex = new RegExp(ZW, 'g');
          const slotVisibleText = node.textContent.replace(zeroWidthRegex, '');
          // 仅 placeholder（仅 ZW）时 ArrowLeft/Right 一次跳出节点。
          if (
            slotVisibleText.length === 0 &&
            node.textContent.length > 0 &&
            (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
          ) {
            const pos = event.key === 'ArrowLeft' ? $from.before() : $from.after();
            if (selection.from - pos !== 1 && selection.from - pos !== -1) {
              dispatch(state.tr.setSelection(TextSelection.create(state.doc, pos)));
              event.preventDefault();
              return true;
            }
          }
          if (event.key === 'Backspace' && selection.empty) {
            const visibleText = node.textContent.replace(zeroWidthRegex, '');
            const onlyZeroWidth = node.textContent.length > 0 && visibleText.length === 0;
            // 删最后一个可见字符 → 整体替换为 ZW（保留 slot + placeholder）。
            if ($from.pos === $from.end() && visibleText.length === 1) {
              dispatch(state.tr.insertText(ZW, $from.start(), $from.end()));
              event.preventDefault();
              return true;
            }
            // 仅剩 ZW 再删 → 删除整个空 slot。
            if (onlyZeroWidth) {
              const pos = $from.before();
              dispatch(state.tr.delete(pos, pos + node.nodeSize));
              event.preventDefault();
              return true;
            }
          }
          // 全选 slot 内容删除 → 替换为 ZW（保留 slot）。
          if (
            !selection.empty &&
            $from.parent === node &&
            selection.from === $from.start() &&
            selection.to >= $from.end() &&
            event.key === 'Backspace'
          ) {
            const tr = state.tr;
            if (selection.to > $from.end()) tr.delete($from.end(), selection.to);
            tr.insertText(ZW, $from.start(), $from.end());
            const pos = $from.start() + 1;
            tr.setSelection(TextSelection.create(tr.doc, pos));
            dispatch(tr);
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
    },
  });
}

/** 光标前/后紧邻的 ZW 文本删除（粘贴/输入前清理）。 */
function removeZeroWidthChar($from: any, tr: any): boolean {
  if ($from.nodeBefore && $from.nodeBefore.isText && $from.nodeBefore.text === ZW) {
    tr.delete($from.pos - $from.nodeBefore.nodeSize, $from.pos);
    return true;
  }
  if ($from.nodeAfter && $from.nodeAfter.isText && $from.nodeAfter.text === ZW) {
    tr.delete($from.pos, $from.pos + $from.nodeAfter.nodeSize);
    return true;
  }
  return false;
}

/** inputSlot 内粘贴的特判：仅 ZW / 全选文本时用粘贴文本替换，避免 slot 被删。 */
function specialPasteLogicForInputSlot(
  deps: InputSlotPluginDeps,
  event: any,
  $from: any,
  tr: any,
  dispatch: any,
  selection: any,
): boolean {
  const { TextSelection } = deps;
  const parentNode = $from.parent;
  const nodeText = parentNode.textContent;
  const isOnlyZeroWidth = nodeText && nodeText === ZW;
  const isAllTextSelected =
    !selection.empty && selection.from === $from.start() && selection.to === $from.end();
  if (isOnlyZeroWidth || isAllTextSelected) {
    const pastedText = event.clipboardData?.getData('text/plain') || '';
    if (pastedText) {
      const pos = $from.start();
      tr = tr.insertText(pastedText, pos, pos + nodeText.length);
      const endPos = pos + pastedText.length;
      tr = tr.setSelection(TextSelection.create(tr.doc, endPos));
      tr.setMeta(DELETABLE, true);
      dispatch(tr);
      event.preventDefault();
      return true;
    }
  }
  return false;
}

/** handlePaste（editorProps）：inputSlot 内走特判，否则清理相邻 ZW。 */
export function makeHandlePaste(deps: InputSlotPluginDeps) {
  return (view: any, event: any): boolean => {
    const { state, dispatch } = view;
    const $from = state.selection.$from;
    const tr = state.tr;
    if ($from.parent.type.name === 'inputSlot') {
      return specialPasteLogicForInputSlot(deps, event, $from, tr, dispatch, state.selection);
    }
    removeZeroWidthChar($from, tr);
    tr.setMeta(DELETABLE, true);
    dispatch(tr);
    return false;
  };
}

/** compositionend（handleDOMEvents）：清理 inputSlot 内 IME 残留 ZW，及光标前 ZW 前缀。 */
export function handleCompositionEndLogic(view: any): void {
  const { state, dispatch } = view;
  const $from = state.selection.$from;
  const node = $from.node();
  const zeroWidthRegex = new RegExp(ZW, 'g');
  if (node.type.name === 'inputSlot') {
    const text = node.textContent;
    const cleanText = text.replace(zeroWidthRegex, '');
    if (cleanText.length > 0 && cleanText.length < text.length) {
      const tr = state.tr;
      tr.insertText(cleanText, $from.start(), $from.end());
      dispatch(tr);
      return;
    }
  }
  const tr = state.tr;
  if ($from.nodeBefore && $from.nodeBefore.isText) {
    const text = $from.nodeBefore.text;
    if (text?.startsWith(ZW)) {
      const removeStart = $from.pos - $from.nodeBefore.nodeSize;
      tr.delete(removeStart, removeStart + 1);
      dispatch(tr);
    }
  }
}

/** handleTextInput（editorProps）：插入文本前清理相邻 ZW，避免锚点混入内容。 */
export function makeHandleTextInput() {
  return (view: any, _from: number, _to: number, text: string): boolean => {
    if (view.composing) return false;
    const { state, dispatch } = view;
    const $from = state.selection.$from;
    let tr = state.tr;
    const modified = removeZeroWidthChar($from, tr);
    if (modified) {
      tr = tr.insertText(text, tr.selection.from, tr.selection.to);
      dispatch(tr);
      return true;
    }
    return false;
  };
}
