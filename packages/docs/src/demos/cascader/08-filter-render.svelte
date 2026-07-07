<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '设计', value: 'design',
      children: [
        { label: '组件', value: 'comp', children: [{ label: 'Button', value: 'btn' }, { label: 'Cascader', value: 'cas' }] },
        { label: '规范', value: 'spec', children: [{ label: '色彩', value: 'color' }, { label: '间距', value: 'space' }] },
      ],
    },
  ];
</script>

<div style="width: 300px">
  <!-- filterRender 自定义搜索结果整行渲染 -->
  <Cascader {treeData} filterable placeholder="搜索并看自定义结果项">
    {#snippet filterRender({ path })}
      <span style="display:flex;gap:6px;align-items:center">
        <span style="color:var(--cd-color-primary)">🔎</span>
        <span>{path.labels.join(' › ')}</span>
      </span>
    {/snippet}
  </Cascader>
</div>
