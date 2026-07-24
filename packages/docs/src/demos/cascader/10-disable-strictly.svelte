<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';

  // 严格禁用：节点「宁波市」disabled，开启 disableStrictly 后，
  // 改变其父节点「浙江省」选中状态时不会影响宁波市。
  const treeData = [
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
          ],
        },
        {
          label: '宁波市',
          value: 'ningbo',
          disabled: true,
          children: [
            { label: '海曙区', value: 'haishu' },
            { label: '江北区', value: 'jiangbei' },
          ],
        },
      ],
    },
  ];
</script>

<Cascader style="width: 300px" {treeData} placeholder="请选择所在地区" multiple disableStrictly />
