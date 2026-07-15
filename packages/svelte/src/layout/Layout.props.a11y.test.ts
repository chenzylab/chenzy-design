// 验证对齐 Semi Layout 的透传 props：style / aria-label / role
// 覆盖 Layout / Header / Content / Footer / Sider 五个组件的根元素透传。
// 命名 *.a11y.test.ts 以进入 dom(jsdom) project。
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import Layout from './Layout.svelte';
import Header from './Header.svelte';
import Content from './Content.svelte';
import Footer from './Footer.svelte';
import Sider from './Sider.svelte';

describe('Layout 家族 props 透传（对齐 Semi）', () => {
  it('Layout：style / aria-label / role 落到 section', () => {
    const { container } = renderWithLocale(Layout, {
      props: { style: 'background: red', ariaLabel: '页面', role: 'region' },
    });
    const el = container.querySelector('section')!;
    expect(el.getAttribute('style')).toContain('background: red');
    expect(el.getAttribute('aria-label')).toBe('页面');
    expect(el.getAttribute('role')).toBe('region');
  });

  it('Header：style / aria-label 透传到 header', () => {
    const { container } = renderWithLocale(Header, {
      props: { style: 'background: blue', ariaLabel: '顶部' },
    });
    const el = container.querySelector('header')!;
    expect(el.getAttribute('style')).toContain('background: blue');
    expect(el.getAttribute('aria-label')).toBe('顶部');
  });

  it('Content：style / role 透传到 main（role 可覆盖）', () => {
    const { container } = renderWithLocale(Content, {
      props: { style: 'background: green', role: 'main' },
    });
    const el = container.querySelector('main')!;
    expect(el.getAttribute('style')).toContain('background: green');
    expect(el.getAttribute('role')).toBe('main');
  });

  it('Footer：style / aria-label 透传到 footer', () => {
    const { container } = renderWithLocale(Footer, {
      props: { style: 'background: gray', ariaLabel: '底部' },
    });
    const el = container.querySelector('footer')!;
    expect(el.getAttribute('style')).toContain('background: gray');
    expect(el.getAttribute('aria-label')).toBe('底部');
  });

  it('Sider：style / aria-label / role 透传到 aside，内含 children 容器', () => {
    const { container } = renderWithLocale(Sider, {
      props: { style: 'background: gold', ariaLabel: '侧栏', role: 'navigation' },
    });
    const el = container.querySelector('aside')!;
    expect(el.getAttribute('style')).toContain('background: gold');
    expect(el.getAttribute('aria-label')).toBe('侧栏');
    expect(el.getAttribute('role')).toBe('navigation');
    expect(el.querySelector('.cd-layout-sider-children')).not.toBeNull();
  });
});

describe('Sider 响应式断点（对齐 Semi breakpoint / onBreakpoint）', () => {
  it('挂载时按 responsiveMap 注册并回调 onBreakpoint(screen, matched)', () => {
    // jsdom 无 matchMedia，注入一个受控 stub：md 命中，其余不命中。
    const listeners: Array<() => void> = [];
    vi.stubGlobal(
      'matchMedia',
      vi.fn((media: string) => ({
        matches: media === '(min-width: 768px)',
        media,
        addEventListener: (_: string, cb: () => void) => listeners.push(cb),
        removeEventListener: () => undefined,
      })),
    );
    const onBreakpoint = vi.fn();
    renderWithLocale(Sider, { props: { breakpoint: ['md', 'lg'], onBreakpoint } });
    // 初始化即回调（callInInit）：md 命中 true，lg 不命中 false。
    expect(onBreakpoint).toHaveBeenCalledWith('md', true);
    expect(onBreakpoint).toHaveBeenCalledWith('lg', false);
    vi.unstubAllGlobals();
  });
});
