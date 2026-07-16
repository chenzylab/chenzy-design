<script lang="ts">
  import { Select, Space, Text } from '@chenzy-design/svelte';

  const data: Record<string, { label: string; value: string }[]> = {
    zhejiang: [
      { label: '杭州', value: 'hangzhou' },
      { label: '宁波', value: 'ningbo' },
    ],
    jiangsu: [
      { label: '南京', value: 'nanjing' },
      { label: '苏州', value: 'suzhou' },
    ],
  };
  const provinces = [
    { label: '浙江', value: 'zhejiang' },
    { label: '江苏', value: 'jiangsu' },
  ];

  let province = $state<string | undefined>(undefined);
  let city = $state<string | undefined>(undefined);

  // 联动：省变更后清空市并更新市 optionList（动态派生）
  const cityOptions = $derived(province ? data[province] : []);
</script>

<Space align="start">
  <Select
    optionList={provinces}
    value={province}
    placeholder="选择省份"
    onChange={(v) => {
      province = v as string;
      city = undefined;
    }}
  />
  <Select optionList={cityOptions} value={city} placeholder="选择城市" onChange={(v) => (city = v as string)} />
</Space>
<Text type="tertiary">已选：{province ?? '—'} / {city ?? '—'}</Text>
