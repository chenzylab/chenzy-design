<script lang="ts">
  import { ScrollList, Text } from '@chenzy-design/svelte';

  const provinces = ['北京', '上海', '广东', '浙江'];
  const cities = ['市辖区', '一区', '二区', '三区'];

  const columns = [
    {
      data: provinces.map((p, i) => ({ value: i, label: p })),
      ariaLabel: '省份',
    },
    {
      data: cities.map((c, i) => ({ value: i, label: c })),
      ariaLabel: '城市',
    },
  ];

  let picked = $state<(string | number)[]>([0, 0]);
</script>

<Text type="tertiary">多列联动选择器（省 / 市）</Text>
<div style="width: 200px; margin-top: 8px">
  <ScrollList
    {columns}
    defaultValue={[0, 0]}
    onChange={(info) => (picked = info.value as (string | number)[])}
  />
</div>
<Text type="tertiary">选中：{provinces[picked[0] as number]} · {cities[picked[1] as number]}</Text>
