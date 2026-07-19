<script lang="ts">
  import { RadioGroup, Space } from '@chenzy-design/svelte';

  // 通过配置 options 参数来渲染单选框。
  let value1 = $state<string | number | boolean>('Guest');
  let value2 = $state<string | number | boolean>('Developer');
  let value3 = $state<string | number | boolean>('Maintainer');

  const plainOptions = ['Guest', 'Developer', 'Maintainer'];
  const options = [
    { label: 'Guest', value: 'Guest', extra: 'Semi Design', style: 'width: 120px;' },
    { label: 'Developer', value: 'Developer', extra: 'Semi Design', style: 'width: 120px;' },
    { label: 'Maintainer', value: 'Maintainer', extra: 'Semi Design', style: 'width: 120px;' },
  ];
  const optionsWithDisabled = [
    { label: 'Guest', value: 'Guest' },
    { label: 'Developer', value: 'Developer' },
    { label: 'Maintainer', value: 'Maintainer', disabled: true },
  ];
</script>

<Space vertical align="start" spacing="loose">
  <RadioGroup
    options={plainOptions}
    value={value1}
    onChange={(e) => (value1 = e.target.value ?? 'Guest')}
    ariaLabel="单选组合示例"
    name="demo-radio-group-1"
  />
  <RadioGroup
    options={optionsWithDisabled}
    value={value2}
    onChange={(e) => (value2 = e.target.value ?? 'Developer')}
    ariaLabel="单选组合示例"
    name="demo-radio-group-2"
  />
  <RadioGroup
    options={options}
    value={value3}
    onChange={(e) => (value3 = e.target.value ?? 'Maintainer')}
    ariaLabel="单选组合示例"
    name="demo-radio-group-3"
  />
</Space>
