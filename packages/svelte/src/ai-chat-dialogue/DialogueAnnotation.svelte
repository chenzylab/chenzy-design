<!--
  DialogueAnnotation — 引用来源摘要（1:1 对齐 Semi widgets/contentItem/annotation.tsx）。

  与本库原实现的关键差异：Semi 是**一条折叠摘要**——logo 头像组（AvatarGroup，超出折叠成
  「+N」）+「N 篇资料」文案 + 右侧 chevron，整条可点击回传全部 annotation；
  本库原来是逐条列出的按钮列表（一个 annotation 一个 li）。

  复用 AvatarGroup / Avatar（Semi 也复用这两个）。
-->
<script lang="ts">
  import { IconChevronRight } from '@chenzy-design/icons';
  import { Avatar, AvatarGroup } from '../avatar/index.js';
  import { useLocale } from '../locale-provider/index.js';

  export interface AnnotationItem {
    logo?: string;
    title?: string;
    url?: string;
    [key: string]: unknown;
  }

  interface Props {
    annotation: AnnotationItem[];
    /** 自定义描述文案；缺省用「N + locale.annotationText」（对齐 Semi）。 */
    description?: string | undefined;
    /** 头像组最多显示几个，超出折叠成「+N」（对齐 Semi maxCount）。 */
    maxCount?: number;
    onClick?: ((annotation: AnnotationItem[]) => void) | undefined;
  }

  let { annotation, description, maxCount = 3, onClick }: Props = $props();

  const loc = useLocale();

  // 对齐 Semi：`${annotation.length} ${locale.annotationText}`。
  const text = $derived(
    description ?? `${annotation.length} ${loc().t('AIChatDialogue.annotationText')}`,
  );
</script>

<!-- Semi 是 div + role=button + 手写 Enter/Space；本库用原生 button，语义等价。 -->
<button
  type="button"
  class="cd-ai-chat-dialogue-annotation-wrapper"
  onclick={() => onClick?.(annotation)}
>
  <span class="cd-ai-chat-dialogue-annotation-content">
    <AvatarGroup {maxCount} size="extra-extra-small" overlapFrom="end" {renderMore}>
      {#each annotation as item, index (index)}
        {#if item.logo}
          <Avatar
            class="cd-ai-chat-dialogue-annotation-content-logo"
            src={item.logo}
            alt={item.title ?? ''}
          />
        {/if}
      {/each}
    </AvatarGroup>
    <span class="cd-ai-chat-dialogue-annotation-content-description">{text}</span>
    <span class="cd-ai-chat-dialogue-annotation-content-icon"><IconChevronRight /></span>
  </span>
</button>

<!-- 溢出「+N」头像：Semi 用 renderMore 给它单独挂 -content-logo-renderMore 类
     （annotation.tsx:34-38）。本库原来直接吃 AvatarGroup 的默认溢出渲染，没有这个类。 -->
{#snippet renderMore({ restNumber }: { restNumber: number })}
  <Avatar
    class="cd-ai-chat-dialogue-annotation-content-logo-renderMore"
    size="extra-extra-small"
    alt="more"
  >
    {`+${restNumber}`}
  </Avatar>
{/snippet}

<style>
  /* 逐条对齐 Semi aiChatDialogue.scss &-annotation。 */
  .cd-ai-chat-dialogue-annotation-wrapper {
    width: var(--cd-ai-chat-dialogue-annotation);
    margin-top: var(--cd-ai-chat-dialogue-annotation-wrapper-margin-top);
    flex: 1 1 auto;
    border: var(--cd-width-ai-chat-dialogue-annotation-border) solid
      var(--cd-color-ai-chat-dialogue-annotation-border);
    border-radius: var(--cd-ai-chat-dialogue-annotation-wrapper);
    padding: var(--cd-ai-chat-dialogue-annotation-wrapper-padding-y)
      var(--cd-ai-chat-dialogue-annotation-wrapper-padding-x);
    background-color: var(--cd-ai-chat-dialogue-annotation-bg-hover);

    /* button 复位（Semi 那边是 div + role=button）。 */
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }

  .cd-ai-chat-dialogue-annotation-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    column-gap: var(--cd-ai-chat-dialogue-annotation-content-column-gap);
    font-size: var(--cd-ai-chat-dialogue-annotation-content-font-size);
    color: var(--cd-ai-chat-dialogue-annotation-text);
    cursor: pointer;
  }

  /* logo 类名挂在子组件 Avatar 根节点上，必须 :global。 */
  .cd-ai-chat-dialogue-annotation-content :global(.cd-ai-chat-dialogue-annotation-content-logo) {
    width: var(--cd-width-ai-chat-dialogue-annotation-logo);
    height: var(--cd-height-ai-chat-dialogue-annotation-logo);
    display: flex;
  }

  .cd-ai-chat-dialogue-annotation-content-description {
    flex: 1 1 auto;
  }
</style>
