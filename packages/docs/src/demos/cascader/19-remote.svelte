<script lang="ts">
  import { Cascader, Spin } from '@chenzy-design/svelte';
  import type { CascaderNode } from '@chenzy-design/svelte';

  let treeData = $state<CascaderNode[]>([]);
  let loading = $state(false);

  // 用变量保存最新一次请求的 token，丢弃过期响应（对齐 Semi reqTokenRef）。
  let reqToken = 0;

  // 模拟远程搜索接口
  function fetchByKeyword(keyword: string): Promise<CascaderNode[]> {
    return new Promise((resolve) => {
      const delay = 200 + Math.floor(Math.random() * 800);
      setTimeout(() => {
        if (!keyword) {
          resolve([]);
          return;
        }
        resolve([
          {
            label: '浙江省',
            value: 'zhejiang',
            children: [
              {
                label: '杭州市',
                value: 'hangzhou',
                children: [
                  { label: '西湖区', value: 'xihu' },
                  { label: '萧山区', value: 'xiaoshan' },
                  { label: '临安区', value: 'linan' },
                ],
              },
              {
                label: '宁波市',
                value: 'ningbo',
                children: [
                  { label: '海曙区', value: 'haishu' },
                  { label: '江北区', value: 'jiangbei' },
                ],
              },
            ],
          },
        ]);
      }, delay);
    });
  }

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  function handleSearch(input: string) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (!input) {
        treeData = [];
        loading = false;
        return;
      }
      const token = ++reqToken;
      loading = true;
      fetchByKeyword(input).then((next) => {
        // 后发先到时直接丢弃过期结果
        if (token !== reqToken) return;
        treeData = next;
        loading = false;
      });
    }, 300);
  }
</script>

<Spin spinning={loading}>
  <Cascader
    style="width: 300px"
    placeholder="输入关键词远程搜索"
    filterTreeNode
    remote
    {treeData}
    onSearch={handleSearch}
    onChange={(v) => console.log('selected:', v)}
  />
</Spin>
