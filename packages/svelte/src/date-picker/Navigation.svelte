<!--
  Navigation —— 对齐 Semi datePicker/navigation.tsx。
  结构：div.NAVIGATION > IconButton(双左/上一年) IconButton(左/上月) div.-month>Button(monthText)
        IconButton(右/下月) IconButton(双右/下一年)。复用本库 IconButton/Button（对齐 Semi 复用）。
  shouldBimonthSwitch + panelType 决定左/右按钮 visibility:hidden（双面板同步切换时隐藏对应侧，保位）。
-->
<script lang="ts">
  import IconButton from '../iconbutton/IconButton.svelte';
  import Button from '../button/Button.svelte';
  import {
    IconChevronLeft,
    IconChevronRight,
    IconDoubleChevronLeft,
    IconDoubleChevronRight,
  } from '@chenzy-design/icons';
  import { cssClasses, strings, type Density, type PanelType } from './constants.js';

  interface Props {
    monthText?: string;
    density?: Density;
    onMonthClick?: (e: MouseEvent) => void;
    onNextMonth?: () => void;
    onPrevMonth?: () => void;
    onNextYear?: () => void;
    onPrevYear?: () => void;
    /** 双面板是否同步切换（决定隐藏哪一侧按钮）。 */
    shouldBimonthSwitch?: boolean;
    /** 面板类型：左/右（对齐 Semi PanelType）。 */
    panelType?: PanelType;
  }

  // 回调默认 noop（对齐 Semi navigation.tsx defaultProps），确保传给 IconButton/Button 的永远是函数。
  const noop = (): void => {};
  let {
    monthText = '',
    density = 'default',
    onMonthClick = noop,
    onNextMonth = noop,
    onPrevMonth = noop,
    onNextYear = noop,
    onPrevYear = noop,
    shouldBimonthSwitch = false,
    panelType,
  }: Props = $props();

  const prefixCls = cssClasses.NAVIGATION;

  // 对齐 Semi：borderless 主题、compact 密度用 default/small 尺寸，非 compact 用 large/default。
  const btnTheme = 'borderless' as const;
  const iconBtnSize = $derived<'default' | 'large'>(density === 'compact' ? 'default' : 'large');
  const buttonSize = $derived<'small' | 'default'>(density === 'compact' ? 'small' : 'default');

  const isLeftPanel = $derived(panelType === strings.PANEL_TYPE_LEFT);
  const isRightPanel = $derived(panelType === strings.PANEL_TYPE_RIGHT);
  const hiddenLeftPanelRightButtons = $derived(shouldBimonthSwitch && isLeftPanel);
  const hiddenRightPanelLeftButtons = $derived(shouldBimonthSwitch && isRightPanel);
  // visibility:hidden 保位（对齐 Semi）。
  const leftButtonStyle = $derived(hiddenRightPanelLeftButtons ? 'visibility:hidden' : '');
  const rightButtonStyle = $derived(hiddenLeftPanelRightButtons ? 'visibility:hidden' : '');
</script>

<div class={prefixCls}>
  <IconButton
    ariaLabel="Previous year"
    size={buttonSize}
    theme={btnTheme}
    iconSize={iconBtnSize}
    noHorizontalPadding
    style={leftButtonStyle}
    onclick={onPrevYear}
  >
    {#snippet icon()}<IconDoubleChevronLeft aria-hidden="true" />{/snippet}
  </IconButton>
  <IconButton
    ariaLabel="Previous month"
    size={buttonSize}
    theme={btnTheme}
    iconSize={iconBtnSize}
    noHorizontalPadding
    style={leftButtonStyle}
    onclick={onPrevMonth}
  >
    {#snippet icon()}<IconChevronLeft aria-hidden="true" />{/snippet}
  </IconButton>
  <div class={`${prefixCls}-month`}>
    <Button theme={btnTheme} size={buttonSize} onclick={onMonthClick}>
      <span>{monthText}</span>
    </Button>
  </div>
  <IconButton
    ariaLabel="Next month"
    size={buttonSize}
    theme={btnTheme}
    iconSize={iconBtnSize}
    noHorizontalPadding
    style={rightButtonStyle}
    onclick={onNextMonth}
  >
    {#snippet icon()}<IconChevronRight aria-hidden="true" />{/snippet}
  </IconButton>
  <IconButton
    ariaLabel="Next year"
    size={buttonSize}
    theme={btnTheme}
    iconSize={iconBtnSize}
    noHorizontalPadding
    style={rightButtonStyle}
    onclick={onNextYear}
  >
    {#snippet icon()}<IconDoubleChevronRight aria-hidden="true" />{/snippet}
  </IconButton>
</div>
