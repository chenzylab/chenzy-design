<script lang="ts">
  import { ConfigProvider, Button, Tag, Input, Text } from '@chenzy-design/svelte';

  // 对齐 Semi RTL/LTR：全局配置 direction 改变组件文本方向；rtl 时 ConfigProvider
  // 渲染 `<div class="cd-rtl">` 包裹层，内部组件随之镜像布局。
  let direction = $state<'ltr' | 'rtl'>('rtl');
</script>

<Text type="tertiary"
  >全局配置 <code>direction</code> 改变组件文本方向；切换 ltr / rtl 观察按钮、标签、输入框的排布与对齐。</Text
>

<div style="margin-top:12px; display:flex; gap:8px">
  <Button type={direction === 'ltr' ? 'primary' : 'tertiary'} onclick={() => (direction = 'ltr')}>
    LTR
  </Button>
  <Button type={direction === 'rtl' ? 'primary' : 'tertiary'} onclick={() => (direction = 'rtl')}>
    RTL
  </Button>
</div>

<ConfigProvider {direction}>
  <div
    style="margin-top:12px; padding:16px; border:1px dashed var(--cd-color-border); border-radius:8px; display:flex; flex-direction:column; gap:12px"
  >
    <Text type="tertiary">当前方向：<strong>{direction}</strong></Text>
    <div style="display:flex; gap:8px; align-items:center">
      <Button type="primary">主要</Button>
      <Button>次要</Button>
      <Tag color="green">起始侧标签</Tag>
    </div>
    <div style="width:240px">
      <Input placeholder="输入框" />
    </div>
  </div>
</ConfigProvider>
