// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import {
  Keys,
  keyToCode,
  isValidHotKeys,
  matchHotKeys,
  attachHotKeys,
  modifierSymbol,
  isApplePlatform,
} from './hotkeys.js';

/** 构造一个满足 matchHotKeys 入参的最小事件对象。 */
function ev(
  partial: Partial<Pick<KeyboardEvent, 'code' | 'key' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>>,
): Pick<KeyboardEvent, 'code' | 'key' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'> {
  return { code: '', key: '', metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, ...partial };
}

describe('Keys 常量枚举', () => {
  it('覆盖字母/数字/修饰/符号/方向/功能/编辑', () => {
    expect(Keys.A).toBe('A');
    expect(Keys.Digit1).toBe('1');
    expect(Keys.Control).toBe('Control');
    expect(Keys.Meta).toBe('Meta');
    expect(Keys.Slash).toBe('/');
    expect(Keys.ArrowUp).toBe('ArrowUp');
    expect(Keys.F12).toBe('F12');
    expect(Keys.Enter).toBe('Enter');
    expect(Keys.Space).toBe(' ');
  });
});

describe('keyToCode', () => {
  it('字母 → KeyX（大写归一）', () => {
    expect(keyToCode('a')).toBe('KeyA');
    expect(keyToCode('A')).toBe('KeyA');
    expect(keyToCode('z')).toBe('KeyZ');
  });
  it('数字 → DigitN', () => {
    expect(keyToCode('1')).toBe('Digit1');
    expect(keyToCode('0')).toBe('Digit0');
  });
  it('符号 → 对应 code', () => {
    expect(keyToCode('/')).toBe('Slash');
    expect(keyToCode('-')).toBe('Minus');
    expect(keyToCode('[')).toBe('BracketLeft');
    expect(keyToCode(' ')).toBe('Space');
  });
  it('多字符键（方向/功能/编辑）原样返回（key 与 code 同名）', () => {
    expect(keyToCode('ArrowUp')).toBe('ArrowUp');
    expect(keyToCode('Enter')).toBe('Enter');
    expect(keyToCode('F1')).toBe('F1');
  });
});

describe('isValidHotKeys', () => {
  it('合法：1 普通键 + 0~多修饰键', () => {
    expect(isValidHotKeys(['A'])).toBe(true);
    expect(isValidHotKeys(['Control', 'A'])).toBe(true);
    expect(isValidHotKeys(['Control', 'Shift', 'A'])).toBe(true);
    expect(isValidHotKeys(['Meta', 'Alt', 'Shift', 'K'])).toBe(true);
  });
  it('非法：0 个普通键（全修饰键）', () => {
    expect(() => isValidHotKeys(['Control', 'Shift'])).toThrow(/恰含 1 个普通键/);
  });
  it('非法：2 个普通键', () => {
    expect(() => isValidHotKeys(['A', 'B'])).toThrow(/恰含 1 个普通键/);
    expect(() => isValidHotKeys(['Control', 'A', 'B'])).toThrow(/恰含 1 个普通键/);
  });
  it('非法：空数组', () => {
    expect(() => isValidHotKeys([])).toThrow(/非空数组/);
  });
  it('非法：重复键', () => {
    expect(() => isValidHotKeys(['Control', 'Control', 'A'])).toThrow(/重复键/);
  });
  it('非法：空字符串项', () => {
    expect(() => isValidHotKeys(['', 'A'])).toThrow(/非法键名/);
  });
});

describe('matchHotKeys — 修饰键精确匹配', () => {
  it('命中：修饰键与普通键（code）全对', () => {
    expect(matchHotKeys(ev({ code: 'KeyA', key: 'a', ctrlKey: true, shiftKey: true }), ['Control', 'Shift', 'A'])).toBe(
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

describe('matchHotKeys — mergeMetaCtrl 跨平台合并 Cmd/Ctrl', () => {
  it('组合声明 Control：按 Meta 也命中', () => {
    expect(matchHotKeys(ev({ code: 'KeyK', key: 'k', metaKey: true }), ['Control', 'K'], { mergeMetaCtrl: true })).toBe(
      true,
    );
  });
  it('组合声明 Meta：按 Ctrl 也命中', () => {
    expect(matchHotKeys(ev({ code: 'KeyK', key: 'k', ctrlKey: true }), ['Meta', 'K'], { mergeMetaCtrl: true })).toBe(
      true,
    );
  });
  it('未开启 mergeMetaCtrl：Control 组合按 Meta 不命中', () => {
    expect(matchHotKeys(ev({ code: 'KeyK', key: 'k', metaKey: true }), ['Control', 'K'])).toBe(false);
  });
  it('mergeMetaCtrl 下无 meta/ctrl 组合：按了任一不命中', () => {
    expect(matchHotKeys(ev({ code: 'KeyK', key: 'k', ctrlKey: true }), ['K'], { mergeMetaCtrl: true })).toBe(false);
    expect(matchHotKeys(ev({ code: 'KeyK', key: 'k' }), ['K'], { mergeMetaCtrl: true })).toBe(true);
  });
  it('mergeMetaCtrl 仍精确匹配 Shift/Alt', () => {
    expect(
      matchHotKeys(ev({ code: 'KeyK', key: 'k', metaKey: true, shiftKey: true }), ['Control', 'K'], {
        mergeMetaCtrl: true,
      }),
    ).toBe(false);
  });
});

describe('modifierSymbol / isApplePlatform', () => {
  it('Apple 平台用符号', () => {
    expect(modifierSymbol('Meta', true)).toBe('⌘');
    expect(modifierSymbol('Control', true)).toBe('⌃');
    expect(modifierSymbol('Alt', true)).toBe('⌥');
    expect(modifierSymbol('Shift', true)).toBe('⇧');
  });
  it('非 Apple 平台用文字', () => {
    expect(modifierSymbol('Meta', false)).toBe('Win');
    expect(modifierSymbol('Control', false)).toBe('Ctrl');
  });
  it('普通键返回 undefined', () => {
    expect(modifierSymbol('A', true)).toBeUndefined();
    expect(modifierSymbol('Enter', false)).toBeUndefined();
  });
  it('isApplePlatform 返回布尔', () => {
    expect(typeof isApplePlatform()).toBe('boolean');
  });
});

describe('attachHotKeys — 监听挂载 / 触发 / 解绑 / disabled', () => {
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

  it('disabled：不绑定监听（返回 noop）', () => {
    const target = document.createElement('div');
    const onHotKey = vi.fn();
    const detach = attachHotKeys(target, ['Control', 'K'], onHotKey, { disabled: true });
    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', ctrlKey: true }));
    expect(onHotKey).not.toHaveBeenCalled();
    expect(() => detach()).not.toThrow();
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

  it('mergeMetaCtrl 透传：Control 组合按 Meta 命中', () => {
    const target = document.createElement('div');
    const onHotKey = vi.fn();
    attachHotKeys(target, ['Control', 'K'], onHotKey, { mergeMetaCtrl: true });
    target.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', metaKey: true }));
    expect(onHotKey).toHaveBeenCalledTimes(1);
  });
});
