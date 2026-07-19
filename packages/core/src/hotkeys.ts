/**
 * createHotKeys helpers — framework-agnostic primitives for HotKeys（快捷键组合绑定）。
 * Pure functions + a tiny listener attach helper. The svelte layer owns the hint DOM
 * and lifecycle; it delegates combo validation / matching / platform detection here so
 * the logic stays testable across frameworks.
 *
 * Matching uses modifier equality (metaKey/shiftKey/altKey/ctrlKey all-exact) plus the
 * plain key compared against `event.code`（物理键位，规避输入法 / 大小写 / Shift 干扰，
 * 保留 Semi 的优秀设计）。`mergeMetaCtrl` 为死 prop（严格对齐 Semi：声明但不实现，Meta/Ctrl 仍严格区分）。
 * See specs/components/other/HotKeys.spec.md §3.
 */

/**
 * Key name constants — 用 `KeyboardEvent.key` 语义的常量枚举，覆盖
 * 字母 / 数字 / 修饰 / 符号 / 方向 / 功能 F1-F12 / 编辑 / 小键盘。
 * hotKeys 数组取值既可用原生字符串，也可用这些常量（更好补全 / 防拼写错）。
 */
export const Keys = {
  // —— 修饰键 ——
  Control: 'Control',
  Meta: 'Meta',
  Shift: 'Shift',
  Alt: 'Alt',
  // —— 字母 ——
  A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', H: 'H', I: 'I',
  J: 'J', K: 'K', L: 'L', M: 'M', N: 'N', O: 'O', P: 'P', Q: 'Q', R: 'R',
  S: 'S', T: 'T', U: 'U', V: 'V', W: 'W', X: 'X', Y: 'Y', Z: 'Z',
  // —— 数字（主键盘）——
  Digit0: '0', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4',
  Digit5: '5', Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9',
  // —— 符号 ——
  Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Backslash: '\\',
  Semicolon: ';', Quote: "'", Backquote: '`', Comma: ',', Period: '.', Slash: '/',
  // —— 方向 ——
  ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight',
  // —— 编辑 / 导航 ——
  Enter: 'Enter', Escape: 'Escape', Backspace: 'Backspace', Delete: 'Delete',
  Tab: 'Tab', Space: ' ', Home: 'Home', End: 'End', PageUp: 'PageUp', PageDown: 'PageDown',
  Insert: 'Insert', CapsLock: 'CapsLock',
  // —— 功能键 ——
  F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6',
  F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',
} as const;

/** 修饰键名集合（用于 isValidHotKeys 判定「普通键 vs 修饰键」）。 */
const MODIFIER_KEYS = new Set<string>(['Control', 'Meta', 'Shift', 'Alt']);

/** 一次组合里的每个键，用原生 `KeyboardEvent.key` 取值。 */
export type HotKey = string;

/**
 * keyToCode — 把 `KeyboardEvent.key`（如 'A' / 'a' / '1' / '/'）映射到对应的
 * `KeyboardEvent.code`（物理键位，如 'KeyA' / 'Digit1' / 'Slash'）。
 * 匹配用 code 可规避输入法 / 大小写 / Shift 变形（如 Shift+'1' 得 '!' 但 code 仍是 'Digit1'）。
 * 无法映射（如已是 code、或未知键）时返回原字符串，matchHotKeys 会回退到 key 直接比较。
 */
export function keyToCode(key: HotKey): string {
  if (key.length === 1) {
    // 字母 → KeyX
    if (/^[a-zA-Z]$/.test(key)) return `Key${key.toUpperCase()}`;
    // 数字 → DigitN
    if (/^[0-9]$/.test(key)) return `Digit${key}`;
    // 符号
    const sym = SYMBOL_TO_CODE[key];
    if (sym) return sym;
    if (key === ' ') return 'Space';
    return key;
  }
  return key; // 'ArrowUp' / 'Enter' / 'F1' 等 —— key 与 code 同名
}

/** 主键盘符号字符 → code。 */
const SYMBOL_TO_CODE: Record<string, string> = {
  '-': 'Minus', '=': 'Equal', '[': 'BracketLeft', ']': 'BracketRight', '\\': 'Backslash',
  ';': 'Semicolon', "'": 'Quote', '`': 'Backquote', ',': 'Comma', '.': 'Period', '/': 'Slash',
};

/** 拆分一组 hotKeys 为「修饰键集合 + 唯一普通键」。 */
interface ParsedHotKeys {
  modifiers: Set<string>;
  plain: HotKey;
}

function parseHotKeys(keys: readonly HotKey[]): ParsedHotKeys {
  const modifiers = new Set<string>();
  let plain = '';
  for (const k of keys) {
    if (MODIFIER_KEYS.has(k)) modifiers.add(k);
    else if (!plain) plain = k;
  }
  return { modifiers, plain };
}

/**
 * isValidHotKeys — 校验一组组合：恰含 **1 个普通键 + 0~多修饰键**，且无重复。
 * 非法（0 个普通键、≥2 个普通键、空数组、非字符串项）抛 Error。合法返回 true。
 */
