<script lang="ts">
  import { Checkbox, CheckboxGroup, Text } from '@chenzy-design/svelte';

  let cardChecks = $state<(string | number)[]>(['pro']);
</script>

<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
  <CheckboxGroup
    type="card"
    direction="vertical"
    value={cardChecks}
    onChange={(v) => (cardChecks = v)}
  >
    <Checkbox value="pro" extra="解锁全部高级特性">专业版</Checkbox>
    <Checkbox value="team" extra="多人协作与权限管理">团队版</Checkbox>
    <Checkbox value="plain" type="pureCard" extra="无边框卡片项">企业版</Checkbox>
  </CheckboxGroup>
  <Text type="tertiary">已选：{cardChecks.join(', ') || '（无）'}</Text>
</div>
