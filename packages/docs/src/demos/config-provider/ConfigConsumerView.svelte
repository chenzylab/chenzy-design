<script lang="ts">
  // 对齐 Semi 的 `<ConfigConsumer>{(value) => ...}</ConfigConsumer>`：
  // React 用 render-props 拿 context 值，本库用 getConfigContext() —— 须在组件初始化期
  // （`<script>` 顶层）调用，返回对象带 getter，故渲染期读到的始终是最新合并结果。
  import { getConfigContext, Text } from '@chenzy-design/svelte';

  const config = getConfigContext();
</script>

<Text
  ellipsis={{ showTooltip: { opts: { style: 'min-width: 1200px' } } }}
  style="width: 600px"
>
  {JSON.stringify(config)}
</Text>
