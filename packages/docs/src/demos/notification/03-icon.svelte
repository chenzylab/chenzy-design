<script lang="ts">
  import { notification, Button } from '@chenzy-design/svelte';
  import { IconGift, IconStar } from '@chenzy-design/icons';

  const opts = {
    title: 'Hi, Bytedance',
    content: 'ies dance dance dance',
    duration: 3,
  };
</script>

<h5>默认的图标</h5>
<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px">
  <Button type="primary" onclick={() => notification.success(opts)}>Success</Button>
  <Button onclick={() => notification.info(opts)}>Info</Button>
  <Button type="warning" onclick={() => notification.warning(opts)}>Warning</Button>
  <Button type="danger" onclick={() => notification.error(opts)}>Error</Button>
</div>

<h5>自定义图标</h5>
<div style="display:flex; gap:8px; flex-wrap:wrap">
  <Button icon={giftBtnIcon} onclick={() => notification.info({ ...opts, icon: giftIcon })} />
  <Button icon={starBtnIcon} onclick={() => notification.info({ ...opts, icon: starIcon })} />
</div>

{#snippet giftBtnIcon()}
  <IconGift />
{/snippet}
{#snippet starBtnIcon()}
  <IconStar />
{/snippet}
{#snippet giftIcon()}
  <IconGift size="large" style="color: var(--cd-color-danger)" />
{/snippet}
{#snippet starIcon()}
  <IconStar size="large" style="color: #f5a623" />
{/snippet}
