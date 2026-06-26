# SPEC · 文档站（docs）

> 阶段：M0 基建（与组件实现并行推进，Phase 1 在首批组件稳定后即可启动）
> 关联：`ai-friendly.spec.md`（meta 数据消费方）、`performance.spec.md`（构建产物体积）、`theming.spec.md`（暗色切换）

## 1. 概述与目标

文档站是 chenzy-design 对外的唯一交互界面，承担三项职责：

1. **组件展示**：每个组件有独立页面，含可运行 demo、API 表格、Design Token 表格。
2. **设计文档**：使用场景、设计规范、解构说明（对标 Semi Design "设计文档" tab）。
3. **开发者参考**：快速上手、主题定制、国际化、贡献指南。

目标对标：Semi Design 文档站的信息密度与交互质量，但基于 Svelte 5 生态实现，API 表格**全部自动生成**（不手写），是与 Semi 最大的差异。

---

## 2. 技术栈决策

| 维度 | 选择 | 理由 |
|---|---|---|
| 框架 | **SvelteKit** | 与组件库同生态；文件系统路由；SSG 友好 |
| 渲染模式 | **adapter-static（SSG）** | 静态文件，零服务器依赖，任意 CDN/GitHub Pages 部署 |
| 内容格式 | **MDsveX**（`.md` 文件内嵌 Svelte 组件） | 支持大段富文本（标题/列表/图片/代码块）+ live Svelte demo 组件混排；比纯 `.svelte` 更适合文档内容创作 |
| 代码高亮 | **Shiki** | 主题一致性好，支持 SSG 预渲染，无运行时依赖 |
| 样式 | **UnoCSS + presetChenzy**（沿用现有） | 与组件库 token 完全对齐，无新样式体系 |
| 搜索 | **Pagefind**（Phase 3） | build 后生成静态索引，零运行时服务器 |
| API 表格数据源 | **`dist/components.json`**（由 `build:meta` 生成） | 单一数据源，props/events/tokens 自动渲染，不手写 |

**不选 Gatsby/VitePress/Astro 的原因**：Gatsby 是 React 生态；VitePress 强绑 Vue；Astro 引入额外运行时复杂度。SvelteKit 与本项目同语言，学习成本最低，svelte-check / typecheck 可统一运行。

---

## 3. 目录结构

```
packages/docs/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte          # 全局布局：顶栏 + 左侧侧边栏 + 内容区
│   │   ├── +layout.ts              # 加载 components.json，注入到所有子路由
│   │   ├── +page.svelte            # 首页（快速上手 + 特性介绍）
│   │   ├── +page.md                # 首页内容（MDsveX）
│   │   └── components/
│   │       ├── +page.svelte        # 组件总览：按分类展示所有组件卡片
│   │       └── [name]/
│   │           ├── +page.svelte    # 组件详情页（两个 tab：API 文档 / 设计文档）
│   │           └── +page.ts        # load：从 components.json 取 meta + 动态 import demo
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ApiTable.svelte     # 自动渲染 meta.props → Markdown 风格表格
│   │   │   ├── TokenTable.svelte   # 自动渲染 meta.tokens → Token 说明表格
│   │   │   ├── DemoBox.svelte      # demo 容器：预览区 + "展开源码"切换
│   │   │   ├── CodeBlock.svelte    # Shiki 代码高亮块 + 一键复制
│   │   │   ├── Sidebar.svelte      # 侧边导航（从 components.json 分类自动生成）
│   │   │   └── TabBar.svelte       # "API 文档 / 设计文档" tab 切换
│   │   └── utils/
│   │       ├── components.ts       # 加载/类型化 components.json 的工具函数
│   │       └── highlight.ts        # Shiki 实例（SSG 预渲染）
│   ├── content/
│   │   └── components/
│   │       ├── button.md           # MDsveX：使用场景 + demo 引用 + API 表格
│   │       ├── input.md
│   │       └── ...                 # 每个组件一个 .md 文件（Phase 3 填充）
│   └── demos/
│       ├── button/
│       │   ├── BasicDemo.svelte    # 从 App.svelte 拆出的 demo
│       │   ├── TypeDemo.svelte
│       │   └── index.ts            # export { BasicDemo, TypeDemo }
│       └── .../                    # 每组件一个目录（Phase 2 拆分）
├── svelte.config.js                # SvelteKit + MDsveX + adapter-static
├── vite.config.ts                  # UnoCSS + presetChenzy（沿用）
├── package.json
└── static/
    └── components.json             # 构建时从 @chenzy-design/svelte dist/ 拷入
```

