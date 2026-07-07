<script lang="ts">
  import { Cascader, Button } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '浙江', value: 'zj',
      children: [{ label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }] }],
    },
  ];
</script>

<div style="width: 300px">
  <!-- triggerRender 完全自定义触发器外观 -->
  <Cascader {treeData} placeholder="选择地区">
    {#snippet triggerRender({ value, placeholder, isOpen })}
      <Button type="tertiary">
        {value && value.length ? '已选择' : placeholder}
        <span style="margin-left:4px">{isOpen ? '▲' : '▼'}</span>
      </Button>
    {/snippet}
  </Cascader>
</div>
