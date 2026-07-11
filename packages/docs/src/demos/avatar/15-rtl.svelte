<script lang="ts">
  import { Avatar, AvatarGroup, ConfigProvider, Button, Text } from '@chenzy-design/svelte';

  let dir = $state<'ltr' | 'rtl'>('rtl');

  const items = [
    { color: 'red' as const, alt: 'Lisa LeBlanc', content: 'LL' },
    { alt: 'Caroline Xiao', content: 'CX' },
    { color: 'amber' as const, alt: 'Rafal Matin', content: 'RM' },
    { alt: 'Zank Lance', content: 'ZL' },
    { alt: 'Youself Zhang', content: 'YZ' },
  ];
</script>

<Text type="tertiary"
  >在 wrap 包裹元素上写 <code>dir</code> 建立方向作用域：RTL 下头像组层叠方向、hover
  遮罩定位随之镜像。</Text
>

<div style="margin-top:12px; display:flex; gap:8px">
  <Button type={dir === 'ltr' ? 'primary' : 'secondary'} onclick={() => (dir = 'ltr')}>LTR</Button>
  <Button type={dir === 'rtl' ? 'primary' : 'secondary'} onclick={() => (dir = 'rtl')}>RTL</Button>
</div>

<ConfigProvider wrap {dir}>
  <div
    style="margin-top:12px; padding:16px; border:1px dashed var(--cd-color-border); border-radius:8px; display:flex; flex-direction:column; gap:16px;"
  >
    <Text type="tertiary">当前方向：<strong>{dir}</strong></Text>
    <AvatarGroup {items} maxCount={3} />
    <div style="display:flex; gap:16px; align-items:center;">
      <Avatar color="red" alt="Bob">
        BD
        {#snippet hoverMask()}
          <div
            style="background-color:var(--cd-color-mask);height:100%;width:100%;display:flex;align-items:center;justify-content:center;color:#fff;"
          >
            📷
          </div>
        {/snippet}
      </Avatar>
      <Avatar
        color="amber"
        bottomSlot={{ shape: 'square', bgColor: '#FE2C55', text: '直播中' }}
       >T</Avatar
      >
    </div>
  </div>
</ConfigProvider>
