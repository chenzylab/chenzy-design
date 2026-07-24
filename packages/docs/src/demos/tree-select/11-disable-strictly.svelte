<script lang="ts">
  import { TreeSelect } from '@chenzy-design/svelte';

  // 节点「中国」开启 disabled，disableStrictly 后改父节点「亚洲」不影响中国。
  const treeData = [
    {
      label: '亚洲',
      value: 'Asia',
      key: '0',
      children: [
        {
          label: '中国',
          value: 'China',
          key: '0-0',
          disabled: true,
          children: [
            { label: '北京', value: 'Beijing', key: '0-0-0' },
            { label: '上海', value: 'Shanghai', key: '0-0-1' },
          ],
        },
        { label: '日本', value: 'Japan', key: '0-1' },
      ],
    },
  ];
</script>

<TreeSelect
  style="width: 300px"
  dropdownStyle="max-height: 400px; overflow: auto"
  {treeData}
  multiple
  disableStrictly
  defaultExpandAll
  placeholder="请选择"
/>
