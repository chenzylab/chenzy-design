/**
 * useLiveAnnouncer — 全库通用的单例 ARIA live region 播报原语。
 *
 * 动态状态变化（排序/筛选/翻页/越界/选择…）需要让屏幕阅读器播报，但若每个
 * 组件各自渲染 `aria-live` 容器，会出现重复/竞争且难以统一。本原语在 body 上
 * 命令式挂载两个全局唯一的 region（polite + assertive），所有组件复用同一对节点。
 *
 * - 红线 #3：region DOM 命令式创建/挂载 + 命令式写入 + cleanup；模块级单例复用，
 *   不依赖任何框架 effect。客户端 only（守 `document`，SSR 下静默 no-op）。
 * - region 视觉隐藏（sr-only：absolute + 1px + clip），不可用 display:none /
 *   visibility:hidden（会被辅助技术忽略）。
 * - 级别策略（WAI-ARIA APG）：polite 排队播报（默认，状态结果类）；assertive
 *   立即打断（错误/紧急）。
 * - 同一文案连续两次也能被重播：先清空再写入，触发新一次 AT 播报。
 *
 * 文案由调用方在组件层经 `@chenzy-design/locale` 本地化后传入（本原语不含文案）。
 *
 * 参考 packages/svelte/src/toast/live-region.ts（Toast 自带的 region 范式），
 * 但本原语放在 core，供全库组件复用。Toast/Notification 仍用各自既有 region。
 *
 * @example
 * const announcer = useLiveAnnouncer();
 * announcer.announce('已按名称升序排序');           // polite
 * announcer.announce('表单提交失败', 'assertive');  // 立即打断
 */

export type Politeness = 'polite' | 'assertive';

export interface LiveAnnouncer {
  /** 把文案写入对应级别的单例 region 供屏幕阅读器播报。默认 polite。 */
  announce(message: string, politeness?: Politeness): void;
}

interface LiveRegions {
  polite: HTMLElement;
  assertive: HTMLElement;
}

// 模块级单例：整库共享同一对 region 节点。
let regions: LiveRegions | null = null;

function makeRegion(politeness: Politeness): HTMLElement {
  const el = document.createElement('div');
  // role=status 隐含 polite；role=alert 隐含 assertive。同时显式标注更稳。
  el.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
  el.setAttribute('aria-live', politeness);
  el.setAttribute('aria-atomic', 'true');
  el.className = 'cd-live-region';
  // 视觉隐藏但对辅助技术可见（不可用 display:none / visibility:hidden）。
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

function announce(message: string, politeness: Politeness = 'polite'): void {
  // 空消息直接 no-op：不挂载 region（懒挂载，仅真正播报时才创建）。
  if (!message) return;
  const r = ensureRegions();
  if (!r) return;
  const target = politeness === 'assertive' ? r.assertive : r.polite;
  // 先清空，确保重复文案也会触发新一次播报。
  target.textContent = '';
  // 同步写入即可被 AT 捕获；保持纯命令式、无 effect。
  target.textContent = message;
}

/**
 * 获取全局单例播报器。多次调用返回等价 API（共享同一对 region 节点），
 * 首次写入时才惰性挂载 region（SSR 下不挂载）。
 */
export function useLiveAnnouncer(): LiveAnnouncer {
  return { announce };
}

/** 测试 only：移除单例 region 并复位模块状态。 */
export function __resetLiveAnnouncer(): void {
  if (regions) {
    regions.polite.remove();
    regions.assertive.remove();
    regions = null;
  }
}
