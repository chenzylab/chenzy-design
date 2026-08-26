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
    /** 对齐 Semi AnnotationItemProps.detail（annotation.tsx:14）：契约里声明了但
     * Semi 自己也没在渲染逻辑里用到（跟 title 一样是预留字段），仍需显式声明而非
     * 靠索引签名兜底——索引签名会掩盖"哪些字段是真实契约"这件事。 */
    detail?: string;
    [key: string]: unknown;
  }

  interface Props {
    annotation: AnnotationItem[];
    /** 自定义描述文案；缺省用「N + locale.annotationText」（对齐 Semi）。 */
    description?: string | undefined;
    /** 头像组最多显示几个，超出折叠成「+N」（对齐 Semi maxCount）。 */
    maxCount?: number;
    /** 对齐 Semi onClick?: (e, item) => void（annotation.tsx:20/31）：真实签名带原生
     * 点击事件（第一参数），本库原来只回传 annotation 数组，消费方拿不到事件对象，
     * 无法 e.stopPropagation() 阻止冒泡（用户 demo 场景：气泡内嵌套点击时避免误触发
     * 外层其他点击处理）。 */
    onClick?: ((e: MouseEvent, annotation: AnnotationItem[]) => void) | undefined;
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
  onclick={(e) => onClick?.(e, annotation)}
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
{#snippet renderMore(restNumber: number)}
  <Avatar
    class="cd-ai-chat-dialogue-annotation-content-logo-renderMore"
    size="extra-extra-small"
    alt="more"
  >
    {`+${restNumber}`}
  </Avatar>
{/snippet}

<style>
  /* 逐条对齐 Semi aiChatDialogue.scss &-annotation。
     宽度：Semi $width-aiChatDialogue_annotation:100% 挂在外层 &-annotation 容器上
     （让父级占满可用宽度），真正的可点击气泡 &-annotation-wrapper 是 width:fit-content
     （紧贴内容，不撑满）。本库原来把这个 100% token 错误地用到了 wrapper 上，导致
     气泡被撑满整行——真机对照 Semi 截图，气泡应该只有「头像组 + N篇资料 + >」这几个
     字符的宽度，紧凑贴合内容。
     背景色：Semi 是 &:hover { background-color: ... }，只在 hover 时才有背景色；
     本库原来把这个 hover 态背景色当默认背景色一直显示，是自造超集。 */
  .cd-ai-chat-dialogue-annotation-wrapper {
    width: fit-content;
    margin-top: var(--cd-ai-chat-dialogue-annotation-wrapper-margin-top);
    flex: 1 1 auto;
    border: var(--cd-width-ai-chat-dialogue-annotation-border) solid
      var(--cd-color-ai-chat-dialogue-annotation-border);
    border-radius: var(--cd-ai-chat-dialogue-annotation-wrapper);
    padding: var(--cd-ai-chat-dialogue-annotation-wrapper-padding-y)
      var(--cd-ai-chat-dialogue-annotation-wrapper-padding-x);

    /* button 复位（Semi 那边是 div + role=button）：浏览器 UA 样式表给 <button> 元素
       默认背景色（多数浏览器渲染成浅灰 buttonface），本库原来漏了这条复位，真机对照
       Semi 截图默认态背景应为纯白（&-wrapper 只在 &:hover 定义背景色，默认态无
       background-color 声明，即继承透明/父级白底），复位后 hover 态背景色才是唯一
       生效来源。 */
    background: none;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }

  .cd-ai-chat-dialogue-annotation-wrapper:hover {
    background-color: var(--cd-ai-chat-dialogue-annotation-bg-hover);
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

  /* 对齐 Semi aiChatDialogue.scss &-content 内嵌套的 `.semi-avatar-group { display: flex }`：
     Avatar 组件通用默认是 inline-block（avatar.scss），但 annotation 场景下 Semi 显式覆盖
     成 flex——本库原来完全没有这条覆盖规则，AvatarGroup 保持 inline-block 默认值，作为
     这里 flex 容器（annotation-content）的直接子项时被浏览器 blockification 强制改写
     显示类型，又没有 flex-shrink:0 保护，被压缩到只剩一个头像的宽度，第二个头像挤到
     下一行——真机 getComputedStyle 实测复现（宽度锁定 16px，两头像纵向堆叠），对照
     Semi 官网 semi.design/zh-CN/ai/aiChatDialogue 实测该处 avatar-group 计算 display
     确实是 flex（宽 28px，两头像正确水平重叠），证实是这条 scss 覆盖规则的缺失，
     不是通用 Avatar/AvatarGroup 组件本身的问题。须 :global —— AvatarGroup 是子组件。 */
  .cd-ai-chat-dialogue-annotation-content :global(.cd-avatar-group) {
    display: flex;
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

  /* 对齐 Semi &-content-icon { @include all-center }：本库原来完全没有这条规则，
     箭头图标在行内流里贴顶对齐而非垂直居中——真机对照 Semi 截图，chevron 应与
     头像组、文案在同一水平线上。all-center = flex + justify/align-items:center
     （semi-theme-default/scss/mixin.scss）。 */
  .cd-ai-chat-dialogue-annotation-content-icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
