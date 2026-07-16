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

  let value = $state<(string | number)[][]>([
    ['fe', 'fw', 'react'],
    ['fe', 'fw', 'vue'],
    ['fe', 'lang', 'ts'],
    ['be', 'belang', 'go'],
  ]);
</script>

<div style="width: 320px">
  <Cascader
    {treeData}
    {value}
    multiple
    showClear
    maxTagCount={2}
    showRestTagsPopover
    placeholder="选择技术栈（可多选）"
    onChange={(p) => (value = (Array.isArray(p[0]) ? p : [p]) as (string | number)[][])}
  />
  <Text type="tertiary">maxTagCount=2 折叠溢出，showRestTagsPopover 悬停 +N 展示剩余</Text>
</div>
