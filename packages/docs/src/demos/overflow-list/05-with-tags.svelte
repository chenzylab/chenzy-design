<script lang="ts">
  import { OverflowList, Tag, Avatar, Text } from '@chenzy-design/svelte';

  const tags = ['前端', '后端', 'UI', 'UX', '数据', '算法', '运维', '安全', '测试'];
  const members = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
  let tagWidth = $state(280);
  let avatarWidth = $state(180);
</script>

<Text type="tertiary">配合 Tag 标签组：容器放不下时把多余标签折叠为 +N</Text>
<input type="range" min="120" max="560" bind:value={tagWidth} style="width:320px;display:block;margin:8px 0" aria-label="标签容器宽度" />
<div style="width:{tagWidth}px;border:1px dashed var(--cd-color-border);padding:8px;border-radius:6px">
  <OverflowList items={tags} ariaLabel="技能标签">
    {#snippet item({ item })}
      <Tag color="primary">{item}</Tag>
    {/snippet}
  </OverflowList>
</div>

<div style="margin-top:24px">
  <Text type="tertiary">配合 Avatar 头像组：溢出头像折叠为 +N（自定义 overflow）</Text>
</div>
<input type="range" min="80" max="480" bind:value={avatarWidth} style="width:320px;display:block;margin:8px 0" aria-label="头像容器宽度" />
<div style="width:{avatarWidth}px;border:1px dashed var(--cd-color-border);padding:8px;border-radius:6px">
  <OverflowList items={members} gap={6} ariaLabel="成员头像">
    {#snippet item({ item })}
      <Avatar size="small" color="blue">{item.charAt(0)}</Avatar>
    {/snippet}
    {#snippet overflow({ overflowCount })}
      <Avatar size="small" color="grey">+{overflowCount}</Avatar>
    {/snippet}
  </OverflowList>
</div>
