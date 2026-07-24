<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';

  // keyMaps：自定义节点中 value/label/children 的字段名。
  const treeData = [
    {
      name: '浙江省',
      id: 'zhejiang',
      sub: [
        {
          name: '杭州市',
          id: 'hangzhou',
          sub: [
            { name: '西湖区', id: 'xihu' },
            { name: '萧山区', id: 'xiaoshan' },
          ],
        },
      ],
    },
  ];
</script>

<Cascader
  style="width: 300px"
  treeData={treeData as never}
  keyMaps={{ value: 'id', label: 'name', children: 'sub' }}
  placeholder="自定义字段映射"
/>
