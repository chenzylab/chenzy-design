import { describe, it, expect } from 'vitest';
import {
  extractScriptBlocks,
  transformSvelteScripts,
} from './svelte-script.js';

describe('extractScriptBlocks', () => {
  it('抽取普通与 module 两个 script 块', () => {
    const src = `<script module>\nexport const a = 1;\n</script>\n<script lang="ts">\nlet b = 2;\n</script>\n<div>{b}</div>`;
    const blocks = extractScriptBlocks(src);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]!.content).toContain('export const a');
    expect(blocks[1]!.content).toContain('let b');
  });

  it('generics 属性值含 > 时不提前截断（Table.svelte 真实形态）', () => {
    const src = `<script lang="ts" generics="T extends Record<string, unknown>">\nlet x: T;\n</script>\n<p></p>`;
    const blocks = extractScriptBlocks(src);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.content.trim()).toBe('let x: T;');
  });

  it('无 script 返回空数组', () => {
    expect(extractScriptBlocks('<div>plain</div>')).toEqual([]);
  });
});

describe('transformSvelteScripts', () => {
  it('只转换 script 块，模板与标签保留', () => {
    const src = `<script lang="ts">let a = 1;</script>\n<div>{a}</div>`;
    const out = transformSvelteScripts(src, (s) => s.toUpperCase());
    expect(out).toBe(`<script lang="ts">LET A = 1;</script>\n<div>{a}</div>`);
  });

  it('transform 抛错时该块原样保留（fallback）', () => {
    const src = `<script>let a = 1;</script>`;
    const out = transformSvelteScripts(src, () => {
      throw new Error('parse fail');
    });
    expect(out).toBe(src);
  });
});
