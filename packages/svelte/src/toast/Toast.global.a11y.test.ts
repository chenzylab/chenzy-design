// cdGlobal 对**命令式** API 生效（对齐 Semi：Toast / Notification 的静态方法读
// overrideDefaultProps 再与用户 options 合并）。声明式组件走 resolveDefault，
// 命令式入口走 getGlobalDefaults 合并 —— 本文件覆盖后者。
//
// 用 `useToast()` 而非全局单例：它返回 [api, localStore] 且走**同一个 toOptions 漏斗**，
// 但 store 是局部的、不异步挂 document.body，故可直接读 store.items 断言「默认值已合并进 option」。
// 断言落在 store item 上而非 DOM：合并就发生在入口，item 拿到值即等价于默认值生效。
import { afterEach, describe, expect, it } from 'vitest';
import { cdGlobal, resetGlobalConfig } from '@chenzy-design/core';
import { useToast } from './useToast.js';

afterEach(() => resetGlobalConfig());

describe('Toast × cdGlobal（命令式入口合并全局默认）', () => {
  it('未配置：走 store 的内置默认（theme=normal）', () => {
    const [toast, store] = useToast();
    toast.info('hi');
    // createToastStore 的 defaultTheme 是 'normal'，未传 theme 时由它兜底。
    expect(store.getToasts()[0]!.theme).toBe('normal');
  });

  it('配置后：未传的键从全局默认补入', () => {
    cdGlobal.config.overrideDefaultProps = { Toast: { theme: 'light', textMaxWidth: 300 } };
    const [toast, store] = useToast();
    toast.info('hi');
    expect(store.getToasts()[0]!.theme).toBe('light');
    expect(store.getToasts()[0]!.textMaxWidth).toBe(300);
  });

  it('用户 options 显式传的键恒覆盖全局默认', () => {
    cdGlobal.config.overrideDefaultProps = { Toast: { theme: 'light' } };
    const [toast, store] = useToast();
    toast.info({ content: 'hi', theme: 'normal' });
    expect(store.getToasts()[0]!.theme).toBe('normal');
  });

  it('string 简写入参也吃全局默认（与对象入参同一个 toOptions 漏斗）', () => {
    cdGlobal.config.overrideDefaultProps = { Toast: { theme: 'light' } };
    const [toast, store] = useToast();
    toast.info('hi');
    expect(store.getToasts()[0]!.theme).toBe('light');
  });

  it('其他组件的配置不影响 Toast（仍是 store 内置默认 normal，不会串到 solid）', () => {
    cdGlobal.config.overrideDefaultProps = { Button: { theme: 'solid' } };
    const [toast, store] = useToast();
    toast.info('hi');
    expect(store.getToasts()[0]!.theme).toBe('normal');
  });
});
