<script lang="ts">
  import { Select } from '@chenzy-design/svelte';
  import type { OptionData } from '@chenzy-design/svelte';

  // filter 传函数：选项 label 都是大写，默认 include 对比区分大小写；
  // 传入自定义 filter 后，输入小写字母也能搜到相应内容。
  function searchLabel(sugInput: string, option: OptionData) {
    const label = String(option.label).toUpperCase();
    const sug = sugInput.toUpperCase();
    return label.includes(sug);
  }

  const optionList = [
    { value: 'douyin', label: 'douyin' },
    { value: 'ulikecam', label: 'HOTSOON' },
    { value: 'jianying', label: 'PIPIXIA' },
    { value: 'xigua', label: 'XIGUA' },
  ];
</script>

<Select filter={searchLabel} style="width: 180px" placeholder="try douyin" {optionList} />
