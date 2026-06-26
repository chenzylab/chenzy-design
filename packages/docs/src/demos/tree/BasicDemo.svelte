<script lang="ts">
  import { Tree, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      key: 'design',
      label: '设计',
      children: [
        { key: 'figma', label: 'Figma 规范' },
        { key: 'token', label: 'Design Token' },
      ],
    },
    {
      key: 'dev',
      label: '研发',
      children: [
        { key: 'fe', label: '前端' },
        {
          key: 'be',
          label: '后端',
          children: [
            { key: 'api', label: 'API' },
            { key: 'db', label: '数据库' },
          ],
        },
      ],
    },
    { key: 'qa', label: '测试' },
  ];

  let treeSel = $state<string | number>('figma');
  let treeChecked = $state<(string | number)[]>([]);
  let treeUnrelatedChecked = $state<(string | number)[]>([]);

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
  let treeFieldSel = $state<string | number | null>(null);
  let treeFieldChecked = $state<(string | number)[]>([]);

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

  type DragNode = { key: string | number; label: string; children?: DragNode[] };
  let dragTreeData = $state<DragNode[]>([
    {
      key: 'a',
      label: '一级 A',
      children: [
        { key: 'a1', label: 'A-1' },
        { key: 'a2', label: 'A-2' },
      ],
    },
    {
      key: 'b',
      label: '一级 B',
      children: [{ key: 'b1', label: 'B-1' }],
    },
    { key: 'c', label: '一级 C' },
  ]);
  let dragInfo = $state('（未拖拽）');

  function reorderTree(
    data: DragNode[],
    dragKey: string | number,
    dropKey: string | number,
    pos: 'before' | 'inside' | 'after',
  ): DragNode[] {
    let dragged: DragNode | undefined;
    function remove(list: DragNode[]): DragNode[] {
      const out: DragNode[] = [];
      for (const n of list) {
        if (n.key === dragKey) { dragged = n; continue; }
        out.push(n.children ? { ...n, children: remove(n.children) } : n);
      }
      return out;
    }
    const pruned = remove(data);
    if (!dragged) return data;
    function insert(list: DragNode[]): DragNode[] {
      const out: DragNode[] = [];
      for (const n of list) {
        if (n.key === dropKey) {
          if (pos === 'before') out.push(dragged as DragNode, n);
          else if (pos === 'after') out.push(n, dragged as DragNode);
          else out.push({ ...n, children: [...(n.children ?? []), dragged as DragNode] });
        } else {
          out.push(n.children ? { ...n, children: insert(n.children) } : n);
        }
      }
      return out;
    }
    return insert(pruned);
  }

  const bigTreeData = Array.from({ length: 50 }, (_, g) => ({
    key: `g${g}`,
    label: `分组 ${g + 1}`,
    children: Array.from({ length: 20 }, (_, c) => ({
      key: `g${g}-c${c}`,
      label: `分组 ${g + 1} · 节点 ${c + 1}`,
    })),
  }));
</script>

