// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { Keys, keyToCode, isValidHotKeys, matchHotKeys, attachHotKeys } from './hotkeys.js';

/** 构造一个满足 matchHotKeys 入参的最小事件对象。 */
function ev(
  partial: Partial<Pick<KeyboardEvent, 'code' | 'key' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>>,
): Pick<KeyboardEvent, 'code' | 'key' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'> {
  return { code: '', key: '', metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, ...partial };
}

describe('Keys 常量枚举（严格镜像 Semi enum Keys，值为小写）', () => {
  it('覆盖字母/数字/修饰/符号/方向/功能/编辑/小键盘', () => {
    expect(Keys.A).toBe('a');
    expect(Keys.Digit1).toBe('1');
    expect(Keys.Control).toBe('control');
    expect(Keys.Meta).toBe('meta');
    expect(Keys.Slash).toBe('/');
    expect(Keys.ArrowUp).toBe('arrowup');
    expect(Keys.F12).toBe('f12');
    expect(Keys.Enter).toBe('enter');
    expect(Keys.Space).toBe(' ');
    expect(Keys.Exclamation).toBe('!');
    expect(Keys.LeftParenthesis).toBe('(');
    expect(Keys.Numpad0).toBe('numpad0');
    expect(Keys.Pause).toBe('pause');
  });
});

describe('keyToCode（严格镜像 Semi keyCodeMap）', () => {
  it('字母 → KeyX（大小写不敏感）', () => {
    expect(keyToCode('a')).toBe('KeyA');
    expect(keyToCode('A')).toBe('KeyA');
    expect(keyToCode('z')).toBe('KeyZ');
  });
  it('数字 → DigitN', () => {
    expect(keyToCode('1')).toBe('Digit1');
    expect(keyToCode('0')).toBe('Digit0');
  });
  it('符号 → 对应 code，Shift+数字别名 → 对应 Digit', () => {
    expect(keyToCode('/')).toBe('Slash');
    expect(keyToCode('?')).toBe('Slash');
    expect(keyToCode('-')).toBe('Minus');
    expect(keyToCode('[')).toBe('BracketLeft');
    expect(keyToCode(' ')).toBe('Space');
    expect(keyToCode('!')).toBe('Digit1');
    expect(keyToCode('@')).toBe('Digit2');
    expect(keyToCode(')')).toBe('Digit0');
  });
  it('多字符键（方向/功能/编辑，小写归一）', () => {
    expect(keyToCode('arrowup')).toBe('ArrowUp');
    expect(keyToCode('ArrowUp')).toBe('ArrowUp');
    expect(keyToCode('enter')).toBe('Enter');
    expect(keyToCode('f1')).toBe('F1');
  });
  it('修饰键映射到左侧变体（对齐 Semi keyCodeMap）', () => {
    expect(keyToCode('shift')).toBe('ShiftLeft');
    expect(keyToCode('control')).toBe('ControlLeft');
    expect(keyToCode('meta')).toBe('MetaLeft');
  });
  it('未收录的键返回 undefined', () => {
    expect(keyToCode('unknownkey')).toBeUndefined();
  });
});

describe('isValidHotKeys（严格镜像 Semi foundation：已知键名校验 + 恰 1 个普通键，不查重）', () => {
  it('合法：1 普通键 + 0~多修饰键（大小写均可）', () => {
    expect(isValidHotKeys(['A'])).toBe(true);
    expect(isValidHotKeys(['a'])).toBe(true);
    expect(isValidHotKeys(['Control', 'A'])).toBe(true);
    expect(isValidHotKeys(['control', 'shift', 'a'])).toBe(true);
    expect(isValidHotKeys(['Meta', 'Alt', 'Shift', 'K'])).toBe(true);
  });
  it('非法：0 个普通键（全修饰键）', () => {
    expect(() => isValidHotKeys(['Control', 'Shift'])).toThrow(/one common key/);
  });
  it('非法：2 个普通键', () => {
    expect(() => isValidHotKeys(['A', 'B'])).toThrow(/one common key/);
    expect(() => isValidHotKeys(['Control', 'A', 'B'])).toThrow(/one common key/);
  });
  it('非法：空数组（0 个普通键）', () => {
    expect(() => isValidHotKeys([])).toThrow(/one common key/);
  });
  it('不校验重复键（对齐 Semi：重复的修饰键不报错，只按普通键计数）', () => {
    expect(isValidHotKeys(['Control', 'Control', 'A'])).toBe(true);
  });
  it('非法：未知键名（不属于 Keys 枚举值）', () => {
    expect(() => isValidHotKeys(['NotAKey'])).toThrow(/is not a valid key/);
  });
});

