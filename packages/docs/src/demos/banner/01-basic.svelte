<script lang="ts">
  import { Banner, Button } from '@chenzy-design/svelte';

  // 横幅常驻，由用户主动关闭；onClose 回调可用于同步外部显隐状态。
  let visible = $state(true);
</script>

<div class="components-layout-demo banner-basic">
  <div class="banner-row" style="height: 64px; line-height: 64px;">Header</div>
  {#if visible}
    <Banner
      onClose={() => (visible = false)}
      description="Semi D2C 现已支持 Figma DevMode, 安装插件，随时查阅图层对应的前端代码"
    />
  {/if}
  <div class="banner-row" style="height: 200px; line-height: 200px;">Content</div>
  <div class="banner-row" style="height: 64px; line-height: 64px;">Footer</div>
</div>

<Button
  onclick={() => (visible = !visible)}
  style="display: block; width: 120px; margin: 12px auto 0;"
>
  {visible ? 'Hide Banner' : 'Show Banner'}
</Button>

<style>
  .banner-row {
    background: var(--cd-color-fill-0);
    text-align: center;
  }
</style>
