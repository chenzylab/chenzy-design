<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';

  const treeData = [
    {
      label: '浙江省',
      value: 'zhejiang',
      children: [
        {
          label: '杭州市',
          value: 'hangzhou',
          disabled: true,
          children: [
            { label: '西湖区', value: 'xihu' },
            { label: '萧山区', value: 'xiaoshan' },
          ],
        },
        {
          label: '宁波市',
          value: 'ningbo',
          children: [{ label: '海曙区', value: 'haishu', disabled: true }],
        },
      ],
    },
  ];
</script>

<Cascader style="width: 300px" {treeData} placeholder="请选择所在地区" />
