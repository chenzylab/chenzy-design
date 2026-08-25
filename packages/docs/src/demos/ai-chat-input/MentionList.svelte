<!--
  MentionList — 对齐 Semi「自定义扩展」demo 的 MentionList：@ 触发的两级命令面板。
  level 1 显示分组名（Files & Folders / Git），Enter/点击下钻到 level 2 显示具体条目；
  query 变化时按 name 过滤当前层级选项。键盘 ↑↓ 移动高亮、Enter 选中/下钻、
  Esc 退出（level 2 时先回退到 level 1，level 1 时才真正退出面板）。

  与 Semi class 组件的差异：本库用 Svelte 5 runes 改写状态管理，行为逐条对齐；
  registerApi 回调把 onKeyDown 方法交给 custom-rich-text-extension.svelte.ts 的
  suggestion.render() 转发（对齐 Semi ref.current.onKeyDown 的转发方式）。
-->
<script lang="ts">
  import type { Editor } from '@tiptap/core';
  import { IconChevronRight, IconFile, IconFolder, IconBranch, IconCode, IconGit } from '@chenzy-design/icons';
  import { TestAction, FirstLevel, type TestActionItem } from './custom-rich-text-extension.svelte.js';

  interface CommandProps {
    item?: TestActionItem;
    allowHotKeySend?: boolean;
  }

  interface Props {
    editor: Editor;
    items: (TestActionItem | string)[];
    query: string;
    command: (props: CommandProps) => void;
    registerApi: (api: { onKeyDown: (opts: { event: KeyboardEvent; exitCb: () => void }) => boolean }) => void;
  }

  let { editor, query, command, registerApi }: Props = $props();

  let selectedIndex = $state(0);
  let level = $state<1 | 2>(1);
  let options = $state<(TestActionItem | string)[]>(FirstLevel);

  // 手动 filter（对齐 Semi componentDidUpdate）：level/query 变化时重新过滤当前层级。
  const filterOptions = $derived.by(() => {
    if (!query || query.length === 0) return options;
    return options.filter((item) => {
      const name = typeof item === 'string' ? item : item.name;
      return name.toLowerCase().includes(query.toLowerCase());
    });
  });

  // 面板挂载：占用 Enter 热键，避免与 AIChatInput 发送冲突（对齐 Semi 构造函数）；
  // 卸载时交还（对齐 Semi componentWillUnmount）。用 $effect 包一层（而非顶层直接调用
  // command），避免 Svelte state_referenced_locally 警告——语义仍是「只在挂载/卸载各跑
  // 一次」，不依赖响应式重跑。
  $effect(() => {
    command({ allowHotKeySend: false });
    return () => command({ allowHotKeySend: true });
  });

  // query 变化时重置高亮（对齐 Semi componentDidUpdate 的 selectedIndex: 0）。
  $effect(() => {
    void query;
    void options;
    selectedIndex = 0;
  });

  function upHandler(): void {
    const len = filterOptions.length;
    if (len === 0) return;
    selectedIndex = (selectedIndex + len - 1) % len;
  }
  function downHandler(): void {
    const len = filterOptions.length;
    if (len === 0) return;
    selectedIndex = (selectedIndex + 1) % len;
  }
  function selectItem(index: number): void {
    const item = options[index];
    if (item && typeof item !== 'string') command({ item });
  }
  function enterHandler(): void {
    if (level === 1) {
      const group = FirstLevel[selectedIndex];
      if (group) {
        level = 2;
        options = TestAction[group] ?? [];
        selectedIndex = 0;
      }
    } else {
      selectItem(selectedIndex);
    }
  }

  function onKeyDown({
    event,
    exitCb,
  }: {
    event: KeyboardEvent;
    exitCb: () => void;
  }): boolean {
    if (event.key === 'ArrowUp') {
      upHandler();
      return true;
    }
    if (event.key === 'ArrowDown') {
      downHandler();
      return true;
    }
    if (event.key === 'Enter') {
      enterHandler();
      return true;
    }
    if (event.key === 'Escape') {
      if (level === 1) {
        exitCb();
        return true;
      } else if (level === 2) {
        level = 1;
        options = FirstLevel;
        return true;
      }
    }
    return false;
  }

  $effect(() => {
    registerApi({ onKeyDown });
  });

  function handleItemClick(index: number): void {
    const item = filterOptions[index];
    if (level === 1) {
      if (typeof item === 'string') {
        level = 2;
        options = TestAction[item] ?? [];
        editor.commands.focus();
      }
    } else {
      if (typeof item !== 'string') {
        selectItem(index);
      }
    }
  }
</script>

<div class="ai-chat-input-custom-extension-dropdown-menu" style="width: {level === 1 ? '200px' : '300px'};">
  {#if filterOptions.length}
    {#each filterOptions as item, index (typeof item === 'string' ? item : item.key)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class={index === selectedIndex ? 'is-selected optionItem' : 'optionItem'}
        onclick={() => handleItemClick(index)}
        onmouseenter={() => (selectedIndex = index)}
      >
        {#if typeof item === 'string'}
          <span>{item}</span>
        {:else}
          <div class="level2Item">
            {#if item.type === 'file'}
              <span class="icon"><IconFile /></span>
            {:else if item.type === 'folder'}
              <span class="icon"><IconFolder /></span>
            {:else if item.type === 'branch'}
              <span class="icon"><IconBranch /></span>
            {:else if item.type === 'code'}
              <span class="icon"><IconCode /></span>
            {:else if item.type === 'git'}
              <span class="icon"><IconGit /></span>
            {/if}
            <span class="name">{item.name}</span>
            <span class="path">{item.path}</span>
          </div>
        {/if}
        {#if level === 1}<IconChevronRight class="option-item-arrow" />{/if}
      </div>
    {/each}
  {:else}
    <div class="item">No result</div>
  {/if}
</div>
