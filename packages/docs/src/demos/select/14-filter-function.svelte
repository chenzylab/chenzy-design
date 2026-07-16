<script lang="ts">
  import { Select, Text } from '@chenzy-design/svelte';

  // 每个选项带 pinyin 字段，自定义过滤同时匹配 label 与拼音
  const optionList = [
    { label: '北京', value: 'bj', pinyin: 'beijing' },
    { label: '上海', value: 'sh', pinyin: 'shanghai' },
    { label: '广州', value: 'gz', pinyin: 'guangzhou' },
    { label: '深圳', value: 'sz', pinyin: 'shenzhen' },
  ];

  // filter 传函数：自定义过滤逻辑 (input, option) => boolean
  function filterByPinyin(input: string, option: { label: string; pinyin?: string }) {
    const q = input.toLowerCase();
    return option.label.includes(input) || (option.pinyin ?? '').toLowerCase().includes(q);
  }
</script>

<div style="max-width:280px">
  <Select {optionList} filter={filterByPinyin} placeholder="输入中文或拼音（如 bei）" />
  <Text type="tertiary">自定义过滤：同时匹配 label 与拼音字段</Text>
</div>
