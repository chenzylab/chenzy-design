import { afterEach, describe, expect, it } from 'vitest';
import {
  cdGlobal,
  getGlobalDefaultProp,
  getGlobalDefaults,
  resolveDefault,
  resetGlobalConfig,
} from './global-config.js';

afterEach(() => resetGlobalConfig());

describe('cdGlobal 全局默认 props（对齐 Semi semiGlobal）', () => {
  it('未配置时 resolveDefault 回退组件内置默认值', () => {
    expect(resolveDefault(undefined, 'Button', 'theme', 'light')).toBe('light');
  });

  it('配置后无外部传值时用全局默认', () => {
    cdGlobal.config.overrideDefaultProps = { Button: { theme: 'solid' } };
    expect(resolveDefault(undefined, 'Button', 'theme', 'light')).toBe('solid');
  });

  it('外部显式传值恒优先于全局默认（对齐 Semi 的 props > defaultProps）', () => {
    cdGlobal.config.overrideDefaultProps = { Button: { theme: 'solid' } };
    expect(resolveDefault('borderless', 'Button', 'theme', 'light')).toBe('borderless');
  });

  it('falsy 的显式值（null/false/0/空串）算「外部有传」，不被全局默认覆盖', () => {
    cdGlobal.config.overrideDefaultProps = { Select: { zIndex: 2000, showClear: true } };
    expect(resolveDefault(0, 'Select', 'zIndex', 1000)).toBe(0);
    expect(resolveDefault(false, 'Select', 'showClear', true)).toBe(false);
    expect(resolveDefault(null as unknown as string, 'Select', 'placeholder', 'x')).toBe(null);
    expect(resolveDefault('', 'Select', 'placeholder', 'x')).toBe('');
  });

  it('只覆盖被显式列出的 prop，同组件其余 prop 仍走内置默认', () => {
    cdGlobal.config.overrideDefaultProps = { Button: { theme: 'solid' } };
    expect(resolveDefault(undefined, 'Button', 'theme', 'light')).toBe('solid');
    expect(resolveDefault(undefined, 'Button', 'size', 'default')).toBe('default');
  });

  it('未配置的组件不受其他组件配置影响', () => {
    cdGlobal.config.overrideDefaultProps = { Button: { theme: 'solid' } };
    expect(resolveDefault(undefined, 'Tag', 'theme', 'light')).toBe('light');
  });

  it('显式配成 undefined 视为「未配置」（回退内置默认）', () => {
    cdGlobal.config.overrideDefaultProps = { Button: { theme: undefined } };
    expect(resolveDefault(undefined, 'Button', 'theme', 'light')).toBe('light');
  });

  it('入口处「后赋值」也生效（实时读单例，对齐 Semi Proxy get 语义）', () => {
    expect(resolveDefault(undefined, 'Button', 'theme', 'light')).toBe('light');
    cdGlobal.config.overrideDefaultProps = { Button: { theme: 'solid' } };
    expect(resolveDefault(undefined, 'Button', 'theme', 'light')).toBe('solid');
  });

  it('getGlobalDefaultProp 未配置返回 undefined', () => {
    expect(getGlobalDefaultProp('Button', 'theme')).toBeUndefined();
    cdGlobal.config.overrideDefaultProps = { Button: { theme: 'solid' } };
    expect(getGlobalDefaultProp('Button', 'theme')).toBe('solid');
    expect(getGlobalDefaultProp('Button', 'size')).toBeUndefined();
  });

  it('getGlobalDefaults 返回浅拷贝，改返回值不污染单例', () => {
    cdGlobal.config.overrideDefaultProps = { Toast: { duration: 5 } };
    const got = getGlobalDefaults('Toast');
    expect(got).toEqual({ duration: 5 });
    got.duration = 99;
    expect(getGlobalDefaults('Toast')).toEqual({ duration: 5 });
  });

  it('getGlobalDefaults 供命令式 API 整体合并：用户 options 覆盖全局默认', () => {
    cdGlobal.config.overrideDefaultProps = { Toast: { duration: 5, theme: 'light' } };
    const merged = { ...getGlobalDefaults('Toast'), ...{ duration: 1 } };
    expect(merged).toEqual({ duration: 1, theme: 'light' });
  });

  it('resetGlobalConfig 清空全部配置', () => {
    cdGlobal.config.overrideDefaultProps = { Button: { theme: 'solid' } };
    resetGlobalConfig();
    expect(getGlobalDefaultProp('Button', 'theme')).toBeUndefined();
  });
});
