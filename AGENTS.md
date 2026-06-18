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

## 8. SPEC / SKILL 索引

- 全局基建 SPEC：见 `specs/00-foundation/`（00 总纲、token、theming、a11y、i18n、performance、mvvm-adapter、ai-friendly、content-guidelines）
- 组件 SPEC：见 `specs/components/<category>/<Component>.spec.md`
- 组件 SPEC 模板：`specs/components/_TEMPLATE.spec.md`
- 完整组件清单与阶段映射：`specs/00-foundation/00-overview.spec.md`
