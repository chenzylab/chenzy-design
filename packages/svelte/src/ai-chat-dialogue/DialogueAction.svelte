<!--
  DialogueAction — 消息操作区（1:1 对齐 Semi widgets/dialogueAction.tsx）。

  本库原来是一排**裸 emoji 按钮**（👍👎🗑✎↻⇪），Semi 是一排复用 Button 的具名图标，
  且删除走 Dropdown「更多」+ 确认 Modal、复制会写剪贴板并弹 Toast。

  逐条对齐 Semi 的显隐规则（render() 里那几个布尔）：
  · showFeedback = 非 user 且 status==='completed'  → 点赞/点踩
  · showReset    = isLastChat 且 role==='assistant' → 重新生成
  · showEdit     = role==='user'                    → 编辑
  · finished     = status 不是 in_progress/incomplete
  · 外层类：-show（showReset&&finished 或 hover）、-hidden（未 finished）

  isLastChat 参数须是真正的「消息列表最后一条」（对齐 Semi index.tsx:330
  `index === chats.length - 1`，逐条计算）——本库原来在 DialogueBox.svelte
  错误传成了 AIChatDialogue.showReset（全局开关，恒为默认 true 的同一个值），
  导致真机验证到几乎每条 assistant 消息都误显示「重新生成」按钮，而非各自
  列表里唯一的最后一条。现由 AIChatDialogue.svelte 逐条算好、DialogueBox.svelte
  用 `showReset && isLastChat` 合并两个独立条件（showReset=是否启用该功能的
  全局开关；isLastChat=这条消息该不该显示的逐条判断）后再传下来。

  复用 Button / Dropdown / Modal / Toast —— Semi 也复用这四个。

  customRender：对齐 Semi customRenderFunc——传了时不走默认布局，而是把 defaultActionsObj
  （各按钮各自的 snippet，对齐 Semi copyNode/resetNode/shareNode/editNode/likeNode/dislikeNode/
  moreNode）连同 defaultAction（整体默认布局）一起交给它，可单独寻址/重排/取舍每个按钮。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { AIDialogueMessage } from '@chenzy-design/core';
  import {
    IconCopyStroked,
    IconRedoStroked,
    IconEditStroked,
    IconShareStroked,
    IconThumbUpStroked,
    IconLikeThumb,
    IconMoreStroked,
    IconDeleteStroked,
  } from '@chenzy-design/icons';
  import { Button } from '../button/index.js';
  import { Dropdown } from '../dropdown/index.js';
  import { useModal, ModalContextHolder } from '../modal/index.js';
  import { Toast } from '../toast/index.js';
  import { useLocale } from '../locale-provider/index.js';
  import type { RenderActionProps } from './render-config.js';

  interface Props {
    message: AIDialogueMessage;
    /** 是否列表最后一条（决定是否显示「重新生成」，对齐 Semi isLastChat）。 */
    isLastChat?: boolean;
    onMessageCopy?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageDelete?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageReset?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageEdit?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageShare?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageGoodFeedback?: ((message: AIDialogueMessage) => void) | undefined;
    onMessageBadFeedback?: ((message: AIDialogueMessage) => void) | undefined;
    /** 自定义整块渲染（对齐 Semi customRenderFunc / dialogueRenderConfig.renderDialogueAction）。 */
    customRender?: Snippet<[RenderActionProps]> | undefined;
  }

  let {
    message,
    isLastChat = false,
    onMessageCopy,
    onMessageDelete,
    onMessageReset,
    onMessageEdit,
    onMessageShare,
    onMessageGoodFeedback,
    onMessageBadFeedback,
    customRender,
  }: Props = $props();

  const loc = useLocale();
  // 全局 modal.warning() mount 到独立 host，脱离组件树拿不到 LocaleProvider context
  // （真机测出 zh-CN 页面里删除确认 Modal 按钮渲染成英文 Cancel/Confirm）。改用
  // useModal()：ConfirmModal 经 <ModalContextHolder> 在本组件树内声明式渲染，继承
  // 此处的 Svelte context（对齐 Semi Modal.useModal 的 contextHolder 用法）。
  const [modal, modalHolder] = useModal();

  // 显隐规则逐条对齐 Semi render()。
  const status = $derived(message.status ?? 'completed');
  const completed = $derived(status === 'completed');
  const finished = $derived(status !== 'in_progress' && status !== 'incomplete');
  const isUser = $derived(message.role === 'user');
  const showFeedback = $derived(!isUser && completed);
  const showReset = $derived(isLastChat && message.role === 'assistant');
  const showEdit = $derived(isUser);

  let moreVisible = $state(false);
  // 对齐 Semi actionFoundation showMoreDropdown/hideMoreDropdown 的 showAction：下拉
  // 打开时操作区强制常显（不再依赖鼠标是否仍 hover 在消息上——真机验证到，点开「更多」
  // 后把鼠标移到页面其他任意位置，Semi 的操作区仍然可见，而本库原来纯靠 CSS :hover
  // 判定可见性，鼠标一移开操作区就消失，下拉却还开着，两者状态脱节）。关闭时延迟 150ms
  // 才收起 showAction（同 Semi hideMoreDropdown 的 setTimeout(…, 150)），避免下拉刚关闭
  // 那一瞬操作区就跟着突兀消失。
  let showAction = $state(false);
  let hideActionTimer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    if (moreVisible) {
      clearTimeout(hideActionTimer);
      showAction = true;
    } else {
      hideActionTimer = setTimeout(() => {
        showAction = false;
      }, 150);
    }
    return () => clearTimeout(hideActionTimer);
  });
  // 给这次下拉打一个实例唯一 id，供全局 mousedown 判定「点击是否落在本实例的触发器内」。
  const dropdownInstanceId = `cd-ai-chat-dialogue-more-${crypto.randomUUID()}`;

  // 点击「更多」触发器/菜单之外即关闭下拉（对齐 Semi actionFoundation
  // registerClickOutsideHandler/unregisterClickOutsideHandler）：Dropdown 用
  // trigger="custom" 时组件自身明确跳过内置的点击外部关闭逻辑（完全交给消费方），
  // 本库原来完全没实现这一层——点开一条消息的「更多」后，点另一条消息的「更多」，
  // 前一个不会关闭（两个下拉各自独立的 moreVisible state，互不影响）。
  // 不用包裹 DOM 元素做 contains() 判定：Dropdown 的 use:triggerAria 依赖自己包裹 span
  // 的 firstElementChild 就是真实触发器，外部多包一层会让 aria-haspopup/expanded 错位
  // 写到裸 span 上（真机验证到 axe aria-allowed-attr 违规）。改用 closest() 选择器判定，
  // 零 DOM 结构改动。
  //
  // 真机验证到一处真实回归：菜单内容（Dropdown.Item「删除」）是 portal 到 document.body
  // 的，不在触发器 [data-dialogue-more-id] 的 DOM 子树内——点击「删除」时 mousedown
  // 先被这里判定成"外部点击"提前关闭下拉，导致紧跟着的 click 事件里 Dropdown.Item 的
  // onClick 没机会执行（handleDelete 从未被调用，Modal 弹不出来）。用触发器的
  // aria-controls（Dropdown 的 use:triggerAria 写上去，指向菜单的 id）反查菜单元素，
  // 一并纳入"内部"判定范围。
  $effect(() => {
    if (!moreVisible) return;
    function handleClickOutside(e: MouseEvent): void {
      const target = e.target as HTMLElement | null;
      const trigger = document.querySelector(`[data-dialogue-more-id="${dropdownInstanceId}"]`);
      if (target?.closest(`[data-dialogue-more-id="${dropdownInstanceId}"]`)) return;
      const menuId = trigger?.getAttribute('aria-controls');
      const menuEl = menuId ? document.getElementById(menuId) : null;
      if (menuEl && target && menuEl.contains(target)) return;
      moreVisible = false;
    }
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  });

  /**
   * 复制消息正文（对齐 Semi copyToClipboardAndToast）：string 直取，
   * 数组则逐块把 content 拼起来（内层再是数组时取各 part 的 text）。
   */
  function messageText(): string {
    const c = message.content;
    if (typeof c === 'string') return c;
    if (!Array.isArray(c)) return '';
    return c
      .map((item) => {
        const inner = (item as { content?: unknown }).content;
        if (typeof inner === 'string') return inner;
        if (Array.isArray(inner)) {
          return inner.map((p) => (p as { text?: string })?.text ?? '').join('');
        }
        return '';
      })
      .join('');
  }

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard?.writeText(messageText());
    } catch {
      // 剪贴板不可用时静默（同 ChatCode / SideBar 的处理）。
    }
    // 对齐 Semi：复制后弹 Toast。
    Toast.success({ content: loc().t('AIChatDialogue.copySuccess') });
    onMessageCopy?.(message);
  }

  /** 删除前弹确认 Modal（对齐 Semi showDeleteModal）。 */
  function handleDelete(): void {
    moreVisible = false;
    modal.warning({
      title: loc().t('AIChatDialogue.deleteConfirm'),
      content: loc().t('AIChatDialogue.deleteContent'),
      onOk: () => onMessageDelete?.(message),
    });
  }
