<!--
  foundation 跨文件响应式验证夹具（里程碑1 技术前提）。
  真实模拟 view→foundation 消费链：$props() → () => props getter → createDatePickerState。
  把 foundation 派生渲染进 DOM，测试改 props 后断言 DOM 更新，即证明跨文件响应式成立。
-->
<script lang="ts">
  import {
    createDatePickerState,
    type DatePickerFoundationProps,
  } from './date-picker-foundation.svelte.js';

  let {
    type = 'date',
    value = undefined,
    open = undefined,
    timeZone = undefined,
    format = undefined,
    onChange = undefined,
  }: Partial<DatePickerFoundationProps> = $props();

  const fProps: DatePickerFoundationProps = {
    get type() {
      return type;
    },
    get value() {
      return value;
    },
    get open() {
      return open;
    },
    get timeZone() {
      return timeZone;
    },
    get format() {
      return format;
    },
    defaultOpen: false,
    multiple: false,
    locale: 'zh-CN',
    rangeSeparator: '~',
    showSecond: true,
    onChangeWithDateFirst: false,
    get onChange() {
      return onChange;
    },
  };

  const st = createDatePickerState(() => fProps);

  export function handleSelectedChange(d: Date) {
    st.handleSelectedChange(d);
  }
</script>

<div data-testid="year">{st.currentSingle instanceof Date ? st.currentSingle.getFullYear() : ''}</div>
<div data-testid="month">{st.currentSingle instanceof Date ? st.currentSingle.getMonth() : ''}</div>
<div data-testid="formatted">{st.formattedValue}</div>
<div data-testid="is-range">{String(st.isRange)}</div>
<div data-testid="is-datetime">{String(st.isDateTime)}</div>
<div data-testid="is-open">{String(st.isOpen)}</div>
