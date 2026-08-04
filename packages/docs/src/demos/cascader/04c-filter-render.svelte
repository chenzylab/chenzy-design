<script lang="ts">
  import { Cascader, Checkbox, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from './_data';
  import type { CascaderNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: 'Semi',
      value: 'Semi',
      children: [
        { label: 'Semi-Material Semi-Material Semi-Material Semi-Material', value: 'Semi-Material' },
        { label: 'Semi-DSM Semi-DSM Semi-DSM Semi-DSM', value: 'Semi-DSM' },
        { label: 'Semi Design Semi Design Semi Design Semi Design', value: 'Semi' },
        { label: 'Semi-C2D Semi-C2D Semi-C2D Semi-C2D Semi-C2D', value: 'Semi-C2D' },
        { label: 'Semi-D2C Semi-D2C Semi-D2C Semi-D2C Semi-D2C ', value: 'Semi-D2C' },
      ],
    },
  ];
</script>

<div>
  <p>鼠标 hover 到选项可查看被省略文本完整内容</p>
  <br />
  <Cascader
    style="width: 320px"
    {treeData}
    placeholder="单选，输入 s 自定义搜索选项渲染结果"
    filterTreeNode
  >
    {#snippet filterRender({ data, selected, onClick, className })}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <li
        class={className}
        role="treeitem"
        aria-selected={selected}
        style="justify-content: flex-start;"
        onclick={onClick}
      >
        <Text
          ellipsis={{ showTooltip: { opts: { style: 'word-break: break-all;' } } }}
          style="width: 270px; color: {selected ? 'var(--cd-color-primary)' : undefined}"
        >
          {(data as CascaderNode[]).map((item) => item.label).join(' / ')}
        </Text>
      </li>
    {/snippet}
  </Cascader>
  <br />
  <Cascader
    multiple
    style="width: 320px; margin-top: 20px"
    {treeData}
    placeholder="多选，输入 s 自定义搜索选项渲染结果"
    filterTreeNode
  >
    {#snippet filterRender({ data, checkStatus, onCheck, className })}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <li
        class={className}
        role="treeitem"
        aria-selected={checkStatus.checked}
        style="justify-content: flex-start;"
        onclick={() => onCheck()}
      >
        <Checkbox
          checked={checkStatus.checked}
          indeterminate={checkStatus.halfChecked}
          onChange={() => onCheck()}
          style="margin-right: 8px"
        />
        <Text
          ellipsis={{ showTooltip: { opts: { style: 'word-break: break-all;' } } }}
          style="width: 250px"
        >
          {(data as CascaderNode[]).map((item) => item.label).join(' / ')}
        </Text>
      </li>
    {/snippet}
  </Cascader>
</div>
