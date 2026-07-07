<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '浙江', value: 'zj',
      children: [{ label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }] }],
    },
  ];

  let picked = $state('');
  // onChangeWithObject：onChange 入参变为完整节点对象（而非 value 数组）
  function handleChange(v: unknown) {
    const arr = v as { label?: string }[];
    picked = Array.isArray(arr) ? arr.map((n) => n?.label ?? '').join(' / ') : '';
  }
</script>

<div style="width: 300px">
  <Cascader
    {treeData}
    onChangeWithObject
    clearable
    placeholder="回调返回完整节点对象"
    onChange={handleChange}
  />
  <Text type="tertiary">对象路径 label：{picked || '（未选）'}</Text>
</div>
