<!--
  DialogueStep — 步骤内容块（1:1 对齐 Semi widgets/contentItem/dialogueStep.tsx）。

  本库此前完全没有 steps 这个内容类型（ContentItemRenderer 无分支、core 无类型），
  Semi 侧是一整个 widget + 9 条 scss 规则。

  行为逐条照搬 Semi：
  · 初始**全部展开**（openIndexes 初值 = 所有下标），steps 变化时重置为全展开；
  · 点击整行切换展开（Semi 用 role=button + tabIndex + Enter/Space，本库直接用
    <button> 原生元素，语义等价且免去手写键盘处理）；
  · 只有 actions 非空才渲染展开箭头（Semi `actionsLength > 0`）；
  · status==='completed' 显示 IconStoryStroked，否则显示三点 loading
    （复用 -content-loading 那套类，与 Semi 一致）。

  复用 Collapsible（Semi 也复用 collapsible）承载展开动效。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import type { DialogueStep as DialogueStepData } from '@chenzy-design/core';
  import { IconStoryStroked, IconChevronDown, IconChevronUp } from '@chenzy-design/icons';
  import { Collapsible } from '../collapsible/index.js';

  interface Props {
    steps: DialogueStepData[];
    /** 自定义 action 图标渲染（Semi 的 action.icon 是 ReactNode，本库交由渲染层给 Snippet）。 */
    renderActionIcon?: Snippet<[{ icon: unknown }]> | undefined;
  }

  let { steps, renderActionIcon }: Props = $props();

  // 初始全展开；steps 变化时重置（对齐 Semi 的 useState 初值 + useEffect([props.steps])）。
  // untrack：初值只取当次快照，不把 steps 变成本行的依赖（后续变化交给下面的 $effect）。
  let openIndexes = $state<Set<number>>(untrack(() => new Set(steps.map((_, i) => i))));
  let prevKey = untrack(() => JSON.stringify(steps));
  $effect(() => {
    const key = JSON.stringify(steps);
    if (key === prevKey) return;
    prevKey = key;
    openIndexes = new Set(steps.map((_, i) => i));
  });

  function toggleOpen(idx: number): void {
    // Svelte 5：普通 Set 的 add/delete 不是响应式的，必须换新引用。
    const next = new Set(openIndexes);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    openIndexes = next;
  }
</script>

