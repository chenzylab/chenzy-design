<!--
  animationData 用法：动画资源 JSON 需被打包进网站代码时，向 params 传入 animationData=JSON 对象。
  下方 fetch 仅作演示——实际项目中 JSON 应 import 进来（这样才会被打包），而非网络请求获取。
  严格对齐 Semi lottie 文档「基本用法」第二段。
-->
<script lang="ts">
  import { Lottie } from '@chenzy-design/svelte';
  import { onMount } from 'svelte';

  const jsonURL =
    'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/lottie_demo.json';

  let data = $state<unknown>('');

  onMount(() => {
    fetch(jsonURL)
      .then((resp) => resp.json())
      .then((json) => (data = json));
  });
</script>

<div>
  {#if data}
    <Lottie params={{ animationData: data }} width="300px" height="300px" />
  {/if}
</div>
