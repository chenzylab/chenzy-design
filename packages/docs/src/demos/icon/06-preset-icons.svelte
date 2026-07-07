<script lang="ts">
  // 这是「纯 class 图标路径」——不经过 <Icon> 组件，直接用 UnoCSS preset-icons
  // 生成的 i-<collection>-<name> class。图标数据来自本地 @iconify-json/lucide。
  // class 必须静态出现在源码中，UnoCSS 才能在构建期生成对应 CSS。
</script>

<div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap; font-size: 24px;">
  <span class="i-lucide-house" aria-hidden="true"></span>
  <span class="i-lucide-search" aria-hidden="true"></span>
  <span class="i-lucide-heart" aria-hidden="true"></span>
  <span class="i-lucide-settings" aria-hidden="true"></span>
  <!-- 颜色继承 currentColor，直接用 text 工具类改色 -->
  <span class="i-lucide-star text-amber-500" aria-hidden="true"></span>
  <!-- 语义图标：给可访问名称，去掉 aria-hidden -->
  <span class="i-lucide-bell" role="img" aria-label="通知"></span>
</div>
