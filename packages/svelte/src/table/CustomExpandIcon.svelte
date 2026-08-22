<!--
  CustomExpandIcon — 展开/树形图标按钮（对齐 Semi CustomExpandIcon.tsx）：
  componentType='expand' 用 IconChevronRight，'tree' 用 IconTreeTriangleRight；
  expandIcon 自定义覆盖默认图标。

  范围声明：本批只做结构抽离，动画机制不变（仍是 CSS class 切换 + transition 旋转，
  非 Semi 的 CSSAnimation enter/leave 状态机）——动画对齐属于任务 #10，单独处理。

  分组标题行（SectionRow）的展开指示器是非交互 <span>（无 aria-label/自身 onclick，
  点击由整个分组行代理），语义与本组件（可独立 focus 的 <button>）不同，不在此复用，
  留在 Table.svelte 内联（任务 #4 SectionRow 抽离时再处理）。
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { Snippet } from 'svelte';
  import { IconChevronRight, IconTreeTriangleRight } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';

  let {
    expanded,
    componentType = 'expand',
    expandIcon,
    record,
    onClick,
  }: {
    expanded: boolean;
    componentType?: 'expand' | 'tree';
    expandIcon?: Snippet<[{ expanded: boolean; record: T }]> | undefined;
    record: T;
    onClick: (e: MouseEvent) => void;
  } = $props();

  const loc = useLocale();
</script>

<button
  type="button"
  class="cd-table-expand-icon"
  class:cd-table-expandedIcon-show={expanded}
  aria-expanded={expanded}
  aria-label={expanded ? loc().t('Table.collapseRow') : loc().t('Table.expandRow')}
  onclick={(e) => {
    e.stopPropagation();
    onClick(e);
  }}
>
  {#if expandIcon}
    {@render expandIcon({ expanded, record })}
  {:else if componentType === 'tree'}
    <IconTreeTriangleRight size="small" aria-hidden="true" />
  {:else}
    <IconChevronRight size="small" aria-hidden="true" />
  {/if}
</button>
