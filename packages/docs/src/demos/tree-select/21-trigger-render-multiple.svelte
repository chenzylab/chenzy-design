<script lang="ts">
  import { TreeSelect, TagInput, Tag } from '@chenzy-design/svelte';
  import { treeData } from './_data';
</script>

<TreeSelect
  filterTreeNode
  searchPosition="trigger"
  multiple
  {treeData}
  placeholder="Custom Trigger"
  style="width: 300px"
>
  {#snippet triggerRender({ value, inputValue, onSearch, onRemove })}
    <TagInput
      value={value.map((node) => String(node.key))}
      {inputValue}
      onInputChange={onSearch}
    >
      {#snippet renderTagItem({ value: key })}
        {@const node = value.find((n) => String(n.key) === key)}
        <Tag
          style="margin-left: 2px"
          tagKey={key}
          closable
          onClose={(_children, _e, tagKey) => tagKey !== undefined && onRemove(tagKey)}
        >
          {node ? String(node.label) : key}
        </Tag>
      {/snippet}
    </TagInput>
  {/snippet}
</TreeSelect>
