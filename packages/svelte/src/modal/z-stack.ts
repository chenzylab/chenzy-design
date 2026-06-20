/**
 * 模块级 z-index 堆叠管理：多个 Modal（声明式 <Modal> + 命令式 modal.confirm）
 * 共享同一计数器，后开者在上；关闭时回收，避免无限增长。
 * 用递增整数（不用 Math.random/Date.now，红线 #3）。
 */

// 与 --cd-modal-z token 基线一致；每开一个 +10，给遮罩/面板留间隙。
const Z_BASE = 1000;
const STEP = 10;

let counter = 0;

/** 申请一个堆叠层级，返回 z-index 与回收函数。回收幂等。 */
export function acquireZIndex(): { zIndex: number; release: () => void } {
  counter += 1;
  const zIndex = Z_BASE + counter * STEP;
  let released = false;
  return {
    zIndex,
    release() {
      if (released) return;
      released = true;
      counter = Math.max(0, counter - 1);
    },
  };
}
