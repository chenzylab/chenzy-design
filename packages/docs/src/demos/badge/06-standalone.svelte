<script lang="ts">
  import { Badge } from '@chenzy-design/svelte';
</script>

<!-- 独立使用：无 children 时徽标脱离宿主，与文字组合表达状态 -->
<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
  <Badge count={5} />
  <Badge count="NEW" theme="light" />
  <Badge count={99} overflowCount={10} type="danger" />
  <span><Badge dot type="primary" /> 进行中 processing</span>
  <span><Badge dot type="tertiary" /> 信息 info</span>
  <span><Badge dot type="success" /> 成功 success</span>
  <span><Badge dot type="warning" /> 提醒 warning</span>
  <span><Badge dot type="danger" /> 错误 error</span>
</div>
