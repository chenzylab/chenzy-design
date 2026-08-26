<!--
  DialogueBox — AIChatDialogue 单条消息（对齐 Semi aiChatDialogue 会话框）。
  头像 / 标题 / 内容（ContentItem 分块，走 ContentItemRenderer）/ 操作区 / status。
  content 归一：string → 单文本块；ContentItem[] → 逐块渲染。
  选择模式下前置 checkbox。全 token，类名前缀 cd-。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    normalizeDialogueContent,
    dialogueMessageToInput,
    type AIDialogueMessage,
    type AIDialogueMetadata,
    type AIDialogueReference,
    type AIChatInputMessageContent,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  // 复用现有组件：Semi dialogueAvatar.tsx 用 Avatar，本库同样复用。
  import { IconAlertCircle } from '@chenzy-design/icons';
  import { Checkbox } from '../checkbox/index.js';
  import ContentItemRenderer from './ContentItemRenderer.svelte';
  import DialogueAction from './DialogueAction.svelte';
  import DialogueAvatar from './DialogueAvatar.svelte';
  import DialogueReference from './DialogueReference.svelte';
  import DialogueTitle from './DialogueTitle.svelte';
  import type { DialogueRenderConfig } from './render-config.js';
  import type { DialogueContentItemRendererMap, DefaultContentRenderer } from './content-item-render-map.js';

  interface Props {
    /** 是否转义用户消息中的 HTML 标签（对齐 Semi escapeHtml）。 */
    escapeHtml?: boolean;
    /** 是否禁用文件点击（对齐 Semi disabledFileItemClick）。 */
    disabledFileItemClick?: boolean;
    /** 分享消息回调（对齐 Semi onMessageShare）。 */
    onMessageShare?: ((message: unknown) => void) | undefined;
    /** annotation 点击回调（对齐 Semi onAnnotationClick）。 */
    onAnnotationClick?: ((annotation: unknown) => void) | undefined;
    message: AIDialogueMessage;
    /** 解析后的角色元数据（名称/头像/色）。 */
    role?: AIDialogueMetadata | undefined;
    /** 布局。 */
    align?: 'leftRight' | 'leftAlign';
    /** 气泡模式。 */
    mode?: 'bubble' | 'noBubble' | 'userBubble';
    /** 选择模式。 */
    selecting?: boolean;
    /** 当前是否被选中。 */
    selected?: boolean;
    /** 与上一条同角色的连续发言：隐藏头像占位、不渲染标题（对齐 Semi continueSend）。 */
    continueSend?: boolean;
    /** 透传 MarkdownRender props。 */
    markdownRenderProps?: Record<string, unknown> | undefined;
    /** ContentItem 按类型覆盖渲染。 */
    renderMap?: DialogueContentItemRendererMap | undefined;
    /** 展示重置操作（全局开关，对齐 Semi AIChatDialogue.showReset）。 */
    showReset?: boolean;
    /**
     * 该消息是否为列表最后一条（对齐 Semi index.tsx:330 `index === chats.length - 1`，
     * 由 AIChatDialogue.svelte 逐条计算传入）。「重新生成」按钮只在最后一条 assistant
     * 消息上出现，与 showReset 独立——showReset 是"要不要启用这个功能"的全局开关，
     * isLastChat 才是"这条消息该不该显示"的逐条判断，两者都满足才真正显示。
     */
    isLastChat?: boolean;
    onSelectToggle?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageCopy?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageDelete?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageReset?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageGoodFeedback?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageBadFeedback?: ((message: AIDialogueMessage) => void) | undefined;
    onFileClick?: ((file: unknown) => void) | undefined;
    onImageClick?: ((image: unknown) => void) | undefined;
    /**
     * 消息编辑渲染（对齐 Semi messageEditRender）：message.editing=true 且 user 消息时，
     * 用它替代正常内容渲染。参数为该消息转成的 MessageContent（messageToChatInput），
     * 消费方通常在里面放 AIChatInput 编辑器。
     */
    messageEditRender?: Snippet<[AIChatInputMessageContent]> | undefined;
    /** 点击编辑操作回调（对齐 Semi onMessageEdit）。 */
    onMessageEdit?: ((message: AIDialogueMessage) => void) | undefined;
    /** 是否展示引用区（对齐 Semi showReference；仅 user 消息生效）。 */
    showReference?: boolean;
    /** 引用项点击回调（对齐 Semi onReferenceClick）。 */
    onReferenceClick?: ((item: AIDialogueReference) => void) | undefined;
    /** 自定义各区块渲染（对齐 Semi dialogueRenderConfig）。 */
    dialogueRenderConfig?: DialogueRenderConfig | undefined;
    /** steps 块 action 图标渲染（透传给 ContentItemRenderer/DialogueStep）。 */
    renderActionIcon?: Snippet<[{ icon: unknown }]> | undefined;
  }

  let {
    message,
    role,
    align = 'leftRight',
    mode = 'bubble',
    selecting = false,
    selected = false,
    continueSend = false,
    markdownRenderProps,
    renderMap,
    showReset = true,
    isLastChat = false,
    onSelectToggle,
    onMessageCopy,
    onMessageDelete,
    onMessageReset,
    onMessageGoodFeedback,
    onMessageBadFeedback,
    onFileClick,
    onImageClick,
    messageEditRender,
    onMessageEdit,
    showReference = false,
    onReferenceClick,
    dialogueRenderConfig,
    escapeHtml = true,
    disabledFileItemClick = false,
    onMessageShare,
    onAnnotationClick,
    renderActionIcon,
  }: Props = $props();

  const loc = useLocale();

  const isUser = $derived(message.role === 'user');
  // 对齐 Semi：只有 user 消息且 align=leftRight 时才右对齐（container-right）。
  const isRightAlign = $derived(isUser && align === 'leftRight');
  // 编辑态：message.editing 受控 + 仅 user 消息（对齐 Semi dialogueContent.tsx `if (editing)
  // { return messageEditRender?.(...) }`——editing 单独驱动分支切换，是否传 messageEditRender
  // 只影响分支内渲染什么，未传时 Semi 也会进入编辑分支、只是内容替换成空白。本库原来把
  // `!!messageEditRender` 一起纳入 isEditing 判定，导致没传时连分支切换都不会发生，
  // 编辑按钮点了跟没点一样——真机验证到用户反馈「一点反应都没有」，比 Semi「至少变空白」
  // 的行为还要弱一层，是本库自己多加的门禁，不是对齐 Semi 应有的样子。）
  const isEditing = $derived(!!message.editing && message.role === 'user');
  // 引用区：有 references 且非编辑态即展示，与角色/showReference 无关（对齐 Semi
  // dialogueContent.tsx:411 `references && references.length > 0 && !editing`）。
  // 本库原来多了 showReference && isUser 双重门禁——那是「消息文本悬停引用图标」
  // （icon-reference）的显示条件，跟这里的「附件引用列表」是 Semi 两套独立机制，混用了。
  const references = $derived<AIDialogueReference[]>(
    !isEditing && Array.isArray(message.references) ? message.references : [],
  );
  // 编辑态载荷：把 dialogue 消息抽取成 MessageContent（inputContents 文本段），喂给编辑器载入。
  const editPayload = $derived<AIChatInputMessageContent>(
    isEditing ? dialogueMessageToInput(message) : { inputContents: [] },
  );
  // 对齐 Semi dialogueContent.tsx:320 `[STATUS.QUEUED, STATUS.IN_PROGRESS,
  // STATUS.INCOMPLETE].includes(status)`：本库原来漏了 incomplete，导致这个状态的消息
  // 既不算 loading 也不算 error（isError 只判 failed/cancelled），会掉进正常内容分支渲染。
  const isLoading = $derived(
    message.status === 'in_progress' ||
      message.status === 'queued' ||
      message.status === 'incomplete',
  );
  // 失败图标（-content-failed）与气泡错误修饰类（-content-error）判断条件不同：Semi
  // dialogueContent.tsx:390 图标是 `status === FAILED || status === CANCELLED`，
  // 但同文件 167 行气泡类只判 `status === FAILED`（不含 cancelled）——两处故意不同，
  // 不能共用一个变量。本库原来只有一个 isError 驱动两处，导致 cancelled 状态下气泡
  // 也会误挂 -content-error（该类当前虽无视觉样式，但判断条件本身仍须对齐契约）。
  const isError = $derived(message.status === 'failed' || message.status === 'cancelled');
  const isFailedOnly = $derived(message.status === 'failed');
  const showBubble = $derived(mode === 'bubble' || (mode === 'userBubble' && isUser));
  // 对齐 Semi contentCls：两种气泡态分别打自己的类，都不满足才是 -no-bubble。
  const isBubbleMode = $derived(mode === 'bubble');
  const isUserBubbleMode = $derived(mode === 'userBubble' && isUser);
  // 对齐 Semi dialogueContent.tsx：外层 PREFIX_CONTENT 容器只有基础类 + editing 类
  // （`cls(PREFIX_CONTENT, { [PREFIX_CONTENT-editing]: editing })`），不带气泡/角色/
  // 错误态修饰类——那些是 wrapCls，真机验证到（semi.design 官网 DOM）挂在每一个文本块
  // （output_text/input_text/refusal/字符串 content）自己身上，不是外层容器：一条消息若
  // 有 reasoning + 两段文本 + 工具调用，会看到两个独立的 .content.content-bubble，
  // 中间的 reasoning/工具调用块完全没有气泡背景。本库原来把气泡类整体挂在外层容器上，
  // 导致所有块类型共享一个大气泡外壳，跟 Semi 视觉结构不同。
  const contentOuterCls = $derived(
    ['cd-ai-chat-dialogue-content', isEditing && 'cd-ai-chat-dialogue-content-editing']
      .filter(Boolean)
      .join(' '),
  );
  // 文本块级气泡类（对齐 Semi wrapCls，见上方注释）：随 customRenderFunc 提供与否传给
  // 消费方决定要不要套回去（renderDialogueContent 分支），也传给 ContentItemRenderer
  // 给每个文本块各自包一层。不含 editing——编辑态整条走 messageEditRender，不会渲染到
  // 文本块这一层。
  const contentWrapCls = $derived(
    [
      'cd-ai-chat-dialogue-content',
      isBubbleMode && 'cd-ai-chat-dialogue-content-bubble',
      isUserBubbleMode && 'cd-ai-chat-dialogue-content-userBubble',
      !isBubbleMode && !isUserBubbleMode && 'cd-ai-chat-dialogue-content-no-bubble',
      isUser && 'cd-ai-chat-dialogue-content-user',
      isFailedOnly && (isBubbleMode || isUserBubbleMode) && 'cd-ai-chat-dialogue-content-error',
    ]
      .filter(Boolean)
      .join(' '),
  );
  const items = $derived(normalizeDialogueContent(message.content));
  // 对齐 Semi dialogueContent.tsx loadingNode 的 isOutputExist：判原始 message.content
  // 长度 + message.output_text，不是归一化后的 items.length——归一化会把 content:''
  // 包成一个长度为 1 的空文本块，用 items.length===0 判断会导致 resetMessage 后的
  // in_progress 空消息走进正常内容分支（渲染一个空 MarkdownRender），而不是 loading 态。
  const hasOutput = $derived(
    (typeof message.content === 'string' && message.content.length > 0) ||
      (Array.isArray(message.content) && message.content.length > 0) ||
      !!message.output_text,
  );

  // 对齐 Semi dialogueContent.tsx:345 `textContent = typeof content === 'string' ? content :
  // message.output_text`：content 是字符串直接用；content 是数组（哪怕是完整的多块结构）
  // 也会退回读 output_text——只要 output_text 有值，default 渲染器就整条接管，不再逐块
  // 渲染。命中 renderMap.default 且 textContent 有值时才生效（对齐 `if (textContent) {...}`）。
  const defaultContentText = $derived(
    typeof message.content === 'string' ? message.content : (message.output_text ?? ''),
  );
  const defaultRenderer = $derived.by<DefaultContentRenderer | undefined>(() => {
    const entry = renderMap?.default;
    return typeof entry === 'function' && defaultContentText ? (entry as DefaultContentRenderer) : undefined;
  });

