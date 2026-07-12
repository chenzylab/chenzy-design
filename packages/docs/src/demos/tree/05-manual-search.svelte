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

  // 通过组件实例 search() 方法手动触发搜索；searchRender={false} 隐藏内部搜索框
  let tree = $state<{ search: (v: string) => void } | undefined>();
  let keyword = $state('');
</script>

<div style="display:flex; flex-direction:column; gap:12px; width:260px">
  <Input
    value={keyword}
    placeholder="外部搜索框，输入后回车/输入触发"
    onInput={(v) => {
      keyword = v;
      tree?.search(v);
    }}
  />
  <!-- filterTreeNode 开启搜索能力，searchRender={false} 隐藏内置框，由外部 search() 驱动 -->
  <Tree
    style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box"
    bind:this={tree}
    {treeData}
    filterTreeNode
    searchRender={false}
    defaultExpandAll
    ariaLabel="手动触发搜索树"
  />
</div>
