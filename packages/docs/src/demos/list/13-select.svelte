<script lang="ts">
  // 单选或多选：组合 CheckboxGroup / RadioGroup 将 List 增强为列表选择器（每项内嵌 Checkbox / Radio）。
  import { List, Checkbox, CheckboxGroup, Radio, RadioGroup } from '@chenzy-design/svelte';

  const data = [
    '围城', '平凡的世界（全三册）', '三体（全集）', '雪中悍刀行（全集）',
    '撒哈拉的故事', '明朝那些事', '一禅小和尚', '沙丘',
    '被讨厌的勇气', '罪与罚', '月亮与六便士', '沉默的大多数', '第一人称单数',
  ];
  // pageSize=8，展示第一页（对齐 Semi getData(1)）。
  const list = data.slice(0, 8);

  let checked = $state<string[]>([list[0]]);
  let picked = $state(list[0]);
</script>

<div style="display:flex; gap:16px;">
  <div style="width:240px;">
    <CheckboxGroup value={checked} onChange={(v) => (checked = v as string[])}>
      <List dataSource={list} split={false} size="small" style="border:1px solid var(--cd-color-border);">
        {#snippet renderItem(item)}
          <List.Item><Checkbox value={item}>{item}</Checkbox></List.Item>
        {/snippet}
      </List>
    </CheckboxGroup>
  </div>

  <div style="width:240px;">
    <RadioGroup value={picked} onChange={(e) => (picked = e.target.value as string)}>
      <List dataSource={list} split={false} size="small" style="border:1px solid var(--cd-color-border);">
        {#snippet renderItem(item)}
          <List.Item><Radio value={item}>{item}</Radio></List.Item>
        {/snippet}
      </List>
    </RadioGroup>
  </div>
</div>
