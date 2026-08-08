<!--
  获取全局 Lottie：getLottie prop 获取全局 lottie 包，也可用静态方法 Lottie.getLottie() 获取
  （对齐 Semi 同名静态方法）。全局 lottie 上含 setQuality 等全局方法。
  严格对齐 Semi lottie 文档「获取全局 Lottie」。
-->
<script lang="ts">
  import { Lottie } from '@chenzy-design/svelte';
  import type { LottiePlayer } from 'lottie-web';

  const jsonURL =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/lottie_demo.json';

  // 静态方法获取全局 lottie（对齐 Semi Lottie.getLottie；内部异步 import lottie-web）。
  Lottie.getLottie().then((lottie) => console.log('lottie (static method)', lottie));

  function handleLottie(lottie: LottiePlayer): void {
    console.log('lottie', lottie);
  }
</script>

<div>
  <Lottie getLottie={handleLottie} params={{ path: jsonURL }} width="300px" height="300px" />
</div>
