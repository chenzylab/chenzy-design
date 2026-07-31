# Semi 组件文档对齐 SOP

> 把组件文档整页一比一对齐 Semi Design 的标准作业流程。
> 标杆：`packages/docs/src/content/components/form.md`（已完成整页对齐，作为模板）。
> 供新 session 直接 `@` 引用后按此执行。

## 背景与参照

- **Semi 源码（本地）**：`~/i/semi-design`
  - 文档：`content/<category>/<comp>/index.md`（中）+ `index-en-US.md`（英）
  - 文档站展示组件：`src/components/`（Notice / ApiType / DesignToken 等）
  - 锚点规则：`src/utils/index.js` 的 `makeAnchorId`
- **本库**：`~/i/chenzy.design`（monorepo：core / svelte / docs / icons / tokens …）
- **先读记忆**：`~/.claude/projects/-Users-chenzy-i-chenzy-design/memory/MEMORY.md`，重点：
  - `button-onclick-lowercase-not-onclick-camelcase`（含 RadioGroup options vs Select optionList）
  - `form-field-external-onchange-passthrough`
  - `form-semi-rewrite-flat-class-field-padding`

## 已建好的基建（直接复用，勿重造）

1. **md 内联驱动整页（唯一渲染路径）**：md 本身就是整页（单页纵向流、无 tab、复刻 Semi）。逻辑在 `routes/(app)/components/[name]/+page.ts` 和 `+page.svelte`。
   > 历史：这曾是 `docMode: inline` frontmatter 控制的两套路径之一。71/71 对齐完成后（2026-07-30 收尾清理）开关与旧 meta 驱动双 tab 路径已整体删除，**新页无需再写任何 docMode 标记**。
2. **`lib/components/Notice.svelte`**：注意事项提示块，严格对齐 Semi（primary / warning / danger 三态）。md 里写 `<Notice type="primary" title="注意事项">…</Notice>`。
3. **锚点 rehype 插件**（`packages/docs/svelte.config.js` 的 `rehypeSemiAnchor`）：md 标题自动生成与 Semi `makeAnchorId` 一致的 id（分享链接锚点逐字节对齐）。
4. **TOC 一级平铺**：从「代码演示」标题起收集、平铺不分树、无「本页目录」标题（已全局去掉）。
5. **i18n 双 md**：`+page.ts` 同时加载 `<name>.md`（中）+ `<name>.en.md`（英），`+page.svelte` 按 `locale.value` 客户端切换，en 缺失回退 zh。**英文整份后补**，每轮先做中文。

## 每个组件的对齐步骤（照 form.md 抄结构）

1. **读 Semi 蓝本全文**：`~/i/semi-design/content/<cat>/<comp>/index.md`。提取：章节标题+层级（`##`/`###`/`####`）、各 demo 说明文字、所有 `<Notice>` 块、API 表、Accessibility / 文案规范 / 设计变量 / FAQ。
2. **md 内联书写整页**：顶部 `<script>` import 各 demo（`../../demos/<dir>/xx.svelte` + `?raw` 源码）+ DemoBox + Notice；正文按 **Semi 章节顺序 + 层级 + 措辞逐字对齐**内联书写：`### demo标题` + 说明 + `<Notice>` + `<DemoBox code={src}><Demo/></DemoBox>`。
3. **demo 严格对齐 Semi**：demo 要「跟 Semi demo 长得一样」——字段名/数量、控件类型、按钮、初始值、布局、文案逐项对齐 Semi 源码，**不许擅自简化**。React→Svelte 合理映射：`<Select><Option>`→`optionList`；render props / children function→带参 snippet；ref / getFormApi；React Hook→本库对应 hook。
4. **能力缺口就补全**（不跳过）：Semi 有而本库缺的能力，改 core/svelte 源码补实现（改 core src 必 rebuild dist）；技术栈差异（HOC / withField 等 Svelte 无对应的）用本库替代技术呈现，**标题也用本库措辞**并说明。
5. **API 表**：md 里手写表格。**表格/说明里的 `{ }` 花括号必须用反引号包**（`` `{ silent: true }` ``），否则 mdsvex 当 Svelte 表达式解析报错，页面 500。

