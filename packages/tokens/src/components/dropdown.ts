/**
 * Component tokens for Dropdown. 全量对齐 Semi Design（semi-foundation/dropdown/variables.scss，34 变量），
 * 并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量（忠实翻译 Semi）。
 *
 * 命名规则：Semi `$` 前缀去除、下划线 `_` kebab 化、camelCase 小写收敛
 * （如 dropdown_menu-paddingY → dropdown-menu-paddingy，dropdown_title_withTick → dropdown-title-withtick）。
 * 映射：--semi-color-* → --cd-color-*；var(--semi-border-radius-*) → var(--cd-border-radius-*)；
 * $spacing-* → var(--cd-spacing-*)；无对应全局档的字面量保留（如 31px / 9px / 280px / 12px / 1px）。
 * filter 归 other。
 *
 * 末尾保留 chenzy-design Dropdown 各子组件（Dropdown/DropdownItem/DropdownItemNode/DropdownSubMenu/
 * DropdownTitle/DropdownDivider）实际消费的补充 token（Semi 无 / 命名差异；组件消费），值对齐 Semi。
 * 收敛前这些 --cd-dropdown-* 被组件直接引用但从未定义（悬空）；此处补齐。
 *
 * 视觉变化点：
 *  - 浮层背景由既有硬编码改为 Semi color-dropdown-bg-default（= --cd-color-bg-3，亮色 #fff）。
 *  - 浮层圆角由既有值改为 Semi radius-dropdown（= --cd-border-radius-medium）。
 *  - 菜单项 hover 背景对齐 Semi color-dropdown-item-bg-hover（= --cd-color-fill-0）。
 *  - 菜单项内边距对齐 Semi item-paddingY/paddingX（= tight / base）。
 *  - 禁用/分组标题文字对齐 Semi disabled-text / title-text。
 */
import type { TokenGroup } from './token-def.js';

