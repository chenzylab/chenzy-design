<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '前端', value: 'fe',
      children: [
        { label: '框架', value: 'fw', children: [{ label: 'React', value: 'react' }, { label: 'Vue', value: 'vue' }, { label: 'Svelte', value: 'svelte' }] },
        { label: '语言', value: 'lang', children: [{ label: 'TypeScript', value: 'ts' }, { label: 'JavaScript', value: 'js' }] },
      ],
    },
    {
      label: '后端', value: 'be',
      children: [{ label: '语言', value: 'belang', children: [{ label: 'Go', value: 'go' }, { label: 'Rust', value: 'rust' }] }],
    },
  ];

  let value = $state<(string | number)[][]>([]);
</script>

<div style="width: 320px">
  <Cascader
    {treeData}
    {value}
    multiple
    clearable
    maxTagCount={2}
    placeholder="选择技术栈（可多选）"
    onChange={(p) => (value = (Array.isArray(p[0]) ? p : [p]) as (string | number)[][])}
  />
  <Text type="tertiary">已选 {value.length} 条路径</Text>
</div>
