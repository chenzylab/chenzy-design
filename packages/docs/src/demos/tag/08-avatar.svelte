<script lang="ts">
  import { Tag, Space } from '@chenzy-design/svelte';

  const src =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png';
</script>

<Space vertical align="start">
  <Tag avatarSrc={src}>焦锐志</Tag>
  <Tag avatarSrc={src} size="large">焦锐志</Tag>
  <Tag avatarSrc={src} size="large" closable>焦锐志</Tag>
  <Tag avatarSrc={src} avatarShape="circle">焦锐志</Tag>
  <Tag avatarSrc={src} avatarShape="circle" size="large">焦锐志</Tag>
  <Tag avatarSrc={src} avatarShape="circle" size="large" closable>焦锐志</Tag>
</Space>
