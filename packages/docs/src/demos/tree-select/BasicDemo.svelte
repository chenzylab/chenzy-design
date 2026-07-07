<script lang="ts">
  import { TreeSelect, Space, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const orgTree = [
    {
      key: 'eng',
      label: '研发',
      children: [
        { key: 'fe', label: '前端' },
        { key: 'be', label: '后端' },
      ],
    },
    { key: 'design', label: '设计' },
  ];

  // fieldNames 映射演示数据（后端字段 id/name/sub）
  const treeFieldData = [
    {
      id: 'd1',
      name: '设计中心',
      sub: [
        { id: 'd1-1', name: 'Figma 规范' },
        { id: 'd1-2', name: 'Design Token' },
      ],
    },
    {
      id: 'd2',
      name: '研发中心',
      sub: [
        { id: 'd2-1', name: '前端组' },
        { id: 'd2-2', name: '后端组' },
      ],
    },
  ];
  const treeFieldNames = { key: 'id', label: 'name', children: 'sub' };

  // 异步加载根节点
  const treeAsyncRoots = [
    { key: 'east', label: '华东' },
    { key: 'south', label: '华南' },
    { key: 'leaf-hk', label: '香港（叶子）', isLeaf: true },
  ];
  function loadTreeChildren(node: { key: string | number; label: string }) {
    return new Promise<Array<{ key: string; label: string; isLeaf?: boolean }>>((resolve) => {
      setTimeout(() => {
        resolve([
          { key: `${node.key}-1`, label: `${node.label}·城市A`, isLeaf: true },
          { key: `${node.key}-2`, label: `${node.label}·城市B`, isLeaf: true },
        ]);
      }, 600);
    });
  }

  // 虚拟化大树（50 组 × 20 子 = 1050 节点）
  const bigTreeData = Array.from({ length: 50 }, (_, g) => ({
    key: `g${g}`,
    label: `分组 ${g + 1}`,
    children: Array.from({ length: 20 }, (_, c) => ({
      key: `g${g}-c${c}`,
      label: `分组 ${g + 1} · 节点 ${c + 1}`,
    })),
  }));

  // 远程搜索（mock 防抖）
  let treeRemoteData = $state<TreeNode[]>([]);
  let treeRemoteLoading = $state(false);
  let treeRemoteTimer: ReturnType<typeof setTimeout> | undefined;
  function treeRemoteSearch(q: string) {
    if (treeRemoteTimer !== undefined) clearTimeout(treeRemoteTimer);
    if (!q) { treeRemoteData = []; treeRemoteLoading = false; return; }
    treeRemoteLoading = true;
    treeRemoteTimer = setTimeout(() => {
      treeRemoteData = [
        { key: `${q}-1`, label: `${q} 部门一`, children: [{ key: `${q}-1-1`, label: `${q} 小组A` }] },
        { key: `${q}-2`, label: `${q} 部门二` },
      ];
      treeRemoteLoading = false;
    }, 200);
  }

  let treeVal = $state<string | number | null>(null);
  let treeMultiVal = $state<(string | number)[]>([]);
  let treeSelectFieldVal = $state<string | number | null>(null);
  let treeSelectIconVal = $state<string | number | null>(null);
  let treeSelectAsyncVal = $state<string | number | null>(null);
  let treeSelectVirtualVal = $state<string | number | null>(null);
  let treeStrategyVal = $state<(string | number)[]>([]);
  let treeMaxTagVal = $state<(string | number)[]>([]);
  let treeRemoteVal = $state<string | number | null>(null);
</script>

<Space vertical align="start">
  <div style="width: 240px" data-testid="treeselect-filter">
    <TreeSelect
      treeData={orgTree}
      value={treeVal}
      clearable
      filterable
      placeholder="可搜索树选"
      onChange={(k) => (treeVal = Array.isArray(k) ? (k[0] ?? null) : k)}
    />
    <Text type="tertiary">树选（可搜索）：{treeVal ?? '（未选）'}</Text>
  </div>
  <div style="width: 280px" data-testid="treeselect-multiple">
    <TreeSelect
      treeData={orgTree}
      multiple
      clearable
      defaultExpandAll
      placeholder="多选部门"
      value={treeMultiVal}
      onChange={(k) => (treeMultiVal = Array.isArray(k) ? k : k === null ? [] : [k])}
    />
    <Text type="tertiary">已选 {treeMultiVal.length} 项</Text>
  </div>
  <div style="width: 240px" data-testid="treeselect-fieldnames">
    <TreeSelect
      treeData={treeFieldData as unknown as TreeNode[]}
      fieldNames={treeFieldNames}
      clearable
      defaultExpandAll
      placeholder="字段映射树选"
      value={treeSelectFieldVal}
      onChange={(k) => (treeSelectFieldVal = Array.isArray(k) ? (k[0] ?? null) : k)}
    />
    <Text type="tertiary">树选（fieldNames）：{treeSelectFieldVal ?? '（未选）'}</Text>
  </div>
  <div style="width: 240px" data-testid="treeselect-icon">
    <TreeSelect
      treeData={orgTree}
      clearable
      defaultExpandAll
      placeholder="带图标树选"
      value={treeSelectIconVal}
      onChange={(k) => (treeSelectIconVal = Array.isArray(k) ? (k[0] ?? null) : k)}
    >
      {#snippet icon({ node, expanded })}
        {#if node.children && node.children.length}
          <span class="tree-icon-glyph">{expanded ? '📂' : '📁'}</span>
        {:else}
          <span class="tree-icon-glyph">📄</span>
        {/if}
      {/snippet}
    </TreeSelect>
    <Text type="tertiary">树选（图标）：{treeSelectIconVal ?? '（未选）'}</Text>
  </div>
  <div style="width: 240px" data-testid="treeselect-async">
    <TreeSelect
      treeData={treeAsyncRoots as unknown as TreeNode[]}
      loadData={loadTreeChildren}
      clearable
      placeholder="异步加载树选"
      value={treeSelectAsyncVal}
      onChange={(k) => (treeSelectAsyncVal = Array.isArray(k) ? (k[0] ?? null) : k)}
    />
    <Text type="tertiary">异步 loadData：展开节点动态加载子项</Text>
  </div>
  <div style="width: 260px" data-testid="treeselect-virtual">
    <TreeSelect
      treeData={bigTreeData}
      virtualized
      defaultExpandAll
      clearable
      placeholder="虚拟化大树选"
      value={treeSelectVirtualVal}
      onChange={(k) => (treeSelectVirtualVal = Array.isArray(k) ? (k[0] ?? null) : k)}
    />
    <Text type="tertiary">virtualized 1050 节点：仅渲染视口内行</Text>
  </div>
  <div style="width: 280px" data-testid="treeselect-strategy">
    <TreeSelect
      treeData={orgTree}
      multiple
      clearable
      defaultExpandAll
      showCheckedStrategy="parent"
      placeholder="收敛策略=parent"
      value={treeStrategyVal}
      onChange={(k) => (treeStrategyVal = Array.isArray(k) ? k : k === null ? [] : [k])}
    />
    <Text type="tertiary">showCheckedStrategy=parent：回填 {treeStrategyVal.length} 项</Text>
  </div>
  <div style="width: 280px" data-testid="treeselect-maxtag">
    <TreeSelect
      treeData={orgTree}
      multiple
      clearable
      defaultExpandAll
      checkRelation="unRelated"
      maxTagCount={2}
      placeholder="maxTagCount=2"
      value={treeMaxTagVal}
      onChange={(k) => (treeMaxTagVal = Array.isArray(k) ? k : k === null ? [] : [k])}
    />
    <Text type="tertiary">maxTagCount=2 + checkRelation=unRelated</Text>
  </div>
  <div style="width: 260px" data-testid="treeselect-remote">
    <TreeSelect
      treeData={treeRemoteData}
      remote
      clearable
      onSearch={treeRemoteSearch}
      placeholder="远程搜索（输入触发）"
      value={treeRemoteVal}
      onChange={(k) => (treeRemoteVal = Array.isArray(k) ? (k[0] ?? null) : k)}
    />
    <Text type="tertiary">remote：{treeRemoteLoading ? '加载中…' : '输入防抖触发 onSearch'}</Text>
  </div>
  <div style="width: 240px" data-testid="treeselect-keepdom">
    <TreeSelect
      treeData={orgTree}
      clearable
      destroyOnClose
      treeDefaultExpandedKeys={['eng']}
      placeholder="destroyOnClose + 默认展开"
    />
    <Text type="tertiary">destroyOnClose 关闭卸载浮层；treeDefaultExpandedKeys 默认展开</Text>
  </div>
</Space>