## 文件目录结构对齐

对齐 Semi **不是只对齐渲染结果**，文件切分/命名也照 Semi 走——这样「Semi 哪个文件干什么」能一一映射到本库，后续排查/补齐能直接按图索骥（TimePicker 的 `Combobox` / `TimeInput` 拆分就是这么来的）。

### 落点映射（Semi 双包 → 本库单目录）

Semi 分 `semi-ui/<comp>/`（React 渲染层）+ `semi-foundation/<comp>/`（无框架逻辑层 + scss）两个包；本库合并为**一个组件目录** `packages/svelte/src/<comp-dir>/`，逻辑层用 `*-foundation` 文件承担，样式内联在 `.svelte` 的 `<style>`（scoped + `:global` 打洞），token 走 `packages/tokens`。

| Semi | 本库 | 说明 |
| --- | --- | --- |
| `semi-ui/<comp>/<Comp>.tsx` | `<Comp>.svelte` | 主组件，**文件名保持 Semi 的 PascalCase 原名** |
| `semi-ui/<comp>/<Sub>.tsx` | `<Sub>.svelte` | 子组件逐个对应（如 `Combobox.tsx`→`Combobox.svelte`、`TimeInput.tsx`→`TimeInput.svelte`）；**Semi 拆了本库就拆，别合并成一个巨型组件** |
| `semi-foundation/<comp>/foundation.ts` | `<comp>-foundation.svelte.ts` | 有响应式状态用 `.svelte.ts`（rune），纯函数用 `.ts` |
| `semi-foundation/<comp>/<X>Foundation.ts` | `<x>-foundation.ts` | 如 `inputFoundation.ts`→`input-foundation.ts`、`ComboxFoundation.ts`→`combobox-foundation.svelte.ts` |
| `semi-foundation/<comp>/constants.ts` | `constants.ts` | 同名 |
| `semi-foundation/<comp>/utils/` | `_utils/` | 下划线前缀（对齐本库既有 `_utils`/`_floating` 惯例） |
| `semi-foundation/<comp>/{timePicker,rtl}.scss` + `variables.scss` | `.svelte` 内 `<style>` + `packages/tokens` | 本库无独立 scss；变量进 token 层 |
| `semi-ui/<comp>/index.tsx` | `index.ts` | 导出口 |
| `semi-ui/<comp>/__test__/` | 同目录 `*.a11y.test.ts` | **Svelte 组件测试必须叫 `*.a11y.test.ts`**（vitest dom project），叫 `*.test.ts` 会落 node project 编译不了 `.svelte` |
| — | `meta.ts` | 本库特有（AI/docs 消费，见 ai-friendly.spec.md），Semi 无对应 |

### 目录名

- **组件目录名用 kebab-case**：Semi 是 camelCase（`timePicker`/`autoComplete`/`datePicker`），本库统一 `time-picker`/`auto-complete`/`date-picker`。**连字符组件的 token component 归属要用整名**（`time-picker` 而非 `time`）。
- docs demo 目录同名：`packages/docs/src/demos/<comp-dir>/`，与 svelte 组件目录**同名**（`time-picker`），别一边 `timepicker` 一边 `time-picker`。
- **md 文件名却是无连字符**：`packages/docs/src/content/components/timepicker.md`（对齐 Semi 路由 `/input/timepicker`）。即：**md 名无连字符、目录名有连字符**，三处别混（改名/移文件要同步所有消费方与 glob key，漏一处静默不加载）。

### 判据

对齐完跑一次「双向点名」：`ls ~/i/semi-design/packages/semi-ui/<comp>/` 逐个文件问「本库对应哪个」，反过来本库每个文件问「Semi 哪来的/为何本库特有」。答不上来的就是**漏拆**或**自造超集**——前者补、后者删或在 spec 里写明理由。

