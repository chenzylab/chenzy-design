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

  // 浮层改由 Popover 承载后踩到的真回归：本库 Tooltip/Popover 会把触发器包进两层
  // inline-block 的 span，把这种块级输入框**收缩成内容宽度**（实测 890→106px，
  // 整页每个实例都被压扁）。Semi 侧 Popover 用 cloneElement 不加包裹层。
  it('输入框宽度不被 Popover 触发器包裹层压缩（撑满父容器）', () => {
    renderKbdFixture(AIChatInputMetricsKbdFixture);

    const box = document.querySelector('[data-testid="attachment-host"] .cd-ai-chat-input')!;
    const host = document.querySelector('[data-testid="attachment-host"]')!;
    const boxW = box.getBoundingClientRect().width;
    const hostW = host.getBoundingClientRect().width;

    expect(hostW, '夹具容器应有真实宽度').toBeGreaterThan(200);
    expect(boxW, `输入框应撑满容器（实测 ${boxW} / ${hostW}）`).toBeCloseTo(hostW, 0);
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

// 文件类型图标底色。Semi &-ref-icon 给七种类型各定一个底色
// （$color-aiChatInput_ref_icon_word-*）；本库此前渲染了 -ref-icon-{type} 类名
// 却一条样式/token 都没有 —— 七种类型全同色，而 a11y 用例只断类名存在，照样绿。
describe('AIChatInput 文件类型图标底色（对齐 Semi）', () => {
  it('docx 附件 → -ref-icon-word，底色是蓝 4（非透明/默认色）', () => {
    renderKbdFixture(AIChatInputMetricsKbdFixture);
    const icon = document.querySelector('.cd-ai-chat-input-ref-icon-word') as HTMLElement;
    expect(icon, '应渲染 word 类型图标').not.toBeNull();
    const bg = getComputedStyle(icon).backgroundColor;
    // Semi $color-aiChatInput_ref_icon_word-bg = rgba(var(--semi-blue-4), 1) = #3295fb。
    expect(bg).toBe('rgb(50, 149, 251)');
    // 前景白（Semi &-ref-icon 的 color: white）。
    // 不断 display：本库 -attachment-icon 另有 flex 覆盖（Semi 无这层规则，属本库自有）。
    expect(getComputedStyle(icon).color).toBe('rgb(255, 255, 255)');
  });
});

// 富文本输入插槽的视觉。Semi 是「主色浅底 + 4px 圆角」的行内药丸，
// 本库原来画成「1px 虚线下划线」—— 两套完全不同的视觉，而 a11y 用例只断类名，照样绿。
// 那 13 条 $*-rich_text-input_slot-* 变量本库此前只有 lineHeight 一条。
describe('AIChatInput 输入插槽视觉（对齐 Semi）', () => {
  it('input-slot 是主色浅底药丸（非虚线下划线）', async () => {
    // 断言对象是**编辑器真渲染出来的** input-slot 节点，不是裸 markup：
    // InputSlotNode 的样式写在它自己的 <style> 里（:global），而 Svelte 组件样式
    // 随组件挂载才注入 —— 摆一份裸 markup 的话，样式能否命中取决于本文件里
    // 是否恰好有别的用例先挂过该组件，会变成用例顺序依赖（本轮因此红过两次）。
    renderKbdFixture(AIChatInputMetricsKbdFixture);
    const deadline = Date.now() + 3000;
    let slot: HTMLElement | null = null;
    while (!slot && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 40));
      slot = document.querySelector(
        '[data-testid="slot-style-host"] .input-slot',
      ) as HTMLElement | null;
    }
    expect(slot, '编辑器应渲染出 input-slot 节点').not.toBeNull();
    const cs = getComputedStyle(slot!);
    expect(cs.display).toBe('inline-block');
    // Semi: 4px 圆角 + 主色浅底；本库原来是 border-bottom dashed、无背景。
    expect(cs.borderRadius).toBe('4px');
    expect(cs.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(cs.borderBottomStyle).not.toBe('dashed');
    // 占位符是绝对定位（Semi 用它避免撑开插槽），本库原来是普通行内元素。
    const ph = slot!.querySelector('.input-slot-placeholder') as HTMLElement;
    expect(getComputedStyle(ph).position).toBe('absolute');
  });
});

// 技能插槽视觉。Semi 是「纯文字（主色 + 600 字重）→ hover 才染底」，
// 删除按钮平时 display:none、hover 才浮成右上角小圆徽标（aiChatInput.scss:612-648）。
// 本库原来是「常显药丸（有底色）+ 常显删除按钮」，且用的是自造的 -skill-* 四条 token。
describe('AIChatInput 技能插槽视觉（对齐 Semi）', () => {
  it('默认：纯文字无底色，删除按钮 display:none', () => {
    renderKbdFixture(AIChatInputMetricsKbdFixture);
    const wrap = document.querySelector('[data-testid="skill-slot-host"] .skill-slot-wrapper') as HTMLElement;
    expect(wrap, 'fixture 应提供 skill-slot 结构').not.toBeNull();
    // 未 hover 时不染底（Semi 只在 :hover 才有 background-color）。
    expect(getComputedStyle(wrap).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    // 4px 圆角（Semi $radius-aiChatInput_rich_text-skill_slot）。
    expect(getComputedStyle(wrap).borderRadius).toBe('4px');

    const del = wrap.querySelector('.skill-slot-delete') as HTMLElement;
    expect(getComputedStyle(del).display, '删除按钮平时不显示').toBe('none');
  });

  it('文本是主色 + 600 字重（非本库原来的 chip 前景色）', () => {
    renderKbdFixture(AIChatInputMetricsKbdFixture);
    const slot = document.querySelector('[data-testid="skill-slot-host"] .skill-slot') as HTMLElement;
    const cs = getComputedStyle(slot);
    expect(cs.fontWeight).toBe('600');
    // 主色（非透明、非继承的默认文本色）。
    expect(cs.color).not.toBe('rgba(0, 0, 0, 0)');
  });
});
