<script lang="ts">
  import { Banner, Link } from '@chenzy-design/svelte';

  // fullMode={false} 使用非全屏模式；bordered 显示边框。
  // icon={null}、closeIcon={null} 隐藏图标与关闭按钮。
  const types = ['info', 'warning', 'danger', 'success'] as const;
</script>

<div class="components-banner-demo" style="width: 640px;">
  {#each types as type, i (type)}
    {#if i > 0}<br />{/if}
    <Banner fullMode={false} {type} bordered icon={null} closeIcon={null}>
      {#snippet titleSnippet()}
        <div style="font-weight: 600; font-size: 14px; line-height: 20px;">不知道 AppKey？</div>
      {/snippet}
      {#snippet descriptionSnippet()}
        <div>
          你可先联系对应的研发同学，确认是否已在
          <Link href="https://semi.design/">应用云平台</Link>
          申请了应用，并填写对应的信息。
        </div>
      {/snippet}
    </Banner>
  {/each}
</div>

<style>
  .components-banner-demo :global(.cd-banner-info.cd-banner-bordered) {
    border: 1px solid var(--cd-color-primary-disabled);
  }
  .components-banner-demo :global(.cd-banner-warning.cd-banner-bordered) {
    border: 1px solid var(--cd-color-warning-light-active);
  }
  .components-banner-demo :global(.cd-banner-danger.cd-banner-bordered) {
    border: 1px solid var(--cd-color-danger-light-active);
  }
  .components-banner-demo :global(.cd-banner-success.cd-banner-bordered) {
    border: 1px solid var(--cd-color-success-light-active);
  }
</style>
