<!--
  仅供 CheckboxGroup.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  CheckboxGroup（role=group）内为原生 <input type=checkbox>（视觉隐藏但可聚焦）。
  Tab 进入聚焦首个 input，Space 切换其 checked 状态。data-testid=before 用于起跳。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import CheckboxGroup from './CheckboxGroup.svelte';
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <CheckboxGroup
    options={[
      { label: 'Apple', value: 'a' },
      { label: 'Banana', value: 'b' },
    ]}
    ariaLabel="Fruits"
  />
</LocaleProvider>
