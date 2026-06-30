---
"@chenzy-design/tokens": minor
---

颜色值对齐 Semi design tokens（以 Semi 开源仓库 semi-theme-default/scss/global.scss 为准）：

- **浅色背景 bg-1/2/3 改为纯白 `#fff`**（原为实色灰阶 grey-0/1/2）。对齐 Semi「浅色 4 层背景全白、层级靠 border/fill 半透明叠加区分」的设计哲学，消除顶栏/卡片等处突兀的灰带。
- **border 改为半透明 `rgba(28,31,35,0.08)`**（Semi `rgba(grey-9,.08)`，原为实色 grey-1），更淡更柔和。
- **新增 `fill-2`**（浅 `rgba(46,50,56,.13)` / 暗 `rgba(255,255,255,.2)`，对齐 Semi 激活态填充）。
- **暗色校正**：bg-2 `#2e3238`→`#35363c`、bg-3 `#41464c`→`#43444a`、border 改半透明 `rgba(255,255,255,.08)`、fill 改 `rgba(white,.12/.16/.2)`，与 Semi 暗色一致。

此前 fill-0/1、text-0~3、primary 已对齐 Semi；本次补齐 bg/border/fill-2 的偏差。全量 971 测试通过、contrast-check 通过、Layout/Table 等组件实测无回归（白底 + border 区分，观感更贴 Semi）。
