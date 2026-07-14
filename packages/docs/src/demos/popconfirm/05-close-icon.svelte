<script lang="ts">
  import { Popconfirm, Button, Space } from '@chenzy-design/svelte';
</script>

<!-- showCloseIcon 默认 true，右上角展示关闭按钮；设 false 可隐藏。 -->
<Space>
  <Popconfirm title="确定是否要保存此修改？" content="此修改将不可逆">
    <Button>默认（含关闭按钮）</Button>
  </Popconfirm>

  <Popconfirm title="确定是否要保存此修改？" content="此修改将不可逆" showCloseIcon={false}>
    <Button>隐藏关闭按钮</Button>
  </Popconfirm>
</Space>
