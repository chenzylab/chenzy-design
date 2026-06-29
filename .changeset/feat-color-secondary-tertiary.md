---
"@chenzy-design/tokens": minor
"@chenzy-design/docs": patch
---

补全语义色 token：新增 --cd-color-secondary（强中性深灰）与 --cd-color-tertiary（弱中性浅灰），light/dark 各一套，与 Button --btn-hue 同源。此前这两个变量未定义，引用会静默回退。

Button 文档新增「关于类型字体色值」节（对齐 Semi）：说明每种 type 对应的 --cd-color-* 语义变量，并用 demo 把主要/次要/第三/警告/危险按对应变量上色。
