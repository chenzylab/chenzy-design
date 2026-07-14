<script lang="ts">
  import { TagGroup } from '@chenzy-design/svelte';

  // 可删除的 TagGroup：在 onTagClose 中依据回传的 tagKey 处理 tagList。
  const defaultList = [
    { tagKey: '1', color: 'light-blue', children: '抖音', closable: true },
    { tagKey: '3', color: 'cyan', children: '剪映', closable: true },
    { tagKey: '2', color: 'violet', children: '醒图', closable: true },
    { tagKey: '4', color: 'teal', children: '轻颜相机', closable: true },
    { tagKey: '5', color: 'white', children: '飞书', closable: true },
  ];

  let tagList = $state(defaultList);

  function onTagClose(_children: unknown, _e: unknown, tagKey: string | number | undefined) {
    tagList = tagList.filter((t) => t.tagKey !== tagKey);
  }

  const boxStyle =
    'background-color: var(--cd-color-fill-0); height: 35px; width: 300px; display: flex; align-items: center; padding: 0 10px; margin-bottom: 30px;';
  const groupStyle = 'display: flex; align-items: center; width: 350px;';
</script>

<div style={boxStyle}>
  <TagGroup maxTagCount={3} showPopover style={groupStyle} {tagList} size="large" {onTagClose} />
</div>
