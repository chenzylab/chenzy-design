<!--
  browser project 夹具（真实 chromium）：只挂一个 Chat，用于验证输入框的 hover / focus 视觉。
  为什么必须在真实浏览器：CSS `:hover` 只有真实指针才会命中，jsdom 无样式、
  CDP 后台标签（document.hidden）下合成鼠标也不投递。
-->
<script lang="ts">
  // 必须显式引入 tokens：browser project 不像 docs 那样自动带上设计变量 CSS，
  // 不引则所有 var(--cd-*) 解析失败、border/背景全读成 0px / transparent，
  // 断言会「恒真」而测不出任何回归（本用例第一版就踩了这个坑）。
  import '@chenzy-design/tokens/tokens.css';
  import Chat from './Chat.svelte';
</script>

<!-- 不传 placeholder：对齐 Semi（无内置默认文案，不传即不显示占位符）。 -->
<Chat chats={[]} />
