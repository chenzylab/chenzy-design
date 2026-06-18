# SPEC · <ComponentName>

> 分类：<basic|input|navigation|show|feedback|other> · 阶段：<M?>
> 对标 Semi：<Semi 同名组件链接/说明>
> 生成新组件 SPEC 时**复制本文件**并逐节填写。所有「横切要求」必须对照 `specs/00-foundation/` 各 SPEC。

## 1. 概述
一句话定位 + 典型使用场景。

## 2. 设计语义
何时用 / 何时不用；与相似组件的区别。

## 3. 分层实现
- **headless（core/）**：是否需要逻辑原语？需要哪些（状态、键盘、a11y）？无交互可省。
- **渲染（svelte/）**：`<Component>.svelte` 结构、内部子组件。

## 4. API
### Props
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| | | | |
### Events
| 事件 | 载荷 | 说明 |
|---|---|---|
### Slots
| 名称 | 说明 |
|---|---|
> 受控/非受控约定遵循全库一致性（见 ai-friendly.spec.md）。

## 5. 主题 / Token（见 theming + tokens）
列出本组件 Component Token：`--cd-<component>-*`，及其默认引用的 Alias。
| Token | 默认 | 用途 |
|---|---|---|

## 6. 无障碍（见 a11y.spec.md）
- role / aria-*：
- 键盘交互：
- 焦点管理：
- 对比度 / reduced-motion / RTL 注意点：

## 7. 国际化（见 i18n.spec.md）
- 涉及的 i18n key：`<Component>.xxx`
- 日期/数字/复数格式需求：

## 8. 文案（见 content-guidelines.spec.md）
- 默认文案与规范要点（尤其危险操作）。

## 9. 性能（见 performance.spec.md）
### Perf Budget
| 指标 | 预算 |
|---|---|
| gzip 体积 | |
| 运行时关键场景 | |
- 是否需要虚拟化 / 惰性渲染 / destroyOnClose。

## 10. AI 元数据（见 ai-friendly.spec.md）
确认提供 `component.meta.ts`（props/events/slots/a11y/tokens/examples）。

## 11. 测试
- 单测（逻辑分支）：
- 交互/视觉 e2e：
- a11y（axe + 键盘）：

## 12. 验收标准（对照 AGENTS.md §5 DoD）
- [ ] 分层正确 · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页完成
