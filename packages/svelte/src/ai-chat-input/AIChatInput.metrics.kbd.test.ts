// AIChatInput 视觉度量对齐 Semi（browser project / 真实 chromium）。
//
// 存在意义：a11y / 元素计数类断言**测不出视觉差异**。本组件已因此吃过两次亏：
//   1. 附件区原是自造的「复用引用条 chip 视觉」（inline-flex + 极小 padding），
//      与 Semi 的 224×36 卡片完全不是一个东西 —— 所有既有用例照样绿；
//   2. 技能/建议项拆成子组件后，样式若忘了跟着从父组件搬走，Svelte scoped CSS
//      会让它们**静默失效**（选择器带父组件的 .svelte-xxx 作用域类，永不匹配），
//      编译器不报 unused、typecheck 不报错、a11y 用例也不红。
//
// 基线见 test-utils/semi-metrics.ts（取自 Semi scss 源码规则 + variables.scss 常量）。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture } from '../test-utils/kbd.js';
import {
  AI_CHAT_INPUT_ATTACHMENT,
  AI_CHAT_INPUT_ATTACHMENT_NAME,
  AI_CHAT_INPUT_ATTACHMENT_ICON,
  AI_CHAT_INPUT_SKILL_ITEM,
  AI_CHAT_INPUT_SUGGESTION_ITEM,
  AI_CHAT_INPUT_REFERENCES,
  AI_CHAT_INPUT_REFERENCE,
} from '../test-utils/semi-metrics.js';
import AIChatInputMetricsKbdFixture from './AIChatInputMetricsKbdFixture.svelte';

function computedOf(el: Element, keys: string[]): Record<string, string> {
  const cs = getComputedStyle(el);
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = cs[k as keyof CSSStyleDeclaration] as string;
  return out;
}

function expectMatches(selector: string, baseline: { computed: Record<string, string> }): void {
  const el = document.querySelector(selector);
  expect(el, `${selector} 应存在`).not.toBeNull();
  const keys = Object.keys(baseline.computed);
  expect(computedOf(el!, keys)).toEqual(baseline.computed);
}

describe('AIChatInput 视觉度量对齐 Semi', () => {
  it('附件卡片尺寸/圆角/内边距与 Semi 一致（224×36、radius 6、padding 8、gap 8）', () => {
    renderKbdFixture(AIChatInputMetricsKbdFixture);
    expectMatches('.cd-ai-chat-input-attachment', AI_CHAT_INPUT_ATTACHMENT);
  });

  it('附件名称行 12px/16px + 600 字重 + 单行省略（@include font-size-small 带 line-height）', () => {
    renderKbdFixture(AIChatInputMetricsKbdFixture);
    expectMatches('.cd-ai-chat-input-attachment-content-name', AI_CHAT_INPUT_ATTACHMENT_NAME);
  });

  it('附件左侧图标 36×36 + radius 3px', () => {
    renderKbdFixture(AIChatInputMetricsKbdFixture);
    expectMatches('.cd-ai-chat-input-attachment-icon', AI_CHAT_INPUT_ATTACHMENT_ICON);
  });

  it('删除钮默认不显示，hover 卡片后才出现（对齐 Semi &:hover > &-delete）', () => {
    renderKbdFixture(AIChatInputMetricsKbdFixture);
    const del = document.querySelector('.cd-ai-chat-input-attachment-delete');
    expect(del, '删除钮节点应存在').not.toBeNull();
    expect(getComputedStyle(del!).display, '未 hover 时应 display:none').toBe('none');
  });

  // 拆分后样式是否跟着搬走 —— 留在父组件会因 scoped CSS 静默失效。
  it('技能项 flex + gap 8 + padding 8/20 + cursor:pointer（样式随组件拆分迁移生效）', () => {
    renderKbdFixture(AIChatInputMetricsKbdFixture);
    expectMatches('.cd-ai-chat-input-skill-item', AI_CHAT_INPUT_SKILL_ITEM);
  });

  it('建议项 radius 6 + padding 8/20 + 14px/20px（样式随组件拆分迁移生效）', () => {
    renderKbdFixture(AIChatInputMetricsKbdFixture);
    expectMatches('.cd-ai-chat-input-suggestion-item', AI_CHAT_INPUT_SUGGESTION_ITEM);
  });

  // 引用条原值全错：padding 走 extra-tight/tight（非 8/12）、radius 回退到
  // --cd-border-radius-small=3px（Semi 是 6px）、gap 用 extra-tight（非 8px）。
  it('引用区容器 12px/16px + 4px 双向间距 + 8px 下外距', () => {
    renderKbdFixture(AIChatInputMetricsKbdFixture);
    expectMatches('.cd-ai-chat-input-references', AI_CHAT_INPUT_REFERENCES);
  });

  it('引用项 padding 8/12 + radius 6 + column-gap 8', () => {
    renderKbdFixture(AIChatInputMetricsKbdFixture);
    expectMatches('.cd-ai-chat-input-reference', AI_CHAT_INPUT_REFERENCE);
  });

  // Semi 按条数自适应 1/2/3 列，本库此前完全没有这套规则（恒为内容宽度）。
  it('引用条按条数自适应列宽：1 条占满、3 条各约 1/3', () => {
    renderKbdFixture(AIChatInputMetricsKbdFixture);

    const single = document.querySelector('[data-testid="attachment-host"] .cd-ai-chat-input-reference')!;
    const singleWrap = single.parentElement!;
    expect(single.getBoundingClientRect().width).toBeCloseTo(
      singleWrap.getBoundingClientRect().width,
      0,
    );

    const three = document.querySelectorAll(
      '[data-testid="references-three-host"] .cd-ai-chat-input-reference',
    );
    expect(three).toHaveLength(3);
    const threeWrapW = three[0]!.parentElement!.getBoundingClientRect().width;
    // Semi 公式：calc(33.333% - columnGap)，columnGap=4px。
    const expected = threeWrapW * 0.33333 - 4;
    for (const el of three) {
      expect(el.getBoundingClientRect().width).toBeCloseTo(expected, 0);
    }
  });
});
