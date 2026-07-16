<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  let val = $state<string | number | undefined>(undefined);
  const optionList = [
    { label: '张三', value: 'zs', role: '前端工程师' },
    { label: '李四', value: 'ls', role: '后端工程师' },
    { label: '王五', value: 'ww', role: '设计师' },
  ];
</script>

<div style="max-width:280px">
  <!-- renderOptionItem：完全自定义候选项渲染；须自行绑定 onMouseEnter/onClick 保持交互 -->
  <Select
    {optionList}
    value={val}
    onChange={(v) => (val = v as string | number)}
    placeholder="选择成员"
  >
    {#snippet renderOptionItem({ option, selected, focused, onMouseEnter, onClick })}
      <div
        role="presentation"
        style="display:flex;justify-content:space-between;width:100%;padding:6px 12px;cursor:pointer;{focused ? 'background:var(--cd-color-fill-0)' : ''}"
        onmouseenter={onMouseEnter}
        onclick={onClick}
      >
        <span style={selected ? 'color:var(--cd-color-primary);font-weight:600' : ''}>{option.label}</span>
        <span style="color:var(--cd-color-text-2);font-size:12px">{(option as { role?: string }).role}</span>
      </div>
    {/snippet}
  </Select>
</div>
