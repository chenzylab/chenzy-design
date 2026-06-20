/**
 * 单例 ARIA live region — 承载所有 toast 文案的屏幕阅读器播报。
 *
 * 视觉上的多个 toast 卡片各自独立，但 a11y 播报统一走这里的两个全局唯一
 * region（polite + assertive），避免每条卡片各自 role/aria-live 导致的重复/竞争。
 *
 * 红线 #3：region DOM 命令式创建/挂载到 body + 写入 + cleanup。模块级单例，
 * 多次 toast 复用同一对节点；__resetLiveRegion 供测试清理。客户端 only（守 document）。
 *
 * 级别策略（参考 WAI-ARIA APG / Semi）：error -> assertive（立即打断），其余 -> polite。
 * region 视觉隐藏（sr-only），仅供辅助技术读取。
 */
import type { ToastType } from '@chenzy-design/core';

interface LiveRegions {
  polite: HTMLElement;
  assertive: HTMLElement;
}

let regions: LiveRegions | null = null;

function makeRegion(politeness: 'polite' | 'assertive'): HTMLElement {
  const el = document.createElement('div');
  // role=status 隐含 polite；role=alert 隐含 assertive。同时显式标注更稳。
  el.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
  el.setAttribute('aria-live', politeness);
  el.setAttribute('aria-atomic', 'true');
  el.className = 'cd-toast-live-region';
  // 视觉隐藏但对辅助技术可见（不可用 display:none / visibility:hidden，会被 AT 忽略）。
  const s = el.style;
  s.position = 'absolute';
  s.width = '1px';
  s.height = '1px';
  s.margin = '-1px';
  s.padding = '0';
  s.overflow = 'hidden';
  s.clip = 'rect(0 0 0 0)';
  s.clipPath = 'inset(50%)';
  s.whiteSpace = 'nowrap';
  s.border = '0';
  return el;
}

function ensureRegions(): LiveRegions | null {
  if (typeof document === 'undefined') return null;
  if (!regions) {
    const polite = makeRegion('polite');
    const assertive = makeRegion('assertive');
    document.body.appendChild(polite);
    document.body.appendChild(assertive);
    regions = { polite, assertive };
  }
  return regions;
}

/**
 * 把一条 toast 文案写入对应级别的单例 region 供屏幕阅读器播报。
 * 同文案连续两次也能被重播：先清空再写入（textContent 重新赋值触发 AT 播报）。
 */
export function announce(message: string, type: ToastType): void {
  const r = ensureRegions();
  if (!r || !message) return;
  const target = type === 'error' ? r.assertive : r.polite;
  // 先清空，确保重复文案也会触发新一次播报。
  target.textContent = '';
  // 同步直接写入即可被 AT 捕获；保持纯命令式、无 effect。
  target.textContent = message;
}

/** 测试 only：移除单例 region 并复位模块状态。 */
export function __resetLiveRegion(): void {
  if (regions) {
    regions.polite.remove();
    regions.assertive.remove();
    regions = null;
  }
}
