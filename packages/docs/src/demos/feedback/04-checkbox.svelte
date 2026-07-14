<script lang="ts">
  import { Feedback, Button } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<Button onclick={() => (visible = !visible)}>展示反馈: Popup, checkbox</Button>
<Feedback
  type="checkbox"
  checkboxGroupProps={{ options: ['抖音', '火山', '豆包'] }}
  title="您最常使用以下哪些产品？"
  {visible}
  onOk={() => { visible = false; }}
  onCancel={() => { visible = false; }}
/>
