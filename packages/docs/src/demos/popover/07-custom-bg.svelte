<script lang="ts">
  import { Popover, Tag } from '@chenzy-design/svelte';
</script>

<Popover
  content="Hi, chenzy-design Popover."
  trigger="custom"
  visible
  position="right"
  showArrow
  arrowStyle={{ backgroundColor: 'var(--cd-color-primary)', borderColor: 'var(--cd-color-primary)' }}
  style="background: var(--cd-color-primary); border-color: var(--cd-color-primary); color: var(--cd-color-white);"
>
  <Tag style="background: var(--cd-color-primary); color: var(--cd-color-white);">Colorful Popover</Tag>
</Popover>
