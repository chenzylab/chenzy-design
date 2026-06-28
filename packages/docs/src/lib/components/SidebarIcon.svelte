<script lang="ts">
  import { componentIcons, categoryColor } from '$lib/component-icons';

  // name：lowercase 组件名；category：分类（决定配色）
  const { name, category }: { name: string; category: string } = $props();

  const path = $derived(componentIcons[name] ?? componentIcons._fallback);
  const color = $derived(categoryColor[category] ?? categoryColor._default);
</script>

<span class="sidebar-icon" style:--icon-color={color} aria-hidden="true">
  <!-- fill/stroke 设在 <svg> 上由子元素继承；个别元素可用 fill="currentColor" 等覆盖 -->
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    {@html path}
  </svg>
</span>

<style>
  .sidebar-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    border-radius: 6px;
    background: color-mix(in srgb, var(--icon-color) 14%, transparent);
    color: var(--icon-color);
  }
  .sidebar-icon :global(svg) {
    display: block;
  }
</style>
