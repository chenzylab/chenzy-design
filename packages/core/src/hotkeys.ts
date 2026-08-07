/**
 * createHotKeys helpers — framework-agnostic primitives for HotKeys（快捷键组合绑定）。
 * Pure functions + a tiny listener attach helper. The svelte layer owns the hint DOM
 * and lifecycle; it delegates combo validation / matching here so the logic stays
 * testable across frameworks. 严格对齐 Semi @douyinfe/semi-foundation/hotKeys
 * （constants.ts + foundation.ts）：Keys 枚举值 / keyCodeMap / 校验规则 / 匹配规则逐条镜像，
 * 无本库扩展。`mergeMetaCtrl` 为死 prop（Semi 声明但 foundation 从未实现，Meta/Ctrl 仍严格区分）。
 * See specs/components/other/HotKeys.spec.md §3.
 */

/**
 * Key name constants — 严格镜像 Semi `semi-foundation/hotKeys/constants.ts` 的 `Keys` enum
 * （值为小写 / 原生符号）。hotKeys 数组取值既可用原生字符串，也可用这些常量。
 */
export const Keys = {
  // —— 字母 ——
  A: 'a', B: 'b', C: 'c', D: 'd', E: 'e', F: 'f', G: 'g', H: 'h', I: 'i',
  J: 'j', K: 'k', L: 'l', M: 'm', N: 'n', O: 'o', P: 'p', Q: 'q', R: 'r',
  S: 's', T: 't', U: 'u', V: 'v', W: 'w', X: 'x', Y: 'y', Z: 'z',
  // —— 数字（主键盘）——
  Digit0: '0', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4',
  Digit5: '5', Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9',
  // —— 符号（含 Shift+数字 的别名值） ——
  Space: ' ', Enter: 'enter', Escape: 'escape', Backspace: 'backspace',
  Tab: 'tab', Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']',
  Backslash: '\\', Semicolon: ';', Quote: "'", Backquote: '`', Comma: ',',
  Period: '.', Slash: '/', Exclamation: '!', At: '@', Hash: '#', Dollar: '$',
  Percent: '%', Caret: '^', Ampersand: '&', Asterisk: '*',
  LeftParenthesis: '(', RightParenthesis: ')',
  // —— 方向 ——
  ArrowUp: 'arrowup', ArrowDown: 'arrowdown', ArrowLeft: 'arrowleft', ArrowRight: 'arrowright',
  // —— 修饰键 ——
  Shift: 'shift', Control: 'control', Alt: 'alt', Meta: 'meta',
  // —— 功能 / 编辑 / 导航 ——
  CapsLock: 'capslock', F1: 'f1', F2: 'f2', F3: 'f3', F4: 'f4', F5: 'f5', F6: 'f6',
  F7: 'f7', F8: 'f8', F9: 'f9', F10: 'f10', F11: 'f11', F12: 'f12',
  Insert: 'insert', Delete: 'delete', Home: 'home', End: 'end',
  PageUp: 'pageup', PageDown: 'pagedown',
  NumLock: 'numlock', ScrollLock: 'scrolllock', Pause: 'pause',
  // —— 小键盘 ——
  Numpad0: 'numpad0', Numpad1: 'numpad1', Numpad2: 'numpad2', Numpad3: 'numpad3',
  Numpad4: 'numpad4', Numpad5: 'numpad5', Numpad6: 'numpad6', Numpad7: 'numpad7',
  Numpad8: 'numpad8', Numpad9: 'numpad9', NumpadDecimal: 'numpaddecimal',
  NumpadDivide: 'numpaddivide', NumpadMultiply: 'numpadmultiply',
  NumpadSubtract: 'numpadsubtract', NumpadAdd: 'numpadadd', NumpadEnter: 'numpadenter',
} as const;

/** Keys 枚举的全部合法值（小写），用于 isValidHotKeys「已知键名」校验（对齐 Semi）。 */
const VALID_KEY_VALUES = new Set<string>(Object.values(Keys));

