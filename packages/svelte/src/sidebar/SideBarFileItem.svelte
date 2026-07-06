<!--
  SideBarFileItem — 单个富文本查看/编辑器（P5）。对齐 Semi file.js FileItem：
  默认扩展集 StarterKit(link openOnClick:false) + TextStyleKit + Image + SelectionMark +
  TextAlign(types:['heading','paragraph']) + 自研 ImageUploadNode，末尾拼接使用方 extensions。
  editable 控制查看/编辑；content 为初始 HTML；onUpdate → onContentChange(editor.getHTML())。
  editable 时渲染精简 MenuBar 工具栏（撤销/重做/标题/列表/引用/对齐/加粗系/链接/图片）。

  tiptap 内核 + 3 官方扩展 + svelte-tiptap + 自研扩展工厂全程动态 import（惰性，不进主 bundle，
  对齐 AIChatInput 范式）。§9.3：editor 在 $effect 创建/销毁；onUpdate 只写普通回调不触碰
  render 期读取的 $state，无 effect 自循环；toolbar 状态用 selectionUpdate 事件刷新的普通 $state。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Editor } from '@tiptap/core';
  import type { SideBarImageUploadOptions } from './file-extensions.js';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    /** 初始富文本内容（HTML）。 */
    content?: string;
    /** 是否可编辑（false=只读查看）。 */
    editable?: boolean;
    /** 内容变更回调（editor.getHTML()）。 */
    onContentChange?: (html: string) => void;
    /** 追加到默认扩展集末尾的自定义扩展（对齐 Semi extensions）。 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extensions?: any[];
    /** 图片上传配置（透传给 ImageUploadNode / 内嵌 Upload）。 */
    imgUploadProps?: SideBarImageUploadOptions;
    /** 根自定义类名。 */
    class?: string;
    /** 根自定义内联样式。 */
    style?: string;
  }

  let {
    content,
    editable = true,
    onContentChange,
    extensions = [],
    imgUploadProps,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();

  let editorHost: HTMLDivElement | undefined = $state();
  let editor = $state<Editor>();
  // 工具栏激活态（selectionUpdate/transaction 时刷新的纯 $state）。
  let toolbarState = $state<Record<string, boolean>>({});

  function computeToolbarState(ed: Editor): Record<string, boolean> {
    return {
      isBold: ed.isActive('bold'),
      isItalic: ed.isActive('italic'),
      isStrike: ed.isActive('strike'),
      isCode: ed.isActive('code'),
      isH1: ed.isActive('heading', { level: 1 }),
      isH2: ed.isActive('heading', { level: 2 }),
      isH3: ed.isActive('heading', { level: 3 }),
      isBulletList: ed.isActive('bulletList'),
      isOrderedList: ed.isActive('orderedList'),
      isBlockquote: ed.isActive('blockquote'),
      isLink: ed.isActive('link'),
      isAlignLeft: ed.isActive({ textAlign: 'left' }),
      isAlignCenter: ed.isActive({ textAlign: 'center' }),
      isAlignRight: ed.isActive({ textAlign: 'right' }),
      canUndo: ed.can().chain().undo().run(),
      canRedo: ed.can().chain().redo().run(),
    };
  }

  // —— tiptap 内核 + 扩展全程动态 import + editor 生命周期（内核不进主 bundle）——
  $effect(() => {
    const host = editorHost;
    if (!host) return;

    let ed: Editor | undefined;
    let destroyed = false;

    void (async () => {
      const [
        tiptapCore,
        { default: StarterKit },
        { TextStyleKit },
        { Image },
        { TextAlign },
        { SvelteNodeViewRenderer },
        { createImageUploadNode, createSelectionMark },
      ] = await Promise.all([
        import('@tiptap/core'),
        import('@tiptap/starter-kit'),
        import('@tiptap/extension-text-style'),
        import('@tiptap/extension-image'),
        import('@tiptap/extension-text-align'),
        import('svelte-tiptap'),
        import('./file-extensions.js'),
      ]);
      if (destroyed) return;

      const { Editor: TiptapEditor, Node, Mark, mergeAttributes } = tiptapCore;

      const imageUpload = createImageUploadNode(
        Node,
        mergeAttributes,
        SvelteNodeViewRenderer,
        imgUploadProps ?? {},
      );
      const selectionMark = createSelectionMark(Mark);

      const defaultExtensions = [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (StarterKit as any).configure({ link: { openOnClick: false } }),
        TextStyleKit,
        Image,
        selectionMark,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (TextAlign as any).configure({ types: ['heading', 'paragraph'] }),
        imageUpload,
      ];

      ed = new TiptapEditor({
        element: host,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extensions: [...defaultExtensions, ...(extensions as any[])] as never,
        editable,
        ...(content !== undefined ? { content } : {}),
        editorProps: {
          attributes: {
            role: 'textbox',
            'aria-multiline': 'true',
            'aria-label': loc().t('SideBar.fileEditor'),
            ...(editable ? {} : { 'aria-readonly': 'true' }),
          },
        },
        onCreate: ({ editor: created }) => {
          toolbarState = computeToolbarState(created);
        },
        onSelectionUpdate: ({ editor: updated }) => {
          toolbarState = computeToolbarState(updated);
        },
        onUpdate: ({ editor: updated }) => {
          toolbarState = computeToolbarState(updated);
          onContentChange?.(updated.getHTML());
        },
      });
      editor = ed;
    })();

    return () => {
      destroyed = true;
      ed?.destroy();
      editor = undefined;
    };
  });

  // editable 变化时同步给已创建的 editor（不重建）。
  $effect(() => {
    const ed = editor;
    if (ed) ed.setEditable(editable);
  });

  const rootCls = $derived(['cd-sidebar-file-item', className].filter(Boolean).join(' '));

  // —— 工具栏命令 ——
  const t = $derived(loc().t);
  function chain() {
    return editor?.chain().focus();
  }
</script>

<div class={rootCls} {style}>
  {#if editable}
    {#snippet toolBtn(
      label: string,
      onclick: () => void,
      active?: boolean,
      disabled?: boolean,
      icon?: Snippet,
    )}
      <button
        type="button"
        class="cd-sidebar-file-item__btn"
        class:cd-sidebar-file-item__btn--active={active}
        aria-label={label}
        aria-pressed={active ?? undefined}
        title={label}
        {disabled}
        {onclick}
      >
        {#if icon}{@render icon()}{/if}
      </button>
    {/snippet}

    <div class="cd-sidebar-file-item__menu" role="toolbar" aria-label={t('SideBar.fileToolbar')}>
      {@render toolBtn(t('SideBar.undo'), () => chain()?.undo().run(), false, !toolbarState.canUndo, undoIcon)}
      {@render toolBtn(t('SideBar.redo'), () => chain()?.redo().run(), false, !toolbarState.canRedo, redoIcon)}
      <span class="cd-sidebar-file-item__sep" aria-hidden="true"></span>
      {@render toolBtn(t('SideBar.heading1'), () => chain()?.toggleHeading({ level: 1 }).run(), toolbarState.isH1, false, h1Icon)}
      {@render toolBtn(t('SideBar.heading2'), () => chain()?.toggleHeading({ level: 2 }).run(), toolbarState.isH2, false, h2Icon)}
      {@render toolBtn(t('SideBar.heading3'), () => chain()?.toggleHeading({ level: 3 }).run(), toolbarState.isH3, false, h3Icon)}
      <span class="cd-sidebar-file-item__sep" aria-hidden="true"></span>
      {@render toolBtn(t('SideBar.bulletList'), () => chain()?.toggleBulletList().run(), toolbarState.isBulletList, false, bulletIcon)}
      {@render toolBtn(t('SideBar.orderedList'), () => chain()?.toggleOrderedList().run(), toolbarState.isOrderedList, false, orderedIcon)}
      {@render toolBtn(t('SideBar.blockquote'), () => chain()?.toggleBlockquote().run(), toolbarState.isBlockquote, false, quoteIcon)}
      <span class="cd-sidebar-file-item__sep" aria-hidden="true"></span>
      {@render toolBtn(t('SideBar.alignLeft'), () => chain()?.setTextAlign('left').run(), toolbarState.isAlignLeft, false, alignLeftIcon)}
      {@render toolBtn(t('SideBar.alignCenter'), () => chain()?.setTextAlign('center').run(), toolbarState.isAlignCenter, false, alignCenterIcon)}
      {@render toolBtn(t('SideBar.alignRight'), () => chain()?.setTextAlign('right').run(), toolbarState.isAlignRight, false, alignRightIcon)}
      <span class="cd-sidebar-file-item__sep" aria-hidden="true"></span>
      {@render toolBtn(t('SideBar.bold'), () => chain()?.toggleBold().run(), toolbarState.isBold, false, boldIcon)}
      {@render toolBtn(t('SideBar.italic'), () => chain()?.toggleItalic().run(), toolbarState.isItalic, false, italicIcon)}
      {@render toolBtn(t('SideBar.strike'), () => chain()?.toggleStrike().run(), toolbarState.isStrike, false, strikeIcon)}
      {@render toolBtn(t('SideBar.code'), () => chain()?.toggleCode().run(), toolbarState.isCode, false, codeIcon)}
      <span class="cd-sidebar-file-item__sep" aria-hidden="true"></span>
      {@render toolBtn(t('SideBar.image'), () => chain()?.insertContent({ type: 'imageUpload' }).run(), false, false, imageIcon)}
    </div>
  {/if}
  <div bind:this={editorHost} class="cd-sidebar-file-item__editor"></div>
</div>

{#snippet undoIcon()}<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8a5 5 0 1 1 1.5 3.5M3 8V4.5M3 8h3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>{/snippet}
{#snippet redoIcon()}<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8a5 5 0 1 0-1.5 3.5M13 8V4.5M13 8H9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>{/snippet}
{#snippet h1Icon()}<svg width="16" height="15" viewBox="0 0 18 16" fill="none" aria-hidden="true"><path d="M2 3v10M8 3v10M2 8h6M12 6l2-1v8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>{/snippet}
{#snippet h2Icon()}<svg width="16" height="15" viewBox="0 0 18 16" fill="none" aria-hidden="true"><path d="M2 3v10M8 3v10M2 8h6M12 6a1.5 1.5 0 1 1 2.6 1L12 13h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>{/snippet}
{#snippet h3Icon()}<svg width="16" height="15" viewBox="0 0 18 16" fill="none" aria-hidden="true"><path d="M2 3v10M8 3v10M2 8h6M12 5.5a1.4 1.4 0 1 1 1.3 2M12 12a1.5 1.5 0 1 0 1.4-2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>{/snippet}
{#snippet bulletIcon()}<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4h7M6 8h7M6 12h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="3" cy="4" r="1" fill="currentColor"/><circle cx="3" cy="8" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/></svg>{/snippet}
{#snippet orderedIcon()}<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4h7M6 8h7M6 12h7M2 3l1-.5V6M2 6h1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>{/snippet}
{#snippet quoteIcon()}<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 5a2 2 0 1 0 0 4M3 5c1 0 1.5 1 1.5 2.5S3.5 11 3 11M9 5a2 2 0 1 0 0 4M9 5c1 0 1.5 1 1.5 2.5S9.5 11 9 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>{/snippet}
{#snippet alignLeftIcon()}<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4h12M2 7h8M2 10h12M2 13h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>{/snippet}
{#snippet alignCenterIcon()}<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4h12M4 7h8M2 10h12M4 13h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>{/snippet}
{#snippet alignRightIcon()}<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4h12M6 7h8M2 10h12M6 13h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>{/snippet}
{#snippet boldIcon()}<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 3h5a2.5 2.5 0 0 1 0 5H4V3ZM4 8h5.5a2.5 2.5 0 0 1 0 5H4V8Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>{/snippet}
{#snippet italicIcon()}<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6.5 3h5M4.5 13h5M9 3l-2 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>{/snippet}
{#snippet strikeIcon()}<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M5 5.5a2.5 2 0 0 1 2.5-2c1.5 0 2.5.8 2.5 2M6 8.5c.5 1.2 1.5 1.8 2.5 1.8 1.5 0 2.5-.8 2.5-2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>{/snippet}
{#snippet codeIcon()}<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4L2.5 8 6 12M10 4l3.5 4-3.5 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>{/snippet}
{#snippet imageIcon()}<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="6" cy="6.5" r="1.2" stroke="currentColor" stroke-width="1.1"/><path d="M3 11l3-2.5 2.5 2 2-1.5L13 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>{/snippet}

<style>
  .cd-sidebar-file-item {
    display: flex;
    flex-direction: column;
    gap: var(--cd-sidebar-file-gap);
  }
  .cd-sidebar-file-item__menu {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--cd-sidebar-file-menu-gap);
    padding: var(--cd-sidebar-file-menu-padding);
    border-bottom: 1px solid var(--cd-sidebar-file-menu-border);
  }
  .cd-sidebar-file-item__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 26px;
    block-size: 26px;
    padding: 0;
    border: none;
    border-radius: var(--cd-sidebar-file-btn-radius);
    background: transparent;
    color: var(--cd-sidebar-file-btn-color);
    cursor: pointer;
    transition:
      background-color var(--cd-motion-duration-fast, 0.1s) var(--cd-motion-ease-standard, ease),
      color var(--cd-motion-duration-fast, 0.1s) var(--cd-motion-ease-standard, ease);
  }
  .cd-sidebar-file-item__btn:hover:not(:disabled) {
    background: var(--cd-sidebar-file-btn-hover-bg);
    color: var(--cd-sidebar-file-btn-color-hover);
  }
  .cd-sidebar-file-item__btn--active {
    background: var(--cd-sidebar-file-btn-active-bg);
    color: var(--cd-sidebar-file-btn-color-active);
  }
  .cd-sidebar-file-item__btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .cd-sidebar-file-item__btn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-sidebar-file-item__sep {
    inline-size: 1px;
    block-size: 16px;
    background: var(--cd-sidebar-file-menu-border);
  }
  .cd-sidebar-file-item__editor {
    color: var(--cd-sidebar-file-editor-color);
    font-size: var(--cd-sidebar-file-editor-size);
    line-height: var(--cd-sidebar-file-editor-line-height);
  }
  /* ProseMirror 编辑区（运行时注入 class）用 :global 命中。 */
  :global(.cd-sidebar-file-item__editor .ProseMirror) {
    outline: none;
    min-block-size: var(--cd-sidebar-file-editor-min-height);
  }
  :global(.cd-sidebar-file-item__editor .ProseMirror:focus) {
    outline: none;
  }
  :global(.cd-sidebar-file-item__editor .ProseMirror img) {
    max-inline-size: 100%;
    border-radius: var(--cd-sidebar-file-image-radius);
  }
  :global(.cd-sidebar-file-item__editor .ProseMirror .cd-sidebar-file-select) {
    background: var(--cd-sidebar-file-selection-bg);
  }
</style>
