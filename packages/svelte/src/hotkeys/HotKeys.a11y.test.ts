// HotKeys a11y + 组件行为（jsdom / dom project）。
// DOM 严格对齐 Semi：div.cd-hotKeys > span > span.-content（用 span 非 kbd），分隔 span.-split "+"。
// 行为：keydown 监听挂载/解绑、preventDefault、content/render/null 提示渲染、getListenerTarget 局部监听。
import { describe, it, expect, vi } from 'vitest';
import type { Component } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import HotKeysComponent from './HotKeys.svelte';

// renderWithLocale 的宽松构造器要求所有 prop 可选；HotKeys 的 hotKeys 必填，
// 用宽松类型别名接收（props 在各用例显式传入，运行时安全）。
const HotKeys = HotKeysComponent as unknown as Component<Record<string, unknown>>;

function contents(container: Element): HTMLElement[] {
  return Array.from(container.querySelectorAll('.cd-hotKeys-content')) as HTMLElement[];
}

describe('HotKeys a11y', () => {
  it('默认渲染：div.cd-hotKeys > span.-content（对齐 Semi）+ -split "+"，无 axe violations', async () => {
    const { container } = renderWithLocale(HotKeys, {
      props: { hotKeys: ['Control', 'Shift', 'A'] },
    });
    const root = container.querySelector('.cd-hotKeys');
    expect(root).not.toBeNull();
    expect(root?.tagName).toBe('DIV');
    // 每个键位是 span.cd-hotKeys-content（3 个键，对齐 Semi 非 kbd）。
    const keys = contents(container);
    expect(keys).toHaveLength(3);
    keys.forEach((k) => expect(k.tagName).toBe('SPAN'));
    // 分隔符 span.-split，文本 "+"（2 个）。
    const splits = Array.from(container.querySelectorAll('.cd-hotKeys-split'));
    expect(splits.length).toBe(2);
    splits.forEach((s) => expect(s.textContent).toBe('+'));
    await expectNoAxeViolations(container);
  });

  it('普通字母键大写显示', () => {
    const { container } = renderWithLocale(HotKeys, { props: { hotKeys: ['a'] } });
    expect(contents(container)[0]?.textContent).toBe('A');
  });

  it('content 自定义显示内容（字符串）', () => {
    const { container } = renderWithLocale(HotKeys, {
      props: { hotKeys: ['Control', 'K'], content: ['Ctrl', 'K'] },
    });
    const texts = contents(container).map((k) => k.textContent);
    expect(texts).toEqual(['Ctrl', 'K']);
  });

  it('render=null：不渲染提示 UI，仅保留监听（无 .cd-hotKeys 节点，仍能触发）', () => {
    const onHotKey = vi.fn();
    const { container } = renderWithLocale(HotKeys, {
      props: { hotKeys: ['Escape'], render: null, onHotKey },
    });
    expect(container.querySelector('.cd-hotKeys')).toBeNull();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }));
    expect(onHotKey).toHaveBeenCalledTimes(1);
  });
});

describe('HotKeys 行为', () => {
  it('挂载后全局命中触发 onHotKey，卸载后解绑不再触发', () => {
    const onHotKey = vi.fn();
    const { unmount } = renderWithLocale(HotKeys, {
      props: { hotKeys: ['Control', 'K'], onHotKey },
    });
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', ctrlKey: true, bubbles: true }),
    );
    expect(onHotKey).toHaveBeenCalledTimes(1);
    unmount();
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', ctrlKey: true, bubbles: true }),
    );
    expect(onHotKey).toHaveBeenCalledTimes(1); // 解绑后不再增加
  });

  it('未命中组合不触发', () => {
    const onHotKey = vi.fn();
    renderWithLocale(HotKeys, { props: { hotKeys: ['Control', 'K'], onHotKey } });
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyJ', key: 'j', ctrlKey: true, bubbles: true }),
    );
    expect(onHotKey).not.toHaveBeenCalled();
  });

  it('preventDefault：命中时调用 event.preventDefault', () => {
    const onHotKey = vi.fn();
    renderWithLocale(HotKeys, {
      props: { hotKeys: ['Control', 'S'], preventDefault: true, onHotKey },
    });
    const event = new KeyboardEvent('keydown', {
      code: 'KeyS',
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const spy = vi.spyOn(event, 'preventDefault');
    document.body.dispatchEvent(event);
    expect(onHotKey).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('disabled：不绑定监听', () => {
    const onHotKey = vi.fn();
    renderWithLocale(HotKeys, {
      props: { hotKeys: ['Control', 'K'], disabled: true, onHotKey },
    });
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', ctrlKey: true, bubbles: true }),
    );
    expect(onHotKey).not.toHaveBeenCalled();
  });

  it('getListenerTarget：局部监听，目标外的事件不触发', () => {
    const local = document.createElement('div');
    document.body.appendChild(local);
    const onHotKey = vi.fn();
    renderWithLocale(HotKeys, {
      props: { hotKeys: ['Enter'], getListenerTarget: () => local, onHotKey },
    });
    // body 上的事件不冒泡到 local（local 是 body 子节点，事件在 body 触发不下传）→ 不命中。
    document.body.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter' }));
    expect(onHotKey).not.toHaveBeenCalled();
    // local 上的事件命中。
    local.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter' }));
    expect(onHotKey).toHaveBeenCalledTimes(1);
    document.body.removeChild(local);
  });

  it('mergeMetaCtrl 死 prop：Control 组合按 Meta 不命中（严格对齐 Semi 不生效）', () => {
    const onHotKey = vi.fn();
    renderWithLocale(HotKeys, {
      props: { hotKeys: ['Control', 'K'], mergeMetaCtrl: true, onHotKey },
    });
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', metaKey: true, bubbles: true }),
    );
    expect(onHotKey).not.toHaveBeenCalled();
  });

  it('非法组合抛错（2 个普通键）', () => {
    expect(() =>
      renderWithLocale(HotKeys, { props: { hotKeys: ['A', 'B'] } }),
    ).toThrow(/恰含 1 个普通键/);
  });
});
