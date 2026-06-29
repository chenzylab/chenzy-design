// 验证对齐 Semi Layout 新增的透传 props：style / aria-label / role
// 覆盖 Layout / Header / Content / Footer / Sider 五个组件的根元素透传。
// 命名 *.a11y.test.ts 以进入 dom(jsdom) project。
import { describe, it, expect } from 'vitest';
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

  it('Header：用户 style 叠加在 height 之后', () => {
    const { container } = renderWithLocale(Header, {
      props: { height: 80, style: 'background: blue', ariaLabel: '顶部' },
    });
    const el = container.querySelector('header')!;
    const style = el.getAttribute('style') ?? '';
    expect(style).toMatch(/height:\s*80px/);
    expect(style).toContain('background: blue');
    expect(el.getAttribute('aria-label')).toBe('顶部');
  });

  it('Content：用户 style 叠加在 padding 之后，role 可覆盖', () => {
    const { container } = renderWithLocale(Content, {
      props: { padding: true, style: 'background: green', role: 'main' },
    });
    const el = container.querySelector('main')!;
    const style = el.getAttribute('style') ?? '';
    expect(style).toContain('padding:');
    expect(style).toContain('background: green');
    expect(el.getAttribute('role')).toBe('main');
  });

  it('Footer：style / aria-label 透传', () => {
    const { container } = renderWithLocale(Footer, {
      props: { style: 'background: gray', ariaLabel: '底部' },
    });
    const el = container.querySelector('footer')!;
    expect(el.getAttribute('style')).toContain('background: gray');
    expect(el.getAttribute('aria-label')).toBe('底部');
  });

  it('Sider：style 叠加在宽度之后，aria-label / role 透传', () => {
    const { container } = renderWithLocale(Sider, {
      props: { width: 150, style: 'background: gold', ariaLabel: '侧栏', role: 'navigation' },
    });
    const el = container.querySelector('aside')!;
    const style = el.getAttribute('style') ?? '';
    expect(style).toContain('width: 150px');
    expect(style).toContain('background: gold');
    expect(el.getAttribute('aria-label')).toBe('侧栏');
    expect(el.getAttribute('role')).toBe('navigation');
  });
});
