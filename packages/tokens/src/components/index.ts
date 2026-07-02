/** Aggregate of all component-level tokens. Add new component token files here. */
import { buttonTokens } from './button.js';
import { iconTokens } from './icon.js';
import { dividerTokens } from './divider.js';
import { spaceTokens } from './space.js';
import { typographyTokens } from './typography.js';
import { gridTokens } from './grid.js';
import { layoutTokens } from './layout.js';
import { inputTokens } from './input.js';
import { tagInputTokens } from './tag-input.js';
import { switchTokens } from './switch.js';
import { checkboxTokens } from './checkbox.js';
import { radioTokens } from './radio.js';
import { ratingTokens } from './rating.js';
import { sliderTokens } from './slider.js';
import { formTokens } from './form.js';
import { selectTokens } from './select.js';
import { colorPickerTokens } from './color-picker.js';
import { datePickerTokens } from './date-picker.js';
import { treeTokens } from './tree.js';
import { transferTokens } from './transfer.js';
import { navigationTokens } from './navigation.js';
import { tabsTokens } from './tabs.js';
import { menuTokens } from './menu.js';
import { navTokens } from './nav.js';
import { displayTokens } from './display.js';
import { tooltipTokens } from './tooltip.js';
import { dataDisplayTokens } from './data-display.js';
import { listTokens } from './list.js';
import { virtualTokens } from './virtual.js';
import { tableTokens } from './table.js';
import { calendarTokens } from './calendar.js';
import { scrollListTokens } from './scroll-list.js';
import { overflowListTokens } from './overflow-list.js';
import { spinTokens } from './spin.js';
import { progressTokens } from './progress.js';
import { skeletonTokens } from './skeleton.js';
import { bannerTokens } from './banner.js';
import { modalTokens } from './modal.js';
import { drawerTokens } from './drawer.js';
import { sideSheetTokens } from './side-sheet.js';
import { popconfirmTokens } from './popconfirm.js';
import { toastTokens } from './toast.js';
import { notificationTokens } from './notification.js';
import { backTopTokens } from './back-top.js';
import { lottieIconTokens } from './lottie-icon.js';

export const componentTokens = {
  ...buttonTokens,
  ...iconTokens,
  ...dividerTokens,
  ...spaceTokens,
  ...typographyTokens,
  ...gridTokens,
  ...layoutTokens,
  ...inputTokens,
  ...tagInputTokens,
  ...switchTokens,
  ...checkboxTokens,
  ...radioTokens,
  ...ratingTokens,
  ...sliderTokens,
  ...formTokens,
  ...selectTokens,
  ...colorPickerTokens,
  ...datePickerTokens,
  ...treeTokens,
  ...transferTokens,
  ...navigationTokens,
  ...tabsTokens,
  ...menuTokens,
  ...navTokens,
  ...displayTokens,
  ...tooltipTokens,
  ...dataDisplayTokens,
  ...listTokens,
  ...virtualTokens,
  ...tableTokens,
  ...calendarTokens,
  ...scrollListTokens,
  ...overflowListTokens,
  ...spinTokens,
  ...progressTokens,
  ...skeletonTokens,
  ...bannerTokens,
  ...modalTokens,
  ...drawerTokens,
  ...sideSheetTokens,
  ...popconfirmTokens,
  ...toastTokens,
  ...notificationTokens,
  ...backTopTokens,
  ...lottieIconTokens,
} as const;
