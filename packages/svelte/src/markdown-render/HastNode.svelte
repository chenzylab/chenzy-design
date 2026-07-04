<!--
  HastNode — internal recursive renderer for a single hast node (MarkdownRender).

  规则：
  - element 节点：查 components[tagName]，命中 → 渲染注册的 Svelte 组件（传 hast properties + children snippet）；
    未命中 → 渲染原生标签（属性经 hastPropsToAttrs 归一）。
  - text 节点：渲染文本。
  - root 节点：渲染其 children。
  - 其它节点（raw / comment / doctype 等）：忽略（对齐 Semi format='md' 不渲染 raw HTML）。

  安全：只渲染 element/text/root；raw/comment 一律跳过，除非使用方经 rehypePlugins 把它们转成 element。
-->
<script lang="ts">
  import type { Component } from 'svelte';
  import type { Root, Element, ElementContent, RootContent } from 'hast';
  import { hastPropsToAttrs } from './props.js';
  import Self from './HastNode.svelte';

  type Registry = Record<string, Component<any> | string>;

  interface Props {
    node: Root | ElementContent | RootContent;
    components: Registry;
  }

  let { node, components }: Props = $props();

  // 命中注册表的 Svelte 组件（string 值表示别名到另一原生标签，走原生分支）。
  const mapped = $derived(
    node.type === 'element' ? components[(node as Element).tagName] : undefined,
  );
  const CustomComp = $derived(typeof mapped === 'function' ? mapped : undefined);
  const aliasTag = $derived(typeof mapped === 'string' ? mapped : undefined);

  const attrs = $derived(
    node.type === 'element' ? hastPropsToAttrs((node as Element).properties) : {},
  );
  const childList = $derived(
    'children' in node ? (node.children as (ElementContent | RootContent)[]) : [],
  );
</script>

{#snippet renderChildren(list: (ElementContent | RootContent)[])}
  {#each list as child, i (i)}
    <Self node={child} {components} />
  {/each}
{/snippet}

{#if node.type === 'text'}
  {node.value}
{:else if node.type === 'root'}
  {@render renderChildren(childList)}
{:else if node.type === 'element'}
  {@const el = node as Element}
  {#if CustomComp}
    <!-- 注册的 Svelte 组件：透传 hast properties（原始）与 children snippet -->
    <CustomComp {...el.properties ?? {}} node={el}>
      {@render renderChildren(childList)}
    </CustomComp>
  {:else}
    {@const Tag = aliasTag ?? el.tagName}
    <svelte:element this={Tag} {...attrs}>
      {@render renderChildren(childList)}
    </svelte:element>
  {/if}
{/if}
