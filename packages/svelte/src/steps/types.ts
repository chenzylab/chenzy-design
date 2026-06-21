export interface StepItem {
  title: string;
  description?: string;
  /** 显式覆盖该步状态；不传时由 current 推断 */
  status?: 'wait' | 'process' | 'finish' | 'error' | 'warning';
  /** 禁用该步：不可点击、不可聚焦、置灰 */
  disabled?: boolean;
}