export function isValidHotKeys(keys: readonly HotKey[]): boolean {
  if (!Array.isArray(keys) || keys.length === 0) {
    throw new Error('[HotKeys] hotKeys 必须是非空数组');
  }
  let plainCount = 0;
  const seen = new Set<string>();
  for (const k of keys) {
    if (typeof k !== 'string' || k.length === 0) {
      throw new Error(`[HotKeys] 非法键名：${String(k)}`);
    }
    if (seen.has(k)) {
      throw new Error(`[HotKeys] 组合中出现重复键：${k}`);
    }
    seen.add(k);
    if (!MODIFIER_KEYS.has(k)) plainCount += 1;
  }
  if (plainCount !== 1) {
    throw new Error(
      `[HotKeys] 组合必须恰含 1 个普通键 + 0~多修饰键，当前普通键数量：${plainCount}（keys=${keys.join('+')}）`,
    );
  }
  return true;
}

/** matchHotKeys 选项。 */
export interface MatchHotKeysOptions {
  /**
   * 跨平台把 Cmd(Meta) 与 Ctrl 视为同一修饰键。**死 prop**：严格对齐 Semi——Semi 声明了此
   * 语义但 foundation 从未实现（Meta/Ctrl 仍严格区分），故本库亦不据其改变匹配（保留声明以对齐 API）。
   */
  mergeMetaCtrl?: boolean;
}

/**
 * matchHotKeys — 判断一次 keydown 是否命中组合 `keys`。
 * - 修饰键**精确匹配**：组合声明的每个修饰键必须按下，未声明的修饰键必须未按下（多按 / 少按都不命中）。
 * - 普通键用 **event.code** 比较（先把组合里的普通键经 keyToCode 归一），规避输入法 / 大小写 / Shift。
 *   若 code 归一后仍不等，回退比较 `event.key`（宽松兜底，覆盖 keyToCode 未收录的键）。
 * - `mergeMetaCtrl`：Cmd/Ctrl 合并为同一修饰位（见 options）。
 */
export function matchHotKeys(
  event: Pick<KeyboardEvent, 'code' | 'key' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>,
  keys: readonly HotKey[],
  options: MatchHotKeysOptions = {},
): boolean {
  const { modifiers, plain } = parseHotKeys(keys);
  // mergeMetaCtrl：严格对齐 Semi，此 prop 为「死 prop」——Semi 声明了但 foundation 从未使用
  // （Meta/Ctrl 仍被当作两个独立修饰键严格区分）。故此处解构但不据其改变匹配逻辑。
  void options.mergeMetaCtrl;

  // —— 修饰键精确匹配（Meta/Ctrl/Shift/Alt 全严格相等，对齐 Semi foundation） ——
  const wantShift = modifiers.has('Shift');
  const wantAlt = modifiers.has('Alt');
  if (event.shiftKey !== wantShift) return false;
  if (event.altKey !== wantAlt) return false;
  const wantMeta = modifiers.has('Meta');
  const wantCtrl = modifiers.has('Control');
  if (event.metaKey !== wantMeta) return false;
  if (event.ctrlKey !== wantCtrl) return false;

  // —— 普通键：优先 code，回退 key ——
  const wantCode = keyToCode(plain);
  if (event.code && event.code === wantCode) return true;
  // 回退：直接比 key（大小写不敏感，覆盖 keyToCode 未映射的键 / 无 code 的合成事件）。
  return event.key.toLowerCase() === plain.toLowerCase();
}

/**
 * platformMeta — 侦测当前平台是否以 Meta(⌘) 作为主快捷键修饰（macOS/iOS）。
 * 服务端 / 无 navigator 时按非 macOS 处理（返回 false）。
 */
export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const p = navigator.platform || '';
  const ua = navigator.userAgent || '';
  return /Mac|iPhone|iPad|iPod/i.test(p) || /Mac|iPhone|iPad|iPod/i.test(ua);
}

/**
 * modifierSymbol — 修饰键的平台化符号（macOS 用 ⌘⌥⌃⇧；其他用文字/符号）。
 * `apple` 显式传入以便测试；缺省时按 isApplePlatform() 侦测。返回 undefined 表示
 * 非修饰键（调用方原样显示键名）。
 */
export function modifierSymbol(key: HotKey, apple: boolean = isApplePlatform()): string | undefined {
  switch (key) {
    case 'Meta':
      return apple ? '⌘' : 'Win';
    case 'Control':
      return apple ? '⌃' : 'Ctrl';
    case 'Alt':
      return apple ? '⌥' : 'Alt';
    case 'Shift':
      return apple ? '⇧' : 'Shift';
    default:
      return undefined;
  }
}

/**
 * attachHotKeys — 在 `target` 上绑定 keydown 监听，命中 `keys` 时调用 `onHotKey`。
 * 返回解绑函数（组件卸载时调用，防泄漏）。`disabled` 为 true 时不绑定（返回空函数）。
 * 纯 DOM 编排，svelte 层在 $effect 内调用并把返回值作为 cleanup。
 */
export interface AttachHotKeysOptions extends MatchHotKeysOptions {
  /** 命中时 preventDefault（拦截浏览器默认行为）。 */
  preventDefault?: boolean;
  /** 禁用：不绑定监听。 */
  disabled?: boolean;
}

export function attachHotKeys(
  target: EventTarget,
  keys: readonly HotKey[],
  onHotKey: ((event: KeyboardEvent) => void) | undefined,
  options: AttachHotKeysOptions = {},
): () => void {
  const { preventDefault = false, disabled = false, mergeMetaCtrl = false } = options;
  if (disabled) return () => {};
  const handler = (ev: Event): void => {
    const event = ev as KeyboardEvent;
    if (!matchHotKeys(event, keys, { mergeMetaCtrl })) return;
    if (preventDefault) event.preventDefault();
    onHotKey?.(event);
  };
  target.addEventListener('keydown', handler);
  return () => target.removeEventListener('keydown', handler);
}
