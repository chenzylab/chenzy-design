# SPEC · HotKeys

> 分类：other · 阶段：M6（增补，对标 Semi Plus 后补齐）
> 对标 Semi：[HotKeys 快捷键](https://semi.design/zh-CN/plus/hotkeys)（Semi 2.66.0+）
> 绑定键盘快捷键组合并渲染可见键位提示。本 SPEC 对标 Semi 2.101.0 API，并在 a11y 上做增强（Semi 用 span 无 `<kbd>` 语义、无 aria-keyshortcuts）。

## 1. 概述

HotKeys 用于**声明一组快捷键组合、绑定键盘监听、并渲染出对应的可见键位提示 UI**。命中组合时触发回调。典型场景：全局命令（Ctrl+K 唤起搜索）、编辑器快捷键、阻止浏览器默认行为（拦截 Ctrl+S）、局部元素级快捷键。

## 2. 设计语义

**何时用**：需要把「键盘组合 → 动作」声明式地绑定，并（可选）向用户展示键位提示。
**何时不用**：
- 单个元素的原生键盘交互（Enter/Space 触发按钮）→ 组件自身处理，不需 HotKeys。
- 复杂的多层快捷键作用域管理 → 本组件是单组合绑定，多作用域由使用方组合多个实例 + `getListenerTarget` 隔离。

## 3. 分层实现

- **headless（core/）**：需要。`packages/core/src/hotkeys/createHotKeys.ts`：
  - `isValidHotKeys(keys)`：校验恰含 1 个普通键 + 0~多修饰键，非法抛错。
  - `matchHotKeys(event, keys, opts)`：修饰键精确匹配（`metaKey/shiftKey/altKey/ctrlKey` 全等）+ 普通键用 `event.code`（物理键位，规避输入法/大小写，保留 Semi 的优秀设计）。
  - `keyToCode(key)`：key → KeyboardEvent.code 映射。
  - `Keys` 常量枚举（字母/数字/修饰/符号/方向/功能/编辑/小键盘）。
  - `mergeMetaCtrl`：**修复 Semi 未生效的 bug** —— 真正实现跨平台合并 Cmd/Ctrl。
  - 监听挂载/解绑（keydown on target）。
- **渲染（svelte/）**：`HotKeys.svelte` 渲染键位提示：每个键用**语义化 `<kbd>`**（超越 Semi 的 span），`+` 分隔符 `aria-hidden`。支持 `render`/`content` 自定义。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `hotKeys` | `string[]` | — | **必填**。快捷键组合数组。恰含 1 个普通键 + 0~多修饰键。取值用原生 `KeyboardEvent.key` 或 `HotKeys.Keys.*` 常量。非法组合抛错。 |
| `onHotKey` | `(e: KeyboardEvent) => void` | — | 命中组合时触发，透传原生事件。 |
| `content` | `(string \| Snippet)[]` | — | 自定义显示的键名内容（仅影响提示 UI，不改监听）。默认用 hotKeys 渲染。 |
| `render` | `Snippet \| null` | — | 完全自定义提示渲染。传 `null` 则不渲染任何提示 UI，仅保留监听。 |
| `preventDefault` | `boolean` | `false` | 命中时是否 `event.preventDefault()`（拦截浏览器默认行为）。 |
| `mergeMetaCtrl` | `boolean` | `false` | 跨平台把 Cmd(Meta) 与 Ctrl 视为同一修饰键（**本库真正实现，Semi 该 prop 未生效**）。 |
| `getListenerTarget` | `() => HTMLElement` | `() => document.body` | 监听挂载节点。默认全局；返回具体元素实现局部监听。 |
| `disabled` | `boolean` | `false` | 禁用监听（不绑定或忽略事件）。 |
| `class` | `string` | — | 根节点类名。 |
| `style` | `string` | — | 根节点内联样式。 |

### 静态导出

`HotKeys.Keys`：键名常量枚举（`Keys.Control`/`Keys.Meta`/`Keys.A` 等）。

### Events

| 名称 | 载荷 | 说明 |
| --- | --- | --- |
| `onHotKey` | `KeyboardEvent` | 组合命中，preventDefault 后触发。 |

### Slots

| 名称 | 说明 |
| --- | --- |
| render | 自定义整个提示 UI（等价 render prop） |

## 5. 主题 / Token 表

| Token | 含义 | 默认引用 |
| --- | --- | --- |
| `--cd-hotkeys-content-bg` | 键位块背景 | `--cd-color-fill-0` |
| `--cd-hotkeys-content-border` | 键位块边框 | `--cd-color-border` |
| `--cd-hotkeys-content-color` | 键位文字色 | `--cd-color-text-1` |
| `--cd-hotkeys-content-radius` | 键位块圆角 | `--cd-border-radius-small` |
| `--cd-hotkeys-content-font-size` | 键位字号 | `--cd-font-size-body-small` |
| `--cd-hotkeys-content-padding` | 键位块内边距 | `--cd-spacing-extra-tight` |
| `--cd-hotkeys-split-color` | `+` 分隔符色 | `--cd-color-text-2` |
| `--cd-hotkeys-gap` | 键位间距 | `--cd-spacing-extra-tight` |

## 6. 无障碍

对标 Semi 的**增强**（Semi 用 span、无 kbd 语义、无 aria）：

- **`<kbd>` 语义**：每个键位用原生 `<kbd>` 承载，屏幕阅读器可识别为键盘输入。`+` 分隔符 `aria-hidden="true"`。
- **aria-keyshortcuts**：提示容器（或使用方通过文档指引把 `aria-keyshortcuts` 加到被触发的目标元素上）声明快捷键，关联动作。
- **匹配用 `event.code`**：物理键位匹配，天然规避输入法/大小写/Shift 干扰。
- **键位文本可选中性**：不强制 `user-select: none`（Semi 设了），允许用户复制键位文本。
- **对比度**：键位块文字与背景 ≥4.5:1。
- **RTL**：键位从逻辑起始排列，`+` 分隔符方向随 RTL。
- 提示 UI 是纯展示（无交互焦点）；监听为全局/局部键盘，不引入焦点陷阱。

## 7. 国际化

- i18n key：`HotKeys.modifierLabels`（可选）—— 修饰键的平台/语言符号映射（Ctrl/⌃、Cmd/⌘、Alt/⌥、Shift/⇧），供跨平台/多语言显示。
- 跨平台 Meta 显示（macOS ⌘ vs Windows Ctrl/Win）：本库提供平台检测 + 符号映射（超越 Semi 的「全交业务」）。
- 键名本身（如 "K"）无需翻译。

## 8. 文案

- 无长文案。修饰键符号映射走 i18n；键名由 `hotKeys`/`content` 提供。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| svelte gzip | ≤ 2 KB | 提示渲染 |
| core `createHotKeys` gzip | ≤ 1.5 KB | 匹配引擎 + Keys 常量 |
| 键盘事件成本 | 单次 keydown O(组合长度) 匹配 | 无节流需求 |

- 全局监听单个 keydown，卸载时解绑。无重排。

## 10. AI 元数据

`component.meta.ts`：
- `name: 'HotKeys'`、`category: 'other'`、`stage: 'M6'`、`semiEquivalent: 'HotKeys'`。
- props/events schema；`Keys` 常量说明。
- `examples`：基础 Ctrl+Shift+A 唤起 Modal、自定义显示内容、render 自定义、preventDefault 拦截 Ctrl+S、getListenerTarget 局部监听、mergeMetaCtrl 跨平台。
- `doNot`：不要用非 kbd 元素展示键位、不要漏 preventDefault 导致浏览器默认行为、不要在 hotKeys 放多个普通键。

## 11. 测试

- **单元（core）**：`isValidHotKeys` 合法/非法（0 普通键、2 普通键、非法键名）；`matchHotKeys` 修饰键精确匹配（多按/少按不触发）、普通键 code 匹配；`keyToCode` 符号映射；`mergeMetaCtrl` 跨平台合并；disabled 不触发。
- **组件**：提示 UI 渲染（默认/content/render/null）；监听挂载与解绑；preventDefault 生效；getListenerTarget 局部。
- **a11y**：axe 无违规；`<kbd>` 语义存在；`+` aria-hidden；对比度达标。
- **视觉回归**：默认提示 × 暗色 × RTL。
- **i18n**：修饰键符号随 locale/平台。

## 12. 验收标准（对照 AGENTS.md §5 DoD）

- [ ] 分层正确（core 匹配引擎 + svelte 提示） · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过（kbd 语义 + 对比度）
- [ ] i18n 无硬编码 · [ ] core/组件/a11y 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页 + demo 完成
