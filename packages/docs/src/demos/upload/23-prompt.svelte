<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
</script>

<Space vertical align="start">
  <Text type="tertiary">prompt + promptPosition（对齐 Semi）：提示文本随位置在触发器 左 / 右 / 下 排列。</Text>

  <Text type="tertiary">promptPosition="right"（默认）</Text>
  <Upload action="/api/upload" promptPosition="right" prompt="支持 jpg / png，单个不超过 2MB" />

  <Text type="tertiary">promptPosition="left"</Text>
  <Upload action="/api/upload" promptPosition="left" prompt="点击右侧按钮选择文件" />

  <Text type="tertiary">promptPosition="bottom"</Text>
  <Upload action="/api/upload" promptPosition="bottom" prompt="提示文本位于上传区下方" />
</Space>
