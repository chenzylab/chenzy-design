<script lang="ts">
  import { Radio, Button } from '@chenzy-design/svelte';

  let disabled = $state(true);
</script>

<!-- Radio 不可用（含默认选中的禁用态） -->
<div>
  <Radio defaultChecked={false} {disabled} ariaLabel="单选示例" name="demo-radio-disabled">
    Disabled
  </Radio>
  <br />
  <Radio defaultChecked {disabled} ariaLabel="单选示例" name="demo-radio-defaultChecked-disabled">
    Disabled
  </Radio>
  <div style="margin-top: 20px;">
    <Button type="primary" onclick={() => (disabled = !disabled)}>Toggle disabled</Button>
  </div>
</div>
