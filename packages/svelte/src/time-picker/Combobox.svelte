<!--
  Combobox —— 时间列面板视图（对齐 Semi timePicker/Combobox.tsx）。
  ScrollList(header/footer) > ScrollItem×(ampm?/hour/minute/second)；逻辑走 combobox-foundation。
  DatePicker dateTime 面板 + TimePicker 复用（拆分 #18，规则同 DatePicker：foundation 分层 + 照搬 Semi）。
  onChange 抛 { isAM, value(格式化串), timeStampValue }（对齐 Semi Combobox onChange）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { format as dateFnsFormat } from 'date-fns';
  import { useLocale } from '../locale-provider/index.js';
  import ScrollList from '../scroll-list/ScrollList.svelte';
  import ScrollItem from '../scroll-list/ScrollItem.svelte';
  import {
    createComboboxState,
    formatOption,
    type ComboboxFoundationProps,
  } from './combobox-foundation.svelte.js';
  import type { ScrollItemData, ScrollItemSelectPayload } from '@chenzy-design/core';

  interface Props extends ComboboxFoundationProps {
    prefixCls?: string;
    panelHeader?: string | Snippet | undefined;
    panelFooter?: string | Snippet | undefined;
    scrollItemProps?: Record<string, unknown>;
    onChange?: (payload: { isAM: boolean; value: string; timeStampValue: number }) => void;
  }

  let {
    timeStampValue = null,
    format,
    use12Hours = false,
    isAM = true,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    hideDisabledOptions = false,
    prefixCls = 'cd-time-picker-panel',
    panelHeader,
    panelFooter,
    scrollItemProps = {},
    onChange,
  }: Props = $props();

  const loc = useLocale();

  const st = createComboboxState(() => ({
    timeStampValue,
    ...(format !== undefined ? { format } : {}),
    use12Hours,
    isAM,
    hourStep,
    minuteStep,
    secondStep,
    ...(disabledHours ? { disabledHours } : {}),
    ...(disabledMinutes ? { disabledMinutes } : {}),
    ...(disabledSeconds ? { disabledSeconds } : {}),
    hideDisabledOptions,
  }));

  const value = $derived(st.dateTime);

  // hour 列：12 小时制调整（对齐 Semi renderHourSelect：[12].concat(filter h<12)、hourAdj=hour%12||12）。
  const hourOptionsAdj = $derived<number[]>(
    use12Hours ? [12, ...st.hourOptions.filter((h) => h < 12 && h > 0)] : st.hourOptions,
  );
  const hourAdj = $derived(use12Hours ? value.getHours() % 12 || 12 : value.getHours());

  const hourList = $derived<ScrollItemData[]>(
    hourOptionsAdj.map((o) => {
      const fo = formatOption(o, st.disabledHours());
      return {
        value: fo.value,
        text: fo.value,
        disabled: fo.disabled,
        transform: (_v: unknown, t: string) => t + loc().t('TimePicker.hour'),
      };
    }),
  );
  const minuteList = $derived<ScrollItemData[]>(
    st.minuteOptions.map((o) => {
      const fo = formatOption(o, st.disabledMinuteOptions);
      return {
        value: fo.value,
        text: fo.value,
        disabled: fo.disabled,
        transform: (_v: unknown, t: string) => t + loc().t('TimePicker.minute'),
      };
    }),
  );
  const secondList = $derived<ScrollItemData[]>(
    st.secondOptions.map((o) => {
      const fo = formatOption(o, st.disabledSecondOptions);
      return {
        value: fo.value,
        text: fo.value,
        disabled: fo.disabled,
        transform: (_v: unknown, t: string) => t + loc().t('TimePicker.second'),
      };
    }),
  );
  const ampmList = $derived<ScrollItemData[]>([
    { value: 'AM', text: loc().t('TimePicker.am') },
    { value: 'PM', text: loc().t('TimePicker.pm') },
  ]);

  // onItemChange —— 照搬 Semi Combobox.onItemChange。
  function onItemChange(payload: ScrollItemSelectPayload) {
    const type = payload.type != null ? String(payload.type) : undefined;
    const val = String(payload.value);
    const transformValue = st.getDisplayDateFromTimeStamp(timeStampValue);
    let curIsAM = isAM;

    if (type === 'hour') {
      if (use12Hours) {
        if (curIsAM) transformValue.setHours(Number(val) % 12);
        else transformValue.setHours((Number(val) % 12) + 12);
      } else {
        transformValue.setHours(Number(val));
      }
    } else if (type === 'minute') {
      transformValue.setMinutes(Number(val));
    } else if (type === 'ampm') {
      const ampm = val.toUpperCase();
      if (use12Hours) {
        if (ampm === 'PM') {
          curIsAM = false;
          if (transformValue.getHours() < 12) transformValue.setHours((transformValue.getHours() % 12) + 12);
        }
        if (ampm === 'AM') {
          curIsAM = true;
          if (transformValue.getHours() >= 12) transformValue.setHours(transformValue.getHours() - 12);
        }
      }
    } else {
      transformValue.setSeconds(Number(val));
    }

    onChange?.({
      isAM: curIsAM,
      value: dateFnsFormat(transformValue, (st.format ?? 'HH:mm:ss').replace(/(\s+)A/g, '$1a')),
      timeStampValue: Number(transformValue),
    });
  }
