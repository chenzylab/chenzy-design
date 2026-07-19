<!--
  获取当前动画实例：getAnimationInstance 拿到当前播放的 AnimationItem 实例，
  实例上含许多方法用于调整动画参数（播放暂停、获取当前帧序号、调整播放速度等）。
  更多信息参考 lottie-web 文档。严格对齐 Semi lottie 文档「获取当前动画实例」。
-->
<script lang="ts">
  import { Lottie } from '@chenzy-design/svelte';
  import type { AnimationItem } from 'lottie-web';

  const jsonURL =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/lottie_demo.json';

  function handleInstance(animation: AnimationItem | null): void {
    // 实例含 play / pause / setSpeed / goToAndStop 等方法。
    console.log('animation', animation);
  }
</script>

<div>
  <Lottie
    getAnimationInstance={handleInstance}
    params={{ path: jsonURL }}
    width="300px"
    height="300px"
  />
</div>
