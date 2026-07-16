<script lang="ts">
  // 配合 Grid 布局：CheckboxGroup 内嵌 Checkbox 与 Row/Col 一起使用，实现灵活的栅格排布。
  import { Checkbox, CheckboxGroup, Row, Col } from '@chenzy-design/svelte';

  let checked = $state<(string | number)[]>(['A']);
</script>

<CheckboxGroup
  ariaLabel="CheckboxGroup 示例"
  value={checked}
  onChange={(v) => (checked = v)}
>
  <Row style="width:100%">
    {#each ['A', 'B', 'C', 'D', 'E'] as v (v)}
      <Col span={8}>
        <Checkbox value={v}>{v}</Checkbox>
      </Col>
    {/each}
  </Row>
</CheckboxGroup>
