// 滚动位置持久化：记住每个页面「当前看到的章节」，刷新后恢复到同一处，
// 但不把 hash 写进地址栏（保持 URL 干净）。用 sessionStorage 按 pathname 分键。

const PREFIX = 'cd:scroll-section:';

function keyFor(pathname: string): string {
  return PREFIX + pathname;
}

// 恢复期间的闸门：程序化滚动（scrollIntoView）同样会触发 scroll 事件，
// 若此时仍写入，会把恢复途经/落点的中间章节覆盖掉真正想恢复的目标。
// 恢复开始前置 true，恢复落定后置 false。
let restoring = false;

export function beginRestore(): void {
  restoring = true;
}

export function endRestore(): void {
  restoring = false;
}

/** 记住当前页面正看到的章节 id。恢复进行中忽略，避免自我覆盖。 */
export function saveScrollSection(id: string): void {
  if (restoring) return;
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(keyFor(location.pathname), id);
  } catch {
    // 隐私模式/配额满时静默跳过
  }
}

/** 取回上次记住的章节 id（无则返回 null）。 */
export function loadScrollSection(pathname: string): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    return sessionStorage.getItem(keyFor(pathname));
  } catch {
    return null;
  }
}
