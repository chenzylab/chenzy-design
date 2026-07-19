<script lang="ts">
  // 对齐 Semi「自动换行」：options.autoWrap 控制超长内容是否折行（默认 true）。
  import { JsonViewer } from '@chenzy-design/svelte';

  const value = JSON.stringify(
    {
      description:
        '这是一段很长的描述文本，用于演示 JsonViewer 的自动换行能力：当一行内容超出容器宽度时，autoWrap 为 true 会折行显示，为 false 则出现横向滚动条。',
      url: 'https://example.com/a/very/long/path/that/exceeds/the/container/width/for/demo',
    },
    null,
    2,
  );
</script>

<JsonViewer {value} height={220} width="100%" options={{ autoWrap: true }} />
