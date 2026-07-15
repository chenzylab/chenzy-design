<script lang="ts">
  import { getConfigResponsive, Text, type BreakpointScreens } from '@chenzy-design/svelte';

  // 在子组件里读 ConfigProvider 的响应式断点能力（等价 Semi ConfigConsumer 的
  // onBreakpoint / screens）。订阅须在 $effect 内并返回取消函数。
  const responsive = getConfigResponsive();
  let screens = $state<BreakpointScreens | undefined>(responsive?.screens);

  $effect(() => {
    const onBreakpoint = responsive?.onBreakpoint;
    if (!onBreakpoint) return;
    // onBreakpoint(cb)：cb 拿到完整 screens 映射，订阅时立即回调一次当前状态。
    const unsubscribe = onBreakpoint((next) => {
      screens = next;
    });
    return unsubscribe;
  });

  const active = $derived(
    screens
      ? Object.entries(screens)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(', ') || '（无命中）'
      : '（未订阅）',
  );
</script>

<Text>当前命中断点：<strong>{active}</strong></Text>
<Text type="tertiary" size="small">{JSON.stringify(screens)}</Text>
