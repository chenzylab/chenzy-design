// CodeHighlight a11y + 渲染验证（dom project / jsdom）。
//  - 底层用 prismjs 就地高亮 <code>；断言给 code+language 后确实产出 .token span。
//  - role=region 滚动区需可访问名（aria-label 走 i18n CodeHighlight.codeBlock）。
//  - tabindex=0 让长代码块可键盘滚动聚焦（a11y_no_noninteractive_tabindex 已知豁免）。
import { describe, it, expect, vi } from 'vitest';
import { tick } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import CodeHighlight from './CodeHighlight.svelte';

describe('CodeHighlight a11y + render', () => {
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

  it('root <pre> 为 role=region 且有 i18n aria-label（codeBlock），无 axe violations', async () => {
    const { container } = renderWithLocale(CodeHighlight, {
      props: { code: 'let x = 2;', language: 'javascript' },
    });
    await tick();

    const pre = container.querySelector('.cd-code-highlight');
    expect(pre?.getAttribute('role')).toBe('region');
    expect(pre?.getAttribute('aria-label')).toBe('Code block');
    expect(pre?.getAttribute('tabindex')).toBe('0');
    await expectNoAxeViolations(container);
  });

  it('lineNumber=false 时 root 无 line-numbers class', async () => {
    const { container } = renderWithLocale(CodeHighlight, {
      props: { code: 'a;', language: 'javascript', lineNumber: false },
    });
    await tick();

    const pre = container.querySelector('.cd-code-highlight');
    expect(pre?.classList.contains('line-numbers')).toBe(false);
    const code = container.querySelector('code');
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
