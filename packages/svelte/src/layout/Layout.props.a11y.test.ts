// 验证对齐 Semi Layout 新增的透传 props：style / aria-label / role
// 覆盖 Layout / Header / Content / Footer / Sider 五个组件的根元素透传。
// 命名 *.a11y.test.ts 以进入 dom(jsdom) project。
import { describe, it, expect } from 'vitest';
import { tick } from 'svelte';
import { renderWithLocale } from '../test-utils/a11y.js';
import Layout from './Layout.svelte';
import Header from './Header.svelte';
import Content from './Content.svelte';
import Footer from './Footer.svelte';
import Sider from './Sider.svelte';
import SiderControlledFixture from './SiderControlledFixture.svelte';

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

describe('Sider 受控折叠 toggle 往返（回归 #350 后）', () => {
  it('受控模式下触发器可反复折叠/展开（不卡在折叠态）', async () => {
    // 夹具无 props，类型为 Record<string, never>，与 helper 的 Record<string, unknown> 不兼容；
    // 测试场景下安全 cast。
    const { container } = renderWithLocale(
      SiderControlledFixture as unknown as Parameters<typeof renderWithLocale>[0],
      {},
    );
    const sider = container.querySelector('.cd-layout-sider')!;
    const trigger = container.querySelector<HTMLButtonElement>('.cd-layout-sider__trigger')!;
    // 初始展开
    expect(sider.classList.contains('cd-layout-sider--collapsed')).toBe(false);
    // 第一次点击 → 折叠
    trigger.click();
    await tick();
    expect(sider.classList.contains('cd-layout-sider--collapsed')).toBe(true);
    // 第二次点击 → 展开（曾因 headless 捕获陈旧受控值而卡住）
    trigger.click();
    await tick();
    expect(sider.classList.contains('cd-layout-sider--collapsed')).toBe(false);
  });
});