## 铁律（来自 Form 对齐踩坑，务必遵守）

- **prop 名不统一，逐组件 grep 核对别想当然**：
  - Button 事件用 `onclick`（原生小写，**非** onClick）
  - Modal `onOk`/`onCancel`、Select `onChange`、Form `onChange`/`getFormApi`/`onValueChange` 是 camelCase
  - **RadioGroup / CheckboxGroup 选项用 `options`，Select 才用 `optionList`**
  - 写错被静默忽略，typecheck 不报，只有真机才暴露（控件渲染空 / handler 不触发）。
- **JS `.click()` 不触发 Svelte 委托事件**：验证交互必须用 claude-in-chrome **真实鼠标点击**（`computer` 的 `left_click`，非 javascript dispatchEvent）。
- **每个交互 demo 必真机点击验证**：不弹 / 不动就逐层彻查（组件单例是否挂载 → core 能力是否工作 → formApi 是否就绪 → handler 是否执行 → prop 名是否对），别在「截图错过」这类推测处翻篇。
- **改公开类型 / core src 后跑根级递归 typecheck**（core + svelte + docs 三包），别只跑单包假绿。改 core src 必 rebuild core dist、改 svelte src 必 rebuild svelte dist（docs 吃 dist）。
- **`await formApi?.validate()` 可选链在 formApi undefined 时 Svelte 编译产物会崩**：先 `if (!formApi) return;` 再 `await formApi.validate()`。
- **本库 `validate` 返回 `Promise<boolean>`**（非 Semi 的 resolve values / reject errors）：demo 按 boolean 契约写。
- **dev server**：`cd packages/docs && pnpm exec vite dev --port 5200`（用 `run_in_background: true`）。改 .svelte 后若真机与改动矛盾，清 `node_modules/.vite` 重启。
- 本仓库 commit 禁 AI 署名（commit-msg 钩子拒 Co-Authored-By Claude）。

## 每个组件收尾清单

- [ ] 中文 md 内联整页，章节 / TOC / Notice / API 逐字对齐 Semi
- [ ] 所有 demo 真机点击验证交互生效（截图对照 Semi）
- [ ] 遇到的能力缺口已补全（改源码）或明确说明技术差异
- [ ] **视觉度量对齐**：关键元素的 `getComputedStyle` 读数与 **Semi 官网实测值**逐属性比对（见下节）
- [ ] core / svelte / docs 三包 typecheck 全绿 + 相关测试全绿
- [ ] **`pnpm --filter @chenzy-design/docs check:anchors` 全绿**（md 里写了锚点链接时必跑，见下节）
- [ ] **`pnpm --filter @chenzy-design/docs build` 通过**（dev 绿 ≠ 构建绿，见下节）
- [ ] 新发现的踩坑写进记忆

**建议一次只对齐 1 个组件**，做透验透再下一个，别批量铺开。优先挑刚破坏性重写对齐过 Semi 的组件（见 git log 近期 `feat(...)!: 对齐 Semi` 提交）。

## 视觉差异必须机器可测，别靠人肉眼（2026-07-31 新增）

**问题**：a11y / kbd / 元素存在与数量类断言**测不出视觉差异**。用户肉眼指出的三个真实回归——
textarea `line-height` 写成 `1.5`（21px，Semi 是固定 20px）、显式 `rows={1}` 让初始框由 4 行塌成单行、
placeholder 兜底到自造 locale 键凭空显示「输入消息」——**当时全部用例照样绿**。
visual project 的截图回归也救不了：它只能发现「相对自己过去变了」，
发现不了「我们从一开始就没和 Semi 对齐」。

### 铁律：**token 的名 / 值 / 公式都要和 Semi 变量一一对应**

**闸门**：`pnpm --filter @chenzy-design/tokens check:semi-parity`
（脚本 `packages/tokens/scripts/check-semi-variable-parity.mjs`）

