<!--
  基本用法（path）：Lottie 动画资源 JSON 在 CDN 上时，向 params 传入 path=JSON 的 URL。
  严格对齐 Semi lottie 文档「基本用法」第一段。
-->
<script lang="ts">
  import { Lottie } from '@chenzy-design/svelte';

  const jsonURL =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/lottie_demo.json';
</script>

<div>
  <Lottie params={{ path: jsonURL }} width="300px" height="300px" />
</div>
