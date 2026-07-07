<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '浙江', value: 'zj',
      children: [{ label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }] }],
    },
  ];

  let value = $state<(string | number)[]>([]);
</script>

<div style="display:flex;flex-direction:column;gap:12px;width:320px">
  <!-- separator 自定义分隔符 + displayRender 自定义回填格式 -->
  <Cascader
    {treeData}
    {value}
    separator=" > "
    clearable
    placeholder="自定义分隔符 >"
    onChange={(p) => (value = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
  />
  <Cascader
    {treeData}
    displayRender={(labels) => `📍 ${labels.join(' - ')}`}
    placeholder="displayRender 自定义回填"
  />
  <Text type="tertiary">已选：{value.join(' > ') || '（未选）'}</Text>
</div>
