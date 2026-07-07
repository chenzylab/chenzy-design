<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '浙江', value: 'zj',
      children: [{ label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }] }],
    },
  ];
</script>

<div style="width: 300px">
  <!-- topSlot / bottomSlot 在面板顶部、底部渲染附加内容 -->
  <Cascader {treeData} placeholder="带顶部/底部附加项">
    {#snippet topSlot()}
      <div style="padding:8px 12px;color:var(--cd-color-text-2);font-size:12px">常用地区</div>
    {/snippet}
    {#snippet bottomSlot()}
      <div style="padding:8px 12px;border-top:1px solid var(--cd-color-border)">
        <span style="color:var(--cd-color-primary);cursor:pointer">管理地区列表</span>
      </div>
    {/snippet}
  </Cascader>
</div>
