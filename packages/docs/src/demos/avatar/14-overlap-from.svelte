<script lang="ts">
  import { Avatar, AvatarGroup } from '@chenzy-design/svelte';
</script>

<!-- overlapFrom 控制层叠压盖方向：start=前压后，end=后压前 -->
<div style="display: flex; flex-direction: column; gap: 16px;">
  <AvatarGroup overlapFrom="start">
    <Avatar color="red" alt="Lisa LeBlanc">LL</Avatar>
    <Avatar alt="Caroline Xiao">CX</Avatar>
    <Avatar color="amber" alt="Rafal Matin">RM</Avatar>
    <Avatar style="color:#f56a00;background-color:#fde3cf" alt="Zank Lance">ZL</Avatar>
    <Avatar style="background-color:#87d068" alt="Youself Zhang">YZ</Avatar>
  </AvatarGroup>
  <AvatarGroup overlapFrom="end">
    <Avatar color="red" alt="Lisa LeBlanc">LL</Avatar>
    <Avatar alt="Caroline Xiao">CX</Avatar>
    <Avatar color="amber" alt="Rafal Matin">RM</Avatar>
    <Avatar style="color:#f56a00;background-color:#fde3cf" alt="Zank Lance">ZL</Avatar>
    <Avatar style="background-color:#87d068" alt="Youself Zhang">YZ</Avatar>
  </AvatarGroup>
</div>
