import { describe, expect, it } from 'vitest';
import { compileToHast, type HastRoot } from './markdown-render.js';
import type { Element, Text } from 'hast';

/** 递归收集所有 element 的 tagName。 */
function tagNames(root: HastRoot): string[] {
  const out: string[] = [];
  function walk(node: HastRoot | Element | Text): void {
    if (node.type === 'element') out.push(node.tagName);
    if ('children' in node) {
      for (const child of node.children) walk(child as Element | Text);
    }
  }
  walk(root);
  return out;
}

/** 递归拼接所有 text 节点内容。 */
function textContent(root: HastRoot): string {
  let out = '';
  function walk(node: HastRoot | Element | Text): void {
    if (node.type === 'text') out += node.value;
    if ('children' in node) {
      for (const child of node.children) walk(child as Element | Text);
    }
  }
  walk(root);
  return out;
}

describe('compileToHast', () => {
  it('compiles basic markdown into hast elements', async () => {
    const root = await compileToHast('# Title\n\nHello **world**.');
    const tags = tagNames(root);
    expect(tags).toContain('h1');
    expect(tags).toContain('p');
    expect(tags).toContain('strong');
    expect(textContent(root)).toContain('Title');
    expect(textContent(root)).toContain('world');
  });

  it('renders GFM tables when remarkGfm is on (default)', async () => {
    const md = ['| a | b |', '| - | - |', '| 1 | 2 |'].join('\n');
    const root = await compileToHast(md);
    const tags = tagNames(root);
    expect(tags).toContain('table');
    expect(tags).toContain('thead');
    expect(tags).toContain('td');
  });

  it('renders GFM strikethrough (del)', async () => {
    const root = await compileToHast('~~gone~~');
    expect(tagNames(root)).toContain('del');
  });

  it('renders GFM task list items with checkboxes', async () => {
    const root = await compileToHast('- [x] done\n- [ ] todo');
    const tags = tagNames(root);
    expect(tags).toContain('ul');
    expect(tags).toContain('li');
    expect(tags).toContain('input');
  });

  it('remarkGfm=false disables tables/strikethrough', async () => {
    const md = ['| a | b |', '| - | - |', '| 1 | 2 |'].join('\n');
    const root = await compileToHast(md, { remarkGfm: false });
    expect(tagNames(root)).not.toContain('table');

    const strike = await compileToHast('~~gone~~', { remarkGfm: false });
    expect(tagNames(strike)).not.toContain('del');
  });

  it('strips raw HTML by default (Semi format=md behavior)', async () => {
    const root = await compileToHast('before <span class="x">raw</span> after');
    const tags = tagNames(root);
    // raw <span> 不作为 element 出现；文本正文保留。
    expect(tags).not.toContain('span');
  });

  it('passes through custom remark plugins', async () => {
    let called = false;
    // remark 插件：transformer 被调用即证明进入管线。
    const remarkProbe = () => () => {
      called = true;
    };
    await compileToHast('# hi', { remarkPlugins: [remarkProbe] });
    expect(called).toBe(true);
  });

  it('passes through custom rehype plugins (can mutate hast)', async () => {
    // rehype 插件：给根追加一个 <hr> element，验证 hast 层插件生效。
    const rehypeAppendHr =
      () =>
      (tree: HastRoot): void => {
        tree.children.push({
          type: 'element',
          tagName: 'hr',
          properties: {},
          children: [],
        });
      };
    const root = await compileToHast('text', { rehypePlugins: [rehypeAppendHr] });
    expect(tagNames(root)).toContain('hr');
  });

  it('accepts [plugin, options] tuple form', async () => {
    let received: unknown;
    const remarkWithOpts = (opts: unknown) => () => {
      received = opts;
    };
    await compileToHast('# hi', {
      remarkPlugins: [[remarkWithOpts, { flag: 1 }]],
    });
    expect(received).toEqual({ flag: 1 });
  });
});