</script>

<!-- 对齐 Semi Combobox.render()：直接返回 ScrollList，无额外 wrapper（Semi 无 -panel div）。
     Combobox 自身零样式（对齐 Semi：面板尺寸样式由 timePicker.scss / datePicker.scss 各自提供，不在共享组件里）。
     ScrollList 根挂 `${prefixCls}`（与列 `${prefixCls}-list-*` 同前缀，作面板锚点）：
       · TimePicker 传默认 `cd-time-picker-panel` → 命中 TimePicker.svelte 的 64/72px 列宽（timePicker.scss）
       · DatePicker tpk 传 `cd-datepicker-tpk-list` → 不命中 64px，由 MonthsGrid 的 width:100%+flex:1 均分（datePicker.scss）。 -->
<ScrollList class={prefixCls} header={panelHeader} footer={panelFooter}>
    {#if use12Hours}
      <ScrollItem
        mode="normal"
        class={`${prefixCls}-list-ampm`}
        list={ampmList}
        selectedIndex={isAM ? 0 : 1}
        type="ampm"
        onSelect={onItemChange}
        ariaLabel={loc().t('TimePicker.triggerLabel')}
        {...scrollItemProps}
      />
    {/if}
    {#if st.showHour}
      <ScrollItem
        mode="normal"
        class={`${prefixCls}-list-hour`}
        list={hourList}
        selectedIndex={hourOptionsAdj.indexOf(hourAdj)}
        type="hour"
        onSelect={onItemChange}
        ariaLabel={loc().t('TimePicker.hourLabel')}
        {...scrollItemProps}
      />
    {/if}
    {#if st.showMinute}
      <ScrollItem
        mode="normal"
        class={`${prefixCls}-list-minute`}
        list={minuteList}
        selectedIndex={st.minuteOptions.indexOf(value.getMinutes())}
        type="minute"
        onSelect={onItemChange}
        ariaLabel={loc().t('TimePicker.minuteLabel')}
        {...scrollItemProps}
      />
    {/if}
    {#if st.showSecond}
      <ScrollItem
        mode="normal"
        class={`${prefixCls}-list-second`}
        list={secondList}
        selectedIndex={st.secondOptions.indexOf(value.getSeconds())}
        type="second"
        onSelect={onItemChange}
        ariaLabel={loc().t('TimePicker.secondLabel')}
        {...scrollItemProps}
      />
    {/if}
  </ScrollList>
