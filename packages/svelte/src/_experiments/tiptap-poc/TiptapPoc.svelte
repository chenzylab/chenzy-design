<!--
  阶段 0 · tiptap 技术验证 POC（AIChatInput 立项）
  验证目标：
    1. svelte-tiptap 的 createEditor 能在 Svelte 5 runes 下跑通（editor store → runes 桥接）。
    2. EditorContent 渲染富文本，可输入。
    3. onContentChange 回调（transaction → 拿到当前内容）。
    4. ref 方法：setContent / focusEditor / getText（对齐 AIChatInput Methods 子集）。
  非正式组件，不进 index 导出。验证通过后作为 AIChatInput 阶段 1 的基座。
-->
<script lang="ts">
  import { createEditor, EditorContent, type Editor } from 'svelte-tiptap';
  import type { Readable } from 'svelte/store';
  import StarterKit from '@tiptap/starter-kit';

  interface Props {
    /** 初始内容（HTML 或纯文本）。 */
    content?: string;
    /** 占位符（starter-kit 无内置 placeholder，这里仅演示 prop 形态）。 */
    placeholder?: string;
    /** 内容变化回调（对齐 AIChatInput onContentChange）。 */
    onContentChange?: ((props: { html: string; text: string }) => void) | undefined;
  }

  let { content = '', placeholder = '', onContentChange }: Props = $props();

  // createEditor 返回 Readable<Editor>（store）。tiptap editor 是命令式实例
  // （需 DOM、有生命周期），无法用 $derived 纯计算 —— 这是 MVVM 适配器把命令式库
  // 接入 runes 的必要模式（同 JsonViewer/AudioPlayer）。故在 $effect 内创建 + 订阅，
  // cleanup 时销毁，规避泄漏。
  let editor = $state<Editor>();

  $effect(() => {
    const store: Readable<Editor> = createEditor({
      extensions: [StarterKit],
      content,
      onUpdate: ({ editor: ed }) => {
        onContentChange?.({ html: ed.getHTML(), text: ed.getText() });
      },
    });
    const unsub = store.subscribe((ed) => {
      editor = ed;
    });
    return () => {
      unsub();
      editor?.destroy();
    };
  });

  // —— ref 方法（对齐 AIChatInput Methods 子集）——
  export function setContent(next: string): void {
    editor?.commands.setContent(next);
  }
  export function focusEditor(): void {
    editor?.commands.focus();
  }
  export function getText(): string {
    return editor?.getText() ?? '';
  }
  export function getHTML(): string {
    return editor?.getHTML() ?? '';
  }
</script>

<div class="tiptap-poc">
  {#if editor}
    <EditorContent {editor} />
  {/if}
  {#if placeholder && editor?.isEmpty}
    <div class="tiptap-poc-placeholder" aria-hidden="true">{placeholder}</div>
  {/if}
</div>

<style>
  .tiptap-poc {
    position: relative;
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-border-radius-medium);
    padding: var(--cd-spacing-tight);
    min-height: 48px;
  }

  .tiptap-poc-placeholder {
    position: absolute;
    top: var(--cd-spacing-tight);
    left: var(--cd-spacing-tight);
    color: var(--cd-color-text-2);
    pointer-events: none;
  }
</style>
