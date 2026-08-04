<script lang="ts">
  import { Cascader, Button, Tag, TagInput } from '@chenzy-design/svelte';
  import { IconClose, IconChevronDown } from '@chenzy-design/icons';
  import { treeData } from './_data';

  // 对齐 Semi getLabelFromValue：value 是 pos 下标字符串（如 '0-0-1'），
  // 按下标逐层查找 resultData[item] / resultData.children[item]，非按 value 值匹配。
  type Node = (typeof treeData)[number];
  function getLabelFromValue(value: string): string {
    const valueArr = value.split('-').map((item) => Number(item));
    let resultData: unknown = treeData;
    valueArr.forEach((item, index) => {
      resultData = index === 0 ? (resultData as Node[])[item] : ((resultData as Node).children as Node[])[item];
    });
    const label = (resultData as Node)?.label;
    return typeof label === 'string' ? label : String(value);
  }
</script>

<div>
  <Cascader {treeData} placeholder="Custom Trigger">
    {#snippet triggerRender({ value, placeholder, onClear })}
      <Button theme="light" iconPosition="right">
        {#snippet icon()}
          {#if value}
            <IconClose onclick={(e: MouseEvent) => onClear(e)} />
          {:else}
            <IconChevronDown />
          {/if}
        {/snippet}
        {value ? getLabelFromValue(value as string) : placeholder}
      </Button>
    {/snippet}
  </Cascader>
  <br />
  <Cascader multiple filterTreeNode {treeData} style="width: 300px" placeholder="Custom Trigger">
    {#snippet triggerRender({ value, onSearch, onRemove })}
      {@const posSet = value ?? new Set<string>()}
      <TagInput value={Array.from(posSet)} onInputChange={onSearch}>
        {#snippet renderTagItem({ value: tagValue })}
          <Tag
            tagKey={tagValue}
            closable
            onClose={(_children, e) => {
              e.preventDefault();
              onRemove(tagValue);
            }}
            style="margin-left: 2px"
          >
            {getLabelFromValue(tagValue)}
          </Tag>
        {/snippet}
      </TagInput>
    {/snippet}
  </Cascader>
</div>
