<script lang="ts">
  import type { Component } from 'svelte';
  import * as IconsLab from '@chenzy-design/icons-lab';
  import { componentIcons, categoryColor } from '$lib/component-icons';

  // name：lowercase 组件名（路由/配色/别名键）；displayName：原始驼峰组件名（图标名匹配，
  // 如 InputNumber → IconInputNumber，避免 lowercase 丢驼峰导致匹配失败）。
  // size：图标渲染尺寸（px）。侧边栏默认 24（对齐 Semi docs 侧栏）；prev/next 卡片传 40
  // （对齐 Semi PrevAndNext nav-icon font-size:40px）。
  const {
    name,
    displayName,
    category,
    size = 24,
  }: { name: string; displayName?: string; category: string; size?: number } = $props();

  // 组件名 → icons-lab 具名图标（对齐 Semi 官网侧边栏彩色组件图标 @douyinfe/semi-icons-lab）。
  // 多数同名（input → IconInput）；少数组件名与图标名不一致的走别名表。
  // 别名：组件名 → icons-lab 现有图标名。优先复用 icons-lab 已有图标（对齐 Semi 官网做法：
  // 官网也复用，如 HotKeys 用齿轮 = IconConfig）；仅 icons-lab 确无对应的才新建专属图标。
  const alias: Record<string, string> = {
    colorpicker: 'ColorPlatte',
    configprovider: 'Config',
    markdownrender: 'Markdown',
    nav: 'Navigation',
    overflowlist: 'Overflow',
    localeprovider: 'LocaleProvider',
    inputgroup: 'Input',
    textarea: 'Input',
    hotkeys: 'Config', // Semi 官网 HotKeys 用齿轮图标 = IconConfig（复用，对齐 Semi）
    autocomplete: 'Autocomplete', // 图标名非驼峰
    pincode: 'Pincode', // 图标名非驼峰
    resizable: 'Steps', // Semi content/basic/resizable frontmatter icon: doc-steps（复用 Steps 图标）
  };

  const labIcons = IconsLab as unknown as Record<string, Component>;

  // 解析出对应的 icons-lab 具名图标组件：先别名表（lowercase 键），再用原始驼峰组件名同名匹配。
  const LabIcon = $derived.by<Component | undefined>(() => {
    const key = alias[name] ?? displayName ?? name.charAt(0).toUpperCase() + name.slice(1);
    return labIcons[`Icon${key}`];
  });

  // fallback：icons-lab 无对应（多为本库特有组件）时用手绘 path + 分类配色。
  const fallbackPath = $derived(componentIcons[name] ?? componentIcons._fallback);
  const fallbackColor = $derived(categoryColor[category] ?? categoryColor._default);
</script>

{#if LabIcon}
  <!-- icons-lab 彩色具名图标（自带色，对齐 Semi 官网侧边栏）。尺寸由 font-size 驱动（size prop）。 -->
  <span class="sidebar-icon-lab" style:--icon-size="{size}px" aria-hidden="true">
    <LabIcon size="inherit" />
  </span>
{:else}
  <!-- fallback：本库特有组件无 icons-lab 图标，用手绘 path + 分类配色。 -->
  <span class="sidebar-icon" style:--icon-color={fallbackColor} style:--icon-size="{size}px" aria-hidden="true">
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      {@html fallbackPath}
    </svg>
  </span>
{/if}

<style>
  .sidebar-icon-lab {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--icon-size, 24px);
    height: var(--icon-size, 24px);
    flex-shrink: 0;
    /* icons-lab 图标 size=inherit → font-size 驱动尺寸。默认 24px 对齐 Semi docs 侧栏；
       prev/next 卡片传 size=40 时随 --icon-size 放大（对齐 Semi nav-icon 40px）。 */
    font-size: var(--icon-size, 24px);
  }
  .sidebar-icon-lab :global(svg) {
    display: block;
  }
  /* fallback 手绘图标：严格对齐 Semi Nav（图标无背景块，直接着分类色）；尺寸随 --icon-size。 */
  .sidebar-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--icon-size, 24px);
    height: var(--icon-size, 24px);
    flex-shrink: 0;
    color: var(--icon-color);
  }
  .sidebar-icon :global(svg) {
    display: block;
  }
</style>
