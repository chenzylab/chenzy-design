<script lang="ts">
  import { Spin, Button, Text } from '@chenzy-design/svelte';

  let spinWrap = $state(true);
</script>

<div style="display:flex; align-items:center; gap:48px; flex-wrap:wrap">
  <div>
    <Text type="tertiary">三尺寸 inline</Text>
    <div style="display:flex; align-items:center; gap:24px; margin-top:8px">
      <Spin size="small" />
      <Spin size="default" />
      <Spin size="large" />
    </div>
  </div>
  <div>
    <Text type="tertiary">带文案</Text>
    <div style="margin-top:8px"><Spin tip="加载中" /></div>
  </div>
</div>

<div style="margin-top:16px">
  <Button onclick={() => (spinWrap = !spinWrap)}>{spinWrap ? '停止' : '开始'}加载</Button>
  <div style="margin-top:8px; width:280px">
    <Spin spinning={spinWrap} tip="数据加载中">
      <div style="padding:24px; background:var(--cd-color-fill-0); border-radius:8px; line-height:1.8">
        这是被包裹的卡片内容。<br />加载时上方会覆盖半透明遮罩 + 居中指示器，内容不可交互。
      </div>
    </Spin>
  </div>
</div>
