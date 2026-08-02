<!--
  DialogueCode — 对话内容里的代码块（1:1 对齐 Semi widgets/contentItem/code.tsx）。

  本库此前没有这个覆盖：对话里的围栏代码块走 MarkdownRender 默认 MdPre，
  没有语言标签栏、也没有复制按钮。

  与 chat 的 ChatCode 是**两套视觉**，别混用（Semi 侧也是两个文件）：
  · chat：深色 topSlot、复制按钮带「复制/已复制」文案；
  · dialogue：浅色 topSlot（fill-0 + text-0）、整块带 1px 边框、复制按钮**只有图标无文案**。

  挂载点是 `pre` 键而非 `code`：Semi 靠 MDX 把围栏代码扁平成 code 元素后覆盖 code 键，
  本库标准 remark-rehype 产出 pre>code，覆盖 pre 才能拿到整块（同 MdPre / ChatCode 的做法）。
-->
<script lang="ts">
  import type { Element, ElementContent } from 'hast';
  import { IconCopyStroked, IconTick } from '@chenzy-design/icons';
  import { CodeHighlight } from '../code-highlight/index.js';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    node?: Element;
    [key: string]: unknown;
  }

  let { node }: Props = $props();

  const loc = useLocale();

  const codeEl = $derived(
    node?.children?.find(
      (c: ElementContent): c is Element => c.type === 'element' && c.tagName === 'code',
    ),
  );

  function extractText(el: ElementContent): string {
    if (el.type === 'text') return el.value;
    if (el.type === 'element' && el.children) {
      return el.children.map((c: ElementContent) => extractText(c)).join('');
    }
    return '';
  }
  const code = $derived(codeEl ? extractText(codeEl) : '');

  const language = $derived.by(() => {
    const cn = codeEl?.properties?.className;
    const classes = Array.isArray(cn) ? cn.map(String) : cn ? [String(cn)] : [];
    const langClass = classes.find((c) => c.startsWith('language-'));
    return langClass ? langClass.slice('language-'.length) : undefined;
  });

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
    <CodeHighlight {code} {language} lineNumber={false} />
  </div>
{:else}
  <pre><code>{code}</code></pre>
{/if}

<style>
  /* 逐条对齐 Semi aiChatDialogue.scss &-code。 */
  .cd-ai-chat-dialogue-code {
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