<div class="cd-ai-chat-dialogue-step-wrapper">
  {#each steps as item, index (index)}
    {@const isOpen = openIndexes.has(index)}
    {@const actionsLength = item.actions?.length ?? 0}
    <button type="button" class="cd-ai-chat-dialogue-step" aria-expanded={isOpen} onclick={() => toggleOpen(index)}>
      <span class="cd-ai-chat-dialogue-step-prefix">
        {#if item.status === 'completed'}
          <IconStoryStroked class="cd-ai-chat-dialogue-step-completed" />
        {:else}
          <!-- 三点 loading：复用 Semi 的 -content-loading 类树。 -->
          <span class="cd-ai-chat-dialogue-content-loading">
            <span class="cd-ai-chat-dialogue-content-loading-item"></span>
            <span class="cd-ai-chat-dialogue-content-loading-item"></span>
            <span class="cd-ai-chat-dialogue-content-loading-item"></span>
          </span>
        {/if}
      </span>
      <span class="cd-ai-chat-dialogue-step-summary">{item.summary ?? ''}</span>
      {#if actionsLength > 0}
        <span class="cd-ai-chat-dialogue-step-suffix">
          {#if isOpen}<IconChevronUp />{:else}<IconChevronDown />{/if}
        </span>
      {/if}
    </button>
    <Collapsible {isOpen}>
      <div class="cd-ai-chat-dialogue-step-panel">
        <div class="cd-ai-chat-dialogue-step-line"></div>
        <div class="cd-ai-chat-dialogue-step-action-wrapper">
          {#each item.actions ?? [] as action, i (i)}
            <div class="cd-ai-chat-dialogue-step-action">
              <div class="cd-ai-chat-dialogue-step-action-summary">{action.summary ?? ''}</div>
              <div class="cd-ai-chat-dialogue-step-action-desc">
                {#if action.icon !== undefined && renderActionIcon}
                  {@render renderActionIcon({ icon: action.icon })}
                {/if}
                {action.description ?? ''}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </Collapsible>
  {/each}
</div>

<style>
  /* 逐条对齐 Semi aiChatDialogue.scss &-step 及其子块。 */
  .cd-ai-chat-dialogue-step-wrapper {
    margin-top: var(--cd-ai-chat-dialogue-step-wrapper-margin-top);
  }

  .cd-ai-chat-dialogue-step {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    line-height: var(--cd-ai-chat-dialogue-step-line-height);
    padding: var(--cd-ai-chat-dialogue-step-padding-y)
      var(--cd-ai-chat-dialogue-step-padding-x);
    border: var(--cd-width-ai-chat-dialogue-step-border) solid
      var(--cd-color-ai-chat-dialogue-step-border);
    border-radius: var(--cd-ai-chat-dialogue-step);
    margin-top: var(--cd-ai-chat-dialogue-step-margin-top);
    font-size: var(--cd-ai-chat-dialogue-step-font-size);

    /* button 复位（Semi 那边是 div + role=button，故无需这几条）。 */
    background: transparent;
    color: inherit;
    font-family: inherit;
    text-align: start;
    cursor: pointer;
  }

  /* Semi: .#{$module}-content-loading { margin-top: 0 } —— 步骤内的 loading 不要上外距。
     content-loading 定义在 DialogueBox.svelte（跨组件），祖先链选择器须整条 :global()，
     只给后半截打洞不够——中间的 scoped hash 对不上会静默失效。 */
  :global(.cd-ai-chat-dialogue-step .cd-ai-chat-dialogue-content-loading) {
    margin-top: 0;
  }

  .cd-ai-chat-dialogue-step :global(.cd-ai-chat-dialogue-step-completed) {
    color: var(--cd-ai-chat-dialogue-step-completed-text);
  }

  .cd-ai-chat-dialogue-step-summary {
    display: inline-block;
    width: fit-content;
    cursor: pointer;
  }

  .cd-ai-chat-dialogue-step-prefix {
    width: var(--cd-width-ai-chat-dialogue-step-prefix);
    height: var(--cd-height-ai-chat-dialogue-step-prefix);
    color: var(--cd-ai-chat-dialogue-step-suffix-text);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--cd-ai-chat-dialogue-step-prefix-margin-right);
  }

  .cd-ai-chat-dialogue-step-suffix {
    width: var(--cd-width-ai-chat-dialogue-step-suffix);
    height: var(--cd-height-ai-chat-dialogue-step-suffix);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--cd-ai-chat-dialogue-step-suffix-text);
    margin-left: var(--cd-ai-chat-dialogue-step-suffix-margin-left);
  }

  .cd-ai-chat-dialogue-step-panel {
    display: flex;
    gap: var(--cd-ai-chat-dialogue-step-panel-gap);
  }

  .cd-ai-chat-dialogue-step-line {
    width: var(--cd-ai-chat-dialogue-step-line);
    background-color: var(--cd-color-ai-chat-dialogue-step-border);
    margin-left: var(--cd-ai-chat-dialogue-step-line-margin-left);
  }

  .cd-ai-chat-dialogue-step-action {
    line-height: var(--cd-ai-chat-dialogue-step-action-line-height);
    margin-top: var(--cd-ai-chat-dialogue-step-action-margin-top);
    font-size: var(--cd-ai-chat-dialogue-step-action-font-size);
  }

  .cd-ai-chat-dialogue-step-action-summary {
    margin-bottom: var(--cd-ai-chat-dialogue-step-action-summary-margin-bottom);
  }

  .cd-ai-chat-dialogue-step-action-desc {
    display: inline-flex;
    color: var(--cd-ai-chat-dialogue-step-action-text);
    padding: var(--cd-ai-chat-dialogue-step-action-desc-padding-y)
      var(--cd-ai-chat-dialogue-step-action-desc-padding-x);
    background-color: var(--cd-ai-chat-dialogue-step-action-bg);
    border-radius: var(--cd-ai-chat-dialogue-action-desc);
    width: fit-content;
    align-items: center;
    justify-content: center;
  }
</style>
