<script lang="ts">
  import { Cascader, Checkbox, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from './_data';
  import type { CascaderNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = ['通用', '场景'].map((label, m) => ({
    label,
    value: m,
    children: Array.from({ length: 100 }, (_, n) => ({
      value: `${m}-${n}`,
      label: `${m}-${n} 第二级`,
      children: Array.from({ length: 20 }, (_, o) => ({
        value: `${m}-${n}-${o}`,
        label: `${m}-${n}-${o} 第三级详细内容`,
      })),
    })),
  }));

  // 高度为面板默认高度 180px 减去上下 padding 2 * 8px。
  const virtualize = { height: 172, width: 320, itemSize: 36 };
</script>

<Cascader
  multiple
  filterTreeNode
  style="width: 320px"
  {treeData}
  placeholder="输入 通用 or 场景 进行搜索"
  virtualizeInSearch={virtualize}
>
  {#snippet filterRender({ data, onCheck, checkStatus, className })}
    <div class={className} style="justify-content: start; padding: 8px 16px 8px 12px; box-sizing: border-box;">
      <Checkbox
        checked={checkStatus.checked}
        indeterminate={checkStatus.halfChecked}
        onChange={() => onCheck()}
        style="margin-right: 8px"
      />
      <Text
        ellipsis={{ showTooltip: { opts: { style: 'word-break: break-all;' } } }}
        style="max-width: 260px"
      >
        {(data as CascaderNode[]).map((item) => item.label).join(' | ')}
      </Text>
    </div>
  {/snippet}
</Cascader>
