# AGENTS.md — chenzy-design 组件库

> 本文件是项目的「宪法」。任何 AI agent 或人类贡献者在动手前必须先读它。
> 它定义了**身份、技术栈、目录约定、命名规范、工作流、质量门禁**。
> 具体「做什么」由 `specs/` 下的 SPEC 文件定义；「怎么做某一类横切能力」由 `.claude/skills/` 下的 SKILL 定义。

---

## 1. 项目身份

- **名称**：chenzy-design
- **定位**：一套对标 [Semi Design](https://semi.design/) 的、面向中后台与前端基础场景的高质量 Svelte 组件库。
- **核心差异化目标**（必须全程满足，不是可选项）：
  1. **无障碍（a11y）**：WCAG 2.1 AA 起步，键盘可达、屏幕阅读器友好。
  2. **主题化**：基于 Design Token 的多层变量体系，支持运行时换肤与编译期定制（参考 Semi Theme）。
  3. **多 MVVM 框架适配能力**：核心逻辑与渲染层解耦，Svelte 为首发渲染层，但 headless 逻辑可被其他框架复用。
  4. **性能基准**：建立可量化的性能基线与回归监控（参考 Semi PerfBaseline / Performance）。
  5. **国际化（i18n）**：组件内置多语言、可注入 Locale，支持 RTL。
  6. **AI 友好**：组件 API、文档、元数据让 AI「有章可循」（参考 Semi AI）。
  7. **文案规范**：内置文案符合统一的 Content Guidelines。

## 1.1 严格对齐 Semi Design（核心开发原则，全程满足）

> 本库定位是「对标 Semi Design」。**「严格对齐 Semi」是贯穿所有组件开发的第一原则**，
> 优先级高于「本库既有实现」与「向后兼容」。1.0 前无兼容包袱，发现偏离 Semi 即破坏性对齐。
> 参照系：本地 Semi 源码 `~/i/semi-design`（semi-mcp 无响应时直接读源码）。

**四个维度都要对齐（不是只对齐 API 表面）：**

1. **API 对齐**：以 Semi 组件的 `propTypes` / `interface Props` 为契约，**逐 prop 核对实现**（不是看
   spec/meta/文档——它们会骗人：假 prop、孤儿组件、缺失方法、默认值漂移）。
   - Semi 有我们没有的 → **补**；我们有 Semi 没有的 → **删超集**（无需向后兼容）。
   - 同名 prop 默认值/枚举/签名漂移 → **改回 Semi**。
   - 通用 prop（class/style/id/rest 透传）也要核（易漏；本库 Svelte 用 `class` 非 `className`）。
2. **DOM 结构对齐**：容器层级、class 语义、条件渲染分支镜像 Semi。
   - **Semi 复用其他 Semi 组件的地方，我们也复用对应组件**（如 timePicker 复用 ScrollList、
     colorPicker 复用 Popover/Input/InputNumber/Select）——且被复用组件要**先对齐 Semi**。
   - Semi 用原生元素处我们也用原生，Semi 不用处我们也不用。
3. **Token 对齐**：
   - **名与值都对应 Semi**（逐条核 `variables.scss` 的值 vs 本库 token 值）。
   - **Semi 无的中间层 token 要删**（去中间层，无需向后兼容）；token 名值、作用的 **DOM 归属**都对齐。
   - **Semi 用公式算的值（如 `(panel_body - item) * 0.5`），我们也用 `calc()` 公式算**，不硬编码近似值。
4. **Demo 对齐**：按 Semi demo 机制（本库 `demos.ts` glob），**场景不少于 Semi**；Semi 有的场景补全。

**验证纪律（对齐不能只靠声称）：**

- **逐 prop grep 实现亲验**，别只看 spec / 抽查 / 子代理正则提取（重大归因动手前自己 grep 反例）。
- **真机对照 Semi**：交互/视觉改动用真实浏览器点击对照 Semi 真机或官方截图（`~/i/semi-design`
  可本地跑 storybook），别只静态看或用 JS dispatch（会绕过 z-index 遮挡假绿）。
- **token 双向核对**：定义全被消费（无悬空）+ 消费全有定义（无 undefined 取空值），`while read` 逐个核，无 fallback。
- 「token/DOM/公式都真对齐了就不会有视觉差异」——出现宽度/间距/高亮偏差，说明某一层没真对齐，实测定位到底哪层。

## 2. 技术栈（不得擅自替换）

| 维度 | 选型 | 说明 |
|---|---|---|
| 渲染框架 | **Svelte 5（runes）** | 首发渲染层 |
| 构建 | **Vite** | 库模式打包 + 文档站点 |
| 样式 | **UnoCSS** | 原子化 + preset 暴露 Design Token |
| 包管理 | **pnpm + workspace** | monorepo |
| 语言 | **TypeScript（strict）** | 全量类型 |
| 测试 | Vitest（单测）+ Playwright（交互/视觉/a11y）| |
| 文档 | Vite + MD/MDX（自建文档站） | |

## 3. Monorepo 目录约定

```
chenzy.design/
├── AGENTS.md                  # 本文件（宪法）
├── pnpm-workspace.yaml
├── package.json               # 根，私有，仅脚本与 devDeps
├── tsconfig.base.json
├── uno.config.ts              # 共享 UnoCSS 预设入口
├── specs/                     # 所有 SPEC（需求规格）
│   ├── 00-foundation/         # 全局横切能力 SPEC
│   └── components/            # 按 Semi 官方分类组织的组件 SPEC
│       ├── basic/ input/ navigation/ show/ feedback/ other/
├── .claude/skills/            # 可复用的执行手册（SKILL）
└── packages/
    ├── tokens/                # @chenzy-design/tokens   设计令牌（源真相）
    ├── unocss-preset/         # @chenzy-design/unocss-preset
    ├── core/                  # @chenzy-design/core      headless 逻辑（框架无关）
    ├── icons/                 # @chenzy-design/icons
    ├── locale/                # @chenzy-design/locale    i18n 语言包与运行时
    ├── svelte/                # @chenzy-design/svelte    Svelte 组件实现（主包）
    ├── theme-cli/             # @chenzy-design/theme-cli 主题定制工具
    └── docs/                  # 文档站（私有，不发布）
```

包依赖方向（**单向，禁止反向依赖**）：
`tokens → unocss-preset → core → svelte`；`icons`、`locale` 被 `svelte` 依赖；`theme-cli` 消费 `tokens`。

## 4. 命名规范（强制）

| 对象 | 前缀/规则 | 示例 |
|---|---|---|
| npm 包 | `@chenzy-design/*` | `@chenzy-design/svelte` |
| CSS 自定义属性（Design Token）| `--cd-` | `--cd-color-primary`, `--cd-spacing-4` |
| 组件根类名 | `cd-` | `cd-button`, `cd-button--primary` |
| 类名修饰符 | BEM-like | `cd-button__icon`, `cd-button--loading` |
| Svelte 组件文件 | PascalCase | `Button.svelte` |
| headless 逻辑 | `createXxx` / `useXxx` | `createButton`, `useFocusTrap` |
| 事件 | 语义化、camelCase | `on:change`, `on:openChange` |
| i18n key | `Component.field` | `Modal.confirm`, `Pagination.total` |

CSS 变量分三层（详见 `specs/00-foundation/theming.spec.md`）：
**Global Token**（`--cd-*` 原子值）→ **Alias/Semantic Token**（语义，如 `--cd-color-text-0`）→ **Component Token**（`--cd-button-*`）。

## 5. 每个组件的「完成定义」（DoD）

一个组件 SPEC 被视为「完成」当且仅当：

- [ ] **严格对齐 Semi（§1.1）**：API 逐 prop 核 propTypes（补缺失/删超集/改漂移）、DOM 结构与复用组件对齐、token 名值/DOM 归属/公式对齐、demo 不少于 Semi；真机对照 Semi + token 双向核对
- [ ] headless 逻辑在 `core/`（如有交互），Svelte 实现在 `svelte/`
- [ ] 全部 props/events/slots 有 TS 类型 + JSDoc
- [ ] Component Token 已在 `tokens/` 注册，支持主题覆盖
- [ ] 通过 a11y 检查（键盘操作 + ARIA + axe 0 violations）
- [ ] 文案走 i18n，无硬编码用户可见字符串
- [ ] 单测覆盖核心逻辑分支；交互/视觉测试覆盖关键状态
- [ ] 性能符合该组件 SPEC 中的预算（Perf Budget）
- [ ] 提供组件元数据（component.meta.ts）供 AI/文档消费
- [ ] 文档页：API 表、示例、可访问性说明、设计语义

## 6. 工作流（AI agent 必读）

1. **接到任务** → 先读本 `AGENTS.md`，再读对应 `specs/**.spec.md`。
2. **识别横切能力** → 命中哪个领域就读对应 SKILL：
   - 主题/Token → `.claude/skills/theming/`
   - 无障碍 → `.claude/skills/a11y/`
   - i18n → `.claude/skills/i18n/`
   - 性能 → `.claude/skills/performance/`
   - 文案 → `.claude/skills/content-guidelines/`
   - 组件骨架 → `.claude/skills/component-authoring/`
3. **实现** → 遵循命名规范与目录约定，headless 与渲染分离。
4. **自检** → 对照该 SPEC 的「验收标准」与本文件 §5 DoD 逐条勾。
5. **禁止**：擅自更换技术栈、绕过 Token 直接写死颜色/尺寸、硬编码文案、跳过 a11y。

## 7. 质量门禁（CI 必过）

`pnpm lint && pnpm typecheck && pnpm test && pnpm test:a11y && pnpm build && pnpm perf:check`

## 7.1 提交信息规范（强制）

- 遵循 Conventional Commits：`type(scope): 描述`（type 如 feat/fix/chore/ci/docs/refactor）。
- **commit message 中禁止出现任何 AI/助手相关字样**：不得包含 `Co-Authored-By: Claude`、`Generated with ...`、`Claude`、`AI`、`Anthropic`、`Copilot` 等。提交信息只描述「改了什么、为什么」。
- 本仓库提供本地 `commit-msg` 钩子（`.githooks/commit-msg`）自动拦截违规信息；通过 `git config core.hooksPath .githooks` 启用（见 README）。
- 需发版的改动须附 changeset：`pnpm changeset`。

## 8. SPEC / SKILL 索引

- 全局基建 SPEC：见 `specs/00-foundation/`（00 总纲、token、theming、a11y、i18n、performance、mvvm-adapter、ai-friendly、content-guidelines）
- 组件 SPEC：见 `specs/components/<category>/<Component>.spec.md`
- 组件 SPEC 模板：`specs/components/_TEMPLATE.spec.md`
- 完整组件清单与阶段映射：`specs/00-foundation/00-overview.spec.md`

## 9. 工作经验与已知陷阱（实战沉淀，动手前务必看）

> 以下是大规模特性补全（含 130+ PR）中反复踩出来的坑与有效做法，违反它们会重复浪费大量时间。

### 9.1 「某组件特性是否齐全」的唯一判据 = spec §4 API 全表

- **判据**：逐个对照该组件 `specs/.../<Component>.spec.md` 的 **§4 API（Props/Events）全表**，逐 prop/event 在 `packages/svelte/src/<组件>/` 整目录 `grep` 确认实现。
- **不可靠的信号（别用来下结论）**：源码里的 `TODO`/`延后` 注释、`meta.ts` 的 description 文字——它们**经常过期或缺失**。真实缺口常常**没有任何 TODO 标记**：整个组件缺失（如曾缺 SideSheet）、藏在源码注释 "not implemented this round"（如曾缺 Typography 的 ellipsis/copyable/editable）、或只是 §4 表里列了但实现只覆盖核心子集的长尾 prop（曾累计补 200+ 个）。
- **正则批量提取 §4 prop 不可靠**：会大量误报（曾报 222 个缺口，亲验后绝大多数是假阳）。**必须人工读 §4 表 + 对每个候选 prop `grep -rc <prop> packages/svelte/src/<组件>/` 整目录验证**（grep 到即视为已实现：可能在子组件 / context / types.ts / 别名）。盘点结论务必抽样亲验后再行动。
- 长尾 prop 高发区：`getPopupContainer` / `destroyOnClose` / `zIndex` / `status` / `size` / 各类格式化回调（`tipFormatter` 等）/ 受控辅助（`initValue` / `validateStatus`）/ 边缘模式开关。补这类时优先复用已实现同类组件的范式（如浮层类复用 Modal/Drawer 的 `useFocusTrap`/`useDismiss`/`useScrollLock`/`acquireZIndex`）。

### 9.2 非缺口（别误补）

- **`onXxx` callback vs spec 写的 `on:xxx`**：全库统一用 Svelte 5 的 callback props（`onChange`/`onOpenChange`…），spec 里的 `on:xxx` 是旧记法。这是**架构决策，不是缺口**，不要改。
- **已实现的别名差异**（如 `aria-label` ↔ `ariaLabel`、`visibleChange` ↔ `onOpenChange`）：功能已覆盖即不算缺口。

### 9.3 Svelte 5 effect 无限循环（`effect_update_depth_exceeded`）

红线 #2 的两种高发形态，CI（typecheck/test/build）**抓不到**，只在浏览器运行时炸，且会拖垮整页（连无关的 Modal/Drawer 都打不开）：

1. **声明式子组件注册收集**：子项 `$effect` 内对父级 `$state` 数组 `push`/`splice`（数组代理 push 先读 length 再写 → 同一 effect 读写自身）。**正确做法**：注册顺序用**普通数组**（非 $state）簿记，render 真正需要的派生量（如末项 id）单独用一个 `$state` 承载，副作用写与渲染读分离；能用纯 CSS（`:not(:last-child)::after`）就别用 JS 收集。
2. **命令式订阅器同步首帧回调**：自建 ResizeObserver/Observer 在 `observe()` 注册时**同步**派发首帧（如同步 `getBoundingClientRect()` → dispatch → 写组件 `$state`），而组件又在挂载 `$effect` 内同步 `observe()` → 首帧落在挂载 effect 同步栈内读写自身。**正确做法**：注册时的首帧测量/派发**延后到下一宏任务**（`setTimeout(…,0)`），并把 timer 纳入 cleanup（对齐原生 Observer「首帧异步」语义）。

新增声明式复合组件 / 命令式订阅器时务必规避；浏览器验证一定要读 console 确认无此错误。

### 9.4 验证与测试坑

- **docs typecheck 是独立门禁**，且常因 dist 过期或 demo 写法报错。完成前必须 `pnpm -r build` 刷新 dist 后再 `--filter @chenzy-design/docs typecheck`，确认 **0 errors**（CI 的 quality job 会跑它）。
- **docs demo 的 `data-testid` 要放在原生 `<div>`/`<span>` 上**，不能直接放组件 props（组件不接受 → docs typecheck 报错）。
- **DOM 测试需 jsdom 时**，`core` 包已声明 `jsdom` devDep；测试首行用 `// @vitest-environment jsdom`。core 其余纯函数测试保持纯 node。
- `<select onchange>` 在 Svelte 5 编译成委托事件，合成事件 / 浏览器自动化**触发不了**——别误判为 bug，改用 compile 静态验证 + 初始渲染验证管线。
- 浏览器自动化标签页 `document.hidden=true` 时 **rAF/ResizeObserver 被节流不触发**——滚动驱动的虚拟化/动画无法在后台标签观测；改用同步几何 + core 单测佐证。

### 9.5 并行多 agent 工作纪律

- 并行改同一 repo 的多个 agent **必须各自独立 `git worktree`**（`git worktree add /tmp/cd-<feature> -b feat/<feature> origin/main`），否则共享单一 HEAD 会互相 `checkout` 污染、commit 落错分支。绝不 `pkill -f vite`（会杀别的 agent 的 dev server），只 kill 自己启的进程 PID。
- 公共文件（`docs/src/App.svelte`、`packages/locale/*`、`packages/core/src/index.ts`）多分支同改 → 串行合并，逐个合并前 rebase `origin/main` 解冲突（多为「双方各自追加」，并列保留即可）。
- 合并前确认 CI 双绿（`label` + `quality`）；`quality` 非 GitHub required check，`label` 过即可被 squash 接受，但仍应等 `quality` pass 再合以防回归。
- 子代理在长任务末尾偶发「代码已完成但 commit/push/建 PR 未落实，却回报已建 PR」。核验时若 `gh pr view` 与 `git ls-remote` 重试后仍查无该 PR/分支，则进入其 worktree 接管：验门禁 → commit → rebase 最新 main → push → 真正 `gh pr create`（代码在 worktree 里是真实的）。注意：刚 came-to-rest 时 GitHub API 可能短暂假阴性，先重 fetch / `gh pr view` 复查再判定。
