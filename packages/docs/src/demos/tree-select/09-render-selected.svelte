<script lang="ts">
  import { TreeSelect, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      key: 'cn',
      label: '中国',
      children: [
        { key: 'sh', label: '上海' },
        { key: 'hz', label: '杭州' },
        { key: 'nj', label: '南京' },
      ],
    },
    {
      key: 'jp',
      label: '日本',
      children: [
        { key: 'tk', label: '东京' },
        { key: 'ok', label: '大阪' },
      ],
    },
  ];

  let value = $state<Array<string | number>>(['sh', 'tk']);
</script>

<div style="width: 320px">
  <!-- renderSelectedItem：具名 snippet 自定义已选 tag 渲染（加图标 + 自定义样式） -->
  <TreeSelect
    {treeData}
    {value}
    multiple
    clearable
    defaultExpandAll
    placeholder="选择城市"
    onChange={(k) => (value = Array.isArray(k) ? k : k == null ? [] : [k])}
  >
    {#snippet renderSelectedItem({ node, onRemove })}
      <span
        style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; margin: 2px; border-radius: 999px; background: var(--cd-color-primary-light-default, #e6f0ff); color: var(--cd-color-primary, #0066ff); font-size: 12px;"
      >
        <span aria-hidden="true">📍</span>
        {node.label}
        <button
          type="button"
          onclick={onRemove}
          style="border: none; background: transparent; cursor: pointer; color: inherit; padding: 0; line-height: 1;"
          aria-label={`移除 ${node.label}`}
        >×</button>
      </span>
    {/snippet}
  </TreeSelect>
  <Text type="tertiary">自定义已选项：已选 {value.length} 项</Text>
</div>