把 Semi 全部 75 份 `variables.scss`（3678 条变量）与本库 token manifest 逐条比对：
**同名、同值、同公式**，缺的新增、错的修正。

命名映射（按本库既有 token 实测归纳）：
`$color-checkbox_cardType-bg-hover` → `--cd-color-checkbox-cardtype-bg-hover`
——去 `$`、`_`→`-`、**驼峰整体小写不拆词**、加 `--cd-`。

两类**必须归一、不算差异**的形态差别（脚本已内置）：

1. **色板形态**：Semi 的 `--semi-grey-9` 存的是**裸 RGB 三元组**（`28,31,35`，
   见 `_palette.scss:52`），故必须写 `rgba(var(--semi-grey-9), 1)`；
   本库 `--cd-color-grey-9` 本身是完整颜色，等价写法就是 `var(--cd-color-grey-9)`。
   带透明度的 `rgba(var(--semi-X), .8)` ≡ `color-mix(in srgb, var(--cd-color-X) 80%, transparent)`。
2. **算术形态**：SCSS 原生支持算术，CSS 必须 `calc()`。
   Semi `($height-control-default - 20px) * 0.5`
   ≡ 本库 `calc((var(--cd-height-control-default) - 20px) * 0.5)`。

**当前基线（2026-07-31 首次全量比对）**：缺失 **2058** 条、值/公式不一致 **81** 条。
这是第二轮对齐 ③「token 命名/取值对齐」的**真实工作量**（原估「49 处命名错配」严重低估）。
因量级过大，闸门暂不进 `verify` 阻断构建；按组件分批清零，
清一个组件就跑 `check:semi-parity <组件名>` 验证归零。

典型问题形态（来自首次扫描）：
- **命名分叉**：Semi `$height-control-default` → 应为 `--cd-height-control-default`，
  本库却叫 `--cd-control-height-default`（词序颠倒）；
- **绕过中间变量**：Semi `$color-button_disabled-bg-default: $color-button-disabled-bg-default`
  这类**组件级中转**，本库直接指向基础色 `--cd-color-disabled-bg`，
  导致主题定制时改不动 button 这一层；
- **把变量写死**：Semi `$width-grid-screen-sm-min: $width-grid-screen-sm`，本库写成 `576px`。

### 铁律：**形式对齐，不只是数值对齐**

Semi 用什么形式表达，本库就用对应形式，一一对应：

| Semi 源码写法 | 本库必须写成 | 反例（数值对但形式错） |
|---|---|---|
| 写死 px（如代码块 `line-height: 1.5`） | 同样写死同值 | 造一个 token 包起来 |
| `@include font-size-*`（通用刻度 mixin） | `var(--cd-line-height-{scale})` | 写死 `20px` |
| 组件专属变量 `$font-checkbox_label-lineHeight` | 同名同值组件 token `--cd-font-checkbox-label-lineheight` | 借用通用刻度 `--cd-line-height-regular` |
| 计算式 `calc($a + $b)` | 同结构 `calc(var(--cd-a) + var(--cd-b))` | 把结果算成一个固定值 |

**为什么形式错了也是错**：数值当下相同，但
①主题定制时改不动那一处（组件 token 被绕过）；
②Semi 改版调整变量时本库不会跟着变，悄悄漂移；
③丢掉「这是组件自己的可调参数」这层语义。

本轮真实案例：我把 Semi 的 `$font-checkbox_label-lineHeight`
错用成通用刻度 `--cd-line-height-regular`（值同为 20px），
而本库其实**早就有** `--cd-font-checkbox-label-lineheight` 同名 token；
AIChatInput 的两个专属行高变量本库没有对应 token，已补建后再消费。

**做法：源码为准，实测为佐证。** 顺序不能反——

