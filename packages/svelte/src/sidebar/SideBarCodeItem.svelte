<!--
  SideBarCodeItem — 单个代码/JSON 预览项。
  对齐 Semi `sidebar/widget/code.tsx` 的 **CodeItem**（该文件同时导出 CodeItem 与
  默认导出 CodeContent，两者都是对外能力；本库此前只实现了列表版 CodeContent，
  把单项渲染内联在其中 —— 按 SOP「Semi 拆了本库就拆」补出本文件）。

  按 isJson 分流：true → JsonViewer（value=content，JSON 语义渲染，内核动态 import）；
  false → CodeHighlight（language 语法高亮）。透传 jsonViewerProps / codeHighlightProps。

  仅负责内容区渲染，不含折叠头 —— 折叠列表与展开按钮由 SideBarCodeContent 承担
  （与 Semi 一致：CodeItem 不渲染 Collapse）。
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

  const rootCls = $derived(['cd-sidebar-code-content-body', className].filter(Boolean).join(' '));
</script>

<div class={rootCls} {style}>
  {#if code.isJson}
    <JsonViewer value={code.content ?? ''} width="100%" showSearch={false} {...code.jsonViewerProps} />
  {:else}
    <CodeHighlight
      code={code.content ?? ''}
      language={code.language ?? 'markup'}
      {...code.codeHighlightProps}
    />
  {/if}
</div>

<style>
  /* 内容区内边距（原在 SideBarCodeContent，随元素搬来 —— scoped 类不跨组件）。 */
  .cd-sidebar-code-content-body {
    padding: var(--cd-sidebar-code-body-padding);
  }
</style>
