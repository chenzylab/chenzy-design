<script lang="ts">
  import { Radio, RadioGroup, Text } from '@chenzy-design/svelte';

  let radioVal = $state<string | number | boolean>('1');
  let radioStatusVal = $state<string | number | boolean>('warn');
</script>

<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px;">
  <RadioGroup
    value={radioVal}
    onChange={(v) => (radioVal = v)}
    options={[
      { label: '单选 1', value: '1' },
      { label: '单选 2', value: '2' },
      { label: '单选 3', value: '3' },
    ]}
  />
  <Text type="tertiary">当前：{radioVal}</Text>

  <Text type="tertiary">Group status 透传（warning / error），单项可覆盖：</Text>
  <RadioGroup
    status="error"
    value={radioStatusVal}
    onChange={(v) => (radioStatusVal = v)}
  >
    <Radio value="warn" status="warning">本项覆盖为 warning</Radio>
    <Radio value="err">继承 Group 的 error</Radio>
    <Radio value="ok">同样继承 error</Radio>
  </RadioGroup>
</div>
