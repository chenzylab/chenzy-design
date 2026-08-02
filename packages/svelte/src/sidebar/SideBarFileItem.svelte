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
  // 复用现有组件：Semi MenuBar 用的就是 Button / Divider / Dropdown / Input / Toast。
  import { Button } from '../button/index.js';
  import { Divider } from '../divider/index.js';
  import { Dropdown } from '../dropdown/index.js';
  import Input from '../input/Input.svelte';
  import { Toast } from '../toast/index.js';
  import {
    IconUndo,
    IconRedo,
    IconHn,
    IconH1,
    IconH2,
    IconH3,
    IconH4,
    IconH5,
    IconH6,
    IconText,
    IconList,
    IconOrderedList,
    IconQuote,
    IconMinus,
    IconAlignLeft,
    IconAlignCenter,
    IconAlignRight,
    IconAlignJustify,
    IconBold,
    IconItalic,
    IconStrikeThrough,
    IconCode,
    IconLink,
    IconImage,
    IconCheckCircleStroked,
    IconDeleteStroked,
  } from '@chenzy-design/icons';

  /** Hn 下拉里 H1–H6 六个图标，按 level 顺序取用。 */
  const headingIcons = [IconH1, IconH2, IconH3, IconH4, IconH5, IconH6];

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

  /** 工具栏激活态。字段逐条对齐 Semi useEditorState 的 selector。 */
  function computeToolbarState(ed: Editor): Record<string, boolean> {
    return {
      isBold: ed.isActive('bold'),
      isItalic: ed.isActive('italic'),
      isStrike: ed.isActive('strike'),
      isCode: ed.isActive('code'),
      isCodeBlock: ed.isActive('codeBlock'),
      // Hn 下拉：整体激活态 + 六级各自激活态（对齐 Semi isHeading / isHeading1..6）。
      isHeading: ed.isActive('heading'),
      isHeading1: ed.isActive('heading', { level: 1 }),
      isHeading2: ed.isActive('heading', { level: 2 }),
      isHeading3: ed.isActive('heading', { level: 3 }),
      isHeading4: ed.isActive('heading', { level: 4 }),
      isHeading5: ed.isActive('heading', { level: 5 }),
      isHeading6: ed.isActive('heading', { level: 6 }),
      isParagraph: ed.isActive('paragraph'),
      isBulletList: ed.isActive('bulletList'),
      isOrderedList: ed.isActive('orderedList'),
      isBlockquote: ed.isActive('blockquote'),
      isLink: ed.isActive('link'),
      isAlignLeft: ed.isActive({ textAlign: 'left' }),
      isAlignCenter: ed.isActive({ textAlign: 'center' }),
      isAlignRight: ed.isActive({ textAlign: 'right' }),
      isAlignJustify: ed.isActive({ textAlign: 'justify' }),
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

  // —— 链接弹层（逐条对齐 Semi handleConfirmLink / handleUnsetLink）——
  let linkVisible = $state(false);
  let linkValue = $state('');
  // 打开弹层时记下选区：输入框会抢焦点，编辑器选区随后不可靠。
  let linkRange = $state<{ from: number; to: number } | null>(null);

  /**
   * 开合弹层（对齐 Semi onVisibleChange）：
   * 打开时记录选区 + 有选区则打 selectionMark（让用户输入时仍看得见选中区域），
   * 回填当前链接地址；关闭时清掉 selectionMark。
   */
  function handleLinkVisibleChange(visible: boolean): void {
    linkVisible = visible;
    const ed = editor;
    if (!ed) return;
    if (visible) {
      const { from, to } = ed.state.selection;
      linkRange = { from, to };
      if (from !== to) {
        (ed.chain().focus() as never as { setMark(n: string): { run(): void } })
          .setMark('selectionMark')
          .run();
      }
      linkValue = (ed.getAttributes('link') as { href?: string })?.href ?? '';
    } else {
      (ed.chain().focus() as never as { unsetMark(n: string): { run(): void } })
        .unsetMark('selectionMark')
        .run();
      linkRange = null;
    }
  }

  function confirmLink(): void {
    const href = linkValue.trim();
    const ed = editor;
    if (!href || !ed) return;
    const { from, to } = linkRange ?? ed.state.selection;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = ed.chain().focus() as any;
    if (from !== to) {
      // 有选区：给选中文字加链接。
      c.setTextSelection({ from, to }).extendMarkRange('link').setLink({ href }).unsetMark('selectionMark').run();
    } else {
      // 无选区只有光标：在光标处插入一段带链接的文字（文本即 href，对齐 Semi）。
      c.setTextSelection(from)
        .insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] })
        .unsetMark('selectionMark')
        .run();
    }
    Toast.success({ content: t('SideBar.linkAddSuccess') });
    linkVisible = false;
    linkRange = null;
  }

  function unsetLink(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (editor?.chain().focus() as any)?.unsetLink().unsetMark('selectionMark').run();
    Toast.success({ content: t('SideBar.linkRemoveSuccess') });
    linkVisible = false;
    linkRange = null;
  }

  function handleLinkKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') confirmLink();
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
        class="cd-sidebar-file-menu-bar-btn"
        class:cd-sidebar-file-item-btn-active={active}
        aria-label={label}
        aria-pressed={active ?? undefined}
        title={label}
        {disabled}
        {onclick}
      >
        {#if icon}{@render icon()}{/if}
      </button>
    {/snippet}

    <!--
      按钮顺序/分隔线位置/命令逐条对齐 Semi MenuBar：
      undo redo │ Hn▾ Text List OrderedList Quote CB Minus │ Align×4 │ Bold Italic Strike Code Link▾ │ Image
      共 4 条 Divider。图标全部换成具名图标（此前是 20 段手写 svg）。
    -->
    <div class="cd-sidebar-file-menu-bar" role="toolbar" aria-label={t('SideBar.fileToolbar')}>
      {@render toolBtn(t('SideBar.undo'), () => chain()?.undo().run(), false, !toolbarState.canUndo, undoIcon)}
      {@render toolBtn(t('SideBar.redo'), () => chain()?.redo().run(), false, !toolbarState.canRedo, redoIcon)}
      <Divider layout="vertical" />

      <!-- 标题下拉：H1–H6 六项，各带激活态（对齐 Semi Dropdown + IconHn 触发器）。 -->
      <Dropdown
        trigger="click"
        position="bottomStart"
        className="cd-sidebar-file-menu-bar-heading-dropdown"
      >
        {#snippet render()}
          <Dropdown.Menu>
            {#each [1, 2, 3, 4, 5, 6] as const as level (level)}
              {@const HeadIcon = headingIcons[level - 1]!}
              <Dropdown.Item
                class={toolbarState[`isHeading${level}`]
                  ? 'cd-sidebar-file-menu-bar-dropdown-item-active'
                  : ''}
                onClick={() => chain()?.toggleHeading({ level }).run()}
              >
                <HeadIcon />
              </Dropdown.Item>
            {/each}
          </Dropdown.Menu>
        {/snippet}
        {@render toolBtn(t('SideBar.heading'), () => {}, toolbarState.isHeading, false, hnIcon)}
      </Dropdown>

      {@render toolBtn(t('SideBar.paragraph'), () => chain()?.setParagraph().run(), toolbarState.isParagraph, false, textIcon)}
      {@render toolBtn(t('SideBar.bulletList'), () => chain()?.toggleBulletList().run(), toolbarState.isBulletList, false, bulletIcon)}
      {@render toolBtn(t('SideBar.orderedList'), () => chain()?.toggleOrderedList().run(), toolbarState.isOrderedList, false, orderedIcon)}
      <!-- 对齐 Semi：这里用 setBlockquote（不是 toggle）。 -->
      {@render toolBtn(t('SideBar.blockquote'), () => chain()?.setBlockquote().run(), toolbarState.isBlockquote, false, quoteIcon)}
      <!-- 代码块：Semi 该按钮无图标，直接显示 "CB" 文字 + -btn-codeblock 类。 -->
      <button
        type="button"
        class="cd-sidebar-file-menu-bar-btn cd-sidebar-file-menu-bar-btn-codeblock"
        class:cd-sidebar-file-menu-bar-btn-active={toolbarState.isCodeBlock}
        aria-label={t('SideBar.codeBlock')}
        aria-pressed={toolbarState.isCodeBlock}
        title={t('SideBar.codeBlock')}
        onclick={() => chain()?.toggleCodeBlock().run()}
      >
        CB
      </button>
      {@render toolBtn(t('SideBar.divider'), () => chain()?.setHorizontalRule().run(), false, false, minusIcon)}
      <Divider layout="vertical" />

      {@render toolBtn(t('SideBar.alignLeft'), () => chain()?.setTextAlign('left').run(), toolbarState.isAlignLeft, false, alignLeftIcon)}
      {@render toolBtn(t('SideBar.alignCenter'), () => chain()?.setTextAlign('center').run(), toolbarState.isAlignCenter, false, alignCenterIcon)}
      {@render toolBtn(t('SideBar.alignRight'), () => chain()?.setTextAlign('right').run(), toolbarState.isAlignRight, false, alignRightIcon)}
      {@render toolBtn(t('SideBar.alignJustify'), () => chain()?.setTextAlign('justify').run(), toolbarState.isAlignJustify, false, alignJustifyIcon)}
      <Divider layout="vertical" />

      {@render toolBtn(t('SideBar.bold'), () => chain()?.toggleBold().run(), toolbarState.isBold, false, boldIcon)}
      {@render toolBtn(t('SideBar.italic'), () => chain()?.toggleItalic().run(), toolbarState.isItalic, false, italicIcon)}
      {@render toolBtn(t('SideBar.strike'), () => chain()?.toggleStrike().run(), toolbarState.isStrike, false, strikeIcon)}
      {@render toolBtn(t('SideBar.code'), () => chain()?.toggleCode().run(), toolbarState.isCode, false, codeIcon)}

      <!--
        链接弹层（对齐 Semi）：开合时 set/unset selectionMark 保持选区可见
        （否则输入框抢焦点后编辑区选区就看不见了）。
      -->
      <Dropdown
        trigger="custom"
        position="bottomStart"
        className="cd-sidebar-file-menu-bar-link-dropdown"
        visible={linkVisible}
        onVisibleChange={handleLinkVisibleChange}
      >
        {#snippet render()}
          <div class="cd-sidebar-file-menu-bar-link-dropdown-body">
            <Input
              size="small"
              placeholder={t('SideBar.enterLinkAddress')}
              value={linkValue}
              className="cd-sidebar-file-menu-bar-link-input"
              onInput={(v) => (linkValue = v)}
              onKeydown={handleLinkKeydown}
            />
            <Button
              size="small"
              theme="borderless"
              type="tertiary"
              aria-label={t('SideBar.linkConfirm')}
              disabled={!linkValue.trim()}
              onclick={confirmLink}
            >
              {#snippet icon()}<IconCheckCircleStroked />{/snippet}
            </Button>
            <Button
              size="small"
              theme="borderless"
              aria-label={t('SideBar.linkRemove')}
              disabled={!toolbarState.isLink}
              onclick={unsetLink}
            >
              {#snippet icon()}<IconDeleteStroked />{/snippet}
            </Button>
          </div>
        {/snippet}
        {@render toolBtn(
          t('SideBar.link'),
          () => handleLinkVisibleChange(!linkVisible),
          toolbarState.isLink,
          false,
          linkIcon,
        )}
      </Dropdown>
      <Divider layout="vertical" />

      {@render toolBtn(t('SideBar.image'), () => chain()?.insertContent({ type: 'imageUpload' }).run(), false, false, imageIcon)}
    </div>
  {/if}
  <!-- Semi widget/file.tsx:446 的 EditorContent 类名是 `${cssClasses.FILE}-editor`
       = semi-sidebar-file-editor；本库原来漏了中间的 -file 段。 -->
  <div bind:this={editorHost} class="cd-sidebar-file-editor"></div>
</div>


<!-- 图标全部走本库具名图标（对齐 Semi：其 MenuBar 用的就是这些具名图标）。
     此前这里是 16 段手写 <svg>，与图标包各画各的。 -->
{#snippet undoIcon()}<IconUndo />{/snippet}
{#snippet redoIcon()}<IconRedo />{/snippet}
{#snippet hnIcon()}<IconHn />{/snippet}
{#snippet textIcon()}<IconText />{/snippet}
{#snippet bulletIcon()}<IconList />{/snippet}
{#snippet orderedIcon()}<IconOrderedList />{/snippet}
{#snippet quoteIcon()}<IconQuote />{/snippet}
{#snippet minusIcon()}<IconMinus />{/snippet}
{#snippet alignLeftIcon()}<IconAlignLeft />{/snippet}
{#snippet alignCenterIcon()}<IconAlignCenter />{/snippet}
{#snippet alignRightIcon()}<IconAlignRight />{/snippet}
{#snippet alignJustifyIcon()}<IconAlignJustify />{/snippet}
{#snippet boldIcon()}<IconBold />{/snippet}
{#snippet italicIcon()}<IconItalic />{/snippet}
{#snippet strikeIcon()}<IconStrikeThrough />{/snippet}
{#snippet codeIcon()}<IconCode />{/snippet}
{#snippet linkIcon()}<IconLink />{/snippet}
{#snippet imageIcon()}<IconImage />{/snippet}

<style>
  .cd-sidebar-file-item {
    display: flex;
    flex-direction: column;
    gap: var(--cd-sidebar-file-gap);
  }
  /* 逐条对齐 Semi &-file &-menu-bar：上下都有边框、居中、gap 2px、padding 2px/12px。
     本库原来只有下边框、gap/padding 走自造 token。 */
  .cd-sidebar-file-menu-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--cd-sidebar-file-menu-bar-gap);
    border-top: var(--cd-width-sidebar-menu-bar-border-top) solid
      var(--cd-color-sidebar-menu-bar-border-top);
    border-bottom: var(--cd-width-sidebar-menu-bar-border-bottom) solid
      var(--cd-color-sidebar-menu-bar-border-bottom);
    padding: var(--cd-sidebar-file-menu-bar-padding-y)
      var(--cd-sidebar-file-menu-bar-padding-x);
  }

  /* Semi &-menu-bar-dropdown-item-active：Hn 下拉里当前级别高亮。 */
  :global(.cd-sidebar-file-menu-bar-dropdown-item-active) {
    color: var(--cd-sidebar-menu-bar-dropdown-item-active-text);
    background: var(--cd-sidebar-menu-bar-dropdown-item-active-bg);
  }

  /* Semi：菜单栏里的竖分隔线不要外边距。 */
  .cd-sidebar-file-menu-bar :global(.cd-divider-vertical) {
    margin: var(--cd-sidebar-menu-bar-divider-margin);
  }

  /* Semi &-menu-bar-btn-codeblock：无图标的 "CB" 文字按钮。 */
  .cd-sidebar-file-menu-bar-btn-codeblock {
    font-size: var(--cd-sidebar-file-menu-bar-codeblock-font-size);
    line-height: var(--cd-sidebar-file-menu-bar-codeblock-line-height);
    padding: var(--cd-sidebar-file-menu-bar-codeblock-padding);
  }

  /* Semi &-menu-bar-link-dropdown：输入框 + 两个按钮一行居中。浮层 portal 到 body 故 :global。 */
  :global(.cd-sidebar-file-menu-bar-link-dropdown-body) {
    padding: var(--cd-sidebar-file-menu-bar-link-dropdown-padding);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cd-sidebar-file-menu-bar-btn {
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
  .cd-sidebar-file-menu-bar-btn:hover:not(:disabled) {
    background: var(--cd-sidebar-file-btn-hover-bg);
    color: var(--cd-sidebar-file-btn-color-hover);
  }
  .cd-sidebar-file-item-btn-active {
    background: var(--cd-sidebar-file-btn-active-bg);
    color: var(--cd-sidebar-file-btn-color-active);
  }
  .cd-sidebar-file-menu-bar-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .cd-sidebar-file-menu-bar-btn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-sidebar-file-editor {
    color: var(--cd-sidebar-file-editor-color);
    font-size: var(--cd-sidebar-file-editor-size);
    line-height: var(--cd-sidebar-file-editor-line-height);
  }
  /* ProseMirror 编辑区（运行时注入 class）用 :global 命中。 */
  :global(.cd-sidebar-file-editor .ProseMirror) {
    outline: none;
    min-block-size: var(--cd-sidebar-file-editor-min-height);
  }
  :global(.cd-sidebar-file-editor .ProseMirror:focus) {
    outline: none;
  }
  :global(.cd-sidebar-file-editor .ProseMirror img) {
    max-inline-size: 100%;
    border-radius: var(--cd-sidebar-file-image-radius);
  }
  :global(.cd-sidebar-file-editor .ProseMirror .cd-sidebar-file-select) {
    display: inline-block;
    background: var(--cd-sidebar-file-selection-bg);
    line-height: var(--cd-font-sidebar-file-lineheight);
  }

  /* —— 正文内容样式（逐条对齐 Semi sidebar.scss:455-520 的 .tiptap 块）——
     本库此前只给编辑器容器/focus/img/select 写了样式，正文字号行高、选区高亮、
     placeholder、段落、引用块、行内代码、代码块、分割线**一条都没有** ——
     全靠浏览器默认样式，而 Semi 这 21 条变量本库也一条没建。 */
  :global(.cd-sidebar-file-editor .ProseMirror) {
    font-size: var(--cd-font-sidebar-file-fontsize);
    line-height: var(--cd-font-sidebar-file-lineheight);
  }

  :global(.cd-sidebar-file-editor .ProseMirror ::selection) {
    background: var(--cd-sidebar-file-selection-bg);
  }

  /* placeholder：tiptap 给空首段打 is-editor-empty，内容取 data-placeholder。 */
  :global(.cd-sidebar-file-editor .ProseMirror p.is-editor-empty:first-child::before) {
    color: var(--cd-color-sidebar-file-placeholder-text);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  :global(.cd-sidebar-file-editor .ProseMirror p) {
    margin: 0;
    white-space: pre-wrap;
    color: var(--cd-color-sidebar-file-text);
  }

  :global(.cd-sidebar-file-editor .ProseMirror blockquote) {
    border-left: var(--cd-width-sidebar-file-blockquote-border-left) solid
      var(--cd-color-sidebar-file-blockquote-border-left);
    margin: var(--cd-sidebar-file-blockquote-margin-y)
      var(--cd-sidebar-file-blockquote-margin-x);
    padding-left: var(--cd-sidebar-file-blockquote-padding-left);
  }

  :global(.cd-sidebar-file-editor .ProseMirror pre) {
    background-color: var(--cd-color-sidebar-file-pre-bg);
    padding: var(--cd-sidebar-file-pre-padding-y) var(--cd-sidebar-file-pre-padding-x);
    border-radius: var(--cd-radius-sidebar-file-pre);
    border: var(--cd-width-sidebar-file-pre-border) solid
      var(--cd-color-sidebar-file-pre-border);
    overflow: auto;
    font-size: var(--cd-font-sidebar-file-pre-fontsize);
    line-height: var(--cd-font-sidebar-file-pre-lineheight);
  }

  /* 代码块里的 code 不再叠一层底色（Semi 显式置 transparent）。 */
  :global(.cd-sidebar-file-editor .ProseMirror pre code) {
    background-color: transparent;
  }

  :global(.cd-sidebar-file-editor .ProseMirror code) {
    background-color: var(--cd-color-sidebar-file-code-bg);
    padding: var(--cd-sidebar-file-code-padding-y) var(--cd-sidebar-file-code-padding-x);
  }

  :global(.cd-sidebar-file-editor .ProseMirror hr) {
    border: none;
    border-top: var(--cd-width-sidebar-file-hr-border) solid
      var(--cd-color-sidebar-file-hr-border-top);
  }
</style>
