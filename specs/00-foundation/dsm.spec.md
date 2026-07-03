# SPEC · DSM 设计管理系统（Design System Manager）

> 需求：可视化主题编辑（全局 + 组件级精细编辑），能力对标 Semi DSM。
> 依赖：`tokens.spec.md`、`theming.spec.md`。本文是二者「主题包 / 局部主题 / theme-cli」草案的**具体实现设计**，并新增可视化编辑器。
> 参考调研：Semi DSM（`semi-design/scripts/designToken.js`、`src/components/DesignToken`、`semi-webpack/semi-theme-loader.ts`、浏览器内 sass.js）。

## 0. 一句话定位

DSM 是一个让用户**在可视化界面里调 Design Token、实时预览整站、导出主题**的系统。全局层调品牌色/圆角/字体，组件层下钻到「某组件某状态」精细覆写（如 primary 按钮 hover 背景）。

## 1. 核心架构决策：为什么我们能比 Semi 更好

Semi 的 token 是**混合模型**，这是它 DSM 复杂度的根源：

| 能力 | Semi | chenzy-design |
|---|---|---|
| 全局 token | 运行时 CSS 变量 ✅ | 运行时 CSS 变量 ✅ |
| **组件 token** | **SCSS 编译期 `$` 变量** ❌ | **运行时 CSS 变量** ✅ |
| 组件级实时预览 | 需浏览器内跑 sass.js WASM 重编译 | **直接 `setProperty` 即时生效** |
| 导出主题 | 生成 npm 包 + webpack loader 编译期注入 | **导出一段 CSS 变量覆写即可** |
| 元数据来源 | 从 SCSS 行尾注释正则解析 | 从 TS token 源结构化产出 |

**结论**：Semi 的组件 token 用 SCSS 编译期变量是历史包袱——所以它的 DSM 必须在浏览器塞一个 WASM SCSS 编译器才能预览组件级改动、还要生成 npm 包才能导出。我们的组件 token 本就是运行时 CSS 变量，**天然免除这两大痛点**。DSM 的「拖滑块即时看效果」与「导出即一段 CSS」在我们架构下几乎是免费的。这是本方案相对「照抄 Semi」的根本价值。

**唯一前提**：组件的每个可调项都必须有独立的组件级 CSS 变量（token）。这正是「地基 3」要补的。

## 2. 三大地基改造

### 地基 1 · Token 元数据层（结构化产出）

**现状缺口**（调研确认）：`build-tokens-detail.ts` 靠正则事后猜——category 会误判、中文 label 一半是英文词根拼接、引用链只有单跳 raw string、无反向依赖图、无 dark 值、无「可编辑/根 token」标记。

**改造**：元数据从 TS token 源**结构化产出**，而非事后正则解析 CSS。

- Token 定义从 `{ key: value }` 升级为可带元数据的形态（见 §4 schema）。为兼容存量，未升级的 token 仍可用裸值，元数据走推断兜底。
- `packages/tokens/src/build.ts` 在产出 `tokens.css` 的同时，产出 **`dist/token-manifest.json`**：每个 token 带
  ```
  { name, value, resolvedLight, resolvedDark, category, component, label, usage,
    references: string[],      // 该 token 值里引用的 --cd-* （多跳解析）
    referencedBy: string[],    // 反向：谁引用了我（依赖图）
    editable: boolean,         // 是否 DSM 可编辑的根/语义 token
    scope: 'global'|'alias'|'component' }
  ```
- manifest 取代 docs 里的 `tokens-detail.json`（docs「设计变量」表格改读 manifest，顺带修掉现有中文名质量问题）。

**为什么强于 Semi**：Semi 靠「注释即元数据」+ 正则；我们从类型化 TS 源产出，category/label/引用链**准确且可校验**，不依赖命名约定猜测。

### 地基 2 · 运行时覆写 API（ConfigProvider 对象化）

**现状缺口**（调研确认）：`ConfigProvider` 只接受 `theme: 'light'|'dark'|'auto'`。`theming` skill 写的对象语法 `theme={{ 'color-primary': '#f00' }}` 与 `theme-cli` **均未实现**（已记入项目记忆）。

