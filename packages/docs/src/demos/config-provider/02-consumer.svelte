<script lang="ts">
  import { ConfigProvider, Select, Text } from '@chenzy-design/svelte';
  import ConfigConsumerView from './ConfigConsumerView.svelte';

  // 对齐 Semi「手动获取值」：通常组件内部自动消费 ConfigProvider 的值，无需关心；
  // 特殊场景可用 getConfigContext（等价 ConfigConsumer）手动读取合并后的配置。
  let timeZone = $state('GMT+08:00');
  const gmtList = [
    { label: 'GMT+08:00', value: 'GMT+08:00' },
    { label: 'GMT+00:00', value: 'GMT+00:00' },
    { label: 'GMT-05:00', value: 'GMT-05:00' },
  ];
</script>

<Text type="tertiary"
  >在 ConfigProvider 子树内的组件里，用 <code>getConfigContext()</code> 手动获取合并后的全局配置。</Text
>

<ConfigProvider {timeZone} direction="ltr">
  <div style="margin-top:12px; display:flex; flex-direction:column; gap:12px">
    <div style="width:200px">
      <Select options={gmtList} value={timeZone} onChange={(v) => (timeZone = v as string)} />
    </div>
    <ConfigConsumerView />
  </div>
</ConfigProvider>
