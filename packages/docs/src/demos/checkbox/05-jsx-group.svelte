<script lang="ts">
  import { CheckboxGroup, Checkbox } from '@chenzy-design/svelte';
</script>

<CheckboxGroup style="width: 100%;" defaultValue={['A', 'B']} ariaLabel="CheckboxGroup 示例">
  <Checkbox value="A">A</Checkbox>
  <Checkbox value="B">B</Checkbox>
  <Checkbox value="C">C</Checkbox>
  <Checkbox value="D">D</Checkbox>
  <Checkbox value="E">E</Checkbox>
</CheckboxGroup>
