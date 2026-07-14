<script lang="ts">
  import { useNotification, NotificationHolder, Button } from '@chenzy-design/svelte';

  // useNotification 返回 [api, holderStore]：holderStore 传给 <NotificationHolder>
  // 渲染在组件树内，使经 api 创建的通知继承 holder 所在位置的上下文（如 LocaleProvider）。
  const [api, holderStore] = useNotification();
</script>

<Button
  onclick={() =>
    api.info({
      title: 'Hook Notification',
      content: '经 useNotification 创建，渲染在 contextHolder 所在位置。',
      duration: 3,
    })}
>
  Display with Hook
</Button>

<NotificationHolder store={holderStore} />
