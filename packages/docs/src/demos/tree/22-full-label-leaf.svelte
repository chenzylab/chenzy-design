<script lang="ts">
  import { Tree, Checkbox } from '@chenzy-design/svelte';
  import type { TreeNodeData } from '@chenzy-design/core';

  const treeData: TreeNodeData[] = [
    {
      label: 'Asia',
      value: 'Asia',
      key: '0',
      children: [
        {
          label: 'China',
          value: 'China',
          key: '0-0',
          children: [
            {
              label: 'Beijing',
              value: 'Beijing',
              key: '0-0-0',
            },
            {
              label: 'Shanghai',
              value: 'Shanghai',
              key: '0-0-1',
            },
          ],
        },
        {
          label: 'Japan',
          value: 'Japan',
          key: '0-1',
          children: [
            {
              label: 'Osaka',
              value: 'Osaka',
              key: '0-1-0',
            },
          ],
        },
      ],
    },
    {
      label: 'North America',
      value: 'North America',
      key: '1',
      children: [
        {
          label: 'United States',
          value: 'United States',
          key: '1-0',
        },
        {
          label: 'Canada',
          value: 'Canada',
          key: '1-1',
        },
      ],
    },
  ];
</script>

<Tree {treeData} renderFullLabel={renderLabel} multiple leafOnly style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border)" />

{#snippet renderLabel(ctx: {
  className: string;
  style: string | undefined;
  isLeaf: boolean;
  checkStatus: { checked: boolean; halfChecked: boolean };
  expandStatus: { expanded: boolean; loading: boolean };
  data: TreeNodeData;
  expandIcon: any;
  onCheck: (e: MouseEvent) => void;
  onExpand: (e: MouseEvent) => void;
})}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class={ctx.className}
    style={ctx.style}
    role="treeitem"
    aria-selected={ctx.checkStatus.checked}
    tabindex="-1"
    onclick={ctx.isLeaf ? ctx.onCheck : ctx.onExpand}
  >
    {#if !ctx.isLeaf}
      {@render ctx.expandIcon(ctx.expandStatus)}
    {/if}
    {#if ctx.isLeaf}
      <div role="checkbox" tabindex="-1" aria-checked={ctx.checkStatus.checked} onclick={ctx.onCheck}>
        <Checkbox
          indeterminate={ctx.checkStatus.halfChecked}
          checked={ctx.checkStatus.checked}
          style="margin-right: 8px"
        />
      </div>
    {/if}
    <span>{ctx.data.label}</span>
  </div>
{/snippet}