/** 修饰键名集合（小写）。判定前先 `key.toLowerCase()`，大小写不敏感（对齐 Semi foundation）。 */
const MODIFIER_KEYS = new Set<string>(['control', 'meta', 'shift', 'alt']);
const isModifierKey = (k: string): boolean => MODIFIER_KEYS.has(k.toLowerCase());

/** 一次组合里的每个键，用原生 `KeyboardEvent.key` 取值。 */
export type HotKey = string;

/**
 * keyToCode — 严格镜像 Semi `keyCodeMap`：把 `KeyboardEvent.key`（小写归一后）映射到
 * 对应的 `KeyboardEvent.code`（物理键位）。修饰键映射到左侧变体（ShiftLeft 等，Semi 原样）。
 * 未收录的键返回 `undefined`（matchHotKeys 会回退到 key 直接比较）。
 */
const KEY_CODE_MAP: Record<string, string> = {
  // alpha
  a: 'KeyA', b: 'KeyB', c: 'KeyC', d: 'KeyD', e: 'KeyE',
  f: 'KeyF', g: 'KeyG', h: 'KeyH', i: 'KeyI', j: 'KeyJ',
  k: 'KeyK', l: 'KeyL', m: 'KeyM', n: 'KeyN', o: 'KeyO',
  p: 'KeyP', q: 'KeyQ', r: 'KeyR', s: 'KeyS', t: 'KeyT',
  u: 'KeyU', v: 'KeyV', w: 'KeyW', x: 'KeyX', y: 'KeyY', z: 'KeyZ',
  // digit
  '0': 'Digit0', '1': 'Digit1', '2': 'Digit2', '3': 'Digit3',
  '4': 'Digit4', '5': 'Digit5', '6': 'Digit6', '7': 'Digit7',
  '8': 'Digit8', '9': 'Digit9',
  // punctuation
  ' ': 'Space', enter: 'Enter', escape: 'Escape', backspace: 'Backspace',
  tab: 'Tab', '-': 'Minus', '=': 'Equal', '[': 'BracketLeft',
  ']': 'BracketRight', '\\': 'Backslash', ';': 'Semicolon',
  "'": 'Quote', '`': 'Backquote', ',': 'Comma', '.': 'Period',
  '/': 'Slash', '?': 'Slash', '!': 'Digit1', '@': 'Digit2',
  '#': 'Digit3', $: 'Digit4', '%': 'Digit5', '^': 'Digit6',
  '&': 'Digit7', '*': 'Digit8', '(': 'Digit9', ')': 'Digit0',
  // arrow
  arrowup: 'ArrowUp', arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft', arrowright: 'ArrowRight',
  // function
  shift: 'ShiftLeft', control: 'ControlLeft', alt: 'AltLeft',
  meta: 'MetaLeft', capslock: 'CapsLock', f1: 'F1',
  f2: 'F2', f3: 'F3', f4: 'F4', f5: 'F5', f6: 'F6',
  f7: 'F7', f8: 'F8', f9: 'F9', f10: 'F10', f11: 'F11',
  f12: 'F12', insert: 'Insert', delete: 'Delete', home: 'Home',
  end: 'End', pageup: 'PageUp', pagedown: 'PageDown',
  numlock: 'NumLock', scrolllock: 'ScrollLock', pause: 'Pause',
  // numpad
  numpad0: 'Numpad0', numpad1: 'Numpad1', numpad2: 'Numpad2',
  numpad3: 'Numpad3', numpad4: 'Numpad4', numpad5: 'Numpad5',
  numpad6: 'Numpad6', numpad7: 'Numpad7', numpad8: 'Numpad8',
  numpad9: 'Numpad9', numpaddecimal: 'NumpadDecimal',
  numpaddivide: 'NumpadDivide', numpadmultiply: 'NumpadMultiply',
  numpadsubtract: 'NumpadSubtract', numpadadd: 'NumpadAdd',
  numpadenter: 'NumpadEnter',
};

