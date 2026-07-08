<script lang="ts">
  import { Upload, Space, Text } from '@chenzy-design/svelte';
</script>

<Space vertical align="start">
  <Text type="tertiary">
    附加请求参数与请求头：uploadData 用函数式按当前文件动态生成字段，headers 传静态对象。
  </Text>
  <Upload
    action="/api/upload"
    multiple
    uploadName="attachment"
    uploadData={(file) => ({ filename: file.name, ts: String(Date.now()) })}
    headers={{ 'X-Upload-Source': 'chenzy-docs', Authorization: 'Bearer demo-token' }}
  />
</Space>
