# SPEC-00 · 总纲与组件路线图

> 阅读顺序：`AGENTS.md` → 本文件 → 具体 SPEC。本文件给出全局视图、阶段划分与完整组件清单。

## 1. 阶段（Milestone）划分

横切能力（a11y / i18n / 主题 / 性能 / 文案 / AI）**贯穿所有阶段**，先在 M0 建立基线，每个组件都必须满足。

| 阶段 | 主题 | 交付 |
|---|---|---|
| **M0 基建** | tokens、unocss-preset、core(headless 原语)、locale、icons、文档站骨架、CI/质量门禁 | `specs/00-foundation/*` 全部落地 |
| **M1 Basic** | 基础展示与原子组件 | Button、Typography、Icon、Layout、Grid、Space、Divider |
| **M2 Input** | 表单与录入 | Input、Form、Select、Checkbox、Radio、Switch、DatePicker… |
| **M3 Navigation** | 导航 | Menu、Tabs、Breadcrumb、Pagination、Steps、Dropdown… |
| **M4 Show** | 数据展示 | Table、List、Card、Tree、Avatar、Tag、Tooltip… |
| **M5 Feedback** | 反馈 | Modal、Toast、Notification、Spin、Progress、Popconfirm… |
| **M6 Other** | 其他/复合 | ConfigProvider、LocaleProvider、BackTop、Anchor… |

## 2. 完整组件清单（对标 Semi Design，按官方分类）

> 每个组件对应一个 SPEC：`specs/components/<category>/<Component>.spec.md`。
> 勾选 = SPEC 已编写。示范组件（Button/Input/Modal）已作为模板完成。

### Basic（基础）
- [x] Button · [x] Icon · [x] Typography · [x] Layout · [x] Grid(Row/Col) · [x] Space · [x] Divider
- [ ] FloatButton · [ ] IconButton（对标 Semi 2.101.0 增补，SPEC 已写，实现中）

### Input（输入）
- [x] Input · [x] InputNumber · [x] Textarea · [x] Form · [x] Select · [x] AutoComplete
- [x] Cascader · [x] Checkbox · [x] Radio · [x] Switch · [x] Slider · [x] Rating
- [x] DatePicker · [x] TimePicker · [x] Upload · [x] TreeSelect · [x] Transfer · [x] ColorPicker · [x] TagInput
- [ ] PinCode（对标 Semi 2.101.0 增补，SPEC 已写，实现中）

### Navigation（导航）
- [x] Anchor · [x] Breadcrumb · [x] Dropdown · [x] Menu · [x] Navigation(SideSheet 导航)
- [x] Pagination · [x] Steps · [x] Tabs

### Show（展示）
- [x] Avatar · [x] AvatarGroup · [x] Badge · [x] Calendar · [x] Card · [x] Carousel
- [x] Collapse · [x] Descriptions · [x] Empty · [x] Highlight · [x] Image · [x] List
- [x] Popover · [x] OverflowList · [x] ScrollList · [x] Table · [x] Tag · [x] Timeline
- [x] Tooltip · [x] Tree · [x] VirtualList
- [ ] UserGuide · [ ] SideBar（AI 侧边信息栏，分阶段）（对标 Semi 2.101.0 增补，SPEC 已写，实现中）

### Feedback（反馈）
- [x] Modal · [x] Banner · [x] Notification · [x] Popconfirm · [x] Progress
- [x] Spin · [x] Toast · [x] SideSheet · [x] Drawer · [x] Skeleton

### Other（其他）
- [x] ConfigProvider · [x] LocaleProvider · [x] BackTop · [x] ResizeObserver · [x] LottieIcon
- [ ] HotKeys（对标 Semi 2.101.0 增补，SPEC 已写，实现中）

## 3. 横切能力 SPEC 索引（M0 必须先完成）

| SPEC | 文件 | 对应需求 |
|---|---|---|
| Design Token | `tokens.spec.md` | 主题化基础 |
| 主题化方案 | `theming.spec.md` | 需求 2 |
| 无障碍 | `a11y.spec.md` | 需求 1 |
| 国际化 | `i18n.spec.md` | 需求 5 |
| 性能基准 | `performance.spec.md` | 需求 4 |
| MVVM 适配 | `mvvm-adapter.spec.md` | 需求 3 |
| AI 友好 | `ai-friendly.spec.md` | 需求 6 |
| 文案规范 | `content-guidelines.spec.md` | 需求 8 |
| **文档站** | `docs.spec.md` | M0 基建，4 个 Phase 分步实施 |

## 4. 每个组件 SPEC 的统一结构

见 `specs/components/_TEMPLATE.spec.md`。批量生成新组件 SPEC 时必须复用该模板。
