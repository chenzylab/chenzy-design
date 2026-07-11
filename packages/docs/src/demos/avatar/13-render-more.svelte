<script lang="ts">
  import { Avatar, AvatarGroup, Popover } from '@chenzy-design/svelte';

  const items = [
    { color: 'red' as const, alt: 'Lisa LeBlanc', content: 'LL' },
    { alt: 'Caroline Xiao', content: 'CX' },
    { color: 'amber' as const, alt: 'Rafal Matin', content: 'RM' },
    { alt: 'Zank Lance', content: 'ZL' },
    { alt: 'Youself Zhang', content: 'YZ' },
  ];
</script>

<!-- renderMore 自定义「+N」溢出头像，可结合 Popover 展开剩余成员 -->
<AvatarGroup {items} maxCount={3}>
  {#snippet renderMore({ restNumber, restAvatars })}
    <Popover trigger="click">
      <Avatar>{`+${restNumber}`}</Avatar>
      {#snippet content()}
        <div style="padding:8px;display:flex;flex-direction:column;gap:8px;">
          {#each restAvatars as a (a.alt)}
            <div style="display:flex;align-items:center;gap:8px;">
              <Avatar size="extra-small" color={a.color} alt={a.alt}
                >{a.content}</Avatar
              >
              <span style="font-size:14px;">{a.alt}</span>
            </div>
          {/each}
        </div>
      {/snippet}
    </Popover>
  {/snippet}
</AvatarGroup>