1. **先读 Semi 源码拿「公式」**（`~/i/semi-design`）：类名、变量名、mixin、计算式。
   源码给的是**规则**（如 `@include font-size-regular` → 固定 `line-height: 20px`），
   实测只给**某一个实例的结果**，会被主题/视口/页面级覆盖带偏，且看不出它为什么是这个值。
2. **再用实测/真机验证**这条规则在本库真的落地了。

⚠️ 我最初写成「打开 Semi 页面测 computed 值」是错的示范：那样只能得到 `20px` 这个数字，
得不到「Semi 的字号与行高是成对绑定的」这条规则，也就防不住下一处同类问题。

### 已落地的静态闸门：字号↔行高绑定

`pnpm check:semi`（已挂进根级 `verify`）会跑
`packages/svelte/scripts/check-font-lineheight.mjs`：

- **依据**（Semi 源码 `semi-theme-default/scss/_font.scss`）：字号与行高成对绑定，
  `small→16px / regular→20px / h6→22px / h5→24px / h4→28px / h3→32px / h2→40px / h1→44px`。
  Semi 全库 159 处 `@include font-size-*`，只有 3 处写死 `1.5`（代码块等宽字体场景）。
- 本库 tokens 已 1:1 镜像该表（`--cd-line-height-*`），组件**只许消费、不许自己算比例**。
- 首次运行揪出 **16 处**裸比例行高（`1.5`/`1.4`/`1.6`），逐个回 Semi 源码查出真值后已全部改为 token。
- 放行 `line-height: 0` 与 `1`：图标/单字形居中的排版重置，与字号无关（Semi 也用 `0`）。

**同类问题请照此办**：先在 Semi 源码里找到「规则」，再写静态闸门把规则固化，
而不是等人肉眼发现后逐个修。

- 基线：`packages/svelte/src/test-utils/semi-metrics.ts`（每条记 **来源 URL + 采集日期 + Semi 选择器**）
- 用例：`<Comp>.metrics.kbd.test.ts`（browser project）
- 夹具**必须 `import '@chenzy-design/tokens/tokens.css'`**，否则 `var(--cd-*)` 全失效、
  读数恒为 `0px`/`transparent`，断言恒真（见 [[browser-project-needs-tokens-css-import]]）

**采集步骤**：打开对应 Semi 文档页 → 对目标元素跑 `getComputedStyle` → 连同日期写进基线常量。
基线是「Semi 当时的真实值」，不是「我们希望的值」；对不上时先判断是本库回归还是 Semi 改版。

**每条新用例都要故意把被测样式改坏、确认它会红**——恒真的断言比没有断言更危险。

哪些属性值得钉：字号/行高/padding/初始高度/align-items/border/圆角，
以及「默认值类」可见行为（有无 placeholder、初始行数、默认展开态）。

## 文档站两个「dev 绿但实际有问题」的陷阱

两条都在 71/71 收尾清理时真实踩到，`pnpm dev` / `svelte-check` / 单测**全绿也不代表没问题**。

### 1. 锚点断链全量校验

`pnpm --filter @chenzy-design/docs check:anchors`（脚本 `packages/docs/scripts/check-anchors.mjs`）。

`kit.prerender.handleMissingId` 设成 `'warn'`（demo 内的示例锚点如 Menu 的 `#nav-home` 并非真实页面锚点，
设 error 会误杀），所以**同页断链只是一条被淹没的警告**；**跨页断链连警告都没有**
（爬虫只在链接被访问到时校验）。收尾时靠此脚本一次性查出 8 处。

锚点 id 由 `svelte.config.js` 的 `makeAnchorId` 生成，**逐字节对齐 Semi**，别凭直觉手写：

| 标题 | 真实 id | 易错写法 |
|---|---|---|
| `### Modal.method()` | `modal-methodaaaaaa` | ~~`modalmethod`~~ |
| `## API 参考` | `api-参考` | ~~`API-参考`~~ / ~~`API_参考`~~（要小写） |
| `### 占位图插画(建设中)` | `占位图插画aaa建设中aaa` | ~~`占位图插画_建设中_`~~ |

