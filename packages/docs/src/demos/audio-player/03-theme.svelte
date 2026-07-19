<!--
  主题：theme="light" 浅色主题（默认 dark）。此例配合对象数组播放列表演示 light 主题。
  严格对齐 Semi「主题」。
-->
<script lang="ts">
  import { AudioPlayer } from '@chenzy-design/svelte';

  const audio1 =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/components/audio1.mp3';
  const audio2 =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/components/audio2.mp3';
  const cover =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg';
</script>

<AudioPlayer
  audioUrl={[
    { src: audio1, title: 'Audio One', cover },
    { src: audio2, title: 'Audio Two', cover },
  ]}
  theme="light"
  autoPlay={false}
/>
