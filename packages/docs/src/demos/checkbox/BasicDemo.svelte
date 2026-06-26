<script lang="ts">
  import { Checkbox, CheckboxGroup, Text } from '@chenzy-design/svelte';

  let checks = $state<(string | number)[]>(['a']);
  let cardChecks = $state<(string | number)[]>(['pro']);
</script>

<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px;">
  <CheckboxGroup
    value={checks}
    onChange={(v) => (checks = v)}
    options={[
      { label: '选项 A', value: 'a' },
      { label: '选项 B', value: 'b' },
      { label: '选项 C（禁用）', value: 'c', disabled: true },
    ]}
  />
  <Text type="tertiary">已选：{checks.join(', ') || '（无）'}</Text>

  <Text type="tertiary">type=card / pureCard 卡片形态（整卡命中区，Group 透传，单项可覆盖）：</Text>
  <div data-testid="checkbox-card">
    <CheckboxGroup
      type="card"
      direction="vertical"
      value={cardChecks}
      onChange={(v) => (cardChecks = v)}
    >
      <Checkbox value="pro" extra="解锁全部高级特性">专业版</Checkbox>
      <Checkbox value="team" extra="多人协作与权限管理">团队版</Checkbox>
      <Checkbox value="plain" type="pureCard" extra="本项用 pureCard 覆盖（无边框）"
        >无边框项</Checkbox
      >
    </CheckboxGroup>
  </div>
  <Text type="tertiary">卡片已选：{cardChecks.join(', ') || '（无）'}</Text>

  <Text type="tertiary">status 校验态（Group 透传，单项可覆盖）：</Text>
  <div data-testid="checkbox-status">
    <CheckboxGroup status="error" defaultValue={['a']}>
      <Checkbox value="a">error 透传</Checkbox>
      <Checkbox value="b">error 透传</Checkbox>
      <Checkbox value="c" status="warning">单项覆盖 warning</Checkbox>
    </CheckboxGroup>
  </div>
</div>
