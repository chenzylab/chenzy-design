<script lang="ts">
  import { Spin, Button } from '@chenzy-design/svelte';

  let spinning = $state(true);
</script>

<Button onclick={() => (spinning = !spinning)}>{spinning ? '停止' : '开始'}加载</Button>
<div style="margin-top:8px; width:280px">
  <Spin {spinning} tip="数据加载中">
    <div style="padding:24px; background:var(--cd-color-fill-0); border-radius:8px; line-height:1.8">
      这是被包裹的卡片内容。<br />加载时上方会覆盖半透明遮罩 + 居中指示器。
    </div>
  </Spin>
</div>
