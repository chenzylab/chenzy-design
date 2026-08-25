<script lang="ts">
  // 严格对齐 Semi「自定义扩展」主 demo（CustomRichTextExtension）：@ 触发两级命令面板，
  // 选中条目插入自定义 referSlot 节点；renderTopSlot 把 content 里的非文本节点
  // （即插入的 referSlot）与 references/attachments 一起在顶部条带展示。
  import { AIChatInput } from '@chenzy-design/svelte';
  import { isImageType } from '@chenzy-design/core';
  import type { AIChatInputReference, AIChatInputContent } from '@chenzy-design/svelte';
  import {
    IconClose,
    IconUpload,
    IconFile,
    IconFolder,
    IconBranch,
    IconTerminal,
    IconGlobeStroke,
    IconConnectionPoint2,
    IconGit,
    IconCode,
  } from '@chenzy-design/icons';
  import { createCustomExtensions } from './custom-rich-text-extension.svelte.js';

  const uploadProps = { action: 'https://api.semi.design/upload' };
  const extensions = createCustomExtensions();

  const customReferences: AIChatInputReference[] = [
    {
      id: '1',
      type: 'file',
      name: 'horizontalScroller.tsx',
      path: 'packages/semi-ui/AIChatInput/horizontalScroller.tsx',
    },
    {
      id: '2',
      type: 'folder',
      name: 'AIChatInput',
      path: 'packages/semi-ui/AIChatInput',
    },
    { id: '3', type: 'web', name: 'web' },
    { id: '4', type: 'change', name: 'recentChange' },
    {
      id: '5',
      type: 'branch',
      name: 'Branch',
      detail: 'Diff with Main Branch',
      branch: 'feat/aichatinput',
      targetBranch: 'feat/targetBranch',
    },
    { id: '6', type: 'terminal', name: 'From 1-2', from: 1, to: 2 },
  ];

  let references = $state<AIChatInputReference[]>(customReferences);
  let chatInputRef = $state<{
    deleteContent: (content: { type?: string; text?: string }) => void;
  }>();

  function iconFor(type: string | undefined) {
    switch (type) {
      case 'file':
        return iconFile;
      case 'folder':
        return iconFolder;
      case 'branch':
        return iconBranch;
      case 'terminal':
        return iconTerminal;
      case 'web':
        return iconGlobeStroke;
      case 'change':
        return iconConnectionPoint2;
      case 'git':
        return iconGit;
      case 'code':
        return iconCode;
      default:
        return undefined;
    }
  }

  function onContentChange(): void {
    // 对齐 Semi：console.log('onContentChange', content)，此处省略打印避免刷屏。
  }

  const transformer = new Map<string, (node: unknown) => AIChatInputContent>([
    [
      'referSlot',
      (node) => {
        const n = node as { attrs?: Record<string, unknown> };
        const { value, info, type = 'text', uniqueKey } = n.attrs ?? {};
        const parsedInfo = typeof info === 'string' && info ? (JSON.parse(info) as Record<string, unknown>) : {};
        return { type: type as string, value, uniqueKey, ...parsedInfo } as AIChatInputContent;
      },
    ],
  ]);
</script>

