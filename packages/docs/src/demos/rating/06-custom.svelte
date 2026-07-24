<script lang="ts">
  import { Rating } from '@chenzy-design/svelte';
  import { IconLikeHeart } from '@chenzy-design/icons';
</script>

<div>
  <Rating style="color: red;" character={heart} defaultValue={3} />
  <br />
  <br />
  <Rating style="color: red;" size={48} allowHalf character={heartLarge} defaultValue={3} />
  <br />
  <br />
  <Rating character="赞" size={18} defaultValue={3} />
  <br />
  <br />
  <Rating count={10} defaultValue={6} />
</div>

{#snippet heart()}
  <IconLikeHeart size="extra-large" />
{/snippet}

{#snippet heartLarge()}
  <IconLikeHeart style="font-size: 48px;" />
{/snippet}
