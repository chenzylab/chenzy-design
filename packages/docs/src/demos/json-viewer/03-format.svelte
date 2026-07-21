<script lang="ts">
  // 对齐 Semi「格式化配置」：options.formatOptions 设置缩进/换行符，ref.format() 触发格式化。
  import { JsonViewer, Button } from '@chenzy-design/svelte';

  const data = `{
  "name": "Semi",
  "version": "0.0.0"
}`;

  let viewer = $state<{ format: () => void } | null>(null);
</script>

<div>
  <Button onclick={() => viewer?.format()}>格式化</Button>
  <div style="margin-bottom: 16px; margin-top: 16px;">
    <JsonViewer
      bind:this={viewer}
      height={100}
      width={700}
      value={data}
      options={{ formatOptions: { tabSize: 4, insertSpaces: true, eol: '\n' } }}
    />
  </div>
</div>
