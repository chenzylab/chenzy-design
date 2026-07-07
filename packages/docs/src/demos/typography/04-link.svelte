<script lang="ts">
  import { Link } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 8px;">
  <Link href="https://svelte.dev" target="_blank">新窗口打开链接（自动 rel）</Link>
  <Link href="https://svelte.dev" underline>带下划线的链接</Link>
  <Link href="https://svelte.dev" icon={linkIcon}>带前置图标的链接</Link>
</div>

{#snippet linkIcon()}
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
{/snippet}
