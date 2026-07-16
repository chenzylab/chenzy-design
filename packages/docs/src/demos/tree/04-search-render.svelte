<script lang="ts">
  import { Tree, Input } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      label: '亚洲',
      key: 'asia',
      children: [
        { label: '中国', key: 'china', children: [{ label: '北京', key: 'beijing' }] },
        { label: '日本', key: 'japan' },
      ],
    },
    { label: '北美洲', key: 'na', children: [{ label: '美国', key: 'us' }] },
  ];
</script>

<div style="width:260px">
  <!-- searchRender：自定义搜索框渲染（这里加了自定义 placeholder 与前缀文案） -->
  <Tree style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box" {treeData} filterTreeNode defaultExpandAll ariaLabel="自定义搜索框树">
    {#snippet searchRender({ value, placeholder, onChange, onClear, showClear })}
      <Input
        {value}
        placeholder={placeholder}
        {showClear}
        onInput={onChange}
        onClear={onClear}
      >
        {#snippet prefix()}
          <span style="padding-inline:4px; color:var(--cd-color-text-2)">搜索</span>
        {/snippet}
      </Input>
    {/snippet}
  </Tree>
</div>
