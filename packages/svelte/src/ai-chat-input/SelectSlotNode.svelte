<!--
  SelectSlotNode — tiptap selectSlot 自定义节点的 Svelte NodeView（可选补充）。
  对齐 Semi SelectSlotComponent：编辑器内联下拉，选中写回 node.attrs.value（updateAttributes）。
  通常用于 renderTemplate 模版填空（模版里嵌可选参数）。用 svelte-tiptap NodeViewWrapper 承载。
  props 由 SvelteNodeViewRenderer 注入（tiptap NodeViewProps：node/updateAttributes）。
-->
<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { NodeViewWrapper } from 'svelte-tiptap';
  import { Select } from '../select/index.js';

  let { node, updateAttributes }: NodeViewProps = $props();

  // options 存为 JSON 字符串（对齐 Semi）；解析失败回退空数组。
  const options = $derived.by(() => {
    const raw = node.attrs.options as string | undefined;
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw) as unknown;
      if (!Array.isArray(arr)) return [];
      return arr.map((o) => ({ value: String(o), label: String(o) }));
    } catch {
      return [];
    }
  });

  const value = $derived((node.attrs.value as string) ?? '');

  function handleChange(v: unknown): void {
    if (typeof v === 'string') updateAttributes({ value: v });
  }
</script>

<!-- 类名对齐 Semi extension/selectSlot/index.tsx：select-slot-wrapper（外层）+
     select-slot（Select 自身），两个都**无前缀**。本库原来外层叫
     cd-ai-chat-input-select-slot-wrap，且 Select 上没挂 select-slot。 -->
<NodeViewWrapper as="span" class="select-slot-wrapper">
  <Select
    class="select-slot"
    size="small"
    optionList={options as never}
    value={value as never}
    onChange={handleChange as never}
  />
</NodeViewWrapper>

<style>
  /* 逐条对齐 Semi aiChatInput.scss:570-596。本库原来只有三行自造样式
     （inline-flex + 通用 spacing 外边距 + min-width:80px），
     Semi 的底色/圆角/高度/内距/文本色/箭头色一条都没接。
     NodeViewWrapper 与 Select 内部节点的 class 都在运行时注入，故一律 :global。 */
  :global(.select-slot-wrapper) {
    display: inline-flex;
    vertical-align: baseline;
    margin: var(--cd-spacing-ai-chat-input-rich-text-select-slot-marginy)
      var(--cd-spacing-ai-chat-input-rich-text-select-slot-marginx);
  }

  /* Semi 未声明 box-sizing，走默认 content-box：height:24px 是内容区，padding 向外
     撑大实际渲染高度（对齐 Semi &-attachment / &-footer-configure-mcp-header 同类
     盒模型问题，本库全局 border-box reset 需在此显式改回）。 */
  :global(.select-slot) {
    box-sizing: content-box;
    height: var(--cd-height-ai-chat-input-rich-text-select-slot);
    padding: var(--cd-spacing-ai-chat-input-rich-text-select-slot-paddingy)
      var(--cd-spacing-ai-chat-input-rich-text-select-slot-paddingx);
    border-radius: var(--cd-radius-ai-chat-input-rich-text-select-slot);
    background-color: var(--cd-color-ai-chat-input-rich-text-select-slot-bg);
    font-size: var(--cd-font-size-regular);
  }

  /* Semi .semi-select 是单层结构，背景色/圆角直接落在它本身。aiChatInput.scss 的
     .select-slot { background-color: ... } 没有写 &:hover 覆盖，但真机核实 Semi 官方
     select-slot 在 hover 时背景确实不变色（.select-slot 单类选择器纸面特异性低于
     .semi-select:hover 类+伪类，理论推不出这个结果——具体是 Semi 侧靠什么机制压住
     hover 未查实，但真机观察到的效果是权威真源）。
     本库 Select 组件是两层结构：视觉全部挂在内层 .cd-select-trigger（自带默认灰底
     --cd-select-bg + hover 态 --cd-select-bg-hover + 圆角），完全遮住外层 .select-slot
     设的浅蓝背景，且默认态与 hover 态都要清空才能稳定不随 hover 变色。
     Select.svelte 里真正生效的 hover 规则是复合选择器
     `.cd-select:not(.cd-select-open):not(...):not(...):not(...) .cd-select-trigger:hover`
     （4 个 :not() 叠加，特异性 0,7,0），单类 `.select-slot .cd-select-trigger:hover`
     （0,3,0）根本压不过——首次改动漏了这层，实测 hover 后背景仍变灰。用 !important
     而非堆砌 :not() 凑特异性：后者要跟着 Select.svelte 的 :not() 链同步维护，脆弱；
     这里只是「清空一个不该有的底色」，!important 是比复刻内部实现细节更稳的写法。 */
  :global(.select-slot .cd-select-trigger),
  :global(.select-slot .cd-select-trigger:hover) {
    background: transparent !important;
    border-radius: inherit;
  }

  /* Semi 的 .semi-select-selection（外层容器）自带 color 声明，其内层
     -selection-text 没有独立 color，天然继承外层蓝色——挂外层一条规则就够。
     本库结构不同：.cd-select-selection（外层）没有自己的默认色，但内层
     .cd-select-value 有独立的 `color: var(--cd-color-select-main-text-default)`
     声明（Select.svelte），继承链在这里被打断，只挂外层不生效，真机实测
     .cd-select-value 仍是默认深灰黑。margin-left 不继承、只能挂在承载盒子的
     外层容器上（对齐 Semi margin-left 落在 -selection 层级）；color/font-weight
     两条必须同时覆盖内层 .cd-select-value 才能真正显示为蓝色粗体。 */
  :global(.select-slot .cd-select-selection) {
    margin-left: var(--cd-spacing-ai-chat-input-rich-text-select-selection-marginleft);
  }
  :global(.select-slot .cd-select-selection),
  :global(.select-slot .cd-select-value) {
    color: var(--cd-color-ai-chat-input-rich-text-select-selection-text);
    font-weight: bold;
  }

  :global(.select-slot .cd-select-arrow) {
    color: var(--cd-color-ai-chat-input-rich-text-select-slot-arrow);
    width: var(--cd-width-ai-chat-input-rich-text-select-slot-arrow);
  }

  /* 展开/聚焦时不显描边（Semi &.semi-select-open / -focus / :focus 均 border-color: transparent）。
     真正带 border 的是内层 .cd-select-trigger（Select.svelte 里 border 挂在 -trigger 而非
     根节点 .cd-select 本身），此前误挂在 .select-slot 根节点——那里本无 border-width，
     规则命中了空气，.cd-select-trigger 保留了 Select 默认 open/focus 态的蓝色描边，
     真机可见（对齐 Semi 应完全无边框）。 */
  :global(.select-slot.cd-select-open .cd-select-trigger),
  :global(.select-slot.cd-select-focus .cd-select-trigger),
  :global(.select-slot:focus .cd-select-trigger) {
    border-color: transparent;
  }
</style>
