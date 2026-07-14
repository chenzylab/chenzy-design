<script lang="ts">
  import { TagGroup } from '@chenzy-design/svelte';

  // 通过 tagList 传入配置，maxTagCount 超出后显示为 +N；showPopover 控制 hover +N 弹层展示剩余。
  const tagList = [
    { color: 'light-blue', children: '抖音' },
    { color: 'cyan', children: '火山' },
    { color: 'violet', children: '剪映' },
    { color: 'white', children: '醒图' },
  ];
  const src =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png';
  const tagList2 = [
    { color: 'white', children: 'Douyin', avatarSrc: src },
    { color: 'white', children: 'Hotsoon', avatarSrc: src },
    { color: 'white', children: 'Capcut', avatarSrc: src },
    { color: 'white', children: 'Xingtu', avatarSrc: src },
  ];
  const boxStyle =
    'background-color: var(--cd-color-fill-0); height: 35px; width: 300px; display: flex; align-items: center; padding: 0 10px; margin-bottom: 30px;';
  const groupStyle = 'display: flex; align-items: center; width: 350px;';
</script>

<div style={boxStyle}>
  <TagGroup maxTagCount={3} style={groupStyle} {tagList} size="large" />
</div>
<div style={boxStyle}>
  <TagGroup maxTagCount={2} style={groupStyle} tagList={tagList2} size="large" avatarShape="circle" showPopover />
</div>
