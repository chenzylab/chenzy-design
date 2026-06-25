<!--
  仅供 RadioGroup.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  WAI-ARIA radiogroup：roving tabindex + 方向键导航即选中（真实焦点）。
  defaultValue 选中一项，使其为单一 Tab 停靠点。前后各放按钮验证 Tab 进/出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import RadioGroup from './RadioGroup.svelte';

  const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
  ];
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <RadioGroup {options} defaultValue="apple" ariaLabel="Fruit" />
  <button type="button" data-testid="after">after</button>
</LocaleProvider>
