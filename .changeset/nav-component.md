---
"@chenzy-design/svelte": minor
---

新增 Nav（Navigation）组件，对齐 Semi Navigation：

- 独立公开组件 `Nav` + `Nav.Header` + `Nav.Footer`，字段对齐 Semi（itemKey/text/icon/items）。
- 支持 vertical/horizontal 模式、子导航、logo 头部、底部 collapseButton（仅 vertical），以及 selectedKeys/openKeys/isCollapsed 的受控与非受控 + onSelect/onOpenChange/onCollapseChange 回调。
- 实现策略：对外是独立组件，内部委托本库 Menu（purpose=navigation）渲染导航体，复用其选中/展开/折叠/键盘/a11y 逻辑，仅新增 Header/Footer 容器与折叠联动。
- 折叠按钮 aria-label 复用 locale 包 Sider.expand/collapse。
- MVP 范围；limitIndent / toggleIconPosition / subNavMotion / renderWrapper / Nav.Item 声明式写法等留待后续。
