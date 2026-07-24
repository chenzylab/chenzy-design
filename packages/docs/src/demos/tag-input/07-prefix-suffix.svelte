<script lang="ts">
  import { TagInput } from '@chenzy-design/svelte';
  import { IconVigoLogo, IconGift } from '@chenzy-design/icons';
</script>

<TagInput>
  {#snippet prefix()}
    <IconVigoLogo />
  {/snippet}
</TagInput>
<br />
<br />
<TagInput prefix="Prefix" />
<br />
<br />
<TagInput>
  {#snippet suffix()}
    <IconGift />
  {/snippet}
</TagInput>
<br />
<br />
<TagInput suffix="Suffix" />
