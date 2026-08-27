# chenzy-design 最佳实践

## 安装与引入

```bash
pnpm add @chenzy-design/svelte @chenzy-design/tokens
```

应用入口引入 Design Token CSS（所有 `--cd-*` 变量的来源，组件样式依赖它）：

```ts
// main.ts / +layout.svelte
import '@chenzy-design/tokens/tokens.css';
```

组件按名导入：

```svelte
<script lang="ts">
  import { Button, Table, Modal } from '@chenzy-design/svelte';
  import { IconHome } from '@chenzy-design/icons';
</script>
```

- Table 也可走子路径 `@chenzy-design/svelte/table`（含 `Column` 组合式子组件）。
- 图标一律用 `@chenzy-design/icons` 的具名图标组件，不要手写 svg。
- 使用 UnoCSS 的项目可接入 `@chenzy-design/unocss-preset`，token 会暴露为 UnoCSS theme。

## Svelte 5 runes 心智

本库基于 Svelte 5（runes）。写消费代码时：

- 状态用 `$state()`、派生用 `$derived()`，不要用 Svelte 4 的 store/`$:` 旧写法。
- 组件插槽是 **snippet**（`{#snippet ...}`），不是 slot 元素；接收 snippet 的 prop（如 Button 的 `icon`）传入 snippet 引用或内联 `{#snippet}`。
- 事件 prop 是原生小写命名（如 Button 的 `onclick`）或本库回调命名（如 `onChange`/`onOk`），以 `get_component_api` 返回的为准。

## 受控组件不用 `bind:`（最重要）

**本库对齐 Semi 的受控/非受控双轨，受控 prop 不回写、`bind:` 静默失效**：

```svelte
<!-- ❌ 错误：bind: 不会生效 -->
<Switch bind:checked={on} />

<!-- ✅ 受控：value/checked + onChange 回调自己更新 -->
<Switch checked={on} onChange={(v) => (on = v)} />

<!-- ✅ 非受控：defaultX 传初值，组件内部自管 -->
<Switch defaultChecked={true} onChange={(v) => console.log(v)} />
```

同样适用于 Input(value)/Checkbox(checked)/Select/Tree/Table(sortState、selectedRowKeys、pagination.current) 等一切受控 prop。

## 主题与暗色模式

- 全部视觉由 `--cd-*` CSS 变量驱动（`@chenzy-design/tokens`），品牌定制覆盖变量即可。
- 暗色模式：在根元素设 `data-theme="dark"`，token 层自动切换，无需改组件代码。
- 组件级 token 清单用 `get_component_api({ componentName, section: "tokens" })` 查询。

## 国际化

内置文案（分页、日期、上传等）经 `LocaleProvider` 注入：

```svelte
<script lang="ts">
  import { LocaleProvider, en_US } from '@chenzy-design/svelte';
</script>

<LocaleProvider locale={en_US}>
  <App />
</LocaleProvider>
```

默认 zh_CN；日期/数字格式经 `Intl` 本地化。

## 无障碍

组件已内置 WCAG 2.1 AA 级 a11y（role/aria/键盘交互/焦点管理），**不要在组件外重复添加 aria 属性**。需要无障碍名时用组件提供的 prop（如 Button 的 `ariaLabel`——注意是 camelCase prop 而非 `aria-label` 属性）。

## 排障流程

1. props 拼写与形态先用 `get_component_api` 核对（类型/默认值以它为准）。
2. 行为与预期不符 → 用 `get_component_file_list` + `get_function_code` 看 core 层对应算法的真实实现。
3. 样式异常 → 确认 `tokens.css` 已引入；检查是否被外部样式覆盖了 `--cd-*` 变量。
