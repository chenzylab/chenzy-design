<script lang="ts">
  import { Steps } from '@chenzy-design/svelte';
</script>

<div style="display: flex; justify-content: center;">
  <Steps type="nav" current={1}>
    <Steps.Step title="注册账号" />
    <Steps.Step title="这个项目的文字比较多多多多" />
    <Steps.Step title="产品用途" />
    <Steps.Step title="期待尝试功能" />
  </Steps>
</div>