</script>

<!-- 默认头像节点：拆到 DialogueAvatar.svelte（同 Semi widgets/dialogueAvatar.tsx）。 -->
{#snippet defaultAvatar()}
  <DialogueAvatar {role} {continueSend} />
{/snippet}

<!-- 默认标题节点：拆到 DialogueTitle.svelte（同 Semi widgets/dialogueTitle.tsx）。 -->
{#snippet defaultTitle()}
  <DialogueTitle {message} {role} />
{/snippet}

<!-- 内容区的纯内容（不含外层容器/引用区）：编辑态 / loading / error / 内容块。
     拆出来给 defaultContent 复用，也是 renderDialogueContent 的 defaultContent 参数本体
     （对齐 Semi dialogueContent.tsx `defaultContent: node`——node 只是内容节点，不含外层
     PREFIX_CONTENT 容器，容器由调用方按 customRenderFunc 是否提供决定要不要渲染）。 -->
{#snippet contentInner()}
  {#if isEditing}
    <!-- 编辑态：用 messageEditRender 替代内容（对齐 Semi）。未传时渲染空——同 Semi
         `messageEditRender?.(...)` 未传返回 undefined，编辑态原内容一样会消失。 -->
    {#if messageEditRender}{@render messageEditRender(editPayload)}{/if}
  {:else if isLoading && !hasOutput}
    <!-- 三个弹跳圆点 + 文案（对齐 Semi dialogueContent.tsx 的 loadingNode）。
         本库原来只有一行裸文字——这几个圆点的 token 早就建好了，没人消费。 -->
    <span class="cd-ai-chat-dialogue-content-loading">
      <span class="cd-ai-chat-dialogue-content-loading-item"></span>
      <span class="cd-ai-chat-dialogue-content-loading-item"></span>
      <span class="cd-ai-chat-dialogue-content-loading-item"></span>
      <span class="cd-ai-chat-dialogue-content-loading-text">
        {loc().t('AIChatDialogue.loading')}
      </span>
    </span>
  {:else if defaultRenderer}
    <!-- default 键：整条消息改用这个渲染器接管，不再逐块渲染（对齐 Semi
         dialogueContent.tsx:347-350，见上方 defaultContentText/defaultRenderer 定义）。 -->
    <div class="cd-ai-chat-dialogue-content-custom-renderer">
      {@render defaultRenderer(defaultContentText, message)}
    </div>
  {:else}
    <!-- Semi 的内容分两层：-content-wrapper 里放「失败图标 + -content-inner」。
         失败时是一个 IconAlertCircle 图标（本库原来渲染的是一行 locale 错误文案，
         Semi 根本没有这个文案节点）。 -->
    <div class="cd-ai-chat-dialogue-content-wrapper">
      {#if isError}
        <div class="cd-ai-chat-dialogue-content-failed">
          <IconAlertCircle />
        </div>
      {/if}
      <div class="cd-ai-chat-dialogue-content-inner">
        {#each items as item, i (i)}
          <ContentItemRenderer
            {item}
            {message}
            {markdownRenderProps}
            {renderMap}
            {onFileClick}
            {onImageClick}
            {escapeHtml}
            {isUser}
            {onAnnotationClick}
            {showReference}
            {disabledFileItemClick}
            {onReferenceClick}
            {renderActionIcon}
            textWrapCls={contentWrapCls}
          />
        {/each}
      </div>
    </div>
  {/if}
{/snippet}

<!-- 默认内容节点（外层容器：引用区 + 内容）：无 renderDialogueContent 覆盖时使用
     （对齐 Semi customRenderFunc 未提供时的 else 分支 dialogueContent.tsx:408-414：
     `<div className={PREFIX_CONTENT}>{references && <ReferenceWidget/>}{node}{loadingNode}</div>`
     ——引用区在 PREFIX_CONTENT 容器内部、正文之前，不是容器外部、正文之后。本库原来
     顺序颠倒（正文在前引用在后）且引用区被挂在容器外——真机对照 Semi 截图，引用条
     应显示在消息气泡上方。 -->
{#snippet defaultContent()}
  <div class={contentOuterCls} aria-busy={isLoading}>
    <!-- 引用区拆到 DialogueReference.svelte（同 Semi widgets/contentItem/reference.tsx）。
         Semi 该元素纯静态展示，不接 onClick——onReferenceClick 只用于消息文本悬停引用图标
         和文件卡引用入口（走 ContentItemRenderer），不传给这里。
         Semi 的 ReferenceWidget 只在 customRenderFunc 未提供的 else 分支里渲染，与
         正文同级，故挂在这个 snippet 里而非 renderDialogueContent 的 defaultContent
         参数——自定义渲染时不会带出引用区。 -->
    <DialogueReference {references} />
    {@render contentInner()}
  </div>
{/snippet}

<!-- 默认操作栏节点：拆到 DialogueAction.svelte（同 Semi widgets/dialogueAction.tsx）。
     customRender 透传 dialogueRenderConfig.renderDialogueAction：由 DialogueAction 内部
     决定走自定义（连同 defaultActionsObj 单独寻址的各按钮 snippet）还是默认布局
     （对齐 Semi actionNode() 把 customRenderFunc 递给 DialogueAction 的结构）。
     无条件渲染（对齐 Semi Dialogue.tsx render() 里 `{this.actionNode()}` 与 contentNode()
     平级、不带 isLoading/selecting/editing 任何门禁——是否显示完全交给 DialogueAction
     内部的 showAction/hover 判定）。本库原来多包了 `!isLoading && !selecting && !isEditing`
     一层，导致编辑态下操作栏整个不挂载，hover 消息整行也不会出现操作区。 -->
{#snippet defaultAction()}
  <DialogueAction
    {message}
    isLastChat={showReset && isLastChat}
    onMessageCopy={onMessageCopy}
    onMessageDelete={onMessageDelete}
    onMessageReset={onMessageReset}
    {onMessageEdit}
    onMessageShare={onMessageShare}
    onMessageGoodFeedback={onMessageGoodFeedback}
    onMessageBadFeedback={onMessageBadFeedback}
    customRender={dialogueRenderConfig?.renderDialogueAction}
  />
{/snippet}

<!-- 结构逐层对齐 Semi Dialogue.tsx：
     wrapper[-selected][-continue-send] > checkbox + container[-right] > avatar + inner。
     右对齐由 container-right 正向标记（Semi 只在 user 且 align=leftRight 时加），
     本库原来是 wrapper-leftAlign 反向标记 + 无 container 层，语义相反且少一层。 -->
<div
  class="cd-ai-chat-dialogue-wrapper"
  class:cd-ai-chat-dialogue-wrapper-selected={selecting && selected}
  class:cd-ai-chat-dialogue-wrapper-continue-send={continueSend}
>
  {#if selecting}
    <div class="cd-ai-chat-dialogue-checkbox">
      <Checkbox
        checked={selected}
        aria-label={loc().t('AIChatDialogue.selectMessage')}
        onChange={() => onSelectToggle?.(message)}
      />
    </div>
  {/if}

  <div
    class="cd-ai-chat-dialogue-container"
    class:cd-ai-chat-dialogue-container-right={isRightAlign}
  >
    {#if dialogueRenderConfig?.renderFullDialogue}
      <!-- 整块自定义渲染（优先级最高，对齐 Semi renderFullDialogue）。 -->
      {@render dialogueRenderConfig.renderFullDialogue({
        message,
        role,
        defaultNodes: { avatar: defaultAvatar, title: defaultTitle, content: defaultContent, action: defaultAction },
      })}
    {:else}
      <!-- 头像 -->
      {#if dialogueRenderConfig?.renderDialogueAvatar}
        {@render dialogueRenderConfig.renderDialogueAvatar({ message, role, defaultAvatar })}
      {:else}
        {@render defaultAvatar()}
      {/if}

    <div class="cd-ai-chat-dialogue-inner">
      <!-- Semi：continueSend 时不渲染标题（同角色连发只在第一条显示名字/时间）。 -->
      {#if continueSend}
        <!-- 连续发言不渲染标题 -->
      {:else if dialogueRenderConfig?.renderDialogueTitle}
        {@render dialogueRenderConfig.renderDialogueTitle({ message, role, defaultTitle })}
      {:else}
        {@render defaultTitle()}
      {/if}

      {#if dialogueRenderConfig?.renderDialogueContent}
        <!-- 对齐 Semi：customRenderFunc 提供时完全跳过默认外层容器和引用区
             （dialogueContent.tsx:400-406 短路返回，不落进 else 分支），消费方拿到
             className（气泡样式类）自行决定要不要套回去、要不要接着渲染引用区。 -->
        {@render dialogueRenderConfig.renderDialogueContent({
          message,
          role,
          defaultContent: contentInner,
          className: contentWrapCls,
        })}
      {:else}
        {@render defaultContent()}
      {/if}

      <!-- renderDialogueAction 的自定义/默认分支已下沉到 defaultAction() 内部的
           DialogueAction customRender（因为 defaultActionsObj 单独寻址的各按钮 snippet
           只有 DialogueAction 内部持有），这里直接渲染即可。 -->
      {@render defaultAction()}
    </div>
    {/if}
  </div>
</div>

<style>
  /* 逐条对齐 Semi &-wrapper：这些 token 早就按 Semi 建好了，
     但组件一直在用 --cd-spacing-tight 之类的通用值，等于没接上。 */
  .cd-ai-chat-dialogue-wrapper {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: var(--cd-ai-chat-dialogue-wrapper);
    flex-wrap: nowrap;
    padding: var(--cd-ai-chat-dialogue-wrapper-padding-y)
      var(--cd-ai-chat-dialogue-wrapper-padding-x);
    margin-top: var(--cd-ai-chat-dialogue-wrapper-margin-top);
    column-gap: var(--cd-ai-chat-dialogue-wrapper-column-gap);
  }

  .cd-ai-chat-dialogue-wrapper-selected {
    background-color: var(--cd-ai-chat-dialogue-wrapper-selected-bg);
    border-radius: var(--cd-ai-chat-dialogue-wrapper-selected);
  }

  /* 对齐 Semi aiChatDialogue.scss:78-82 &-wrapper:hover { &-action:not(&-action-hidden)
     { visibility:visible } }：本库原来完全没有这条规则，导致 hover 到消息上时操作区
     不会显示。-action 类挂在子组件 DialogueAction 根节点上，须 :global。 */
  .cd-ai-chat-dialogue-wrapper:hover :global(.cd-ai-chat-dialogue-action:not(.cd-ai-chat-dialogue-action-hidden)) {
    visibility: visible;
  }

  /* container 层：Semi 用它承载左右布局，本库原来整层缺失。 */
  .cd-ai-chat-dialogue-container {
    flex: 1 1 auto;
    display: flex;
    flex-direction: row;
    column-gap: var(--cd-ai-chat-dialogue-container-column-gap);
  }

  /* 右对齐（user + align=leftRight）。Semi 是正向标记 -container-right；
     本库原来是反向的 -wrapper-leftAlign（默认反转、leftAlign 再转回来），语义相反。 */
  .cd-ai-chat-dialogue-container-right {
    flex-direction: row-reverse;
  }

  .cd-ai-chat-dialogue-container-right .cd-ai-chat-dialogue-inner {
    align-items: flex-end;
  }

  /* 头像样式已随组件拆分迁到 DialogueAvatar.svelte（同 Semi widgets/dialogueAvatar.tsx）。 */

  /* 逐条对齐 Semi &-inner：display:flex + flex-direction:column（本库原来只有
     它作为 -container flex 子项的规则，漏了它自己也是 title/content/action 的
     flex 容器——导致 -container-right 下的 align-items:flex-end 在非 flex 元素
     上完全不生效，title 撑满宽度且不会跟随头像贴右侧）。 */
  .cd-ai-chat-dialogue-inner {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1 1 auto;
  }

  /* 标题样式已随组件拆分迁到 DialogueTitle.svelte（同 Semi widgets/dialogueTitle.tsx）。 */

  /* 气泡（对齐 Semi &-bubble, &-userBubble）。修饰类现在直接挂在 content 上，
     不再靠外层 wrapper 后代选择，且尺寸值接回 Semi token（原来用的是通用 spacing）。
     必须 :global —— contentWrapCls 只是算好字符串传给 ContentItemRenderer 子组件当
     textWrapCls，DialogueBox 自己的模板从不直接渲染带这些类的元素，scoped 规则
     匹配不到；真机实测过 getComputedStyle，之前漏打洞导致背景色/圆角/padding 全部
     计算为 0（规则形同虚设，只是类名字符串挂对了，样式完全没生效）。 */
  :global(.cd-ai-chat-dialogue-content-bubble),
  :global(.cd-ai-chat-dialogue-content-userBubble) {
    margin-top: var(--cd-ai-chat-dialogue-content-bubble-margin-top);
    padding: var(--cd-ai-chat-dialogue-bubble-padding-y)
      var(--cd-ai-chat-dialogue-bubble-padding-x);
    border-radius: var(--cd-ai-chat-dialogue-bubble);
    background-color: var(--cd-ai-chat-dialogue-bubble-bg);
    max-width: var(--cd-ai-chat-dialogue-bubble-max);
    box-sizing: border-box;
    width: fit-content;
  }

  :global(.cd-ai-chat-dialogue-content-no-bubble) {
    margin-top: var(--cd-ai-chat-dialogue-content-no-bubble-margin-top);
    width: fit-content;
  }

  /* 对齐 Semi aiChatDialogue.scss &-content-custom-renderer（370-373 行）：
     renderDialogueContentItem 渲染出的节点统一被包在这个类的 div 里，宽度
     天生收缩贴合内容（width:fit-content），不是靠消费方自己在渲染节点上写
     width 撑起/收缩——本库原来完全没定义这条基础规则，只有 container-right
     场景下的 margin-left:auto 覆盖（见下方选择器），真机对照 Semi 官网发现
     function_call 自定义渲染节点应是贴合文字的胶囊而非占满整行的横幅，
     token 层 ai-chat-dialogue-custom-renderer-margin-top 早就定义了却从未
     被组件消费，是一处死 token。 */
  :global(.cd-ai-chat-dialogue-content-custom-renderer) {
    margin-top: var(--cd-ai-chat-dialogue-custom-renderer-margin-top);
    width: fit-content;
  }

  /* 右对齐时这三类内容靠右（对齐 Semi container-right 下的规则）。
     -content-no-bubble / -content-user 也渲染在 ContentItemRenderer 子组件里（同上
     bubble/userBubble 那条），祖先链跨组件时 Svelte scoped hash 对不上会静默失效
     （规则合法但从不命中，真机 getComputedStyle 实测才能发现），整条选择器须
     :global() 包裹，不能只给最外层 .container-right 打洞。 */
  :global(.cd-ai-chat-dialogue-container-right .cd-ai-chat-dialogue-content-no-bubble),
  :global(.cd-ai-chat-dialogue-container-right .cd-ai-chat-dialogue-content-user),
  :global(.cd-ai-chat-dialogue-container-right .cd-ai-chat-dialogue-content-custom-renderer) {
    margin-left: auto;
  }

  .cd-ai-chat-dialogue-container-right .cd-ai-chat-dialogue-content-inner {
    text-align: right;
  }

  /* markdown 正文在右对齐容器里仍保持左对齐（Semi 显式做了这条兜底）。 */
  .cd-ai-chat-dialogue-container-right
    .cd-ai-chat-dialogue-content-inner
    :global(.cd-markdown-render) {
    text-align: left;
  }

  /* content-inner（对齐 Semi &-inner { margin-left:auto; width:100% }）：token 早就建好
     （--cd-ai-chat-dialogue-content-inner）却从未被消费，本库这层一直没有显式宽度，
     默认收缩到内容宽度——真机对照 Semi 截图，「已思考完成」这类靠 width:100% 撑满的
     子块（&-reasoning-wrapper 同样是 100%）会因为父容器没有宽度基准而显得偏窄。 */
  .cd-ai-chat-dialogue-content-inner {
    margin-left: auto;
    width: var(--cd-ai-chat-dialogue-content-inner);
  }

  /* content-wrapper（对齐 Semi &-content-wrapper：display:flex; align-items:end）：
     本库原来只搭了这层 DOM 结构没配样式，失败图标按 block 布局垂直堆在气泡上方；
     真机对照 Semi 截图，图标应与「失败图标 + -content-inner」横向排列，且底部对齐
     气泡底边（不是顶部也不是垂直居中）。 */
  .cd-ai-chat-dialogue-content-wrapper {
    display: flex;
    align-items: flex-end;
  }

  /* 失败图标（对齐 Semi &-content-failed）：Semi 这里是 IconAlertCircle，
     没有错误文案节点——本库原来渲染的是一行 locale 文字，属自造。 */
  .cd-ai-chat-dialogue-content-failed {
    color: var(--cd-ai-chat-dialogue-failed);
    margin-right: var(--cd-ai-chat-dialogue-content-failed-margin-right);
  }

  /* 加载：三个弹跳圆点 + 文案（对齐 Semi &-loading）。必须 :global —— 这套类名不只
     DialogueBox 自己用，DialogueStep.svelte 的 loading 态图标也复用同一套类
     （Semi 两处都是同一套 loadingIcon），但那边渲染发生在别的组件 scope 里，普通
     scoped 规则跨组件不命中；真机实测 getComputedStyle 发现三个点 width/height 全部
     计算为 0、背景透明，DOM 结构对但视觉完全不可见（step 摘要「总结北京旅游攻略的
     创建成果并呈现给用户」in_progress 态前缀区域看起来像完全没有图标）。 */
  :global(.cd-ai-chat-dialogue-content-loading) {
    display: flex;
    align-items: center;
    margin-top: var(--cd-ai-chat-dialogue-content-loading-margin-top);
  }

  :global(.cd-ai-chat-dialogue-content-loading-item) {
    border-radius: var(--cd-radius-ai-chat-dialogue-loading-circle);
    width: var(--cd-width-ai-chat-dialogue-loading-circle);
    height: var(--cd-height-ai-chat-dialogue-loading-circle);
    margin: var(--cd-ai-chat-dialogue-loading-item-margin-y)
      var(--cd-ai-chat-dialogue-loading-item-margin-x);
    overflow: visible;
    position: relative;
    animation: cd-ai-chat-dialogue-loading-bounce 1s infinite ease;
  }

  /* 三个圆点各自的颜色与动画延迟（对齐 Semi 的 nth-child(1..3)）。 */
  :global(.cd-ai-chat-dialogue-content-loading-item:nth-child(1)) {
    animation-delay: -200ms;
    background-color: var(--cd-ai-chat-dialogue-loading-circle-first-bg);
  }

  :global(.cd-ai-chat-dialogue-content-loading-item:nth-child(2)) {
    animation-delay: -100ms;
    background-color: var(--cd-ai-chat-dialogue-loading-circle-second-bg);
  }

  :global(.cd-ai-chat-dialogue-content-loading-item:nth-child(3)) {
    animation-delay: 0ms;
    background-color: var(--cd-ai-chat-dialogue-loading-circle-third-bg);
  }

  :global(.cd-ai-chat-dialogue-content-loading-text) {
    margin-left: var(--cd-ai-chat-dialogue-loading-text-margin-left);
    color: var(--cd-ai-chat-dialogue-loading-text);
    font-size: var(--cd-ai-chat-dialogue-loading-text-font-size);
  }

  /* 逐帧照搬 Semi 的 @keyframes（起跳/落地/回弹/静止四段）。 */
  @keyframes cd-ai-chat-dialogue-loading-bounce {
    0% {
      transform: translateY(0) scale(1);
    }
    18% {
      transform: translateY(-4px) scale(0.96);
    }
    36% {
      transform: translateY(0) scale(1.06);
    }
    44% {
      transform: translateY(-0.5px) scale(0.98);
    }
    52% {
      transform: translateY(0) scale(1);
    }
    100% {
      transform: translateY(0) scale(1);
    }
  }

  /* 操作区样式已随组件拆分迁到 DialogueAction.svelte
     （原来这三条是给裸 emoji 按钮写的，Semi 侧那几个按钮是复用 Button，样式归 Button 管）。 */

  /* 引用区样式已随组件拆分迁到 DialogueReference.svelte（同 Semi widgets/contentItem/reference.tsx）。 */

  /* —— RTL（对齐 Semi aiChatDialogue/rtl.scss）：wrapper 整体镜像书写方向。 —— */
  :global(.cd-rtl) .cd-ai-chat-dialogue-wrapper {
    direction: rtl;
  }
</style>
