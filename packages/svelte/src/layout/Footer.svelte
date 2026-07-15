<!--
  Footer — Layout 底部区（对齐 Semi）。纯布局容器，不附带背景/尺寸样式，按需自定义。
  与 Layout 共享 API（class / style / aria-label / role）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    /** 根元素自定义内联样式（透传）。 */
    style?: string;
    /** 可访问性标签（透传到根元素 aria-label）。 */
    ariaLabel?: string;
    /** 可访问性 role（透传到根元素）。 */
    role?: string;
    children?: Snippet;
  }

  let { class: className = '', style, ariaLabel, role, children }: Props = $props();

  const cls = $derived(['cd-layout-footer', className].filter(Boolean).join(' '));
</script>

<footer class={cls} {style} aria-label={ariaLabel} {role}>
  {@render children?.()}
</footer>

<style>
  .cd-layout-footer {
    flex: 0 0 auto;
    box-sizing: border-box;
  }
</style>
