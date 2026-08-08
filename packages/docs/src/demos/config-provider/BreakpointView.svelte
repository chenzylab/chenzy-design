<script lang="ts">
  // 严格复刻 Semi 的 `BreakpointSubscriber`：订阅 onBreakpoint 后打印完整 screens 映射。
  // React 版把 onBreakpoint/screens 经 ConfigConsumer 的 render-props 拿到再 useEffect 订阅；
  // 本库用 getConfigResponsive()（须在组件初始化期调用），订阅放 $effect 并返回取消函数。
  import { getConfigResponsive, Text, type BreakpointScreens } from '@chenzy-design/svelte';

  const responsive = getConfigResponsive();
  let subscribedScreens = $state<BreakpointScreens | undefined>(responsive?.screens);

  $effect(() => {
    const onBreakpoint = responsive?.onBreakpoint;
    if (!onBreakpoint) return;
    // 订阅即回调一次当前命中情况（对齐 Semi：无需在挂载时另调 matchMedia）。
    return onBreakpoint((next) => {
      subscribedScreens = next;
    });
  });
</script>

<Text>{JSON.stringify(subscribedScreens ?? responsive?.screens)}</Text>
