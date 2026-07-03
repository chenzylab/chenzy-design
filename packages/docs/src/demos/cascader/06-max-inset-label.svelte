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
  let exceeded = $state(0);
</script>

<div style="display: flex; flex-direction: column; gap: 12px; width: 320px">
  <!-- insetLabel：触发器在值前内嵌一个标签 -->
  <Cascader {treeData} insetLabel="技术栈：" placeholder="请选择" clearable />

  <!-- max：多选最多勾选 2 项，超出触发 onExceed 且不选入 -->
  <Cascader
    {treeData}
    {value}
    multiple
    clearable
    max={2}
    insetLabel="最多 2 项："
    placeholder="选择技术栈（最多 2 项）"
    onChange={(p) => (value = (Array.isArray(p[0]) ? p : [p]) as (string | number)[][])}
    onExceed={() => (exceeded += 1)}
  />
  <Text type="tertiary">已选 {value.length} 项 · 触发 onExceed {exceeded} 次</Text>
</div>