`(` 和 `)` 各转 `aaa` 不是笔误——Semi 原样如此。**不确定就先跑一遍 dev 看渲染出的真实 id**。

### 2. 生产构建才暴露的 prerender 失败

**改文档站必须跑 `pnpm --filter @chenzy-design/docs build`**，只跑 dev 会漏掉整类问题。

典型：删掉某个 UI 元素时，如果它是某条 `prerender = true` 路由的**唯一站内入口**，
SvelteKit 爬虫就再也发现不了该路由，构建报
`marked as prerenderable, but were not prerendered` 并**非零退出**。
收尾清理删双 tab 栏时就这样把 `/design/components/[name]` 弄丢了。

两条防线：

- 参数化路由**尽量显式导出 `entries()`**（如 `design/components/[name]/+page.ts` 从 `components.json` 枚举），
  别指望靠爬虫从别处链接发现；
- 删 UI 元素前先 `grep` 它的 `href` 目标，确认不是某条路由的唯一入口——
  **丢入口不只是构建问题，更是「该页对用户彻底不可达」的功能回归**。

## ✅ 关于 `docMode`（收尾清理，已于 2026-07-30 完成）

`docMode: inline` 曾是「两套渲染路径」的开关（标记页走 md 内联单页流，未标记页走旧 meta 驱动双 tab）。
71/71 全部对齐后已执行收尾清理：**开关连同旧双 tab 路径整体删除，md 内联成为唯一渲染路径**。

结论（后来者只需记住）：

- **新增/重写文档页不用再写任何 `docMode` frontmatter**，md 直接就是整页。
- `+page.svelte` 830 → 318 行、`+page.ts` 60 → 34 行（`load` 返回 `{ meta, Content, ContentEn, brief }`），
  meta 驱动的 API/a11y/tokens section 渲染、`activeTab`/`tocSections`、34 个配套 CSS 规则块均已移除。
- **`meta.ts` 仍是 API 契约真源**（spec 校验、组件清单等仍读它），只是不再被文档页渲染层消费。
- ✅ **85 份 `demos.ts` 已于 2026-07-31 全部删除**（连同一个遗留重复目录 `demos/pin-code/`）。
  当时它们是 13 个「无 md」组件仅存的 demo 数据源，故先补完那 13 个页（84/84 归零）再删。
  删后 demo `.svelte` 866 个全部由 md 直接 import，构建与全量测试均通过。

执行明细与验证结果见 [semi-doc-alignment-progress.md 的「收尾清理」](./semi-doc-alignment-progress.md)。

## spec 类名漂移检测（改完组件类名后必跑）

组件类名改了、spec 没跟上，会让后续开发按错的类名写覆盖样式（静默不匹配）。
本仓 2026-07-30 全量比对时初测 **21 个 spec 漂移**，其中 Anchor 的 `ink/rail/list`
早在 PR #503 后就与源码脱节。做法：

```python
# 已知集合 = svelte/icons/icons-lab 全部 .svelte 的类名 + tokens 全量 token
# 待检 = 每个 spec 里 `.cd-x` / `cd-x` 反引号语境出现的名字
# 差集即漂移；逐条核源码真名后订正，改完重跑直到剩余 0
```

三类处理，**别编造名字**：
1. **前缀写错**（组件目录 kebab 化后 spec 未跟）→ 按目录名订正。
2. **结构名改过**→ grep 源码真名替换。
3. **spec 承诺了源码从未实现的类** → **如实标注**（「未实现，规划中」/「由 X 子组件承担」/
   「由 token 切换，无独立修饰类」），不要为了让检测通过而随手编一个名字。

⚠️ 自查：我在这轮里两次凭印象写错真名（`cd-input-disabled` 实为
`cd-input-wrapper-disabled`；`cd-image-img-placeholder` 根本不存在），
都是靠重跑脚本看「剩余数」才发现。**每轮改完必重跑，别凭印象收工。**
