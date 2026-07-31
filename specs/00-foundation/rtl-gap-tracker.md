# RTL 覆盖面缺口追踪

> 对标 Semi 的 61 个 `semi-foundation/<comp>/rtl.scss`。
> 调查日期：2026-07-30。**状态：2026-07-31 起分批实施中**。
>
> ## ⚠️ 三条已被推翻/更正的旧结论（先看这里，别按旧数据干活）
>
> 1. **§2 的阻断点已基本消除**。「class 不同构、命中率仅 40-50%」是 ① 之前测的。
>    把 Semi 61 份 rtl.scss 的 `&-` 嵌套与 `#{$module}` 插值还原成完整类名后重测：
>    **474 个目标类本库命中 392 = 83%**（含 navigation→nav / pagination→page 两个前缀别名）。
>    rtl.scss 现在可以逐条参照了。
> 2. **工作量应按「真镜像缺口」算，不是按物理属性总数**。
>    粗数物理属性得 1067 处，但其中大量是**左右同值**的 padding/margin
>    （互换等于空操作，Semi 写它们只因正向就用了物理属性）、
>    以及 `translateX(-50%)` 这类居中用法（与方向无关）。
>    剔掉后**真缺口约 230 处**（不含已完成的 grid），集中在十几个组件。
> 3. **Carousel 原有的 RTL 规则是死代码**（写成 `:dir(rtl)`，只认 HTML `dir` 属性，
>    而本库同 Semi 只注入 `class="cd-rtl"`）。已修并建闸门 `check:rtl-scope` 禁用 `:dir()`。
>
> ## 浮层（Portal 到 body）：已定 —— 不搬 Semi 的 `portal-rtl`
>
> Semi 有 **51 份** rtl.scss 的选择器写了 `.semi-portal-rtl`，
> 但全仓 **0 处** TS/TSX 输出这个类 —— **Semi 自己这块也是死代码**。
>
> 用户 2026-07-31 拍板：**对齐 Semi 就行，他是死代码我们就不搬**。
>
> 执行结果：删掉本库 Layout / Space 一度照抄的 2 处 `.cd-portal-rtl` 选择器，
> 并把 `portal-rtl` 一并纳入 `check:rtl-scope` 闸门禁止（已双向验红）。
>
> 因此 dropdown / modal / notification / toast / tooltip / select 这些浮层组件
> **不做 RTL 覆盖**（与 Semi 现状一致）。若将来真要支持，需另设机制
> （透传 direction / 浮层根挂类 / portal 容器加 dir），届时再单独立项。
>
> ## 已完成（逐批提交，每批配 browser 用例并验红）
>
> | 批次 | 组件 | 要点 |
> |---|---|---|
> | 试点 | switch | 只取负会把 knob 甩出轨道；须像 Semi 用物理属性钉死锚点 |
> | 批1 | calendar / descriptions / timeline | 补 `--cd-motion-timeline-head-custom-transform-rtl` token |
> | 批1.5 | carousel | 修死代码 + 建 `check:rtl-scope` 闸门 |
> | 批2 | steps / tag / tag-group / split-tag-group | 分裂标签首末圆角也要换边 |
>
> 剩余按 `rtl-effective.mjs` 的排序继续（cropper / resizable / side-sheet /
> date-picker / dropdown / modal / notification / chat / video-player / json-viewer …）。
>
> **本文件是 Semi 对齐工作的一部分**，属
> [semi-doc-alignment-progress.md](./semi-doc-alignment-progress.md) 的「第二轮对齐 ②」的细节承载
> —— 总待办去那里看，本文件只放调查数据，避免两处各记一份。
> 相关：[semi-doc-alignment-sop.md](./semi-doc-alignment-sop.md) · [class-naming-convention.md](./class-naming-convention.md)

## 0. 现状

`ConfigProvider direction='rtl'` 已能正确注入 `<div class="cd-rtl">` 方向作用域（与 Semi `.semi-rtl` 同构，
真机实测包住 60 个组件实例）。**但镜像样式只有 3 个组件实现**：

| 已实现 | 说明 |
|---|---|
| `layout` | `.cd-rtl` 下的方向覆盖 |
| `space` | `direction: rtl` |
| `grid`（Col） | `float: right` + offset margin 镜像 |

Semi 侧对应有 **61 个 rtl.scss / 2942 行**。即：本页 demo 在 rtl 下大部分组件**不会真正镜像** ——
这是尚未补齐的能力，不是配置未生效（configprovider.md 已用 warning Notice 如实标注）。

## 1. 规模与分类（已量化，重跑时直接用）

Semi 全部 61 个 rtl.scss 的**逐条声明**分类：

| 类别 | 条数 | 处理方式 |
|---|---|---|
| `direction: rtl` | 90 | 必写，照搬 |
| `padding/margin-left\|right` 互换 | 370 | **本库正向若已用逻辑属性则自动生效**，照搬反而冗余（见 §3） |
| `float` / `left` / `right` / `border-左右` / `transform` / `text-align` / `background-position` | 239 | 逻辑属性覆盖不到，**必须**写 `.cd-rtl` 覆盖 |
| 其它 | 65 | 逐条看 |

本库逻辑属性用量（`grep -rhoE '(margin|padding|border|inset)-(inline|block)'`）：

