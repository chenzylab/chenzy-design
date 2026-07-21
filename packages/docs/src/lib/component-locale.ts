// 文档站语言（Lang）→ 组件库内置文案语言包（LocaleProvider 的 locale）的集中映射。
// 对齐 Semi layout.js 的 semiLocale map（`{'zh-CN': semiZhCN, 'en-US': semiEnUS}`）：
// 文档站只需登记它实际支持的语言，而非把组件库全部语言都引入。
//
// 扩展多语言时只改此处一处：import 新语言包 + 在 map 里登记一行，所有消费方（全站
// LocaleProvider 等）自动生效，无需逐处维护 `lang === 'zh' ? ... : ...` 三元表达式。
import { zh_CN, en_US, type Locale } from '@chenzy-design/svelte';
import type { Lang } from './locale.svelte';

export const componentLocale: Record<Lang, Locale> = {
  zh: zh_CN,
  en: en_US,
};
