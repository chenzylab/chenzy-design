<!--
  DialogueReference — user 消息的引用区（对齐 Semi widgets/contentItem/reference.tsx）。

  拆成独立文件是为了跟 Semi 的文件结构一致：Semi 把它放在 widgets/contentItem/ 下，
  本库原来内联在 DialogueBox.svelte 里当 snippet（那个文件已 622 行）。

  DOM 逐层对齐 Semi reference.tsx:66-79：
    .cd-ai-chat-dialogue-references（复数 = 容器）
      > .cd-ai-chat-dialogue-reference（单数 = 每一项）
        > IconSendMsgStroked + .-reference-content（包裹层）
            > .-reference-icon-{type} 或 .-reference-img + .-reference-name
  注意子元素挂的是**单数**前缀（Semi 有 PREFIX_REFERENCES / PREFIX_REFERENCE 两个常量）。
-->
<script lang="ts">
  import { dialogueFileIconType, type AIDialogueReference } from '@chenzy-design/core';
  import {
    IconCode,
    IconExcel,
    IconPdf,
    IconSendMsgStroked,
    IconVideo,
    IconWord,
  } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    /** 引用项列表（空数组则整块不渲染）。 */
    references?: AIDialogueReference[];
    /** 点击某条引用（对齐 Semi onReferenceClick）。 */
    onReferenceClick?: ((item: AIDialogueReference) => void) | undefined;
  }

  let { references = [], onReferenceClick }: Props = $props();

  const loc = useLocale();

  /** 取文件名扩展名（对齐 Semi `name.split('.').pop()`）。 */
  function refExtension(name: string | undefined): string | undefined {
    return name ? name.split('.').pop() : undefined;
  }
</script>

{#if references.length > 0}
  <ul class="cd-ai-chat-dialogue-references" aria-label={loc().t('AIChatDialogue.references')}>
    {#each references as ref, i (ref.id ?? i)}
      <!-- 按扩展名分派类型图标 + -icon-{type} 修饰类（对齐 Semi renderReferenceIcon）。
           Semi 只对 word/pdf/excel/code/video 五类出图标，其余（含图片）不出。 -->
      {@const refType = dialogueFileIconType(refExtension(ref.name))}
      <li>
        <button
          type="button"
          class="cd-ai-chat-dialogue-reference"
          class:cd-ai-chat-dialogue-reference-text-only={!!ref.content && !ref.name}
          title={ref.name ?? ref.content ?? ''}
          onclick={() => onReferenceClick?.(ref)}
        >
          <IconSendMsgStroked />
          <span class="cd-ai-chat-dialogue-reference-content">
            {#if ref.name && refType !== 'default' && refType !== 'image'}
              <span
                class="cd-ai-chat-dialogue-reference-icon cd-ai-chat-dialogue-reference-icon-{refType}"
                aria-hidden="true"
              >
                {#if refType === 'word'}<IconWord size="small" />
                {:else if refType === 'pdf'}<IconPdf size="small" />
                {:else if refType === 'excel'}<IconExcel size="small" />
                {:else if refType === 'code'}<IconCode size="small" />
                {:else}<IconVideo size="small" />{/if}
              </span>
            {/if}
            <!-- 图片类引用直接出缩略图（对齐 Semi renderReferenceImage：16×16 的 Image）。 -->
            {#if ref.url && refType === 'image'}
              <img
                class="cd-ai-chat-dialogue-reference-img"
                src={ref.url}
                alt=""
                width="16"
                height="16"
              />
            {/if}
            <span class="cd-ai-chat-dialogue-reference-name">
              {ref.name || ref.content}
            </span>
          </span>
        </button>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .cd-ai-chat-dialogue-references {
    list-style: none;
    margin: var(--cd-spacing-extra-tight) 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--cd-spacing-extra-tight);
  }

  .cd-ai-chat-dialogue-reference {
    appearance: none;
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-extra-tight);
    max-width: 100%;
    padding: var(--cd-spacing-extra-tight) var(--cd-spacing-tight);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-1);
    font-size: var(--cd-font-size-small);
    cursor: pointer;
    text-align: left;
  }

  .cd-ai-chat-dialogue-reference:hover {
    background: var(--cd-color-fill-1);
    border-color: var(--cd-color-primary);
  }

  .cd-ai-chat-dialogue-reference-text-only {
    max-width: 320px;
  }

  /* 逐条对齐 Semi &-reference-icon：16×16 + 右外边距 4px（本库原来只有色和 flex-shrink）。 */
  .cd-ai-chat-dialogue-reference-icon {
    color: var(--cd-color-primary);
    flex-shrink: 0;
    width: var(--cd-width-ai-chat-dialogue-reference-icon);
    height: var(--cd-height-ai-chat-dialogue-reference-icon);
    margin-right: var(--cd-ai-chat-dialogue-reference-icon-margin-right);
  }

  /* 图片类引用的缩略图（对齐 Semi &-reference-img）。 */
  .cd-ai-chat-dialogue-reference-img {
    flex-shrink: 0;
    margin-right: var(--cd-ai-chat-dialogue-reference-img-margin-right);
  }

  .cd-ai-chat-dialogue-reference-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cd-ai-chat-dialogue-reference-content {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
