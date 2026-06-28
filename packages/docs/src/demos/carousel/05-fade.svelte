<script lang="ts">
  import { Carousel } from '@chenzy-design/svelte';
</script>

{#snippet s1()}
  <div style="height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;background:linear-gradient(135deg,#1864ab,#1098ad);color:#fff">
    <strong style="font-size:18px">渐隐切换</strong>
    <span style="opacity:.85">animation = "fade"</span>
  </div>
{/snippet}
{#snippet s2()}
  <div style="height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;background:linear-gradient(135deg,#5f3dc4,#9c36b5);color:#fff">
    <strong style="font-size:18px">自定义内容</strong>
    <span style="opacity:.85">幻灯片可放任意 Snippet</span>
  </div>
{/snippet}
{#snippet s3()}
  <div style="height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;background:linear-gradient(135deg,#e8590c,#f08c00);color:#fff">
    <strong style="font-size:18px">自定义箭头</strong>
    <span style="opacity:.85">arrowProps 替换箭头图标</span>
  </div>
{/snippet}

{#snippet leftIcon()}<span>◀</span>{/snippet}
{#snippet rightIcon()}<span>▶</span>{/snippet}

<div style="width: 360px">
  <Carousel
    slides={[s1, s2, s3]}
    animation="fade"
    speed={500}
    arrowProps={{ leftArrow: { children: leftIcon }, rightArrow: { children: rightIcon } }}
    height={180}
    theme="light"
  />
</div>
