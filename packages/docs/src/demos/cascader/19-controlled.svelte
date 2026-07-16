<script lang="ts">
  import { Cascader, Button, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '浙江', value: 'zj',
      children: [
        { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }, { label: '余杭区', value: 'yh' }] },
        { label: '宁波', value: 'nb', children: [{ label: '海曙区', value: 'hs' }] },
      ],
    },
  ];

  let value = $state<(string | number)[]>(['zj', 'hz', 'xh']);
</script>

<div style="display:flex;flex-direction:column;gap:12px;width:320px">
  <!-- 受控：外部持有 value，配合 onChange 双向同步 -->
  <Cascader
    {treeData}
    {value}
    showClear
    placeholder="受控组件"
    onChange={(p) => (value = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
  />
  <div style="display:flex;gap:8px">
    <Button size="small" onclick={() => (value = ['zj', 'nb', 'hs'])}>设为宁波/海曙</Button>
    <Button size="small" type="tertiary" onclick={() => (value = [])}>清空</Button>
  </div>
  <Text type="tertiary">当前 value：[{value.join(', ')}]</Text>
</div>
