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

1. **`docMode: inline` 机制**：md frontmatter 加 `docMode: inline` → 该页走「md 内联驱动整页」（单页纵向流、无 tab、复刻 Semi）。逻辑在 `routes/(app)/components/[name]/+page.ts` 和 `+page.svelte`。
2. **`lib/components/Notice.svelte`**：注意事项提示块，严格对齐 Semi（primary / warning / danger 三态）。md 里写 `<Notice type="primary" title="注意事项">…</Notice>`。
3. **锚点 rehype 插件**（`packages/docs/svelte.config.js` 的 `rehypeSemiAnchor`）：md 标题自动生成与 Semi `makeAnchorId` 一致的 id（分享链接锚点逐字节对齐）。
4. **TOC 一级平铺**：从「代码演示」标题起收集、平铺不分树、无「本页目录」标题（已全局去掉）。
5. **i18n 双 md**：`+page.ts` 同时加载 `<name>.md`（中）+ `<name>.en.md`（英），`+page.svelte` 按 `locale.value` 客户端切换，en 缺失回退 zh。**英文整份后补**，每轮先做中文。

## 每个组件的对齐步骤（照 form.md 抄结构）

1. **读 Semi 蓝本全文**：`~/i/semi-design/content/<cat>/<comp>/index.md`。提取：章节标题+层级（`##`/`###`/`####`）、各 demo 说明文字、所有 `<Notice>` 块、API 表、Accessibility / 文案规范 / 设计变量 / FAQ。
2. **md 改成 inline 内联**：frontmatter 加 `docMode: inline`；顶部 `<script>` import 各 demo（`../../demos/<dir>/xx.svelte` + `?raw` 源码）+ DemoBox + Notice；正文按 **Semi 章节顺序 + 层级 + 措辞逐字对齐**内联书写：`### demo标题` + 说明 + `<Notice>` + `<DemoBox code={src}><Demo/></DemoBox>`。
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
- [ ] core / svelte / docs 三包 typecheck 全绿 + 相关测试全绿
- [ ] 新发现的踩坑写进记忆

**建议一次只对齐 1 个组件**，做透验透再下一个，别批量铺开。优先挑刚破坏性重写对齐过 Semi 的组件（见 git log 近期 `feat(...)!: 对齐 Semi` 提交）。

## 关于 `docMode`（收尾清理，勿中途做）

`docMode: inline` 是「两套渲染路径」的开关，**不是临时脚手架**：标记的页走新的 md 内联单页流，没标记的走旧 meta 驱动双 tab。

- **对齐进行中 / 只对齐了一部分**：`docMode: inline` 必须**保留**在每个已对齐的 md 里——它是「本页已对齐、走新路径」的标记。中途删除会让已对齐页退回旧渲染而崩。
- **确认全部组件（约 72 个）对齐后**，才做一次独立的「渲染层统一收尾」：
  1. `+page.svelte` 反转默认让所有页走 inline，删掉 meta 驱动的 tab 分支（demo / api / a11y / tokens section、activeTab 状态、tocSections）
  2. `+page.ts` 删 `docMode` 读取，`load` 不再返回它
  3. 逐个 md 删掉 `docMode: inline` frontmatter 行
  4. 评估旧 `demos.ts` / meta 驱动 API 渲染的去留（无消费者则删）
  5. 根级 typecheck + 全页真机抽验不回归

即：**不是「去掉 docMode」，而是「全量对齐后把 inline 变默认并删掉旧路径」。全量完成前不要碰。**