**改造**：`ConfigProvider` 的 `theme` 支持对象形态，注入 scoped CSS 变量：
```svelte
<ConfigProvider theme={{ 'color-primary': '#0af', 'button-color-bg-primary': '#f50' }}>
  <!-- 子树内所有 --cd-color-primary / --cd-button-color-bg-primary 被覆写 -->
</ConfigProvider>
```
- 实现：对包裹元素 `element.style.setProperty('--cd-<key>', value)`，作用域限于子树（利用 CSS 变量级联）。不污染全局、不影响兄弟子树。
- 保留字符串枚举形态（`'light'|'dark'|'auto'`）向后兼容；对象与枚举可组合。
- **这就是 DSM「改一个值」的落地点**：编辑器把用户改动汇成一个 token→value 映射，注入预览根节点即时生效。无编译、无 WASM。

### 地基 3 · 组件 Token 收敛与补齐（最大工作量，渐进）

**现状缺口**（调研确认）：约一半组件直接消费 alias（Select ~37% 才走组件 token，Button/Input ~52%），~31 个组件缺独立组件 token。Modal（~95% 组件 token）是理想模板。

**改造原则**：组件级精细编辑要求「每个可调项 = 一个组件 token」。把组件里直接引 alias 的样式收敛为组件 token（组件 token 默认值仍 `var(--cd-color-primary)`，保持继承——未覆写时跟随全局，覆写时本地固定）。

- **不改视觉**：收敛只是「插入一层同值的组件变量」，默认渲染完全不变（组件 token 默认值 = 原来直接引的 alias）。
- 按组件渐进，Modal 为模板。Button 为 Phase 0 试点（并顺带全量对齐 Semi 的 151 个有值 token）。

**Token 精简原则（2026-07 决策，修正早期「全量对齐 Semi = 建全部 Semi variables」的做法）**：DSM 只收录**组件实际消费的 token**，不保留「对齐 Semi 但无组件消费」的孤儿。理由：DSM 编辑面的每个可调项都必须**真实生效**——一个调了看不到任何变化的 token 是「假开关」，误导用户，不如不要。因此：
- **孤儿 token（无 `.svelte` 消费、无 var() 引用）一律删除**，不作「Semi 完整面登记」保留（推翻早期 §1「DSM 可编辑面 = Semi 完整设计面」的字面主张——完整面的价值不抵假开关的代价）。
- **中间节点**：若「组件消费的别名 → 中间 token → 全局 alias」，而中间 token 无其他消费者，则让别名**直引全局**、删中间层（链条缩短、不断链、无孤儿）。
- **架构差异部位**（Semi 有而我们设计上没有的 DOM，如填充式按钮的边框态、我们简化的卡片几何）：不为「消费 token」而给组件造 DOM——这些 Semi token 不建。
- **设计基元直引不组件化**：布局间距（`spacing-tight`）、聚焦环（`focus-ring`）、过渡（`motion-*`）等跨组件共享量，组件**直引 alias**，不包组件 token（否则破坏「改一处全局生效」、徒增体积）。这类 alias 由 DSM **全局层**统一编辑（见 §3 全局层）。
- 删除孤儿要**同步删 meta.ts 对应项**、保证 build 后零悬空、组件测试全绿。

## 3. 编辑器（地基就绪后）

docs 站新增 `/dsm` 页面：
- **左**：按「组件 / 分类」树列 token（读 manifest）。全局层 = 品牌色/圆角/字体等 alias；组件层 = 下钻到单组件单状态。
- **中**：实时预览区（渲染真实组件）。改值 → 汇入覆写 map → 注入预览根 `setProperty` → 即时变。引用链可视化：改全局 primary，未覆写的组件 token 联动变（展示继承）；已覆写的显示「已本地固定」并可重置。
- **右**：导出。产出 **一段 CSS 变量覆写**（`:root{ --cd-xxx: ...; }` + 可选 `[data-theme=dark]{}`），可直接贴进宿主项目 `<style>` 或存为主题文件。**无需生成 npm 包**（对比 Semi）。

