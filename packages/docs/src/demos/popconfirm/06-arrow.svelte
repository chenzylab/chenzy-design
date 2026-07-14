<script lang="ts">
  import { Popconfirm, Button, Space } from '@chenzy-design/svelte';
</script>

<!-- showArrow 显示指向触发元素的小三角；arrowPointAtCenter 让三角指向元素中心。 -->
<Space>
  <Popconfirm title="确定是否要保存此修改？" content="此修改将不可逆" showArrow position="top">
    <Button>带箭头</Button>
  </Popconfirm>

  <Popconfirm
    title="确定是否要保存此修改？"
    content="此修改将不可逆"
    showArrow
    arrowPointAtCenter
    position="topLeft"
  >
    <Button>箭头指向中心</Button>
  </Popconfirm>
</Space>