---

## 4. 组件详情页规范

每个 `/components/[name]` 页面由两个 tab 组成：

### 4.1 API 文档 tab

```
┌─────────────────────────────────────────────────────┐
│  [分类] · [ComponentName]                            │  ← 面包屑
│  组件中文名                                          │  ← meta.name（中文）
│  meta.description（一句话描述）                       │
│  [版本对比] 按钮（可选）                              │
├─────────────────────────────────────────────────────┤
│  [API 文档]  [设计文档]                              │  ← tab 切换
├─────────────────────────────────────────────────────┤
│  ## 使用场景                                         │  ← content/<name>.md §使用场景
│  （富文本，来自 MDsveX 内容文件）                     │
├─────────────────────────────────────────────────────┤
│  ## 代码演示                                         │
│  ### 基本用法                                        │
│  ┌──────────────────────────────┐                   │
│  │  <DemoBox>                   │                   │  ← demos/<name>/BasicDemo.svelte
│  │    [预览区]                   │                   │
│  │    [展开源码 ▼]               │                   │
│  └──────────────────────────────┘                   │
├─────────────────────────────────────────────────────┤
│  ## API 参考                                         │
│  ### Props                                          │  ← 自动从 meta.props 生成
│  | 属性 | 类型 | 默认值 | 说明 |                    │
│  ...                                                │
│  ### Events / Slots（如有）                          │
├─────────────────────────────────────────────────────┤
│  ## Design Tokens                                   │  ← 自动从 meta.tokens 生成
│  | Token | 默认值 | 用途 |                           │
└─────────────────────────────────────────────────────┘
```

### 4.2 设计文档 tab

```
┌─────────────────────────────────────────────────────┐
│  ## 如何使用                                         │  ← content/<name>.md §设计文档
│  ## 解构（含示意图）                                  │
│  ## 组件 Demo（可选，复用 API 文档 tab 的 demo）      │
│  ## 设计规范                                         │
└─────────────────────────────────────────────────────┘
```

内容来源：从 `specs/components/<category>/<Name>.spec.md` 的 §1/§2/§8 段落整理迁移。初期可留空（仅显示 API 文档 tab），Phase 3 逐步填充。

### 4.3 内容文件格式（MDsveX）

```mdx
---
title: Cascader 级联选择
category: input
brief: 用于选择多级分类下的某个选项
---

<script>
  import BasicDemo from '../../demos/cascader/BasicDemo.svelte';
  import MultipleDemo from '../../demos/cascader/MultipleDemo.svelte';
  import { ApiTable, DemoBox, TokenTable } from '$lib/components';
</script>

## 使用场景

与 TreeSelect 的区别：
- **TreeSelect**：核心价值在于目标节点…
- **Cascader**：核心价值在于路径…

## 代码演示

### 基本用法

最简单的用法，默认只可以选叶子节点。

<DemoBox title="基本用法">
  <BasicDemo />
</DemoBox>

### 多选

设置 `multiple`，可以进行多选。

<DemoBox title="多选">
  <MultipleDemo />
</DemoBox>

## API 参考

<ApiTable component="Cascader" />

## Design Tokens

<TokenTable component="Cascader" />
```

---

## 5. Phase 1 — SvelteKit 骨架

**目标**：把 `packages/docs` 从 Vite SPA 改造为 SvelteKit SSG 项目，实现全部组件可导航、API 表格自动生成。无需任何 demo 内容，先有骨架。

**前置条件**：`@chenzy-design/svelte` 的 `build:meta` 已生成 `dist/components.json`。

### 任务清单

