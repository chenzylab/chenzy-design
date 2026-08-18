<script lang="ts">
  import { Nav, Button } from '@chenzy-design/svelte';
  import { IconStar, IconSetting, IconUser } from '@chenzy-design/icons';

  const fullItems = [
    { itemKey: 'user', text: '用户管理', icon: iconUser },
    { itemKey: 'union', text: '公会中心', icon: iconStar },
    { itemKey: 'job', text: '任务平台', icon: iconSetting, items: ['任务管理', '用户任务查询'] },
  ];
  const shortItems = [
    { itemKey: 'union', text: '公会中心', icon: iconStar },
    { itemKey: 'job', text: '任务平台', icon: iconSetting, items: ['任务管理', '用户任务查询'] },
  ];

  // items 动态增删（对齐 Semi ItemsChange story）：在完整/精简/空三种列表间循环切换。
  // 用独立的 mode 状态而非 items 引用比较——$state(fullItems) 会把数组包一层响应式
  // Proxy，赋值后 items 恒不等于原始 fullItems/shortItems 常量引用，引用比较会永远失败。
  let mode = $state<'full' | 'short' | 'empty'>('full');
  const items = $derived(mode === 'full' ? fullItems : mode === 'short' ? shortItems : []);

  function change(): void {
    mode = mode === 'full' ? 'short' : mode === 'short' ? 'empty' : 'full';
  }
</script>

{#snippet iconUser()}<IconUser />{/snippet}
{#snippet iconStar()}<IconStar />{/snippet}
{#snippet iconSetting()}<IconSetting />{/snippet}

<Button onclick={change}>切换 items（完整 → 精简 → 空）</Button>
<Nav {items} bodyStyle="height: 150px;" />