{#snippet iconFile()}<IconFile size="small" />{/snippet}
{#snippet iconFolder()}<IconFolder size="small" />{/snippet}
{#snippet iconBranch()}<IconBranch size="small" />{/snippet}
{#snippet iconTerminal()}<IconTerminal size="small" />{/snippet}
{#snippet iconGlobeStroke()}<IconGlobeStroke size="small" />{/snippet}
{#snippet iconConnectionPoint2()}<IconConnectionPoint2 size="small" />{/snippet}
{#snippet iconGit()}<IconGit size="small" />{/snippet}
{#snippet iconCode()}<IconCode size="small" />{/snippet}

<div style="margin: 12px;">
  <AIChatInput
    bind:this={chatInputRef}
    class="aiChatInput-customTopSlot"
    {references}
    {extensions}
    showUploadFile={false}
    showReference={false}
    {onContentChange}
    {transformer}
    {uploadProps}
    placeholder="使用 @ 触发"
  >
    {#snippet renderTopSlot({ references: refs, attachments, content, handleUploadFileDelete })}
      {@const showContent = content.filter((item) => item.type !== 'text')}
      <div class="ai-chat-input-topSlot">
        <!-- order: reference, rich text area content, attachments -->
        {#each showContent as item, index (item.uniqueKey ?? index)}
          {@const ContentIcon = iconFor(item.type as string | undefined)}
          <div class="item">
            <span class="item-icon">
              {#if ContentIcon}<span class="item-left item-icon">{@render ContentIcon()}</span>{/if}
              <button
                type="button"
                class="item-icon-delete"
                aria-label="删除内容"
                onclick={() => chatInputRef?.deleteContent(item as never)}
              >
                <IconClose size="small" />
              </button>
            </span>
            <span class="item-content">
              {(item as { name?: string }).name ?? item.value}
              {#if item.type === 'branch'}<span class="detail">{(item as { detail?: string }).detail}</span>{/if}
            </span>
          </div>
        {/each}
        {#each refs as ref, index (ref.id)}
          {@const RefIcon = iconFor(ref.type as string | undefined)}
          <div class="item">
            <span class="item-icon">
              {#if RefIcon}<span class="item-left item-icon">{@render RefIcon()}</span>{/if}
              <button
                type="button"
                class="item-icon-delete"
                aria-label="删除引用"
                onclick={() => {
                  const next = [...references];
                  next.splice(index, 1);
                  references = next;
                }}
              >
                <IconClose size="small" />
              </button>
            </span>
            <span class="item-content">
              {ref.name}
              {#if ref.type === 'branch'}<span class="detail">{ref.detail}</span>{/if}
            </span>
          </div>
        {/each}
        {#each attachments as attachment (attachment.uid)}
          <div class="item">
            <span class="item-icon">
              {#if isImageType(attachment)}
                <img class="item-image item-left" src={attachment.url} alt={attachment.name} />
              {:else}
                <span class="item-left item-icon"><IconUpload size="small" /></span>
              {/if}
              <button
                type="button"
                class="item-icon-delete"
                aria-label="删除附件"
                onclick={() => handleUploadFileDelete(attachment)}
              >
                <IconClose size="small" />
              </button>
            </span>
            <span class="item-content">{attachment.name}</span>
          </div>
        {/each}
      </div>
    {/snippet}
  </AIChatInput>
</div>

<style>
  /* 严格对齐 Semi src/styles/docDemo.scss：与「自定义渲染顶部区域」demo 共用
     .ai-chat-input-topSlot 样式规则（官网文档站补丁），此处额外多了 content 分支
     （渲染 @ 命令面板插入的 referSlot 节点）。 */
  .ai-chat-input-topSlot {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: 4px;
  }

  .ai-chat-input-topSlot :global(.item) {
    width: fit-content;
    flex-shrink: 0;
    border: 1px solid var(--cd-color-border);
    padding: 2px;
    border-radius: 6px;
    display: flex;
    column-gap: 4px;
    align-items: center;
    cursor: pointer;
    margin-bottom: 8px;
  }

  .ai-chat-input-topSlot :global(.item-icon) {
    height: 12px;
    color: var(--cd-color-text-1);
    display: flex;
    align-items: center;
  }

  .ai-chat-input-topSlot :global(.item-icon-delete) {
    display: none;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    color: inherit;
    line-height: 1;
  }

  .ai-chat-input-topSlot :global(.item:hover .item-icon-delete) {
    display: inline-flex;
  }

  .ai-chat-input-topSlot :global(.item:hover .item-left) {
    display: none;
  }

  .ai-chat-input-topSlot :global(.item-image) {
    width: 12px;
    height: 12px;
    border-radius: 4px;
  }

  .ai-chat-input-topSlot :global(.item-content) {
    font-size: 12px;
    line-height: 16px;
  }

  /* 对齐 Semi docDemo.scss：@ 命令面板容器与两级选项样式。 */
  :global(.ai-chat-input-custom-extension-dropdown-menu) {
    background: var(--cd-color-bg-3);
    border: 1px solid var(--cd-color-border);
    border-radius: 0.7rem;
    box-shadow: var(--cd-shadow-elevated);
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    overflow: auto;
    padding: 0.4rem;
    position: relative;
  }

  :global(.ai-chat-input-custom-extension-dropdown-menu div) {
    align-items: center;
    background-color: transparent;
    display: flex;
    gap: 0.25rem;
    text-align: left;
    width: 100%;
  }

  :global(.ai-chat-input-custom-extension-dropdown-menu .optionItem) {
    border-radius: 4px;
    padding: 4px 8px;
    justify-content: space-between;
    box-sizing: border-box;
    font-size: 14px;
    line-height: 20px;
  }

  :global(.ai-chat-input-custom-extension-dropdown-menu .option-item-arrow) {
    color: var(--cd-color-text-2);
  }

  :global(.ai-chat-input-custom-extension-dropdown-menu .optionItem:hover),
  :global(.ai-chat-input-custom-extension-dropdown-menu .optionItem.is-selected) {
    background-color: var(--cd-color-fill-0);
  }

  :global(.ai-chat-input-custom-extension-dropdown-menu .mention) {
    background-color: var(--cd-color-success);
    color: var(--cd-color-primary);
    font-weight: 700;
    border-radius: 4px;
    padding: 6px 6px;
  }

  :global(.ai-chat-input-custom-extension-dropdown-menu .level2Item) {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px 8px;
    cursor: pointer;
    width: 100%;
    flex-shrink: 1;
    min-width: 0;
  }

  :global(.ai-chat-input-custom-extension-dropdown-menu .level2Item .name) {
    flex-shrink: 0;
  }

  :global(.ai-chat-input-custom-extension-dropdown-menu .level2Item .icon) {
    flex-shrink: 0;
  }

  :global(.ai-chat-input-custom-extension-dropdown-menu .level2Item .path) {
    flex-shrink: 1;
    opacity: 0.5;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    overflow: hidden;
    display: inline-block;
  }
</style>
