<!--
  DialogueReference — 消息的引用附件列表（对齐 Semi widgets/contentItem/reference.tsx）。

  拆成独立文件是为了跟 Semi 的文件结构一致：Semi 把它放在 widgets/contentItem/ 下，
  本库原来内联在 DialogueBox.svelte 里当 snippet（那个文件已 622 行）。

  DOM 逐层对齐 Semi reference.tsx:66-79：
    .cd-ai-chat-dialogue-references（复数 = 容器）
      > .cd-ai-chat-dialogue-reference（单数 = 每一项）
        > IconSendMsgStroked + .-reference-content（包裹层）
            > .-reference-icon-{type} 或 .-reference-img + .-reference-name
  注意子元素挂的是**单数**前缀（Semi 有 PREFIX_REFERENCES / PREFIX_REFERENCE 两个常量）。

  显示门禁对齐 Semi dialogueContent.tsx:411：`references.length > 0 && !editing`，
  与角色/showReference 无关——那两个条件是「消息文本悬停引用图标」（icon-reference）的
  显示条件，是 Semi 另一套独立机制，本库以前混在一起了。

  Semi reference.tsx 里 `<div className={referencePrefixCls}>` 是纯静态展示，没有
  onClick；本库原来给它接了 onReferenceClick 自造出可点击交互，已按 Semi 去掉。
  onReferenceClick 这个真实存在的 Semi 回调用在文本悬停引用图标 / 文件卡引用入口
  （ContentItemRenderer / DialogueFile），不属于这个列表。
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
  }

  let { references = [] }: Props = $props();

  const loc = useLocale();

  /** 取文件名扩展名（对齐 Semi `name.split('.').pop()`）。 */
  function refExtension(name: string | undefined): string | undefined {
    return name ? name.split('.').pop() : undefined;
  }
</script>

{#if references.length > 0}
  <!-- Semi reference.tsx:65-80 是 <div className={referencesPrefixCls}> 直接包
       <div className={referencePrefixCls}>（无 ul/li 中间层）。本库原来多包了
       一层 <li>，导致真正的 flex item 是 li 而非 .cd-ai-chat-dialogue-reference，
       margin-left:auto 挂错了层级，真机验证到该规则完全不生效（5 条引用全部
       computed marginLeft:0px 贴左排列，而非 Semi 的靠右挤）。改回 Semi 原始
       两层 div 结构。 -->
  <div class="cd-ai-chat-dialogue-references" role="list" aria-label={loc().t('AIChatDialogue.references')}>
    {#each references as ref, i (ref.id ?? i)}
      <!-- 按扩展名分派类型图标 + -icon-{type} 修饰类（对齐 Semi renderReferenceIcon）。
           Semi 只对 word/pdf/excel/code/video 五类出图标，其余（含图片）不出。 -->
      {@const refType = dialogueFileIconType(refExtension(ref.name))}
      <div
        role="listitem"
        class="cd-ai-chat-dialogue-reference"
        class:cd-ai-chat-dialogue-reference-text-only={!!ref.content && !ref.name}
        title={ref.name ?? ref.content ?? ''}
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
      </div>
    {/each}
  </div>
{/if}

<style>
  /* 逐条对齐 Semi aiChatDialogue.scss &-references（本库原来用的是通用 spacing/字号 token，
     未接上这一批专属 token；且 &-reference 原来还带 cursor:pointer + hover 态，
     那是自造的可点击交互残留，Semi 该元素是纯静态展示，已一并去掉）。 */
  .cd-ai-chat-dialogue-references {
    list-style: none;
    margin: var(--cd-ai-chat-dialogue-references-margin-top) 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    font-size: var(--cd-ai-chat-dialogue-references-font-size);
    line-height: var(--cd-ai-chat-dialogue-references-line-height);
    color: var(--cd-ai-chat-dialogue-reference-text);
    column-gap: var(--cd-ai-chat-dialogue-references-column-gap);
    row-gap: var(--cd-ai-chat-dialogue-references-row-gap);
  }

  .cd-ai-chat-dialogue-reference {
    display: flex;
    align-items: center;
    padding: var(--cd-ai-chat-dialogue-reference-padding-y)
      var(--cd-ai-chat-dialogue-reference-padding-x);
    box-sizing: border-box;
    width: fit-content;
    max-width: var(--cd-ai-chat-dialogue-reference-max);
    flex-shrink: 1;
    column-gap: var(--cd-ai-chat-dialogue-reference-column-gap);
    background-color: var(--cd-ai-chat-dialogue-reference-bg);
    border-radius: var(--cd-ai-chat-dialogue-reference);
    /* Semi：每条引用条靠右挤（aiChatDialogue.scss:600）。 */
    margin-left: auto;
  }

  .cd-ai-chat-dialogue-reference-text-only {
    max-width: 320px;
  }

  /* 逐条对齐 Semi &-reference-icon（本库原来颜色用 --cd-color-primary，
     Semi 实际是图标文字色 $color-aiChatDialogue_icon-text；且漏了圆角）。 */
  .cd-ai-chat-dialogue-reference-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--cd-ai-chat-dialogue-reference-icon-margin-right);
    color: var(--cd-ai-chat-dialogue-icon-text);
    width: var(--cd-width-ai-chat-dialogue-reference-icon);
    height: var(--cd-height-ai-chat-dialogue-reference-icon);
    border-radius: var(--cd-radius-ai-chat-dialogue-reference-icon);
  }

  .cd-ai-chat-dialogue-reference-icon-word {
    background-color: var(--cd-ai-chat-dialogue-word-icon-bg);
  }
  .cd-ai-chat-dialogue-reference-icon-pdf {
    background-color: var(--cd-ai-chat-dialogue-pdf-icon-bg);
  }
  .cd-ai-chat-dialogue-reference-icon-excel {
    background-color: var(--cd-ai-chat-dialogue-excel-icon-bg);
  }
  .cd-ai-chat-dialogue-reference-icon-video {
    background-color: var(--cd-ai-chat-dialogue-video-icon-bg);
  }
  .cd-ai-chat-dialogue-reference-icon-code {
    background-color: var(--cd-ai-chat-dialogue-code-icon-bg);
  }

  /* 图片类引用的缩略图（对齐 Semi &-reference-img）。 */
  .cd-ai-chat-dialogue-reference-img {
    flex-shrink: 0;
    margin-right: var(--cd-ai-chat-dialogue-reference-img-margin-right);
  }

  .cd-ai-chat-dialogue-reference-name {
    display: inline-block;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
    max-width: var(--cd-ai-chat-dialogue-reference-name-max);
  }

  /* 逐条对齐 Semi &-reference-content：单行省略 + flex-grow（本库原来是
     -webkit-line-clamp:2 多行截断，自造，Semi 是单行 nowrap）。 */
  .cd-ai-chat-dialogue-reference-content {
    display: flex;
    align-items: center;
    flex-grow: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
