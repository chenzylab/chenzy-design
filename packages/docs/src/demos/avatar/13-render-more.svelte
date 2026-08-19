<script lang="ts">
  import { Avatar, AvatarGroup, Popover } from '@chenzy-design/svelte';
</script>

<!-- renderMore 自定义「+N」溢出头像，可结合 Popover 展开剩余成员 -->
<AvatarGroup maxCount={3}>
  <Avatar color="red" alt="Lisa LeBlanc">LL</Avatar>
  <Avatar alt="Caroline Xiao">CX</Avatar>
  <Avatar color="amber" alt="Rafal Matin">RM</Avatar>
  <Avatar style="color:#f56a00;background-color:#fde3cf" alt="Zank Lance">ZL</Avatar>
  <Avatar style="background-color:#87d068" alt="Youself Zhang">YZ</Avatar>
  {#snippet renderMore(restNumber, restAvatars)}
    <Popover
      autoAdjustOverflow={false}
      position="bottomRight"
      style="padding: 12px 8px; padding-bottom: 0;"
    >
      <Avatar>{`+${restNumber}`}</Avatar>
      {#snippet content()}
        {#each restAvatars as a, index (index)}
          <div style="padding-bottom:12px;">
            <Avatar
              size="extra-small"
              color={a.color}
              src={a.src}
              srcSet={a.srcSet}
              style={a.style}
              alt={a.alt}
            >
              {#snippet children()}{@render a.content?.()}{/snippet}
            </Avatar>
            <span style="margin-left:8px;font-size:14px;">这是段文字描述</span>
          </div>
        {/each}
      {/snippet}
    </Popover>
  {/snippet}
</AvatarGroup>
