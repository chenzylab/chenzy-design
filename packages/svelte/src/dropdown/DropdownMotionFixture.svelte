<!--
  Dropdown 进出场动画测试夹具：受控 visible + trigger='custom'，透传 keepDOM/motion。
  仅供 Dropdown.motion.a11y.test.ts 使用，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Dropdown } from './index.js';

  interface Props {
    visible?: boolean;
    keepDOM?: boolean;
    motion?: boolean;
  }

  let { visible = false, keepDOM = false, motion = true }: Props = $props();
</script>

<LocaleProvider locale="en_US">
  <Dropdown {visible} trigger="custom" {keepDOM} {motion}>
    <button type="button">Actions</button>
    {#snippet render()}
      <Dropdown.Menu>
        <Dropdown.Item key="edit">Edit</Dropdown.Item>
        <Dropdown.Item key="dup">Duplicate</Dropdown.Item>
      </Dropdown.Menu>
    {/snippet}
  </Dropdown>
</LocaleProvider>
