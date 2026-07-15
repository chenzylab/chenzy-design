---
"@chenzy-design/svelte": major
"@chenzy-design/tokens": major
---

Grid（Row/Col）：破坏性重写严格对齐 Semi Design（float 布局机制 + type prop）。

- Row：新增 `type?: 'flex'`。缺省渲染 `cd-row`（display:block + clearfix ::before/::after），`type="flex"` 渲染 `cd-row-flex`（display:flex）并激活 `cd-row-flex-{justify}` / `cd-row-flex-{align}`。移除 `wrap` prop；`align` 收窄为 top/middle/bottom，`justify` 收窄为 start/end/center/space-between/space-around（删 baseline/stretch/space-evenly）。gutter 改为 Semi 真实四向负 margin（水平 marginLeft/Right、垂直 marginTop/Bottom），移除 `--cd-grid-gutter-x/y` CSS 变量与 row-gap。新增 `style` prop（追加在 gutter margin 之后可覆盖）。保留 screens 状态机（复用 core registerMediaQuery/defaultResponsiveMap）+ getGutter 从大到小降级。
- Col：布局机制从 flex-basis + max-width 改为 Semi float（`float:left` + `width%`；push→left、pull→right、offset→margin-left、order→order）。四向 gutter padding（补齐垂直 padding-top/bottom 抵消 Row 垂直负 margin）。移除 `flex` prop，新增 `style` prop。补 `.cd-rtl` RTL 覆盖（float:right、offset margin-right）。断点 xs 无 @media、sm/md/lg/xl/xxl 包 @media，col-0 系列 display:none。百分比与断点值（576/768/992/1200/1600）逐字镜像 Semi。
- tokens：删除 Semi 无的中间 token（grid-columns、grid-gutter-x、grid-gutter-y）；组件走 float + 内联样式，无运行时 CSS 变量消费。保留 width-grid-screen-* + width-grid-columns + width-grid-gutter 作为设计变量表。
- demo：justify/align/order demo 加 `type="flex"`；gutter demo 补响应式对象示例；删除依赖已删 prop 的 09-flex-fill（Col flex）与 10-nowrap（Row wrap）。
- DOM / class 名 / CSS 值逐字对齐 Semi（cd-row / cd-row-flex / cd-row-flex-center / cd-col / cd-col-8 / cd-col-md-12 等）。
