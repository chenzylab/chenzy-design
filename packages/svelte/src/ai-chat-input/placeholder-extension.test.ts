// 自定义 Placeholder 的判空逻辑单测（纯函数，node 环境即可跑）。
// 对齐 Semi richTextInput.tsx 的 isDocActuallyEmpty / isParagraphActuallyEmpty /
// paragraphHasSkillSlot 三个辅助函数。
import { describe, it, expect } from 'vitest';
import { isActuallyEmpty, paragraphHasSkillSlot } from './placeholder-extension.js';
import { AI_CHAT_INPUT_ZERO_WIDTH } from '@chenzy-design/core';

/** 最小 ProseMirror 节点桩的形状（递归结构，需显式标注否则 TS 无法自推）。 */
interface StubNode {
  type: { name: string };
  isLeaf: boolean;
  isText: boolean;
  text?: string | undefined;
  nodeSize: number;
  content: { size: number };
  descendants(fn: (n: never, pos: number) => boolean | void): void;
  __children: StubNode[];
}

/** 构造一个最小 ProseMirror 节点桩：descendants 深度优先遍历 children。 */
function node(
  name: string,
  opts: { text?: string; children?: StubNode[]; isText?: boolean } = {},
): StubNode {
  const children: StubNode[] = opts.children ?? [];
  const self: StubNode = {
    type: { name },
    isLeaf: children.length === 0 && !!opts.isText,
    isText: !!opts.isText,
    text: opts.text,
    nodeSize: 1,
    content: { size: children.length },
    descendants(fn: (n: never, pos: number) => boolean | void) {
      let pos = 0;
      const walk = (list: StubNode[]) => {
        for (const child of list) {
          pos += 1;
          const goDeeper = fn(child as never, pos);
          if (goDeeper !== false) walk(child.__children);
        }
      };
      walk(children);
    },
    __children: children,
  };
  return self;
}

const text = (t: string) => node('text', { text: t, isText: true });
const skill = () => node('skillSlot', { children: [text('翻译')] });

describe('isActuallyEmpty（忽略 skillSlot 与零宽字符）', () => {
  it('空段落 → 空', () => {
    expect(isActuallyEmpty(node('paragraph') as never)).toBe(true);
  });

  it('只含 skillSlot → 仍视为空（这正是 showPlaceholderWhenSkillOnly 的关键）', () => {
    expect(isActuallyEmpty(node('paragraph', { children: [skill()] }) as never)).toBe(true);
  });

  it('skillSlot 之外还有真实文本 → 非空', () => {
    expect(
      isActuallyEmpty(node('paragraph', { children: [skill(), text('你好')] }) as never),
    ).toBe(false);
  });

  it('只含零宽字符 → 视为空', () => {
    expect(
      isActuallyEmpty(node('paragraph', { children: [text(AI_CHAT_INPUT_ZERO_WIDTH)] }) as never),
    ).toBe(true);
  });

  it('零宽字符 + 真实文本 → 非空', () => {
    expect(
      isActuallyEmpty(
        node('paragraph', { children: [text(AI_CHAT_INPUT_ZERO_WIDTH + 'a')] }) as never,
      ),
    ).toBe(false);
  });

  it('含其它自定义节点（如 inputSlot）→ 非空', () => {
    expect(
      isActuallyEmpty(node('paragraph', { children: [node('inputSlot')] }) as never),
    ).toBe(false);
  });
});

describe('paragraphHasSkillSlot', () => {
  it('含 skillSlot → true', () => {
    expect(paragraphHasSkillSlot(node('paragraph', { children: [skill()] }) as never)).toBe(true);
  });

  it('不含 → false', () => {
    expect(
      paragraphHasSkillSlot(node('paragraph', { children: [text('你好')] }) as never),
    ).toBe(false);
  });
});
