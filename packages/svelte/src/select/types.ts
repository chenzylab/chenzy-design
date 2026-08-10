export type OptionValue = string | number;
/**
 * Select 选项数据结构。下划线前缀字段为内部保留，由组合式 `<Select.Option>` 写入
 * （见 Option.svelte），optionList 配置式声明的普通对象不应设置：
 *   `_content` —— children 自定义渲染的 Snippet 引用（类型标注 unknown 以不强绑定 svelte
 *     的 Snippet 类型到本文件），optionRow 读出后渲染为候选项行内容，替代默认纯文本 label。
 *   `_style` —— 整行容器（.cd-select-option）的内联样式（对齐 Semi Select.Option style）。
 *   `_className` —— 整行容器追加的类名（对齐 Semi Select.Option className）。
 *   `_showTick` —— 自定义 children 场景下是否显示选中对勾占位（对齐 Semi Select.Option showTick）。
 */
export type OptionData = {
  label: string;
  value: OptionValue;
  disabled?: boolean;
  _content?: unknown;
  _style?: string;
  _className?: string;
  _showTick?: boolean;
  [key: string]: unknown;
};
/**
 * 选项分组：含 options 即为分组项。仅组合式 `<Select.OptGroup>` 收集产出此形态
 * （对齐 Semi：分组功能仅支持 JSX children 声明，不支持 optionList 数组传入）。
 */
export type OptionGroup = { label: string; options: OptionData[] };
export type OptionOrGroup = OptionData | OptionGroup;
