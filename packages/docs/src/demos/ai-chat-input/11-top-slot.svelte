<script lang="ts">
  // 严格对齐 Semi「自定义渲染顶部区域」：renderTopSlot 自绘引用/附件条目，
  // 类型图标走 refTypeToIconMap（file/folder/branch/terminal/web/change/git/code），
  // 默认显示类型图标，hover 时切到删除叉（纯 CSS :hover 驱动，见 docDemo.scss）。
  import { AIChatInput } from '@chenzy-design/svelte';
  import { isImageType } from '@chenzy-design/core';
  import type { AIChatInputReference } from '@chenzy-design/svelte';
  import {
    IconClose,
    IconUpload,
    IconFile,
    IconFolder,
    IconBranch,
    IconTerminal,
    IconGlobeStroke,
    IconConnectionPoint2,
    IconTemplateStroked,
    IconSearch,
  } from '@chenzy-design/icons';

  // 对齐 Semi：label 是纯图标（<IconTemplateStroked />/<IconSearch />），无文字。
  const radioButtonProps = [
    { label: iconTemplateStroked, value: 'fast' },
    { label: iconSearch, value: 'think' },
  ];

  const uploadProps = { action: 'https://api.semi.design/upload' };

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
      default:
        return undefined;
    }
  }
</script>

{#snippet iconFile()}<IconFile size="small" />{/snippet}
{#snippet iconFolder()}<IconFolder size="small" />{/snippet}
{#snippet iconBranch()}<IconBranch size="small" />{/snippet}
{#snippet iconTerminal()}<IconTerminal size="small" />{/snippet}
{#snippet iconGlobeStroke()}<IconGlobeStroke size="small" />{/snippet}
{#snippet iconConnectionPoint2()}<IconConnectionPoint2 size="small" />{/snippet}
{#snippet iconTemplateStroked()}<IconTemplateStroked />{/snippet}
{#snippet iconSearch()}<IconSearch />{/snippet}

<div style="margin: 12px;">
  <AIChatInput
    class="aiChatInput-customTopSlot"
    {references}
    showUploadFile={false}
    showReference={false}
    {uploadProps}
    placeholder="自定义渲染顶部内容，可用于渲染上传内容、引用内容"
  >
    {#snippet renderConfigureArea()}
      <AIChatInput.Configure.RadioButton
        field="mode"
        options={radioButtonProps}
        initValue="fast"
      />
    {/snippet}
    {#snippet renderTopSlot({ references: refs, attachments, handleUploadFileDelete })}
      <div class="ai-chat-input-topSlot">
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
  /* 严格对齐 Semi src/styles/docDemo.scss 的 .ai-chat-input-topSlot：官网文档站自己的
     顶部区域样式补丁，不属于组件库内置能力，demo 文件承担等价角色（同 07b-configure-item
     的 Cascader 补丁、06-skills 的模版面板补丁归属判断）。默认显示类型图标，hover 时用
     纯 CSS 切到删除叉，不靠 JS state 控制显隐。 */
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
</style>
