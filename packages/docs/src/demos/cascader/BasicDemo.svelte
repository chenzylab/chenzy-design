<script lang="ts">
  import { Cascader, Space, Text } from '@chenzy-design/svelte';

  const regionData = [
    {
      label: '浙江',
      value: 'zj',
      children: [
        { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }, { label: '余杭区', value: 'yh' }] },
        { label: '宁波', value: 'nb', children: [{ label: '海曙区', value: 'hs' }] },
      ],
    },
    {
      label: '江苏',
      value: 'js',
      children: [{ label: '南京', value: 'nj', children: [{ label: '玄武区', value: 'xw' }] }],
    },
  ];

  const lazyRegionData = [
    { label: '华东', value: 'east' },
    { label: '华南', value: 'south' },
  ];

  function loadRegionChildren(node: { value: string | number }) {
    return new Promise<{ label: string; value: string; isLeaf?: boolean }[]>((resolve) => {
      setTimeout(() => {
        resolve([
          { label: `${node.value}-城市A`, value: `${node.value}-a`, isLeaf: true },
          { label: `${node.value}-城市B`, value: `${node.value}-b`, isLeaf: true },
        ]);
      }, 600);
    });
  }

  let cascaderVal = $state<(string | number)[]>([]);
  let cascaderMultiVal = $state<(string | number)[][]>([]);
  let cascaderHoverVal = $state<(string | number)[]>([]);
  let cascaderDisplayVal = $state<(string | number)[]>([]);
  let cascaderCosVal = $state<(string | number)[]>([]);
  let cascaderSepVal = $state<(string | number)[]>([]);
  let cascaderMaxTagVal = $state<(string | number)[][]>([]);
  let cascaderLeafOnlyVal = $state<(string | number)[][]>([]);
</script>

<Space direction="vertical" align="start">
  <div style="width: 240px" data-testid="cascader-filter">
    <Cascader
      treeData={regionData}
      value={cascaderVal}
      clearable
      filterable
      placeholder="可搜索级联"
      onChange={(p) => (cascaderVal = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
    />
    <Text type="tertiary">级联（可搜索）：{cascaderVal.join(' / ') || '（未选）'}</Text>
  </div>
  <div style="width: 320px" data-testid="cascader-multiple">
    <Cascader
      treeData={regionData}
      multiple
      clearable
      placeholder="多选地区"
      value={cascaderMultiVal}
      onChange={(p) => (cascaderMultiVal = (Array.isArray(p[0]) ? p : p.length ? [p] : []) as (string | number)[][])}
    />
    <Text type="tertiary">多选级联：已选 {cascaderMultiVal.length} 条</Text>
  </div>
  <div style="width: 240px" data-testid="cascader-async">
    <Cascader treeData={lazyRegionData} loadData={loadRegionChildren} />
    <Text type="tertiary">异步 loadData（点击节点动态加载）</Text>
  </div>
  <div style="width: 240px" data-testid="cascader-hover">
    <Cascader
      treeData={regionData}
      expandTrigger="hover"
      clearable
      placeholder="悬停展开"
      value={cascaderHoverVal}
      onChange={(p) => (cascaderHoverVal = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
    />
    <Text type="tertiary">悬停展开（expandTrigger="hover"）：{cascaderHoverVal.join(' / ') || '（未选）'}</Text>
  </div>
  <div style="width: 240px" data-testid="cascader-display">
    <Cascader
      treeData={regionData}
      clearable
      placeholder="自定义回显"
      value={cascaderDisplayVal}
      displayRender={(labels) => labels.join('-')}
      onChange={(p) => (cascaderDisplayVal = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
    />
    <Text type="tertiary">displayRender 省-市-区 格式回显</Text>
  </div>
  <div style="width: 240px" data-testid="cascader-change-on-select">
    <Cascader
      treeData={regionData}
      changeOnSelect
      clearable
      placeholder="任意层级可选"
      value={cascaderCosVal}
      onChange={(p) => (cascaderCosVal = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
    />
    <Text type="tertiary"
      >changeOnSelect 任意层级可选：{cascaderCosVal.join(' / ') || '（未选）'}</Text
    >
  </div>
  <div style="width: 240px" data-testid="cascader-separator">
    <Cascader
      treeData={regionData}
      clearable
      separator=" › "
      displayProp="value"
      placeholder="自定义分隔符 + value 回显"
      value={cascaderSepVal}
      onChange={(p) => (cascaderSepVal = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
    />
    <Text type="tertiary">separator=" › " + displayProp="value"</Text>
  </div>
  <div style="width: 320px" data-testid="cascader-maxtag">
    <Cascader
      treeData={regionData}
      multiple
      clearable
      maxTagCount={1}
      placeholder="多选 + maxTagCount"
      value={cascaderMaxTagVal}
      onChange={(p) => (cascaderMaxTagVal = (Array.isArray(p[0]) ? p : p.length ? [p] : []) as (string | number)[][])}
    />
    <Text type="tertiary">maxTagCount=1：超出折叠 +N</Text>
  </div>
  <div style="width: 320px" data-testid="cascader-leafonly">
    <Cascader
      treeData={regionData}
      multiple
      leafOnly
      clearable
      columnWidth={[160, 200]}
      placeholder="leafOnly + 逐列列宽"
      value={cascaderLeafOnlyVal}
      onChange={(p) => (cascaderLeafOnlyVal = (Array.isArray(p[0]) ? p : p.length ? [p] : []) as (string | number)[][])}
    />
    <Text type="tertiary">leafOnly：全选父级折叠为父 tag；columnWidth=[160,200]</Text>
  </div>
  <div style="width: 240px" data-testid="cascader-filtertreenode">
    <Cascader
      treeData={regionData}
      clearable
      filterTreeNode={(q, path) => path.labels.some((l) => l.includes(q))}
      filterLeafOnly={false}
      emptyContent="未找到匹配地区"
      placeholder="自定义过滤谓词"
    />
    <Text type="tertiary">filterTreeNode 自定义谓词 + filterLeafOnly=false + emptyContent</Text>
  </div>
  <div style="width: 240px" data-testid="cascader-keepdom">
    <Cascader
      treeData={regionData}
      clearable
      destroyOnClose={false}
      placeholder="destroyOnClose=false"
    />
    <Text type="tertiary">destroyOnClose=false：关闭保留浮层 DOM（仅隐藏）</Text>
  </div>
</Space>
