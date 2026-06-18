<!-- Example generated icon. Real icons are codegen'd from SVG assets. -->
<script lang="ts">
  interface Props {
    size?: number;
    label?: string;
  }
  let { size = 16, label }: Props = $props();
</script>

<svg
  class="cd-icon"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : 'true'}
  focusable="false"
>
  <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
</svg>
