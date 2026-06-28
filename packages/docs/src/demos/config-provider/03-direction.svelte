<script lang="ts">
  import { ConfigProvider, Button, Tag, Text } from '@chenzy-design/svelte';

  let dir = $state<'ltr' | 'rtl'>('rtl');
</script>

<Text type="tertiary"
  >dir 在 wrap 包裹元素上写 <code>dir</code> 属性建立方向作用域，内部组件随之镜像布局；切换
  ltr / rtl 观察按钮与标签的排布与对齐方向。</Text
>

<div style="margin-top:12px; display:flex; gap:8px">
  <Button type={dir === 'ltr' ? 'primary' : 'secondary'} onclick={() => (dir = 'ltr')}>
    LTR
  </Button>
  <Button type={dir === 'rtl' ? 'primary' : 'secondary'} onclick={() => (dir = 'rtl')}>
    RTL
  </Button>
</div>

<ConfigProvider wrap {dir}>
  <div
    style="margin-top:12px; padding:16px; border:1px dashed var(--cd-color-border); border-radius:8px"
  >
    <Text type="tertiary">当前方向：<strong>{dir}</strong></Text>
    <div style="margin-top:12px; display:flex; gap:8px; align-items:center">
      <Button type="primary">主要</Button>
      <Button>次要</Button>
      <Tag color="success">起始侧标签</Tag>
    </div>
  </div>
</ConfigProvider>
