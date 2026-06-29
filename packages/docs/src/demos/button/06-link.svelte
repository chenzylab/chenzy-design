<script lang="ts">
  import { Typography } from '@chenzy-design/svelte';

  const { Link } = Typography;
</script>

<!-- 链接型文字按钮推荐用 Typography.Link 实现（而非 Button） -->
<div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
  <Link href="https://github.com/bytegolang/chenzy.design" target="_blank" rel="noreferrer">
    链接文本
  </Link>

  <Link href="https://svelte.dev" target="_blank" rel="noreferrer">
    打开网站
  </Link>

  <!-- 带图标 + 下划线的链接 -->
  <Link href="https://svelte.dev" target="_blank" rel="noreferrer" underline>
    <span style="display: inline-flex; gap: 4px; align-items: center;">
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      带下划线的网页链接
    </span>
  </Link>
</div>
