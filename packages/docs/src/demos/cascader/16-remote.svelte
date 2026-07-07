<script lang="ts">
  import { Cascader, Text } from '@chenzy-design/svelte';

  type Node = { label: string; value: string; children?: Node[] };
  const allData: Node[] = [
    { label: '浙江', value: 'zj', children: [{ label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }] }] },
    { label: '江苏', value: 'js', children: [{ label: '南京', value: 'nj', children: [{ label: '玄武区', value: 'xw' }] }] },
    { label: '广东', value: 'gd', children: [{ label: '广州', value: 'gz', children: [{ label: '天河区', value: 'th' }] }] },
  ];

  let treeData = $state<Node[]>(allData);
  let timer: ReturnType<typeof setTimeout>;

  // remote：本地不过滤，onSearch 回调里异步更新 treeData
  function handleSearch(q: string) {
    clearTimeout(timer);
    if (!q) {
      treeData = allData;
      return;
    }
    timer = setTimeout(() => {
      treeData = allData.filter((n) => n.label.includes(q));
    }, 400);
  }
</script>

<div style="width: 300px">
  <Cascader
    {treeData}
    remote
    filterable
    clearable
    placeholder="远程搜索省份"
    onSearch={handleSearch}
  />
  <Text type="tertiary">输入省份名触发远程过滤</Text>
</div>
