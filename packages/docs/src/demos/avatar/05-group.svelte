<script lang="ts">
  import { Avatar, AvatarGroup } from '@chenzy-design/svelte';

  const items = [
    { content: '陈' },
    { content: '张' },
    { content: '李' },
    { content: '王' },
    { content: '赵' },
  ];
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  <AvatarGroup {items} maxCount={3} />
  <AvatarGroup size="small">
    <Avatar color="auto" alt="陈">陈</Avatar>
    <Avatar color="auto" alt="张">张</Avatar>
    <Avatar color="auto" alt="李">李</Avatar>
    <Avatar color="auto" alt="王">王</Avatar>
  </AvatarGroup>
</div>
