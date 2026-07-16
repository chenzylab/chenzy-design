<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
</script>

<Space vertical align="start">
  <Text type="tertiary">
    children 自定义拖拽区（对齐 Semi）：draggable + children 时，拖拽区外观完全由 children 决定（无默认虚线框/文案）。
  </Text>
  <Upload draggable multiple action="/api/upload">
    <div
      style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:32px 48px;border:2px dashed var(--cd-color-primary);border-radius:12px;background:var(--cd-color-primary-light-default);color:var(--cd-color-primary);cursor:pointer;"
    >
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" aria-hidden="true">
        <path
          d="M12 16V4m0 0-4 4m4-4 4 4M4 20h16"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <strong>点击或拖拽文件到此处</strong>
      <span style="font-size:12px;opacity:0.75;">完全自定义的上传区域</span>
    </div>
  </Upload>
</Space>
