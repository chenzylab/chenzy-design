<script lang="ts">
  import { Icon } from '@chenzy-design/svelte';

  const star =
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z"/></svg>';
</script>

<div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
  <!-- svg 字符串作为渲染源（来源须可信；构建期 SVGO 净化） -->
  <Icon size="large" svg={star} />
  <!-- 语义图标：提供 type 后 role=img + aria-label，供屏幕阅读器读出 -->
  <Icon size="large" svg={star} type="收藏" style="color: #ff9a2e;" />
  <!-- fill 覆盖填充色 -->
  <Icon size="extra-large" svg={star} fill="#165dff" />
</div>
