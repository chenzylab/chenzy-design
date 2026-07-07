<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '浙江', value: 'zj',
      children: [
        { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }, { label: '余杭区', value: 'yh' }] },
        { label: '宁波', value: 'nb', children: [{ label: '海曙区', value: 'hs' }, { label: '江北区', value: 'jb' }] },
      ],
    },
    {
      label: '江苏', value: 'js',
      children: [{ label: '南京', value: 'nj', children: [{ label: '玄武区', value: 'xw' }, { label: '秦淮区', value: 'qh' }] }],
    },
  ];

  let value = $state<(string | number)[][]>([]);
  // filterSorter：命中项按 label 链长度升序（更短的路径优先）
  function sorter(a: { labels: string[] }, b: { labels: string[] }) {
    return a.labels.join('').length - b.labels.join('').length;
  }
</script>

<div style="width: 340px">
  <!-- 多选 + 可搜索：搜索框输入过滤，BackSpace 删除已选；filterSorter 排序结果 -->
  <Cascader
    {treeData}
    {value}
    multiple
    filterable
    clearable
    maxTagCount={3}
    filterSorter={sorter}
    placeholder="搜索并多选地区"
    onChange={(p) => (value = (Array.isArray(p[0]) ? p : [p]) as (string | number)[][])}
  />
  <Text type="tertiary">已选 {value.length} 条路径</Text>
</div>
