---
"@chenzy-design/svelte": major
"@chenzy-design/core": major
---

Grid：破坏性重写响应式机制严格对齐 Semi，删除 breakpoints.ts。

- Col：从「JS 单激活断点 + resolveResponsiveValue」改为 Semi 的纯 CSS 类驱动——生成 cd-col-{span} / cd-col-{bp}-{span} / offset / push / pull / order 基础类与断点类，cd-col-0 / cd-col-{bp}-0 → display:none。24×6 断点类以 :global 静态样式落地（xs 基础层，sm/md/lg/xl/xxl 包在 @media (min-width) 内，靠源码顺序层叠），百分比与断点值（576/768/992/1200/1600）逐字镜像 Semi。Col 不再读 JS 断点。
- Row：引入 Semi 的 screens 状态机（复用 core 的 registerMediaQuery + defaultResponsiveMap + BreakpointScreens，仅当 gutter 为对象时注册监听），getGutter 用 responsiveArray=[xxl…xs] 从大到小降级取值。gutter 类型对齐 Semi。保留负 margin 与 align/justify/wrap。
- core：删除 breakpoints.ts（及 resolveActiveBreakpoint / resolveResponsiveValue / BREAKPOINT_ORDER，全仓库无消费方）；Breakpoint 类型与 BREAKPOINTS 常量迁入 config-provider.ts，从 core 入口重导出。
- 删除 packages/svelte/src/grid/use-breakpoint.svelte.ts。
