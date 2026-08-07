# SPEC · HotKeys

> 分类：other · 阶段：M6（增补，对标 Semi Plus 后补齐）
> 对标 Semi：[HotKeys 快捷键](https://semi.design/zh-CN/plus/hotkeys)（Semi 2.66.0+）
> 绑定键盘快捷键组合并渲染可见键位提示。**严格对齐 Semi**：`packages/semi-ui/hotKeys/index.tsx` 是单文件组件（无多文件拆分），无具名图标（纯文字 `span` 渲染），props / DOM / 样式 / token / 无障碍范围全部以 Semi 为准，不做超越 Semi 的增强。

## 1. 概述

HotKeys 用于**声明一组快捷键组合、绑定键盘监听、并渲染出对应的可见键位提示 UI**。命中组合时触发回调。典型场景：全局命令（Ctrl+K 唤起搜索）、编辑器快捷键、阻止浏览器默认行为（拦截 Ctrl+S）、局部元素级快捷键。

## 2. 设计语义

**何时用**：需要把「键盘组合 → 动作」声明式地绑定，并（可选）向用户展示键位提示。
**何时不用**：
- 单个元素的原生键盘交互（Enter/Space 触发按钮）→ 组件自身处理，不需 HotKeys。
- 复杂的多层快捷键作用域管理 → 本组件是单组合绑定，多作用域由使用方组合多个实例 + `getListenerTarget` 隔离。

## 3. 分层实现

- **headless（core/）**：`packages/core/src/hotkeys.ts`：
  - `isValidHotKeys(keys)`：校验恰含 1 个普通键 + 0~多修饰键，非法抛错（对齐 Semi foundation `isValidHotKeys`）。
  - `matchHotKeys(event, keys, opts)`：修饰键精确匹配（`metaKey/shiftKey/altKey/ctrlKey` 全等）+ 普通键用 `event.code`（物理键位，规避输入法/大小写，Semi foundation 原生设计）。
  - `keyToCode(key)`：key → KeyboardEvent.code 映射（对齐 Semi `keyCodeMap`）。
  - `Keys` 常量枚举（字母/数字/修饰/符号/方向/功能/编辑/小键盘，对齐 Semi `Keys` enum）。
  - `mergeMetaCtrl`：**死 prop**，严格对齐 Semi——声明但不生效，Meta/Ctrl 仍严格区分（Semi foundation 同样声明了此语义但从未实现）。
  - `attachHotKeys`：监听挂载/解绑（keydown on target）。
- **渲染（svelte/）**：`HotKeys.svelte` 渲染键位提示：DOM 与 class 命名严格对齐 Semi `index.tsx` render：`div.cd-hotKeys > span > span.cd-hotKeys-content`，分隔符 `span.cd-hotKeys-split` 文本 `+`。键位内容原样渲染（`content ?? hotKeys` 数组直接输出，不做大小写 / 平台符号转换）。支持 `render`/`content` 自定义。

## 4. API

### Props

严格对齐 Semi `HotKeysProps`（`packages/semi-ui/hotKeys/index.tsx`），无本库扩展 prop。

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `hotKeys` | `string[]` | — | **必填**。快捷键组合数组。恰含 1 个普通键 + 0~多修饰键。取值用原生 `KeyboardEvent.key` 或 `HotKeys.Keys.*` 常量。非法组合抛错。 |
| `onHotKey` | `(e: KeyboardEvent) => void` | — | 命中组合时触发，透传原生事件。 |
| `content` | `(string \| Snippet)[]` | — | 自定义显示的键名内容（仅影响提示 UI，不改监听）。默认用 hotKeys 原样渲染。 |
| `render` | `Snippet \| null` | — | 完全自定义提示渲染。传 `null` 则不渲染任何提示 UI，仅保留监听。 |
| `onClick` | `() => void` | — | 提示 UI 根节点点击回调。 |
| `preventDefault` | `boolean` | `false` | 命中时是否 `event.preventDefault()`（拦截浏览器默认行为）。 |
| `mergeMetaCtrl` | `boolean` | `false` | 跨平台把 Cmd(Meta) 与 Ctrl 视为同一修饰键。**死 prop**：严格对齐 Semi，声明但不生效（Meta/Ctrl 仍严格区分）。 |
| `getListenerTarget` | `() => HTMLElement` | `() => document.body` | 监听挂载节点。默认全局；返回具体元素实现局部监听。 |
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

镜像 Semi `semi-foundation/hotKeys/variables.scss`（8 个），见 `packages/tokens/src/components/hotkeys.ts`。

| Token | 含义 | 默认引用 |
| --- | --- | --- |
| `--cd-color-hotkeys-bg` | 键位块背景 | `--cd-color-fill-0` |
| `--cd-color-hotkeys-text` | 键位块文字色 | `--cd-color-text-2` |
| `--cd-color-hotkeys-split` | `+` 分隔符色 | `--cd-color-text-0` |
| `--cd-width-hotkeys-border` | 键位块边框宽度 | `1px` |
| `--cd-radius-hotkeys` | 键位块圆角 | `2px` |
| `--cd-height-hotkeys` | 键位块高度 | `20px` |
| `--cd-spacing-hotkeys-paddingY` | 键位块纵向内边距 | `2px` |
| `--cd-spacing-hotkeys-paddingX` | 键位块横向内边距 | `8px`（对齐 Semi `$spacing-tight`） |

## 6. 无障碍

严格对齐 Semi（Semi 用 span，无 kbd 语义，无 aria-keyshortcuts，无 RTL 特殊处理）：

- 键位用 `span` 承载（非 `kbd`），`+` 分隔符 `span.cd-hotKeys-split`，均无额外 aria 属性。
- 根节点 `user-select: none`（对齐 Semi，键位文本不可选中复制）。
- **匹配用 `event.code`**：物理键位匹配，规避输入法/大小写/Shift 干扰（Semi foundation 原生设计，非本库增强）。
- **对比度**：键位块文字与背景 ≥4.5:1（沿用 token 默认值，`--cd-color-fill-0` / `--cd-color-text-2` 已达标）。
- 提示 UI 是纯展示（无交互焦点）；监听为全局/局部键盘，不引入焦点陷阱。

## 7. 国际化

- 无 i18n 需求：键位内容原样渲染 `hotKeys`/`content` 提供的字符串，不做符号转换或翻译（对齐 Semi，Semi 无平台检测、无修饰键符号映射）。

## 8. 文案

- 无长文案。键名由 `hotKeys`/`content` 提供，原样展示。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| svelte gzip | ≤ 2 KB | 提示渲染 |
| core `hotkeys.ts` gzip | ≤ 1.5 KB | 匹配引擎 + Keys 常量 |
| 键盘事件成本 | 单次 keydown O(组合长度) 匹配 | 无节流需求 |

- 全局监听单个 keydown，卸载时解绑。无重排。

## 10. AI 元数据

`component.meta.ts`：
- `name: 'HotKeys'`、`category: 'other'`、`stage: 'M6'`、`semiEquivalent: 'HotKeys'`。
- props/events schema；`Keys` 常量说明。
- `examples`：基础 Ctrl+Shift+A 唤起 Modal、自定义显示内容、render 自定义、preventDefault 拦截 Ctrl+S、getListenerTarget 局部监听、mergeMetaCtrl 死 prop 演示。
- `doNot`：不要漏 preventDefault 导致浏览器默认行为、不要在 hotKeys 放多个普通键。

## 11. 测试

- **单元（core）**：`isValidHotKeys` 合法/非法（0 普通键、2 普通键、非法键名）；`matchHotKeys` 修饰键精确匹配（多按/少按不触发）、普通键 code 匹配；`keyToCode` 符号映射；`mergeMetaCtrl` 死 prop 不生效（Meta/Ctrl 仍严格区分）。
- **组件**：提示 UI 渲染（默认原样/content/render/null）；监听挂载与解绑；preventDefault 生效；getListenerTarget 局部；onClick 点击回调。
- **a11y**：axe 无违规；DOM 结构对齐 Semi（span 非 kbd）；对比度达标。
- **视觉回归**：默认提示 × 暗色。

## 12. 验收标准（对照 AGENTS.md §5 DoD）

- [ ] 分层正确（core 匹配引擎 + svelte 提示） · [ ] 类型+JSDoc · [ ] Token 注册（镜像 Semi 8 个变量） · [ ] a11y 通过（DOM 对齐 Semi + 对比度）
- [ ] 无本库扩展 prop/能力（严格对齐 Semi） · [ ] core/组件/a11y 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页 + demo 完成
