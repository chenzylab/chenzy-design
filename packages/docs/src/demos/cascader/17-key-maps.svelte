<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';
  import type { ComponentProps } from 'svelte';

  // 数据字段名与默认不同：name/id/sub，通过 keyMaps 映射
  // 自定义字段结构与标准 CascaderNode 不同，用断言传入（运行时经 keyMaps 归一）
  const treeData = [
    {
      name: '浙江', id: 'zj',
      sub: [
        { name: '杭州', id: 'hz', sub: [{ name: '西湖区', id: 'xh' }, { name: '余杭区', id: 'yh' }] },
      ],
    },
  ] as unknown as ComponentProps<typeof Cascader>['treeData'];

  let value = $state<(string | number)[]>([]);
</script>

<div style="width: 300px">
  <!-- keyMaps 自定义字段映射：label←name、value←id、children←sub -->
  <Cascader
    {treeData}
    {value}
    keyMaps={{ label: 'name', value: 'id', children: 'sub' }}
    clearable
    placeholder="自定义字段映射"
    onChange={(p) => (value = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
  />
  <Text type="tertiary">已选：{value.join(' / ') || '（未选）'}</Text>
</div>
