// cdGlobal 全局默认 props 在真实渲染中的行为（对齐 Semi semiGlobal.config.overrideDefaultProps）。
// 断言 class 而非内部变量：确认全局默认真的走到了 DOM，而不是只在 JS 里算对了。
import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import { cdGlobal, resetGlobalConfig } from '@chenzy-design/core';
import Button from './Button.svelte';
import ButtonGroupFixture from './ButtonGroupGlobalFixture.svelte';

afterEach(() => resetGlobalConfig());

const cls = (c: HTMLElement) => c.querySelector('button')!.className;

describe('Button × cdGlobal 全局默认 props', () => {
  it('未配置：走组件内置默认（primary + light）', () => {
    const { container } = render(Button, { props: { 'aria-label': 'x' } });
    expect(cls(container)).toContain('cd-button-primary');
    expect(cls(container)).toContain('cd-button-light');
  });

  it('配置 theme=solid 后，未传 theme 的 Button 渲染成 solid', () => {
    cdGlobal.config.overrideDefaultProps = { Button: { theme: 'solid' } };
    const { container } = render(Button, { props: { 'aria-label': 'x' } });
    expect(cls(container)).toContain('cd-button-solid');
    expect(cls(container)).not.toContain('cd-button-light');
  });

  it('显式传 theme 恒优先于全局默认（对齐 Semi props > defaultProps）', () => {
    cdGlobal.config.overrideDefaultProps = { Button: { theme: 'solid' } };
    const { container } = render(Button, { props: { 'aria-label': 'x', theme: 'borderless' } });
    expect(cls(container)).toContain('cd-button-borderless');
    expect(cls(container)).not.toContain('cd-button-solid');
  });

  it('ButtonGroup 上下文优先于全局默认（就近覆盖）', () => {
    cdGlobal.config.overrideDefaultProps = { Button: { theme: 'solid' } };
    // 用夹具渲染「Group(theme=borderless) > Button(不传 theme)」：
    // 子按钮应取 Group 的 borderless，而非全局的 solid。
    const { container } = render(ButtonGroupFixture, { props: { groupTheme: 'borderless' } });
    const btn = container.querySelector('.cd-button-group button')!;
    expect(btn.className).toContain('cd-button-borderless');
    expect(btn.className).not.toContain('cd-button-solid');
  });

  it('只覆盖列出的 prop，同组件其余 prop 仍走内置默认（type 仍 primary）', () => {
    cdGlobal.config.overrideDefaultProps = { Button: { theme: 'solid' } };
    const { container } = render(Button, { props: { 'aria-label': 'x' } });
    expect(cls(container)).toContain('cd-button-solid');
    expect(cls(container)).toContain('cd-button-primary');
  });

  it('多 prop 同时覆盖（type + size）', () => {
    cdGlobal.config.overrideDefaultProps = { Button: { type: 'danger', size: 'large' } };
    const { container } = render(Button, { props: { 'aria-label': 'x' } });
    expect(cls(container)).toContain('cd-button-danger');
    expect(cls(container)).toContain('cd-button-size-large');
  });

  it('其他组件的配置不影响 Button', () => {
    cdGlobal.config.overrideDefaultProps = { Select: { zIndex: 2000 } };
    const { container } = render(Button, { props: { 'aria-label': 'x' } });
    expect(cls(container)).toContain('cd-button-primary');
  });
});
