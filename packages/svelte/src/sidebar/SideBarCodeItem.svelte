<!--
  SideBarCodeItem — 单个代码/JSON 预览项。
  对齐 Semi `sidebar/widget/code.tsx` 的 **CodeItem**（该文件同时导出 CodeItem 与
  默认导出 CodeContent，两者都是对外能力；本库此前只实现了列表版 CodeContent，
  把单项渲染内联在其中 —— 按 SOP「Semi 拆了本库就拆」补出本文件）。

  按 isJson 分流：true → JsonViewer（value=content，JSON 语义渲染，内核动态 import）；
  false → CodeHighlight（language 语法高亮）。透传 jsonViewerProps / codeHighlightProps。

  仅负责内容区渲染，不含 Collapse 折叠面板头部 —— 那是 SideBarCodeContent 列表场景
  才有的外层折叠列表/展开按钮（与 Semi 一致：CodeItem 不渲染 Collapse）。
  注意与之无关的另一层折叠：isJson 分支下 JsonViewer 内核对每一可折叠行都有自己的
  行内折叠三角（hover 该行行号列才出现），这是 JsonViewer 自身能力，与本组件是否
  包 Collapse 无关，CodeItem 单条渲染场景同样具备。
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import CodeHighlight from '../code-highlight/CodeHighlight.svelte';
  import JsonViewer from '../json-viewer/JsonViewer.svelte';

  /** JsonViewer 组件 props 子集（透传，非受控 value）。 */
  type JsonViewerProps = Partial<ComponentProps<typeof JsonViewer>>;
  /** CodeHighlight 组件 props 子集（透传）。 */
  type CodeHighlightProps = Partial<ComponentProps<typeof CodeHighlight>>;

  /** 单个代码/JSON 预览项。对齐 Semi CodeItemProps。 */
  export interface CodeItemProps {
    /** 折叠头显示名。 */
    name?: string;
    /** 唯一标识（折叠面板 key）。 */
    key: string;
    /** 是否按 JSON 渲染（true → JsonViewer；false → CodeHighlight）。 */
    isJson?: boolean;
    /** CodeHighlight 语言 id（isJson=false 时生效）。 */
    language?: string;
    /** 预览内容（CodeHighlight 的 code / JsonViewer 的 value）。 */
    content?: string;
    /** 透传给 JsonViewer 的额外 props（isJson=true 时）。 */
    jsonViewerProps?: JsonViewerProps;
    /** 透传给 CodeHighlight 的额外 props（isJson=false 时）。 */
    codeHighlightProps?: CodeHighlightProps;
  }

  interface Props {
    /** 待渲染的代码项。 */
    code: CodeItemProps;
    /** 根自定义类名。 */
    class?: string;
    /** 根自定义内联样式。 */
    style?: string;
  }

  let { code, class: className, style }: Props = $props();

  const rootCls = $derived(['cd-sidebar-code-content', className].filter(Boolean).join(' '));
</script>

<div class={rootCls} {style}>
  {#if code.isJson}
    <!-- Semi widget/code.tsx 传 options={strings.JSON_VIEWER_OPTIONS}（readOnly:true,
         autoWrap:true）——JSON 预览恒只读，本库原来漏传，默认可编辑。 -->
    <JsonViewer
      value={code.content ?? ''}
      width="100%"
      showSearch={false}
      options={{ readOnly: true, autoWrap: true }}
      {...code.jsonViewerProps}
    />
  {:else}
    <CodeHighlight
      code={code.content ?? ''}
      language={code.language ?? 'markup'}
      {...code.codeHighlightProps}
    />
  {/if}
</div>

<style>
  /* 对齐 Semi sidebar.scss:345-347 &-code-content { height:100% }，无 padding
     （本库原来自造了一层 padding，与列表场景 SideBarCodeContent 的 &-collapse-code
     content padding:12px 0px 叠加，展开态内容区顶部出现两段空白）。 */
  .cd-sidebar-code-content {
    block-size: 100%;
  }
  /* 对齐 Semi sidebar.scss:349-368（&-code-content, &-main-content 共用覆盖，
     本库原来完全没做这段）：CodeHighlight 默认主题 pre 标签去 margin/上下 padding、
     背景透明、纵向裁剪横向可滚；line-numbers 竖线在 sidebar 场景去掉
     （border-right:none，Semi CodeHighlight 通用默认值是 1px solid #999）；
     JsonViewer 同样去上下 padding + 背景透明。 */
  .cd-sidebar-code-content :global(.cd-code-highlight-defaultTheme pre[class*='language-']) {
    margin: 0;
    padding-block: 0;
    background-color: transparent;
    overflow-y: hidden;
    overflow-x: auto;
  }
  .cd-sidebar-code-content :global(.cd-code-highlight .line-numbers .line-numbers-rows) {
    border-right: none;
  }
  .cd-sidebar-code-content :global(.cd-json-viewer-editor) {
    padding-block: 0;
    background-color: transparent;
  }
</style>