export function keyToCode(key: HotKey): string | undefined {
  return KEY_CODE_MAP[key.toLowerCase()];
}

/** 拆分一组 hotKeys 为「修饰键集合 + 唯一普通键」。 */
interface ParsedHotKeys {
  modifiers: Set<string>;
  plain: HotKey;
}

function parseHotKeys(keys: readonly HotKey[]): ParsedHotKeys {
  const modifiers = new Set<string>();
  let plain = '';
  for (const k of keys) {
    if (isModifierKey(k)) modifiers.add(k.toLowerCase());
    else if (!plain) plain = k;
  }
  return { modifiers, plain };
}

/**
 * isValidHotKeys — 严格镜像 Semi foundation `isValidHotKeys`：每个 key（小写归一后）必须
 * 属于 `Keys` 已知值集合，且恰含 **1 个普通键 + 0~多修饰键**。不检查重复（对齐 Semi，Semi
 * 未做重复校验）。非法（未知键名、0 个普通键、≥2 个普通键）抛 Error。合法返回 true。
 */
export function isValidHotKeys(keys: readonly HotKey[]): boolean {
  let plainCount = 0;
  for (const k of keys) {
    const lower = String(k).toLowerCase();
    if (!VALID_KEY_VALUES.has(lower)) {
      throw new Error(`[HotKeys] ${k} is not a valid key`);
    }
    if (!isModifierKey(lower)) plainCount += 1;
  }
  if (plainCount !== 1) {
    throw new Error('HotKeys must have one common key and 0/some modifier key');
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
 * - `mergeMetaCtrl`：死 prop，不改变匹配（见 options）。
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

  // —— 修饰键精确匹配（Meta/Ctrl/Shift/Alt 全严格相等，对齐 Semi foundation；大小写不敏感） ——
  const wantShift = modifiers.has('shift');
  const wantAlt = modifiers.has('alt');
  if (event.shiftKey !== wantShift) return false;
  if (event.altKey !== wantAlt) return false;
  const wantMeta = modifiers.has('meta');
  const wantCtrl = modifiers.has('control');
  if (event.metaKey !== wantMeta) return false;
  if (event.ctrlKey !== wantCtrl) return false;

  // —— 普通键：优先 code，回退 key ——
  const wantCode = keyToCode(plain);
  if (event.code && wantCode !== undefined && event.code === wantCode) return true;
  // 回退：直接比 key（大小写不敏感，覆盖 keyToCode 未映射的键 / 无 code 的合成事件）。
  return event.key.toLowerCase() === plain.toLowerCase();
}

/**
 * attachHotKeys — 在 `target` 上绑定 keydown 监听，命中 `keys` 时调用 `onHotKey`。
 * 返回解绑函数（组件卸载时调用，防泄漏）。纯 DOM 编排，svelte 层在 $effect 内调用并把
 * 返回值作为 cleanup。
 */
export interface AttachHotKeysOptions extends MatchHotKeysOptions {
  /** 命中时 preventDefault（拦截浏览器默认行为）。 */
  preventDefault?: boolean;
}

export function attachHotKeys(
  target: EventTarget,
  keys: readonly HotKey[],
  onHotKey: ((event: KeyboardEvent) => void) | undefined,
  options: AttachHotKeysOptions = {},
): () => void {
  const { preventDefault = false, mergeMetaCtrl = false } = options;
  const handler = (ev: Event): void => {
    const event = ev as KeyboardEvent;
    if (!matchHotKeys(event, keys, { mergeMetaCtrl })) return;
    if (preventDefault) event.preventDefault();
    onHotKey?.(event);
  };
  target.addEventListener('keydown', handler);
  return () => target.removeEventListener('keydown', handler);
}
