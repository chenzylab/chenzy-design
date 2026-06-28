<script lang="ts">
  import { ConfigProvider, Switch, Tag, Text } from '@chenzy-design/svelte';

  let reduce = $state(false);
  let applied = $state(false);
</script>

<Text type="tertiary"
  >reducedMotion 显式开启时写全局 <code>data-reduced-motion</code> 标记，令依赖 motion-duration
  token 的库内动画退化为 0ms；'auto'（默认）则跟随系统 prefers-reduced-motion。</Text
>

<ConfigProvider
  reducedMotion={reduce}
  onReducedMotionChange={(info) => (applied = info.reduced)}
>
  <div style="margin-top:12px; display:flex; align-items:center; gap:12px">
    <Switch value={reduce} onChange={(v) => (reduce = v)} />
    <Text type="tertiary">
      reducedMotion={String(reduce)} · reduced={String(applied)}
    </Text>
    <Tag color={applied ? 'warning' : 'success'}>
      {applied ? '动画已降级' : '动画正常'}
    </Tag>
  </div>
</ConfigProvider>
