// Typography copyable：复制按钮渲染/点击态切换/自定义 content·icon·render/onCopy 回调。
// 拆分 Copyable.svelte 前后的行为基线（对齐 Semi copyable.tsx）。
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import TypographyA11yFixture from './TypographyA11yFixture.svelte';
import Text from './Text.svelte';

// jsdom 无 navigator.clipboard，core copyable.ts 的 writeClipboard 会走 execCommand 兜底路径；
// document.execCommand 在 jsdom 里默认返回 false，显式 mock 成功以覆盖 onCopy(res=true) 分支。
beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

describe('Typography copyable a11y', () => {
  it('copyable=true：默认渲染复制按钮，aria-label 命中 i18n copy 文案，无 axe violations', async () => {
    const { container } = renderWithLocale(TypographyA11yFixture, {
      props: { variant: 'text', text: 'Hello world', props: { copyable: true } },
    });
    const btn = container.querySelector('.cd-typography-action-copy-icon');
    expect(btn).toBeTruthy();
    expect(btn?.getAttribute('aria-label')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('复制按钮外层包 Tooltip 触发结构（对齐 Semi copyable.tsx <Tooltip><a .../></Tooltip>）', () => {
    const { container } = renderWithLocale(TypographyA11yFixture, {
      props: { variant: 'text', text: 'Hello world', props: { copyable: true } },
    });
    const trigger = container.querySelector('.cd-tooltip-trigger');
    expect(trigger).toBeTruthy();
    expect(trigger?.querySelector('.cd-typography-action-copy-icon')).toBeTruthy();
  });

  it('点击复制按钮：切到 copied 态，class 变 -action-copied，文案变 i18n copied', async () => {
    const { container } = renderWithLocale(TypographyA11yFixture, {
      props: { variant: 'text', text: 'Hello world', props: { copyable: true } },
    });
    const btn = container.querySelector('.cd-typography-action-copy-icon') as HTMLButtonElement;
    await fireEvent.click(btn);
    await new Promise((r) => setTimeout(r, 0));
    expect(container.querySelector('.cd-typography-action-copied')).toBeTruthy();
    expect(container.querySelector('.cd-typography-action-copy')).toBeNull();
  });

  it('copyable={{ content }}：复制自定义 content 而非节点 textContent', async () => {
    const { container } = renderWithLocale(TypographyA11yFixture, {
      props: {
        variant: 'text',
        text: 'Hello world',
        props: { copyable: { content: 'custom payload' } },
      },
    });
    const btn = container.querySelector('.cd-typography-action-copy-icon') as HTMLButtonElement;
    await fireEvent.click(btn);
    await new Promise((r) => setTimeout(r, 0));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('custom payload');
  });

  it('copyable={{ onCopy }}：回调触发，签名 (e, content, res)', async () => {
    const onCopy = vi.fn();
    const { container } = renderWithLocale(TypographyA11yFixture, {
      props: {
        variant: 'text',
        text: 'Hello world',
        props: { copyable: { content: 'abc', onCopy } },
      },
    });
    const btn = container.querySelector('.cd-typography-action-copy-icon') as HTMLButtonElement;
    await fireEvent.click(btn);
    await new Promise((r) => setTimeout(r, 0));
    expect(onCopy).toHaveBeenCalledTimes(1);
    const call = onCopy.mock.calls[0] as [MouseEvent, string, boolean];
    expect(call[1]).toBe('abc');
    expect(call[2]).toBe(true);
  });

  it('copyable={{ icon }}：自定义复制图标 snippet 渲染生效，替换默认 IconCopy', () => {
    const icon = createRawSnippet(() => ({ render: () => '<svg data-testid="custom-copy-icon"></svg>' }));
    const { container } = renderWithLocale(Text, {
      props: { copyable: { icon } },
    });
    expect(container.querySelector('[data-testid="custom-copy-icon"]')).toBeTruthy();
  });

  it('copyable={{ render }}：完全接管渲染，默认结构不出现', () => {
    const customRender = createRawSnippet(() => ({
      render: () => '<button data-testid="custom-copy-render">Copy</button>',
    }));
    const { container } = renderWithLocale(Text, {
      props: { copyable: { render: customRender } },
    });
    expect(container.querySelector('[data-testid="custom-copy-render"]')).toBeTruthy();
    expect(container.querySelector('.cd-typography-action-copy-icon')).toBeNull();
    expect(container.querySelector('.cd-tooltip-trigger')).toBeNull();
  });
});