describe('matchHotKeys — 修饰键精确匹配（大小写不敏感）', () => {
  it('命中：修饰键与普通键（code）全对', () => {
    expect(matchHotKeys(ev({ code: 'KeyA', key: 'a', ctrlKey: true, shiftKey: true }), ['Control', 'Shift', 'A'])).toBe(
      true,
    );
  });
  it('命中：小写修饰键写法（对齐 Semi 原生 Keys 值）', () => {
    expect(matchHotKeys(ev({ code: 'KeyA', key: 'a', ctrlKey: true, shiftKey: true }), ['control', 'shift', 'a'])).toBe(
      true,
    );
  });
  it('少按修饰键不命中', () => {
    expect(matchHotKeys(ev({ code: 'KeyA', key: 'a', ctrlKey: true }), ['Control', 'Shift', 'A'])).toBe(false);
  });
  it('多按修饰键不命中', () => {
    expect(matchHotKeys(ev({ code: 'KeyA', key: 'a', ctrlKey: true, altKey: true }), ['Control', 'A'])).toBe(false);
  });
  it('无修饰键组合：按了修饰键则不命中', () => {
    expect(matchHotKeys(ev({ code: 'KeyA', key: 'a' }), ['A'])).toBe(true);
    expect(matchHotKeys(ev({ code: 'KeyA', key: 'a', ctrlKey: true }), ['A'])).toBe(false);
  });
});

describe('matchHotKeys — 普通键用 code（规避输入法/大小写/Shift）', () => {
  it('Shift+数字：event.key 变形（! ）但 code 仍 Digit1 → 命中 Shift+1', () => {
    expect(matchHotKeys(ev({ code: 'Digit1', key: '!', shiftKey: true }), ['Shift', '1'])).toBe(true);
  });
  it('大写 key（CapsLock/Shift 影响）仍由 code 命中', () => {
    expect(matchHotKeys(ev({ code: 'KeyA', key: 'A' }), ['a'])).toBe(true);
  });
  it('无 code（合成事件）回退比 key（大小写不敏感）', () => {
    expect(matchHotKeys(ev({ code: '', key: 'A' }), ['a'])).toBe(true);
  });
});

describe('matchHotKeys — mergeMetaCtrl 是死 prop（严格对齐 Semi：声明但不生效）', () => {
  it('组合声明 Control：即使 mergeMetaCtrl=true，按 Meta 仍不命中（Meta/Ctrl 严格区分）', () => {
    expect(
      matchHotKeys(ev({ code: 'KeyK', key: 'k', metaKey: true }), ['Control', 'K'], { mergeMetaCtrl: true }),
    ).toBe(false);
  });
  it('组合声明 Meta：即使 mergeMetaCtrl=true，按 Ctrl 仍不命中', () => {
    expect(
      matchHotKeys(ev({ code: 'KeyK', key: 'k', ctrlKey: true }), ['Meta', 'K'], { mergeMetaCtrl: true }),
    ).toBe(false);
  });
  it('mergeMetaCtrl=true 不改变精确匹配：声明 Control 按 Control 命中', () => {
    expect(
      matchHotKeys(ev({ code: 'KeyK', key: 'k', ctrlKey: true }), ['Control', 'K'], { mergeMetaCtrl: true }),
    ).toBe(true);
  });
  it('未开启 mergeMetaCtrl：Control 组合按 Meta 不命中', () => {
    expect(matchHotKeys(ev({ code: 'KeyK', key: 'k', metaKey: true }), ['Control', 'K'])).toBe(false);
  });
});

describe('attachHotKeys — 监听挂载 / 触发 / 解绑', () => {
  it('绑定后命中触发 onHotKey，解绑后不再触发', () => {
    const target = document.createElement('div');
    const onHotKey = vi.fn();
    const detach = attachHotKeys(target, ['Control', 'K'], onHotKey);
    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', ctrlKey: true }));
    expect(onHotKey).toHaveBeenCalledTimes(1);
    detach();
    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', ctrlKey: true }));
    expect(onHotKey).toHaveBeenCalledTimes(1);
  });

  it('未命中不触发', () => {
    const target = document.createElement('div');
    const onHotKey = vi.fn();
    attachHotKeys(target, ['Control', 'K'], onHotKey);
    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ', key: 'j', ctrlKey: true }));
    expect(onHotKey).not.toHaveBeenCalled();
  });

  it('preventDefault：命中时调用 event.preventDefault', () => {
    const target = document.createElement('div');
    const onHotKey = vi.fn();
    attachHotKeys(target, ['Control', 'S'], onHotKey, { preventDefault: true });
    const event = new KeyboardEvent('keydown', { code: 'KeyS', key: 's', ctrlKey: true, cancelable: true });
    const spy = vi.spyOn(event, 'preventDefault');
    target.dispatchEvent(event);
    expect(onHotKey).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('mergeMetaCtrl 死 prop：Control 组合按 Meta 不命中（对齐 Semi 不生效）', () => {
    const target = document.createElement('div');
    const onHotKey = vi.fn();
    attachHotKeys(target, ['Control', 'K'], onHotKey, { mergeMetaCtrl: true });
    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', metaKey: true }));
    expect(onHotKey).not.toHaveBeenCalled();
  });
});