export const dropdownTokens = {
  // —— 圆角 ——
  'radius-dropdown': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '下拉菜单圆角', usage: '下拉菜单圆角大小' },
  'radius-dropdown-item': { value: '0px', category: 'radius', label: '菜单项圆角', usage: '下拉菜单项圆角大小' },

  // —— 颜色 ——
  'color-dropdown-bg-default': { value: 'var(--cd-color-bg-3)', category: 'color', label: '默认背景色', usage: '下拉菜单背景颜色' },
  'color-dropdown-title-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '分组标题文字色', usage: '下拉菜单分组标题文字颜色' },

  // —— 菜单内边距 ——
  'spacing-dropdown-menu-paddingy': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '菜单垂直内边距', usage: '下拉菜单垂直内边距' },
  'spacing-dropdown-menu-paddingx': { value: '0', category: 'spacing', label: '菜单水平内边距', usage: '下拉菜单水平内边距' },

  // —— 分组标题内边距 ——
  'spacing-dropdown-title-paddingtop': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标题顶内边距', usage: '下拉菜单分组标题顶部内边距' },
  'spacing-dropdown-title-paddingbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '标题底内边距', usage: '下拉菜单分组标题底部内边距' },
  'spacing-dropdown-title-paddingleft': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '标题左内边距', usage: '下拉菜单分组标题左侧内边距' },
  'spacing-dropdown-title-paddingright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '标题右内边距', usage: '下拉菜单分组标题右侧内边距' },
  'spacing-dropdown-title-withtick-paddingleft': { value: '31px', category: 'spacing', label: '可选标题左内边距', usage: '可选中的下拉菜单，分组标题左侧内边距' },
  'spacing-dropdown-item-withtick-paddingleft': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '可选项对勾左内边距', usage: '可选中的下拉菜单项，对勾 icon 左侧内边距' },

  // —— 菜单项内边距 ——
  'spacing-dropdown-item-paddingy': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '菜单项垂直内边距', usage: '下拉菜单项垂直内边距' },
  'spacing-dropdown-item-paddingx': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '菜单项水平内边距', usage: '下拉菜单项水平内边距' },

  // —— 菜单项颜色 ——
  'color-dropdown-item-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '菜单项文字色', usage: '下拉菜单项文字颜色' },
  'color-dropdown-item-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '菜单项悬浮背景', usage: '下拉菜单项背景颜色 - 悬浮' },
  'color-dropdown-item-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '菜单项按下背景', usage: '下拉菜单项背景颜色 - 按下' },
  'color-dropdown-item-danger-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '危险项文字色', usage: '危险菜单项文字颜色' },
  'color-dropdown-item-secondary-text-default': { value: 'var(--cd-color-secondary)', category: 'color', label: '二级项文字色', usage: '二级菜单项文字颜色' },
  'color-dropdown-item-warning-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告项文字色', usage: '警告菜单项文字颜色' },
  'color-dropdown-item-tertiary-text-default': { value: 'var(--cd-color-tertiary)', category: 'color', label: '三级项文字色', usage: '第三菜单项文字颜色' },
  'color-dropdown-item-primary-text-default': { value: 'var(--cd-color-primary)', category: 'color', label: '主要项文字色', usage: '主要菜单项文字颜色' },
  'color-dropdown-item-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用项文字色', usage: '禁用菜单项文字颜色' },
  'color-dropdown-item-disabled-bg-default': { value: 'transparent', category: 'color', label: '禁用项背景色', usage: '禁用菜单项背景颜色' },
  'color-dropdown-seperator-bg-default': { value: 'var(--cd-color-border)', category: 'color', label: '分隔线颜色', usage: '菜单项分隔线颜色' },

  // —— 图标 / 分隔线间距 ——
  'spacing-dropdown-icon-marginright': { value: '9px', category: 'spacing', label: '图标右外边距', usage: '菜单项图标右侧外边距' },
  'spacing-dropdown-seperator-marginy': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '分隔线垂直外边距', usage: '菜单项分隔线垂直外边距' },
  'spacing-dropdown-seperator-marginx': { value: '0', category: 'spacing', label: '分隔线水平外边距', usage: '菜单项分隔线水平外边距' },

  // —— 尺寸 ——
  'width-dropdown': { value: '280px', category: 'width', label: '菜单最大宽度', usage: '菜单最大宽度' },
  'size-dropdown-icon-width': { value: '12px', category: 'width', label: '图标宽度', usage: '菜单项图标宽度' },
  'size-dropdown-icon-height': { value: '12px', category: 'height', label: '图标高度', usage: '菜单项图标高度' },
  'height-dropdown-seperator': { value: '1px', category: 'height', label: '分隔线高度', usage: '菜单项分隔线宽度' },

  // —— 字重 ——
  'font-dropdown-item-active-fontweight': { value: '600', category: 'font', label: '选中项字重', usage: '选中菜单项字重' },

  // —— 滤镜（Semi $filter-dropdown-bg） ——
  'filter-dropdown-bg': { value: 'none', category: 'other', label: '背景滤镜', usage: '下拉菜单背景滤镜' },

  // —— chenzy-design Dropdown 各子组件实际消费的补充 token（Semi 无 / 命名差异；组件消费），值对齐 Semi ——
  // 收敛前这些被组件直接引用却从未定义（悬空），此处补齐并溯源到上方 Semi 对齐 token。
  'dropdown-bg': { value: 'var(--cd-color-dropdown-bg-default)', category: 'color', label: '浮层背景', usage: '浮层菜单背景（组件消费，= Semi color-dropdown-bg-default / bg-3）' },
  'dropdown-radius': { value: 'var(--cd-radius-dropdown)', category: 'radius', label: '浮层圆角', usage: '浮层菜单圆角（组件消费，= Semi radius-dropdown / radius-medium）' },
  'dropdown-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '浮层阴影', usage: '浮层菜单投影（组件消费；Semi 阴影统一走 shadow-elevated）' },
  'dropdown-min-width': { value: '160px', category: 'width', label: '浮层最小宽度', usage: '浮层菜单最小宽度（组件消费）' },
  'dropdown-z': { value: 'var(--cd-z-dropdown)', category: 'other', label: '浮层层级', usage: '浮层 z-index（组件消费，= 全局 z-dropdown / 1050）' },
  'dropdown-item-padding': { value: 'var(--cd-spacing-dropdown-item-paddingy) var(--cd-spacing-dropdown-item-paddingx)', category: 'spacing', label: '菜单项内边距', usage: '菜单项内边距（组件消费，= Semi item-paddingY item-paddingX / tight base）' },
  'dropdown-item-bg-hover': { value: 'var(--cd-color-dropdown-item-bg-hover)', category: 'color', label: '菜单项悬浮背景', usage: '菜单项悬浮/聚焦背景（组件消费，= Semi color-dropdown-item-bg-hover / fill-0）' },
  'dropdown-item-color-disabled': { value: 'var(--cd-color-dropdown-item-disabled-text-default)', category: 'color', label: '禁用/标题文字色', usage: '禁用菜单项与分组标题文字色（组件消费，= Semi disabled-text）' },
  'dropdown-motion-duration': { value: 'var(--cd-motion-duration-fast)', category: 'animation', label: '进场时长', usage: '浮层进场动画时长（组件消费）' },
  'dropdown-motion-easing': { value: 'var(--cd-motion-ease-standard)', category: 'animation', label: '进场缓动', usage: '浮层进场动画缓动（组件消费）' },
} satisfies TokenGroup;
