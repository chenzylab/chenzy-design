<!--
  DialogueCode — 对话内容里的代码块（1:1 对齐 Semi widgets/contentItem/code.tsx）。

  与 chat 的 ChatCode 是**两套视觉**，别混用（Semi 侧也是两个文件）：
  · chat：深色 topSlot、复制按钮带「复制/已复制」文案；
  · dialogue：浅色 topSlot（fill-0 + text-0）、整块带 1px 边框、复制按钮**只有图标无文案**。

  挂载点是 `code` 键（对齐 Semi aiChatDialogue/code.tsx 挂 components['code']，内部调用
  markdownRender 的 code(props) 渲染核心内容，外层按 language 有无包 topSlot）。
-->
<script lang="ts">
  import type { Element } from 'hast';
  import { IconCopyStroked, IconTick } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import Code from '../markdown-render/components/code.svelte';
  import { getCodeLanguage } from '../markdown-render/components/code-lang.js';

  interface Props {
    node?: Element;
    [key: string]: unknown;
  }

  let { node }: Props = $props();

  const loc = useLocale();

  function extractText(el: Element['children'][number]): string {
    if (el.type === 'text') return el.value;
    if (el.type === 'element' && el.children) {
      return el.children.map((c) => extractText(c)).join('');
    }
    return '';
  }
  const code = $derived(node ? node.children.map((c) => extractText(c)).join('') : '');
  const language = $derived(getCodeLanguage(node));

  // 对齐 Semi：复制后置 copied 态，2s 复位。
  let copied = $state(false);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard?.writeText(code);
    } catch {
      // 剪贴板不可用时静默（同 ChatCode / SideBar 的处理）。
    }
    copied = true;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => (copied = false), 2000);
  }
</script>

<!-- 对齐 Semi：仅有语言时才套 topSlot 外壳，无语言直接退回默认代码渲染。 -->
{#if language}
  <div class="cd-ai-chat-dialogue-code">
    <div class="cd-ai-chat-dialogue-code-topSlot">
      <span class="cd-ai-chat-dialogue-code-topSlot-type">{language}</span>
      <span class="cd-ai-chat-dialogue-code-topSlot-copy">
        <button
          type="button"
          class="cd-ai-chat-dialogue-code-topSlot-copy-wrapper"
          aria-label={copied ? loc().t('Chat.copied') : loc().t('Chat.copy')}
          onclick={handleCopy}
        >
          {#if copied}<IconTick />{:else}<IconCopyStroked />{/if}
        </button>
      </span>
    </div>
    <Code {...(node ? { node } : {})} />
  </div>
{:else}
  <Code {...(node ? { node } : {})} />
{/if}

<style>
  /* 逐条对齐 Semi aiChatDialogue.scss &-code。
     display:flex + flex-direction:column 是本库补的（Semi 没有，JSX 渲染不产生空白
     文本节点不需要）：Svelte 模板里 </div> 与 <Code/> 之间的换行/缩进会编译成一个
     空白文本节点，在 block 布局下继承 line-height:32px 会被撑成一整行可见空白
     （真机验证到，topSlot 与代码内容之间多出 32px 间隙）。改 flex 后子节点按
     flex item 处理，line-height 只作用于内部真正含文字处，不会被空白文本节点单独撑高。 */
  .cd-ai-chat-dialogue-code {
    display: flex;
    flex-direction: column;
    border-radius: var(--cd-ai-chat-dialogue-code);
    overflow: hidden;
    border: var(--cd-width-ai-chat-dialogue-code-border) solid
      var(--cd-color-ai-chat-dialogue-code-border);
    line-height: var(--cd-ai-chat-dialogue-code-line-height);
  }

  /* Semi: & .codeHighlight pre { word-break: break-all; white-space: pre-wrap } */
  .cd-ai-chat-dialogue-code :global(.cd-code-highlight pre) {
    word-break: break-all;
    white-space: pre-wrap;
  }

  .cd-ai-chat-dialogue-code-topSlot {
    display: flex;
    justify-content: space-between;
    background-color: var(--cd-ai-chat-dialogue-code-top-slot-bg);
    align-items: center;
    padding: var(--cd-ai-chat-dialogue-code-top-slot-padding-y)
      var(--cd-ai-chat-dialogue-code-top-slot-padding-x);
    color: var(--cd-ai-chat-dialogue-code-top-slot-text);
    font-size: var(--cd-ai-chat-dialogue-code-top-slot-font-size);
  }

  .cd-ai-chat-dialogue-code-topSlot-copy {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: var(--cd-ai-chat-dialogue-action-copy);
  }

  .cd-ai-chat-dialogue-code-topSlot-copy-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: transparent;
    border: none;
    color: inherit;
  }

  /* Semi: .codeHighlight-defaultTheme pre[class*=language-] { margin:0; background } */
  .cd-ai-chat-dialogue-code :global(pre[class*='language-']) {
    margin: 0;
    background: var(--cd-ai-chat-dialogue-code-content-bg);
  }
</style>
