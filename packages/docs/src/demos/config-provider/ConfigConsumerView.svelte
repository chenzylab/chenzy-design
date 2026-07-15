<script lang="ts">
  import { getConfigContext, Text } from '@chenzy-design/svelte';

  // 在 ConfigProvider 子树内的组件里，用 getConfigContext 手动获取合并后的全局配置
  // （等价 Semi 的 ConfigConsumer）。须在组件初始化期（<script> 顶层）调用。
  const config = getConfigContext();
</script>

<Text code>{JSON.stringify(config)}</Text>