- [ ] 安装依赖：`@sveltejs/kit`、`@sveltejs/adapter-static`、`mdsvex`、`shiki`
- [ ] 改写 `svelte.config.js`：引入 SvelteKit + MDsveX preprocessor + adapter-static
- [ ] 改写 `vite.config.ts`：从 `@sveltejs/vite-plugin-svelte` 改为 `@sveltejs/kit/vite`，保留 UnoCSS
- [ ] 建 `+layout.svelte`：顶栏（Logo + 导航链接）+ 左侧侧边栏 + 主内容区
- [ ] 建 `Sidebar.svelte`：从 `components.json` 按 `category` 分组，自动生成导航条目（无需手写组件列表）
- [ ] 建 `+page.svelte`（首页）：简单的欢迎页 + 快速上手代码块
- [ ] 建 `components/+page.svelte`：组件总览，按分类渲染卡片列表（name + description）
- [ ] 建 `components/[name]/+page.ts`：`load` 函数从 `components.json` 取对应 meta
- [ ] 建 `components/[name]/+page.svelte`：渲染标题 + description + ApiTable + TokenTable
- [ ] 建 `ApiTable.svelte`：接收 `props: PropMeta[]`，渲染"属性/类型/默认值/说明"四列表格
- [ ] 建 `TokenTable.svelte`：接收 `tokens: string[]`，渲染 token 前缀说明表格
- [ ] 配置 `adapter-static` 的 `prerender.entries`：预渲染全部组件页
- [ ] 验证 `pnpm build` 输出静态文件，所有组件 URL 均可访问

### 验收标准（DoD）

- [ ] `pnpm dev` 能跑，侧边栏显示全部组件分类与条目
- [ ] 访问 `/components/button` 显示 Button 的 API 表格（props 自动来自 meta）
- [ ] 访问 `/components/cascader` 同上
- [ ] `pnpm build` 成功，`dist/` 为纯静态文件
- [ ] `pnpm typecheck` 0 errors

---

## 6. Phase 2 — Demo 拆分

**目标**：把 `App.svelte` 中 5600 行的 demo 代码拆分为每组件独立的 `.svelte` demo 文件，接入 `DemoBox` 展示。`App.svelte` 完成历史使命后删除。

**前置条件**：Phase 1 骨架已完成。

### 拆分原则

- 每个组件至少有一个 `BasicDemo.svelte`（最简用法）
- 同一组件多个 demo 按功能命名：`MultipleDemo.svelte`、`SizeDemo.svelte`、`DisabledDemo.svelte` 等
- demo 文件是完整可独立运行的 Svelte 组件（自己管理状态，不依赖外部 props）
- demo 内的 `import` 路径统一用 `@chenzy-design/svelte`（不用相对路径）

### DemoBox 规范

```svelte
<DemoBox title="基本用法" description="可选的补充说明文字">
  <BasicDemo />
</DemoBox>
```

DemoBox 展示：
- 上方：组件渲染结果
- 下方：「`</>` 查看源码」折叠按钮，展开后显示 Shiki 高亮的源码

### 任务清单

- [ ] 建 `src/lib/components/DemoBox.svelte`
- [ ] 按组件逐个拆分（86 个组件，可并行批次进行）：
  - 从 `App.svelte` 找到该组件的 demo 段落（以 `<Title heading={5}>组件名</Title>` 为界）
  - 每个 demo 变体提取为独立 `.svelte` 文件，放入 `src/demos/<name>/`
  - 在对应的 `content/<name>.md` 中引用 `<DemoBox>` + demo 组件
- [ ] 所有 demo 提取完成后删除 `src/App.svelte`
- [ ] 在 `pnpm dev` 下人工验证至少 10 个核心组件（Button/Input/Select/Form/Table/Modal/Toast/Tree/DatePicker/Cascader）的 demo 正确渲染

### 验收标准（DoD）

- [ ] `src/App.svelte` 已删除
- [ ] 所有组件页至少有 1 个 DemoBox
- [ ] demo 在 `pnpm dev` 下无控制台报错
- [ ] `pnpm build` 成功

---

## 7. Phase 3 — 内容填充

**目标**：把 `specs/components/<category>/<Name>.spec.md` 的设计意图、使用场景整理成组件文档页的文字内容，填充"使用场景"和"设计文档"tab。

**前置条件**：Phase 2 demo 拆分已完成。

### 内容迁移规则