<div style="display: flex; align-items: flex-start; gap: 48px; flex-wrap: wrap">
  <div style="width: 240px" data-testid="tree-icon">
    <Text type="tertiary">单选 + 节点图标</Text>
    <Tree
      {treeData}
      defaultExpandAll
      value={treeSel}
      onChange={(info) => (treeSel = info.value as string | number)}
      ariaLabel="部门树"
    >
      {#snippet icon({ node, expanded })}
        {#if node.children && node.children.length}
          <span>{expanded ? '📂' : '📁'}</span>
        {:else}
          <span>📄</span>
        {/if}
      {/snippet}
    </Tree>
    <Text type="tertiary">已选：{treeSel}</Text>
  </div>

  <div style="width: 240px">
    <Text type="tertiary">可勾选（父子联动）+ 可搜索</Text>
    <Tree
      {treeData}
      checkable
      filterable
      defaultExpandAll
      checkedKeys={treeChecked}
      onCheck={(info) => (treeChecked = info.checked)}
      ariaLabel="可勾选部门树"
    />
    <Text type="tertiary">已勾选 {treeChecked.length} 项</Text>
  </div>

  <div style="width: 240px" data-testid="tree-showline">
    <Text type="tertiary">showLine 层级连接线</Text>
    <Tree {treeData} showLine showIcon={false} defaultExpandAll ariaLabel="连接线树" />
  </div>

  <div style="width: 240px" data-testid="tree-accordion">
    <Text type="tertiary">accordion 手风琴（同层级只展开一个）</Text>
    <Tree {treeData} accordion ariaLabel="手风琴树" />
  </div>

  <div style="width: 240px" data-testid="tree-loaddata">
    <Text type="tertiary">异步加载（展开拉取子节点）</Text>
    <Tree treeData={treeAsyncRoots} loadData={loadTreeChildren} ariaLabel="异步加载树" />
  </div>

  <div style="width: 280px" data-testid="tree-virtualized">
    <Text type="tertiary">虚拟滚动（1050 节点，仅渲染视口内行）</Text>
    <Tree
      treeData={bigTreeData}
      virtualized
      height={320}
      defaultExpandAll
      ariaLabel="大数据虚拟树"
    />
  </div>

  <div style="width: 240px" data-testid="tree-draggable">
    <Text type="tertiary">draggable 拖拽排序（before / inside / after）</Text>
    <Tree
      treeData={dragTreeData}
      draggable
      defaultExpandAll
      showLine
      showIcon={false}
      ariaLabel="可拖拽树"
      onDrop={(info) => {
        dragTreeData = reorderTree(
          dragTreeData,
          info.dragNode.key,
          info.dropNode.key,
          info.dropPosition,
        );
        dragInfo = `${info.dragNode.label} → ${info.dropNode.label}（${info.dropPosition}）`;
      }}
    />
    <Text type="tertiary">最近一次拖拽：{dragInfo}</Text>
  </div>

  <div style="width: 240px" data-testid="tree-fieldnames">
    <Text type="tertiary">fieldNames 字段映射（数据用 id/name/sub）</Text>
    <Tree
      treeData={treeFieldData as unknown as TreeNode[]}
      fieldNames={treeFieldNames}
      checkable
      defaultExpandAll
      value={treeFieldSel}
      checkedKeys={treeFieldChecked}
      onChange={(info) => (treeFieldSel = info.value as string | number)}
      onCheck={(info) => (treeFieldChecked = info.checked)}
      ariaLabel="字段映射树"
    />
    <Text type="tertiary">已选：{treeFieldSel ?? '（未选）'}，已勾选 {treeFieldChecked.length} 项</Text>
  </div>

  <div style="width: 240px" data-testid="tree-checkrelation">
    <Text type="tertiary">checkRelation="unRelated"（父子勾选互不联动、无半选）</Text>
    <Tree
      {treeData}
      checkable
      checkRelation="unRelated"
      defaultExpandAll
      checkedKeys={treeUnrelatedChecked}
      onCheck={(info) => (treeUnrelatedChecked = info.checked)}
      ariaLabel="非联动勾选树"
    />
    <Text type="tertiary">已勾选 {treeUnrelatedChecked.length} 项（无半选）</Text>
  </div>

  <div style="width: 240px" data-testid="tree-expandeddepth">
    <Text type="tertiary">expandedDepth=&#123;1&#125;（默认仅展开第 1 层）</Text>
    <Tree {treeData} expandedDepth={1} ariaLabel="按层展开树" />
  </div>

  <div style="width: 240px" data-testid="tree-filtertreenode">
    <Text type="tertiary">filterTreeNode 自定义谓词（仅匹配以关键词开头的节点）</Text>
    <Tree
      {treeData}
      filterTreeNode={(input, node) => node.label.startsWith(input)}
      defaultExpandAll
      ariaLabel="自定义过滤树"
    />
  </div>
</div>
