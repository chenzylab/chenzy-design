<!--
  Content — Layout 内容区（对齐 Semi）。撑满剩余空间；纯布局容器，不附带背景/尺寸样式。
  语义元素为 <main>；与 Layout 共享 API（class / style / aria-label / role）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    /** 根元素自定义内联样式（透传）。 */
    style?: string;
    /** 可访问性标签（透传到根元素 aria-label）。 */
    ariaLabel?: string;
    /** 可访问性 role（透传到根元素，覆盖默认 main 语义）。 */
    role?: string;
    children?: Snippet;
  }

  let { class: className = '', style, ariaLabel, role, children }: Props = $props();

  const cls = $derived(['cd-layout-content', className].filter(Boolean).join(' '));
</script>

<main class={cls} {style} aria-label={ariaLabel} {role}>
  {@render children?.()}
</main>

<style>
  .cd-layout-content {
    flex: auto;
    min-height: auto;
    box-sizing: border-box;
  }
</style>
