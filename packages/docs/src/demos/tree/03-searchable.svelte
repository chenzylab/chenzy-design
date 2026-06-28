<script lang="ts">
  import { Tree, Text } from '@chenzy-design/svelte';
  import type { TreeNode } from '@chenzy-design/svelte';

  const treeData: TreeNode[] = [
    {
      key: 'components',
      label: '组件',
      children: [
        {
          key: 'input',
          label: '输入类',
          children: [
            { key: 'input-field', label: 'Input 输入框' },
            { key: 'select', label: 'Select 选择器' },
            { key: 'datepicker', label: 'DatePicker 日期选择' },
          ],
        },
        {
          key: 'show',
          label: '展示类',
          children: [
            { key: 'table', label: 'Table 表格' },
            { key: 'tree', label: 'Tree 树形控件' },
            { key: 'tag', label: 'Tag 标签' },
          ],
        },
      ],
    },
    {
      key: 'feedback',
      label: '反馈类',
      children: [
        { key: 'modal', label: 'Modal 对话框' },
        { key: 'toast', label: 'Toast 轻提示' },
      ],
    },
  ];

  let lastSearch = $state('');
  let hitCount = $state(0);
</script>

<div style="display:flex; gap:48px; flex-wrap:wrap; align-items:flex-start">
  <div style="width:280px">
    <Text type="tertiary">内置搜索（命中高亮 + 自动展开祖先）</Text>
    <Tree
      {treeData}
      filterable
      defaultExpandAll
      onSearch={(value, keys) => {
        lastSearch = value;
        hitCount = keys.length;
      }}
      ariaLabel="可搜索组件树"
    />
    <Text type="tertiary">
      {lastSearch ? `“${lastSearch}” 命中 ${hitCount} 项` : '输入关键词过滤，如 “选择”'}
    </Text>
  </div>

  <div style="width:280px">
    <Text type="tertiary">自定义过滤谓词（仅匹配开头）</Text>
    <Tree
      {treeData}
      defaultExpandAll
      filterTreeNode={(input, node) =>
        node.label.toLowerCase().startsWith(input.toLowerCase())}
      ariaLabel="自定义过滤组件树"
    />
    <Text type="tertiary">按 label 前缀匹配，如 “T”</Text>
  </div>
</div>