| spec 节 | 迁移到 | 放哪个 tab |
|---|---|---|
| §1 概述 | `content/<name>.md` 开头描述 | API 文档 |
| §2 设计语义（何时用/何时不用） | `content/<name>.md` ## 使用场景 | API 文档 |
| §6 无障碍 | `content/<name>.md` ## Accessibility | API 文档 |
| §2 与相似组件区别 | 设计文档 tab ## 如何使用 | 设计文档 |
| §3 分层实现（设计意图部分） | 设计文档 tab ## 解构 | 设计文档 |
| §8 文案规范 | 设计文档 tab ## 文案规范 | 设计文档 |

### 任务清单

- [ ] 确认 MDsveX 配置支持 frontmatter（`title`/`category`/`brief`）
- [ ] 配置 Pagefind（build 后生成静态搜索索引）
- [ ] 高频组件优先填充（Button/Input/Form/Select/Table/Modal）
- [ ] 其余组件逐步补充，无严格截止
- [ ] 设计文档示意图：需设计师提供，初期可留占位符

### 验收标准（DoD）

- [ ] 至少 20 个高频组件有"使用场景"文字内容
- [ ] 搜索功能可用（Pagefind 索引生成）
- [ ] 暗色模式切换可用（`prefers-color-scheme` + 手动切换按钮）

---

## 8. Phase 4 — 变量调试面板

**目标**：在组件详情页右侧增加交互式 prop 调试面板，让用户实时调整 prop 值预览效果（对标 Semi 设计文档 tab 的"变量调试"面板）。

**前置条件**：Phase 2 已完成。

### 实现方案

从 `meta.props` 的类型信息自动推导控件类型：

| prop 类型特征 | 调试控件 |
|---|---|
| `boolean` | `<input type="checkbox">` |
| 联合字面量 `'a'\|'b'\|'c'` | `<select>` |
| `number` | `<input type="number">` |
| `string` | `<input type="text">` |
| `Snippet` / 复杂类型 | 不渲染控件（跳过） |

面板状态通过 Svelte 5 `$state` 管理，实时传入 demo 组件（demo 组件需支持受 prop 驱动）。

### 任务清单

- [ ] 建 `PropPlayground.svelte`：接收 `meta.props`，自动生成调试控件
- [ ] 详情页布局调整：主内容区（左 70%）+ 调试面板（右 30%），响应式（小屏折叠）
- [ ] 高频组件的 `BasicDemo.svelte` 改为接收 `props` 从外部传入
- [ ] 验证 Button/Input/Select 的调试面板功能正确

### 验收标准（DoD）

- [ ] Button 详情页调试面板可切换 type/theme/size/disabled
- [ ] 调试面板在移动端自动折叠为底部抽屉

---

## 9. 部署与 CI

### 构建流程

```bash
# 1. 先构建组件库，生成 dist/components.json
pnpm --filter @chenzy-design/svelte build

# 2. 再构建文档站（依赖 components.json）
pnpm --filter @chenzy-design/docs build
```

`package.json` 的 `build` 脚本顺序由 pnpm workspace 依赖保证（docs 声明 `@chenzy-design/svelte: workspace:*`）。

### CI 集成

在现有 CI 流水线中，docs build 作为独立 step，失败不阻断组件库的 lint/test/typecheck 门禁（docs 属于展示层，不影响组件质量）。

推荐部署目标：**GitHub Pages**（免费，与仓库直接集成，`adapter-static` 原生支持）。

### 预渲染配置

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({ fallback: '404.html' }),
    prerender: {
      // 所有组件页在 build 时预渲染（从 components.json 动态生成条目列表）
      entries: ['*'],
    },
  },
};
```

---

## 10. 验收总览

| Phase | 核心产出 | 完成判据 |
|---|---|---|
| Phase 1 | SvelteKit 骨架 + API 表格自动生成 | 86 个组件有独立 URL，API 表格自动渲染 |
| Phase 2 | Demo 拆分，App.svelte 退役 | 所有组件有 DemoBox，build 成功 |
| Phase 3 | 富文本内容 + 搜索 + 暗色模式 | ≥20 个组件有使用场景文字，搜索可用 |
| Phase 4 | 变量调试面板 | Button/Input/Select 调试面板功能正确 |
