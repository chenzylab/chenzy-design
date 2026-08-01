<!--
  DialogueReasoning — 思考过程块（1:1 对齐 Semi widgets/contentItem/reasoning.tsx）。

  本库原来只有「一个按钮 + 折叠内容」两层，Semi 是 -wrapper 外框（带边框圆角）
  + -header（prefix 图标 / title 文案 / suffix 箭头 三段）+ -content（带上边框）。

  逐条照搬的行为：
  · 默认展开与否取决于状态：`status !== 'completed'` 即思考中 → 默认展开；
  · 标题文案两态：completed → locale reasoning.completed，否则 reasoning.thinking
    （本库原来是单串 'Reasoning'，已按 Semi 改成嵌套两态）；
  · 前缀固定 IconAISearchLevel2，后缀 IconChevronUp/Down 随展开态切换；
  · 正文优先取 summary，为空再取 content（Semi getText 的顺序）。

  复用 Collapsible + MarkdownRender（Semi 也复用这两个）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { IconAISearchLevel2, IconChevronDown, IconChevronUp } from '@chenzy-design/icons';
  import { Collapsible } from '../collapsible/index.js';
  import { MarkdownRender } from '../markdown-render/index.js';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    status?: string | undefined;
    summary?: { text?: string; type?: string }[] | undefined;
    content?: { text?: string; type?: string }[] | undefined;
    markdownRenderProps?: Record<string, unknown> | undefined;
    /** 自定义正文渲染（对齐 Semi customRenderer）。 */
    customRenderer?: Snippet<[{ status: string | undefined; text: string }]> | undefined;
  }

  let { status, summary, content, markdownRenderProps, customRenderer }: Props = $props();

  const loc = useLocale();

  // 对齐 Semi：defaultOpen = status !== 'completed'（思考中默认展开，完成后默认收起）。
  // untrack：只吃初始状态，之后由用户点击控制，不因 status 变化强行改回。
  let isOpen = $state(untrack(() => status !== 'completed'));

  // 对齐 Semi getText：summary 非空优先，否则取 content，均以 \n 连接。
  const text = $derived.by(() => {
    if (summary && summary.length > 0) return summary.map((s) => s.text ?? '').join('\n');
    if (content && content.length > 0) return content.map((c) => c.text ?? '').join('\n');
    return '';
  });

  const title = $derived(
    status === 'completed'
      ? loc().t('AIChatDialogue.reasoning.completed')
      : loc().t('AIChatDialogue.reasoning.thinking'),
  );
</script>

<div class="cd-ai-chat-dialogue-reasoning">
  <div class="cd-ai-chat-dialogue-reasoning-wrapper">
    <!-- Semi 是 div + role=button + 手写 Enter/Space；本库用原生 button，语义等价。 -->
    <button
      type="button"
      class="cd-ai-chat-dialogue-reasoning-header"
      aria-expanded={isOpen}
      onclick={() => (isOpen = !isOpen)}
    >
      <span class="cd-ai-chat-dialogue-reasoning-header-prefix">
        <IconAISearchLevel2 />
      </span>
      <span class="cd-ai-chat-dialogue-reasoning-header-title">{title}</span>
      <span class="cd-ai-chat-dialogue-reasoning-header-suffix">
        {#if isOpen}<IconChevronUp />{:else}<IconChevronDown />{/if}
      </span>
    </button>
    <Collapsible {isOpen}>
      <div class="cd-ai-chat-dialogue-reasoning-content">
        {#if customRenderer}
          {@render customRenderer({ status, text })}
        {:else}
          <MarkdownRender raw={text} {...markdownRenderProps} />
        {/if}
      </div>
    </Collapsible>
  </div>
</div>

<style>
  /* 逐条对齐 Semi aiChatDialogue.scss &-reasoning。 */
  .cd-ai-chat-dialogue-reasoning {
    width: var(--cd-ai-chat-dialogue-reasoning);
  }

  .cd-ai-chat-dialogue-reasoning-wrapper {
    width: var(--cd-width-ai-chat-dialogue-reasoning-wrapper);
    margin-top: var(--cd-ai-chat-dialogue-reasoning-wrapper-margin-top);
    cursor: pointer;
    border: var(--cd-width-ai-chat-dialogue-reasoning-border) solid
      var(--cd-color-ai-chat-dialogue-reasoning-border);
    border-radius: var(--cd-radius-ai-chat-dialogue-reasoning-wrapper);
  }

  .cd-ai-chat-dialogue-reasoning-header {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: var(--cd-ai-chat-dialogue-reasoning-header-padding);

    /* button 复位（Semi 那边是 div + role=button）。 */
    width: 100%;
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }

  .cd-ai-chat-dialogue-reasoning-header-prefix,
  .cd-ai-chat-dialogue-reasoning-header-suffix {
    width: var(--cd-width-ai-chat-dialogue-reasoning-prefix);
    height: var(--cd-height-ai-chat-dialogue-reasoning-prefix);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cd-ai-chat-dialogue-reasoning-header-title {
    flex: 1 1 auto;
    line-height: var(--cd-ai-chat-dialogue-reasoning-header-title-line-height);
    font-weight: var(--cd-ai-chat-dialogue-reasoning-header-title-font-weight);
  }

  .cd-ai-chat-dialogue-reasoning-content {
    padding: var(--cd-ai-chat-dialogue-reasoning-content-padding-y)
      var(--cd-ai-chat-dialogue-reasoning-content-padding-x);
    border-top: var(--cd-width-ai-chat-dialogue-reasoning-border) solid
      var(--cd-color-ai-chat-dialogue-reasoning-border);
  }
</style>
