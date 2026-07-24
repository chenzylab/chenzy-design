<script lang="ts">
  import { Select, Toast } from '@chenzy-design/svelte';

  const optionList = [
    { value: 'douyin', label: '抖音' },
    { value: 'ulikecam', label: '轻颜相机' },
    { value: 'jianying', label: '剪映' },
    { value: 'xigua', label: '西瓜视频' },
  ];
</script>

<Select multiple style="width: 320px" defaultValue={['douyin', 'ulikecam']} {optionList} />
<br />
<br />
<Select
  multiple
  maxTagCount={2}
  showRestTagsPopover={true}
  restTagsPopoverProps={{ position: 'top' }}
  style="width: 320px"
  defaultValue={['douyin', 'ulikecam', 'jianying']}
  {optionList}
/>
<br />
<br />
<Select
  multiple
  style="width: 320px"
  defaultValue={['douyin']}
  max={2}
  onExceed={() => Toast.warning('最多只允许选择两项')}
  {optionList}
/>
<br />
<br />
<Select
  multiple
  maxTagCount={2}
  showRestTagsPopover={true}
  restTagsPopoverProps={{ position: 'top' }}
  style="width: 220px"
  defaultValue={['xigua', 'ulikecam', 'jianying', 'douyin']}
  ellipsisTrigger
  expandRestTagsOnClick
  {optionList}
/>
