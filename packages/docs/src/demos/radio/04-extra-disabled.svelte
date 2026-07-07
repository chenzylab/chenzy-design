<script lang="ts">
  import { Radio, Button, Space } from '@chenzy-design/svelte';

  let disabled = $state(true);
</script>

<Space vertical align="start">
  <!-- extra 辅助文本（仅 type=default 生效） -->
  <div style="width:320px">
    <Radio value="semi" extra="Semi Design 是由抖音前端团队与 UED 团队共同设计开发并维护的设计系统">
      Semi Design
    </Radio>
  </div>

  <!-- disabled 禁用（含默认选中的禁用态） -->
  <Radio value="a" {disabled}>未选中 · 禁用</Radio>
  <Radio value="b" defaultChecked {disabled}>已选中 · 禁用</Radio>
  <Button size="small" type="primary" onclick={() => (disabled = !disabled)}>
    切换禁用
  </Button>
</Space>