- **方向相关** `*-inline-*`：**247 处**（RTL 下会翻转，是本议题的对象）
- **方向无关** `*-block-*` / `inline-size` / `block-size`：**678 处**（RTL 不翻转，**不要动**）

61 个 rtl.scss **全部能映射到本库已有组件**，无「Semi 有而本库无」的情况。

## 2. 阻断点：class 命名不同构，rtl.scss 无法逐行照搬

试点 Tabs（回退 20 处逻辑属性 → 准备照搬 Semi 100 行 rtl.scss）时卡住：
**Semi rtl.scss 选择的类，本库大多不存在。**

| Semi rtl.scss 目标类 | 本库 |
|---|---|
| `.semi-tabs-bar-line` / `-bar-card` / `-bar-button` | ✗ 本库是 `cd-tabs-line` / `-card` / `-button`（无 `bar-` 中缀） |
| `.semi-tabs-bar-left` / `-bar-top` | ✗ 本库是 `cd-tabs-left` |
| `.semi-tabs-bar-arrow-start` / `-arrow-end` | ✗ 本库是 `cd-tabs-scroll-btn-prev` / `-next` |
| `.semi-tabs-bar-collapse` | ✗ |

Tabs 11 个目标类只命中 3 个。抽查其他组件命中率：

```
button      Semi 子类  8 → 命中 4 (50%)
timeline    Semi 子类 10 → 命中 4 (40%)
steps       Semi 子类  2 → 命中 1 (50%)
avatar      Semi 子类  3 → 命中 3 (100%)
radio       Semi 子类  1 → 命中 1 (100%)
```

**根因**：本库 class 在「全库统一单连字符折平」那轮（见 [[class-naming-single-hyphen-not-bem]]）
把 Semi 的 `-bar-line` 这类中缀结构折平了。故「照搬 rtl.scss 实现逐行同构」在 class 命名层面
**先天不成立** —— 属该轮决定的连带影响，非 RTL 本身的问题。

## 3. 为什么「照搬」会产生冗余（不是没对齐 Semi）

冗余只出在那 370 条 `padding/margin-left|right` 互换上，且**取决于本库正向样式的写法**：

- **Button（两边都用物理属性）**：Semi 正向 `padding-left/right`，本库也是 → Semi 的 104 行 rtl.scss
  照搬过来**零冗余，必须搬**。
- **Tabs（本库正向已用逻辑属性）**：本库 `Tabs.svelte:1012` 是 `margin-inline-end`，
  它在 `direction:rtl` 下**自己就翻转**；而 Semi 正向写 `margin-right`，所以它必须在 rtl.scss 里
  补 `margin-right:0; margin-left:X` 掰回来。这条搬过来是**纯冗余，甚至有害**
  （用物理属性把已自动翻转好的值又覆盖一遍）。

即：**Semi 那 370 条是在给「正向用物理属性」这个选择还债**；本库 23 个组件的正向样式已用逻辑属性，
这部分债本来就没欠。

## 4. 附带发现：token 命名语义错配（独立于 RTL，可单独修）

全库 **49 处**「逻辑属性 + 物理方位命名 token」错配：

```
margin-inline-end: var(--cd-spacing-tabs-tab-icon-marginright)
                                              ^^^^^^^^^^^ 名字说“右”
^^^^^^^^^^^^^^^^^ 实际是“行内结束侧”，RTL 下是左边
```

- **DSM 仍可控**（实测把该 token 设成 `99px`，computed 就是 `99px`）—— 逻辑属性消费 `var()` 与物理属性一样。
- **但会误导**：DSM 面板显示「图标右外边距」，LTR 下确实是右，**RTL 下调的是左边距**；
  一个 token 在两种书写方向下控制不同的物理边，而名字只描述了其中一种。
- 这也解释了 Semi 为何全用物理属性：**物理属性下 token 名与它控制的边永远一一对应**，
  代价就是多写那 370 条 rtl.scss。是真实权衡，不是 Semi 偷懒。

## 5. 待办

待办条目统一记在
[semi-doc-alignment-progress.md 的「第二轮对齐」](./semi-doc-alignment-progress.md#第二轮对齐文档页-7171-完成后的下一阶段)（① class 命名对齐 → ② 补 RTL → ③ 修 token 命名）。

**重跑 ② 时的决策点**（数据见上文 §1–§4）：先看 ① 之后 §2 的阻断点是否消除 ——
若 class 已同构，可逐行照搬 rtl.scss（`direction` 90 条 + 必须覆盖的 239 条 + 视正向写法决定的 370 条）；
若仍不同构，只能按本库真实类名重写，接受「不可逐行比对」。

## 6. 本轮已还原的试点

调查期间的改动**已全部还原**，工作区无残留：

- Spin / Badge / Skeleton / OverflowList / AutoComplete 追加的 `direction: rtl` 块 —— 已删除
- Tabs 的 20 处逻辑属性回退 —— 已还原

（这 5 个组件的 `direction: rtl` 曾真机验证生效：`.cd-rtl` 内 Spin/Badge 实测 `direction: rtl`，
未转换的 Tag 仍为 `ltr` 作对照。机制本身没问题，只是整体搁置。）
