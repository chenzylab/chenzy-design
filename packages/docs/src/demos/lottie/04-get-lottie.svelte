<!--
  获取全局 Lottie：getLottie prop 获取全局 lottie 包，也可用具名导出 getLottie() 获取。
  全局 lottie 上含 setQuality 等全局方法。更多信息参考 lottie-web 文档。
  严格对齐 Semi lottie 文档「获取全局 Lottie」（Semi 用 Lottie.getLottie 静态方法；
  Svelte 组件无法挂静态方法，故等价能力以具名导出 getLottie 提供）。
-->
<script lang="ts">
  import { Lottie, getLottie } from '@chenzy-design/svelte';
  import type { LottiePlayer } from 'lottie-web';

  const jsonURL =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/lottie_demo.json';

  // 具名导出获取全局 lottie（异步 import lottie-web）。
  getLottie().then((lottie) => console.log('lottie (named export)', lottie));

  function handleLottie(lottie: LottiePlayer): void {
    console.log('lottie', lottie);
  }
</script>

<div>
  <Lottie getLottie={handleLottie} params={{ path: jsonURL }} width="300px" height="300px" />
</div>
