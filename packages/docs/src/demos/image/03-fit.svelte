<script lang="ts">
  import { Image } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 16px; flex-wrap: wrap;">
  {#each ['fill', 'contain', 'cover', 'scale-down'] as fit}
    <div>
      <p style="font-size: 12px; color: #888; margin: 0 0 4px; text-align: center;">{fit}</p>
      <Image
        src="https://picsum.photos/seed/fit/300/200"
        alt="fit={fit}"
        width={120}
        height={90}
        {fit}
      />
    </div>
  {/each}
</div>
