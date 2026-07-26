<!--
  Switch —— 对齐 Semi datePicker/monthsGrid.tsx renderSwitch（dateTime 面板日期/时间视图切换条）。
  div.-switch > div.-switch-date(role=button, IconCalendar + 日期文案) + div.-switch-time(role=button,
  IconClock + 时间文案)。-switch-date-active 标记当前视图；disabledTimePicker 时 time 段禁用。
  density=default 才显示图标（compact 无图标）。独立 props 驱动，状态机由 MonthsGrid 装配（后续接入）。
-->
<script lang="ts">
  import { localeFormat } from '@chenzy-design/core';
  import { IconCalendar, IconClock } from '@chenzy-design/icons';
  import { cssClasses, formatToken, type Density } from './constants.js';

  interface Props {
    /** 当前面板日期（生成日期/时间文案）。 */
    showDate?: Date | null;
    /** 时间视图是否打开（决定 active 归属）。 */
    isTimePickerOpen?: boolean;
    /** range 端点日期文案（优先于 showDate 的月文案，对齐 Semi dateText）。 */
    dateText?: string;
    disabledTimePicker?: boolean;
    density?: Density;
    /** 时间格式（默认 HH:mm:ss）。 */
    timeFormat?: string;
    onShowDatePanel?: () => void;
    onShowTimePicker?: () => void;
  }

  let {
    showDate = null,
    isTimePickerOpen = false,
    dateText = '',
    disabledTimePicker = false,
    density = 'default',
    timeFormat = formatToken.FORMAT_TIME_PICKER,
    onShowDatePanel,
    onShowTimePicker,
  }: Props = $props();

  const prefixCls = cssClasses.PREFIX;

  const monthText = $derived(showDate ? localeFormat(showDate, formatToken.FORMAT_FULL_DATE) : '');
  const timeText = $derived(showDate ? localeFormat(showDate, timeFormat) : '');
  const showSwitchIcon = $derived(density === 'default');

  const dateCls = $derived(
    [`${prefixCls}-switch-date`, !isTimePickerOpen && `${prefixCls}-switch-date-active`]
      .filter(Boolean)
      .join(' '),
  );
  const timeCls = $derived(
    [
      `${prefixCls}-switch-time`,
      disabledTimePicker && `${prefixCls}-switch-time-disabled`,
      isTimePickerOpen && `${prefixCls}-switch-date-active`,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={`${prefixCls}-switch`}>
  <!-- 对齐 Semi renderSwitch：div[role=button] 无 tabindex/keydown（Semi 同款，键盘可达由面板整体承担）。 -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div class={dateCls} role="button" aria-label="Switch to date panel" onclick={() => onShowDatePanel?.()}>
    {#if showSwitchIcon}<IconCalendar aria-hidden="true" />{/if}
    <span class={`${prefixCls}-switch-text`}>{dateText || monthText}</span>
  </div>
  <!-- 对齐 Semi renderSwitch：div[role=button] 无 tabindex/keydown（Semi 同款，键盘可达由面板整体承担）。 -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div
    class={timeCls}
    role="button"
    aria-label="Switch to time panel"
    onclick={() => !disabledTimePicker && onShowTimePicker?.()}
  >
    {#if showSwitchIcon}<IconClock aria-hidden="true" />{/if}
    <span class={`${prefixCls}-switch-text`}>{timeText}</span>
  </div>
</div>