</script>

{#snippet editNode()}
  <Button
    theme="borderless"
    type="tertiary"
    class="cd-ai-chat-dialogue-action-btn"
    aria-label={loc().t('AIChatDialogue.edit')}
    onclick={() => onMessageEdit?.(message)}
  >
    {#snippet icon()}<IconEditStroked />{/snippet}
  </Button>
{/snippet}

{#snippet resetNode()}
  <Button
    theme="borderless"
    type="tertiary"
    class="cd-ai-chat-dialogue-action-btn"
    aria-label={loc().t('AIChatDialogue.reset')}
    onclick={() => onMessageReset?.(message)}
  >
    {#snippet icon()}<IconRedoStroked class="cd-ai-chat-dialogue-action-icon-redo" />{/snippet}
  </Button>
{/snippet}

{#snippet copyNode()}
  <Button
    theme="borderless"
    type="tertiary"
    class="cd-ai-chat-dialogue-action-btn"
    aria-label={loc().t('AIChatDialogue.copy')}
    onclick={handleCopy}
  >
    {#snippet icon()}<IconCopyStroked />{/snippet}
  </Button>
{/snippet}

{#snippet shareNode()}
  <Button
    theme="borderless"
    type="tertiary"
    class="cd-ai-chat-dialogue-action-btn"
    aria-label={loc().t('AIChatDialogue.share')}
    onclick={() => onMessageShare?.(message)}
  >
    {#snippet icon()}<IconShareStroked />{/snippet}
  </Button>
{/snippet}

{#snippet likeNode()}
  <!-- 已选中用实心 IconLikeThumb（对齐 Semi）。 -->
  <Button
    theme="borderless"
    type="tertiary"
    class="cd-ai-chat-dialogue-action-btn"
    aria-label={loc().t('AIChatDialogue.like')}
    onclick={() => onMessageGoodFeedback?.(message)}
  >
    {#snippet icon()}
      {#if (message as { like?: boolean }).like}<IconLikeThumb />{:else}<IconThumbUpStroked />{/if}
    {/snippet}
  </Button>
{/snippet}

{#snippet dislikeNode()}
  <!-- 已选中用实心 IconLikeThumb，额外挂 -icon-flip 垂直翻转（对齐 Semi）。 -->
  <Button
    theme="borderless"
    type="tertiary"
    class="cd-ai-chat-dialogue-action-btn"
    aria-label={loc().t('AIChatDialogue.dislike')}
    onclick={() => onMessageBadFeedback?.(message)}
  >
    {#snippet icon()}
      {#if (message as { dislike?: boolean }).dislike}
        <IconLikeThumb class="cd-ai-chat-dialogue-action-icon-flip" />
      {:else}
        <IconThumbUpStroked class="cd-ai-chat-dialogue-action-icon-flip" />
      {/if}
    {/snippet}
  </Button>
{/snippet}

{#snippet moreNode()}
  <!-- 删除收在「更多」下拉里，点击后弹确认 Modal（对齐 Semi moreNode + showDeleteModal）。
       position：Semi 写 bottomLeft，本库 Placement 用逻辑方位命名，等价值是 bottomStart。 -->
  <Dropdown
    trigger="custom"
    position="bottomStart"
    className="cd-ai-chat-dialogue-action-dropdown"
    visible={moreVisible}
    onVisibleChange={(v) => (moreVisible = v)}
    spacing={12}
  >
    {#snippet render()}
      <Dropdown.Menu>
        <!-- 危险色对齐 Semi &-action-dropdown li { color: $color-aiChatDialogue_action_dropdown-text }
             （删除是危险操作）：走 Dropdown.Item 自身的 type="danger" 语义色，而非外部 CSS
             硬覆盖——本库原来用 :global(.cd-ai-chat-dialogue-action-dropdown li) 覆盖颜色，
             但 Dropdown.Item 自带的默认文字色规则是双类选择器（特异性 0,2,0），
             压过了这条单类+标签选择器（0,1,1），从未真正生效，真机测得删除项一直是常规黑色。 -->
        <Dropdown.Item type="danger" onClick={handleDelete}>
          <IconDeleteStroked />
          {loc().t('AIChatDialogue.delete')}
        </Dropdown.Item>
      </Dropdown.Menu>
    {/snippet}
    <!-- data-dialogue-more-id 供点击外部关闭判定 closest() 用（不额外包裹 DOM 元素——
         Dropdown 的 use:triggerAria 依赖自己包裹 span 的 firstElementChild 就是真实
         触发器 Button，多包一层会导致 aria-haspopup/expanded 错位写到裸 span 上）。 -->
    <Button
      theme="borderless"
      type="tertiary"
      class="cd-ai-chat-dialogue-action-btn"
      aria-label={loc().t('AIChatDialogue.more')}
      data-dialogue-more-id={dropdownInstanceId}
      onclick={() => (moreVisible = !moreVisible)}
    >
      {#snippet icon()}<IconMoreStroked />{/snippet}
    </Button>
  </Dropdown>
{/snippet}

{#snippet defaultAction()}
  <!-- 渲染顺序逐条对齐 Semi render()：copy → reset → share → edit → like/dislike → more。
       本库原来是 edit → reset → copy → share → like/dislike → more，顺序错了（真机对照
       Semi 截图发现：System「复制/分享/有帮助/无帮助/更多」、User「复制/分享/编辑/更多」、
       Assistant「复制/重新生成/分享/有帮助/无帮助/更多」，edit 排在 share 之后而非最前）。 -->
  <div
    class="cd-ai-chat-dialogue-action"
    class:cd-ai-chat-dialogue-action-show={(showReset && finished) || showAction}
    class:cd-ai-chat-dialogue-action-hidden={!finished}
  >
    <!-- copy 显示条件对齐 Semi {completed && this.copyNode()}：本库原来无条件渲染，
         导致 failed/in_progress 等未完成状态也会出现复制按钮——真机对照 Semi 截图，
         错误状态下操作区只有「重新生成 + 更多」，没有复制。 -->
    {#if completed}{@render copyNode()}{/if}
    {#if showReset}{@render resetNode()}{/if}
    <!-- share 显示条件对齐 Semi {completed && this.shareNode()}：只看 completed，
         与 onMessageShare 是否传入无关（本库原来误判为「传了才显示」）。 -->
    {#if completed}{@render shareNode()}{/if}
    {#if showEdit}{@render editNode()}{/if}
    {#if showFeedback}
      {@render likeNode()}
      {@render dislikeNode()}
    {/if}
    {@render moreNode()}
  </div>
{/snippet}

{#if customRender}
  <!-- defaultActionsObj 对齐 Semi actionNodeObj（dialogueAction.tsx:271-292）真实只赋值
       这 5 个字段：shareNode/editNode 是内部私有方法，从未被塞进这个对象——本库原来
       多传了这两个，是超出 Semi 契约的自造字段，已删。
       defaultActions 对齐 Semi actionNodes 数组，顺序与推入条件逐条一致：completed→copy，
       showFeedback→like+dislike，showReset→reset，moreNode 无条件包含。 -->
  {@render customRender({
    message,
    defaultAction,
    defaultActions: [
      ...(completed ? [copyNode] : []),
      ...(showFeedback ? [likeNode, dislikeNode] : []),
      ...(showReset ? [resetNode] : []),
      moreNode,
    ],
    className: 'cd-ai-chat-dialogue-action',
    defaultActionsObj: {
      ...(completed ? { copyNode } : {}),
      ...(showReset ? { resetNode } : {}),
      ...(showFeedback ? { likeNode, dislikeNode } : {}),
      moreNode,
    },
  })}
{:else}
  {@render defaultAction()}
{/if}

<ModalContextHolder items={modalHolder.items} />

<style>
  /* 逐条对齐 Semi aiChatDialogue.scss &-action。 */
  .cd-ai-chat-dialogue-action {
    margin-top: var(--cd-ai-chat-dialogue-action-margin-top);
    visibility: hidden;
  }

  .cd-ai-chat-dialogue-action-show {
    visibility: visible;
  }

  /* 对齐 Semi &.action-hidden, &:hover.action-hidden { visibility:hidden }：双类选择器
     特异性(0,2,0)压过 -show 的(0,1,0)，确保 in_progress/incomplete 消息即便 showAction
     意外为 true（更多下拉理论上不应在未完成消息上出现，但防御性地保持与 Semi 同等优先级），
     操作区仍强制不可见。本库原来完全没写这条规则，-hidden 类只在模板绑定、无实际 CSS 效果。 */
  .cd-ai-chat-dialogue-action.cd-ai-chat-dialogue-action-hidden,
  .cd-ai-chat-dialogue-action:hover.cd-ai-chat-dialogue-action-hidden {
    visibility: hidden;
  }

  /* Semi &-action-btn：24×24。 */
  .cd-ai-chat-dialogue-action :global(.cd-ai-chat-dialogue-action-btn) {
    width: var(--cd-width-ai-chat-dialogue-action-btn);
    height: var(--cd-height-ai-chat-dialogue-action-btn);
  }

  /* Semi &-action-icon-flip：点踩图标垂直翻转复用点赞图标（aiChatDialogue.scss:386-388
     是 scaleY(-1)，不是 rotate(180deg)——旋转会连带水平镜像，缩放才是单纯上下翻转）。 */
  .cd-ai-chat-dialogue-action :global(.cd-ai-chat-dialogue-action-icon-flip) {
    transform: scaleY(-1);
  }

  /* Semi &-action-dropdown 的「li 用 danger 色」改走 Dropdown.Item type="danger"
     语义色实现（见上方 render() 里的用法），不再需要外部 CSS 覆盖。 */

  /* —— RTL（对齐 Semi aiChatDialogue/rtl.scss）：重置图标水平翻转（箭头指向随书写方向）。 —— */
  :global(.cd-rtl) :global(.cd-ai-chat-dialogue-action-icon-redo) {
    transform: scaleX(-1);
  }
</style>
