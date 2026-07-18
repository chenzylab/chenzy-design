<!--
  ChatCode — Chat 消息内容的代码块覆盖（严格对齐 Semi chat/chatBox/code.tsx）。
  通过 MarkdownRender components={{ pre: ChatCode }} 覆盖围栏代码块：
  - 有语言 → <div.cd-chat-chatBox-content-code>（深色 topSlot 栏：语言标签 + 复制按钮 IconCopyStroked/IconTick）+ CodeHighlight。
  - 无语言 → 纯 <pre><code>。
  复制走 navigator.clipboard，2s 后复位为「复制」态（对齐 Semi copied 态）。
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

  let copied = $state(false);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard?.writeText(code);
    } catch {
      // 剪贴板不可用时静默。
    }
    copied = true;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => (copied = false), 2000);
  }
</script>

{#if language}
  <div class="cd-chat-chatBox-content-code">
    <div class="cd-chat-chatBox-content-code-topSlot">
      <span class="cd-chat-chatBox-content-code-topSlot-type">{language}</span>
      <span class="cd-chat-chatBox-content-code-topSlot-copy">
        {#if copied}
          <span class="cd-chat-chatBox-content-code-topSlot-copy-wrapper">
            <IconTick />
            {loc().t('Chat.copied')}
          </span>
        {:else}
          <button
            type="button"
            class="cd-chat-chatBox-content-code-topSlot-copy-wrapper cd-chat-chatBox-content-code-topSlot-toCopy"
            onclick={handleCopy}
          >
            <IconCopyStroked />
            {loc().t('Chat.copy')}
          </button>
        {/if}
      </span>
    </div>
    <CodeHighlight {code} {language} lineNumber={false} />
  </div>
{:else}
  <pre><code>{code}</code></pre>
{/if}

<style>
  /* —— 代码块（对齐 Semi -content-code：圆角 + 深色 topSlot） —— */
  .cd-chat-chatBox-content-code {
    border-radius: var(--cd-chat-chatBox-content-code-radius);
    overflow: hidden;
  }

  .cd-chat-chatBox-content-code-topSlot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--cd-chat-chatBox-code-topSlot-bg);
    padding: var(--cd-chat-chatBox-content-code-topSlot-paddingX)
      var(--cd-chat-chatBox-content-code-topSlot-paddingY);
    color: var(--cd-chat-chatBox-code-topSlot);
    font-size: var(--cd-chat-chatBox-code-topSlot-font-size);
    line-height: var(--cd-chat-chatBox-code-topSlot-line-height);
  }

  .cd-chat-chatBox-content-code-topSlot-copy {
    min-width: var(--cd-chat-chatBox-content-code-topSlot-copy-width);
    display: flex;
    justify-content: flex-end;
  }

  .cd-chat-chatBox-content-code-topSlot-copy-wrapper {
    display: flex;
    align-items: center;
    column-gap: var(--cd-chat-chatBox-content-code-topSlot-copy-columnGap);
    cursor: pointer;
    background: transparent;
    border: none;
    color: var(--cd-chat-chatBox-code-topSlot);
    line-height: var(--cd-chat-chatBox-code-topSlot-line-height);
    padding: var(--cd-chat-chatBox-content-code-topSlot-copy-padding);
    border-radius: var(--cd-chat-chatBox-content-code-topSlot-copy-radius);
    font: inherit;
    font-size: var(--cd-chat-chatBox-code-topSlot-font-size);
  }

  .cd-chat-chatBox-content-code-topSlot-toCopy:hover {
    background: var(--cd-chat-chatBox-code-topSlot-toCopy-bg-hover);
  }

  /* CodeHighlight 内容背景对齐 Semi -code-content（去掉 CodeHighlight 自带 pre 圆角/margin，铺满） */
  .cd-chat-chatBox-content-code :global(.cd-code-highlight) {
    border-radius: 0;
  }
  .cd-chat-chatBox-content-code :global(pre[class*='language-']) {
    margin: 0;
    background: var(--cd-chat-chatBox-code-content);
  }
</style>
