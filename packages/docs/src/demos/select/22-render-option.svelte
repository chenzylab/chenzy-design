<script lang="ts">
  import { Select, Checkbox, Highlight } from '@chenzy-design/svelte';

  let inputValue = $state('');

  const optionList = [
    { value: 'douyin', label: '抖音', otherKey: 0 },
    { value: 'ulikecam', label: '轻颜相机', disabled: true, otherKey: 1 },
    { value: 'jianying', label: '剪映', otherKey: 2 },
    { value: 'toutiao', label: '今日头条', otherKey: 3 },
  ];
</script>

<Select
  filter
  placeholder="单选"
  onSearch={(v) => (inputValue = v)}
  {optionList}
  style="width: 180px"
>
  {#snippet renderOptionItem({ option, selected, onMouseEnter, onClick })}
    <!-- 完全自定义候选项渲染：需自行绑定 onMouseEnter/onClick 并展现选中态 -->
    <div
      style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer"
      role="option"
      aria-selected={selected}
      tabindex="-1"
      onmouseenter={onMouseEnter}
      onclick={onClick}
      onkeydown={() => {}}
    >
      <Checkbox checked={selected} />
      <Highlight sourceString={String(option.label)} searchWords={[inputValue]} />
    </div>
  {/snippet}
</Select>
<br />
<br />
<Select
  filter
  placeholder="多选"
  multiple
  onSearch={(v) => (inputValue = v)}
  {optionList}
  style="width: 320px"
>
  {#snippet renderOptionItem({ option, selected, onMouseEnter, onClick })}
    <div
      style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer"
      role="option"
      aria-selected={selected}
      tabindex="-1"
      onmouseenter={onMouseEnter}
      onclick={onClick}
      onkeydown={() => {}}
    >
      <Checkbox checked={selected} />
      <Highlight sourceString={String(option.label)} searchWords={[inputValue]} />
    </div>
  {/snippet}
</Select>
