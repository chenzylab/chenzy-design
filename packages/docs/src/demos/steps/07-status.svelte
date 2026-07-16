<script lang="ts">
  import { Steps } from '@chenzy-design/svelte';
</script>

<Steps type="basic" current={1} status="error" onChange={(i) => console.log(i)}>
  <Steps.Step title="已完成" description="这是一段描述" />
  <Steps.Step title="进行中" description="这是一段描述" />
  <Steps.Step title="等待中" description="这是一段描述" />
</Steps>
