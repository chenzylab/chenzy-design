<script lang="ts">
  import { FloatButton } from '@chenzy-design/svelte';
  import { IconAIEditLevel1 } from '@chenzy-design/icons';
</script>

<div style="display:flex; gap:24px; align-items:center; flex-wrap:wrap; padding:8px 0">
  <FloatButton
    disabled
    badge={{ dot: true, type: 'danger' }}
    style="position:static"
  >
    {#snippet icon()}
      <IconAIEditLevel1 />
    {/snippet}
  </FloatButton>

  <FloatButton
    size="large"
    badge={{ count: 1000, overflowCount: 999 }}
    style="position:static"
  >
    {#snippet icon()}
      <IconAIEditLevel1 />
    {/snippet}
  </FloatButton>

  <FloatButton
    colorful
    badge={{ dot: true }}
    style="position:static"
  >
    {#snippet icon()}
      <IconAIEditLevel1 />
    {/snippet}
  </FloatButton>

  <FloatButton
    colorful
    size="large"
    badge={{ count: 'VIP', type: 'danger' }}
    style="position:static"
  >
    {#snippet icon()}
      <IconAIEditLevel1 />
    {/snippet}
  </FloatButton>
</div>