## 4. Token 元数据 Schema（草案）

```ts
// 升级后的组件 token 定义形态（与裸值兼容）
type TokenDef = string | {
  value: string;                    // 'var(--cd-color-primary)' | '6px'
  category?: TokenCategory;         // 缺省时按值/名推断
  label?: string;                   // 中文名（DSM UI 显示）
  usage?: string;                   // 用途说明
  editable?: boolean;               // 默认 true；纯派生量可设 false
};
type TokenCategory =
  'color'|'font'|'height'|'width'|'spacing'|'radius'|'animation'|'other';
```

manifest 产物见地基 1。

## 5. 命名规范（对齐 Semi 语义，落到我们 kebab-case）

Semi：`$<category>-<component>_<variant>_<theme>-<property>-<state>`，`_` 分隔语义层、`-` 分隔结构层。
我们统一 **kebab-case、全小写、`--cd-` 前缀**，语义层也用 `-`：
```
--cd-<component>-<variant>-<property>-<state>
例：--cd-button-primary-bg-hover
    --cd-button-primary-solid-colorful-bg-default
```
- `<property>`：`bg`/`text`/`border`/`outline`
- `<state>`：`default`/`hover`/`active`/`disabled`/`focus`
- 保留现有存量组件 token 命名（如 `--cd-button-height-default`），新增按上式。

## 6. 落地路径（分期）

| Phase | 范围 | 交付 |
|---|---|---|
| **P0 试点** | Button | ① button.ts 全量对齐 Semi 151 个有值 token（去 55 个空动画）+ 升级带元数据；② build 产出 button 段 manifest；③ ConfigProvider 支持对象化覆写；④ docs 最小 `/dsm` 页，仅编辑 button token，验证实时预览 + 导出。**跑通全链路机制。** |
| **P1** | 元数据全量 | build 产出全库 manifest；docs 设计变量表改读 manifest；修中文 label |
| **P2..N** | 逐组件收敛 | 按组件把直接引 alias 收敛为组件 token（Modal 模板），扩充 DSM 可编辑面 |
| **末期** | 导出/CLI | 沉淀 `theme-cli`（`theming.spec.md` 草案）：接收覆写 → 产出 CSS 主题文件 |

**关键**：P0 用 Button 验证机制正确，再铺开。避免全库改完才发现架构问题。

## 7. 与现有 spec 的关系

- 兑现 `theming.spec.md` 里未勾选的三项草案：局部主题（地基 2）、主题包（P 末期 theme-cli）、品牌色替换（编辑器全局层）。
- 遵守 `tokens.spec.md` 三层架构：DSM 编辑面 = alias 层（全局）+ component 层（精细）；global 原子层不直接暴露给用户编辑。
- 组件收敛须遵守「组件只消费 alias/component token」既有纪律。

## 8. 验收标准

- [ ] P0：在 `/dsm` 改「primary 按钮 hover 背景」，预览即时变，导出得到一段可用 CSS 变量覆写。
- [ ] P0：改全局 `color-primary`，未覆写的 button 组件 token 联动变；已覆写的保持本地值。
- [ ] 收敛不改默认视觉（组件 token 默认值 = 原 alias，视觉回归通过）。
- [ ] manifest 的 category/引用链/label 准确（不再靠正则误判）。
- [ ] ConfigProvider 对象化主题作用域隔离（不影响兄弟子树），向后兼容字符串枚举。
- [ ] 导出的主题 CSS 可被任意宿主项目直接引入生效（无需 npm 包 / 编译）。

## 9. 风险与权衡

- **体积**：组件 token 全量收敛后，tokens.css 会增长（Button 单组件 +~150 token ≈ gzip +1.5KB）。全库铺开需同步校准 `.size-limit.js` 预算（见 performance）。空动画/transform 占位 token **不纳入**（CSS 变量架构下是无人消费的死变量）。
- **收敛工作量**：地基 3 是主要成本，须渐进、每组件视觉回归。
- **不转 SCSS**：明确不采用 Semi 的 SCSS 编译期变量——那会丢掉运行时实时预览与「导出即 CSS」的核心优势。
