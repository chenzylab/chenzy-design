<script lang="ts">
  // 对齐 Semi 的 `<LocaleConsumer componentName="X">{(localeData, localeCode) => ...}</LocaleConsumer>`。
  // React 用 render-props 拿 (localeData, localeCode, dateFnsLocale)；
  // 本库用 useLocale() —— 须在组件初始化期（`<script>` 顶层）调用一次拿到稳定 getter，
  // 再在渲染期读 loc()，语言切换后自动拿到新 api。
  //
  // 两种读法：
  //  - `loc().component('TimePicker')` 取整片（对应 Semi 的 localeData），可读嵌套/数组值；
  //  - `loc().t('X.y')` 按点号路径取单条，**支持语言包里的自定义键**（不必在 Locale 类型中声明）。
  import { useLocale } from '@chenzy-design/svelte';

  let { componentName, field }: { componentName: 'TimePicker' | 'ComponentA'; field: string } =
    $props();

  const loc = useLocale();
</script>

<div>{loc().code} : {loc().t(`${componentName}.${field}`)}</div>
