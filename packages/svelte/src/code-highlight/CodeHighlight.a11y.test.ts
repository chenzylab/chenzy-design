// CodeHighlight 渲染验证（dom project / jsdom）。
//  - 底层用 prismjs 就地高亮 <code>；断言给 code+language 后确实产出 .token span。
//  - 根 <div> 严格对齐 Semi：无 role/aria-label/tabindex（Semi 源码无此增强，本库不额外加）。
import { describe, it, expect, vi } from 'vitest';
import { tick } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import CodeHighlight from './CodeHighlight.svelte';

describe('CodeHighlight render', () => {
  it('给 code + language 渲染后 <code> 内含 .token span', async () => {
    const { container } = renderWithLocale(CodeHighlight, {
      props: { code: 'const a = 1;', language: 'javascript' },
    });
    // 高亮在 $effect 里异步进行：先动态 import Prism 语言组件（客户端懒加载），再 highlightElement。
    // 故轮询等待 token 出现，而非固定等一拍。
    await vi.waitFor(() => {
      expect(container.querySelectorAll('code .token').length).toBeGreaterThan(0);
    });

    const code = container.querySelector('code');
    expect(code).toBeTruthy();
    // language class 已加到 code 元素。
    expect(code?.className).toContain('language-javascript');
  });

  it('root <div> 对齐 Semi：无 role/aria-label/tabindex，class 顺序 class-name 在前', async () => {
    const { container } = renderWithLocale(CodeHighlight, {
      props: { code: 'let x = 2;', language: 'javascript', class: 'my-extra' },
    });
    await tick();

    // DOM 对齐 Semi：根为 div.cd-code-highlight（含 cd-light-scrollbar）。
    const root = container.querySelector('.cd-code-highlight');
    expect(root?.tagName).toBe('DIV');
    expect(root?.classList.contains('cd-light-scrollbar')).toBe(true);
    // 对齐 Semi cls(className, PREFIX, "semi-light-scrollbar", ...)：外部 class 排最前。
    expect(root?.className.split(' ')[0]).toBe('my-extra');
    expect(root?.hasAttribute('role')).toBe(false);
    expect(root?.hasAttribute('aria-label')).toBe(false);
    expect(root?.hasAttribute('tabindex')).toBe(false);
    // defaultTheme 默认 true → 根含 cd-code-highlight-defaultTheme。
    expect(root?.classList.contains('cd-code-highlight-defaultTheme')).toBe(true);
    await expectNoAxeViolations(container);
  });

  it('defaultTheme=false 时根无 cd-code-highlight-defaultTheme class', async () => {
    const { container } = renderWithLocale(CodeHighlight, {
      props: { code: 'a;', language: 'javascript', defaultTheme: false },
    });
    await tick();

    const root = container.querySelector('.cd-code-highlight');
    expect(root?.classList.contains('cd-code-highlight-defaultTheme')).toBe(false);
  });

  it('lineNumber 控制 <pre> 上的 line-numbers class', async () => {
    // 对齐 Semi：line-numbers class 只由 CodeHighlight 加在 <code> 上；Prism line-numbers
    // 插件的 complete hook 高亮完成后再把它从 <code> 搬到 <pre>（见 prism-line-numbers.js），
    // 本组件模板不手动给 <pre> 加此 class。故断言需等待插件跑完（轮询 .line-numbers-rows）。
    const on = renderWithLocale(CodeHighlight, {
      props: { code: 'a;', language: 'javascript', lineNumber: true },
    });
    await vi.waitFor(() => {
      expect(on.container.querySelector('pre')?.classList.contains('line-numbers')).toBe(true);
    });
    expect(on.container.querySelector('code')?.className).not.toContain('line-numbers');

    const off = renderWithLocale(CodeHighlight, {
      props: { code: 'a;', language: 'javascript', lineNumber: false },
    });
    await vi.waitFor(() => {
      expect(off.container.querySelectorAll('code .token').length).toBeGreaterThan(0);
    });
    expect(off.container.querySelector('pre')?.classList.contains('line-numbers')).toBe(false);
    const code = off.container.querySelector('code');
    expect(code?.className).not.toContain('line-numbers');
  });

  it('code 内容作为纯文本渲染，不解析为 HTML（无 XSS 面）', async () => {
    const { container } = renderWithLocale(CodeHighlight, {
      props: { code: '<img src=x onerror="alert(1)">', language: 'markup' },
    });
    await tick();
    await Promise.resolve();

    // 不应真的产生 <img> 元素——内容经 textContent 写入后由 Prism 转义高亮。
    expect(container.querySelector('code img')).toBeNull();
    expect(container.querySelector('code')?.textContent).toContain('<img');
  });
});
