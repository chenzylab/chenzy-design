// MarkdownRender 渲染 + a11y 验证（dom / jsdom project）。
// 覆盖：基本 md（标题/加粗/链接/列表/表格/代码块）、components 覆盖 h1、自定义标签渲染 Svelte 组件。
// compileToHast 异步（惰性 import 编译器），断言前轮询等待 hast 渲染完成。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import MarkdownRender from './MarkdownRender.svelte';
import H1Stub from './H1Fixture.svelte';
import CalloutStub from './CalloutFixture.svelte';

/** 轮询等待条件成立（异步编译落地）。 */
async function waitFor(fn: () => boolean, timeout = 2000): Promise<void> {
  const start = Date.now();
  while (!fn()) {
    if (Date.now() - start > timeout) throw new Error('waitFor timeout');
    await new Promise((r) => setTimeout(r, 10));
  }
}

const BASIC = [
  '# Title',
  '',
  'Hello **world** and [link](https://example.com).',
  '',
  '- one',
  '- two',
  '',
  '| a | b |',
  '| - | - |',
  '| 1 | 2 |',
  '',
  '```js',
  'const x = 1;',
  '```',
].join('\n');

describe('MarkdownRender render', () => {
  it('renders basic markdown: heading/bold/link/list/table/code', async () => {
    const { container } = render(MarkdownRender, { props: { raw: BASIC } });
    await waitFor(() => !!container.querySelector('h1'));

    const root = container.querySelector('.cd-markdown-render')!;
    expect(root.querySelector('h1')?.textContent).toContain('Title');
    expect(root.querySelector('strong')?.textContent).toBe('world');

    const link = root.querySelector('a');
    expect(link?.getAttribute('href')).toBe('https://example.com');
    // 外链自动补 rel/target（Anchor 覆盖）
    expect(link?.getAttribute('rel')).toContain('noopener');
    expect(link?.getAttribute('target')).toBe('_blank');

    expect(root.querySelectorAll('li').length).toBe(2);
    expect(root.querySelector('table')).toBeTruthy();
    expect(root.querySelector('thead')).toBeTruthy();
    // 代码块降级为 <pre><code>（CodeHighlight 未合并）
    await waitFor(() => !!root.querySelector('pre code'));
    expect(root.querySelector('pre code')?.textContent).toContain('const x = 1;');

    await expectNoAxeViolations(container);
  });

  it('components override replaces h1 with a custom Svelte component', async () => {
    const { container } = render(MarkdownRender, {
      props: { raw: '# Heading', components: { h1: H1Stub } },
    });
    await waitFor(() => !!container.querySelector('[data-testid="custom-h1"]'));
    const stub = container.querySelector('[data-testid="custom-h1"]');
    expect(stub).toBeTruthy();
    expect(stub?.textContent).toContain('Heading');
    // 原生 h1 不再渲染
    expect(container.querySelector('h1')).toBeNull();
  });

  it('registers a custom tag rendered by a Svelte component (via rehype plugin)', async () => {
    // rehype 插件：把 <p> 里首个 text "CALLOUT" 段落替换为自定义 <callout> element。
    const rehypeInjectCallout =
      () =>
      (tree: { children: unknown[] }): void => {
        tree.children.unshift({
          type: 'element',
          tagName: 'callout',
          properties: { tone: 'info' },
          children: [{ type: 'text', value: 'note body' }],
        });
      };

    const { container } = render(MarkdownRender, {
      props: {
        raw: 'plain paragraph',
        components: { callout: CalloutStub },
        rehypePlugins: [rehypeInjectCallout],
      },
    });
    await waitFor(() => !!container.querySelector('[data-testid="callout"]'));
    const callout = container.querySelector('[data-testid="callout"]');
    expect(callout?.getAttribute('data-tone')).toBe('info');
    expect(callout?.textContent).toContain('note body');
  });

  it('strips raw HTML by default (no injected span)', async () => {
    const { container } = render(MarkdownRender, {
      props: { raw: 'a <span id="danger">x</span> b' },
    });
    await waitFor(() => !!container.querySelector('.cd-markdown-render p'));
    expect(container.querySelector('#danger')).toBeNull();
  });
});
