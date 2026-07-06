# Props 级对标缺口追踪（第三层核实）

> 对标 Semi 2.101.0。前两层已零遗漏：①目录级（组件存在）②导出符号级（子组件/具名导出）。
> 本文件是**第三层 props 级**核实的产物——已有组件的 props 是否齐全（AGENTS.md §9.1 最高发缺口区）。
> 核实日期：2026-07-06。方法：逐组件读 Semi 的 props interface/propTypes，对本库对应目录 `grep -rni` 逐 prop 验证。

## 0. 核实链与状态

- **初报**：props 级 agent 报 ~93 个候选缺口（抽验 4/4 命中：onRemove/disableStrictly/validateStatus/crop 均真缺）。
- **精验**：去假阳 agent 逐个亲验 → **假阳 27，真缺口 66**。
- **甄别质量复验（✅ 已完成 2026-07-06）**：据 §3 逐条单条 grep 复验，**12/12 全部符合预期，agent 甄别零误判**。
  - 真缺口 7/7 确认 0 命中：crop · getFormApi · previewFile · triggerRender · defaultPickerValue · disableStrictly · expandAllGroupRows。
  - 假阳 5/5 确认别名真存在：Tree switcher(Tree.svelte:162) · Upload uploadName(:57) · Select dropdownHeader(:141) · Table defaultExpandAllRows(:107/188) · Tabs lazy(:76)。
  - 净单可信，进入 §4 实现阶段。

## 1. 真缺口净单（66 个，按组件+优先级）

### Upload（20）
**高**：✅ 批次1 已实现 → previewFile · renderFileItem · renderThumbnail · showPicInfo+renderPicInfo（成套）· crop+beforeCrop+onCropError+cropModalProps（裁剪整套：addFiles 分流 runCropPipeline，Modal+Cropper，getCropperCanvas→toBlob→File 替换后走原上传管线）
**中**：✅ uploadTrigger · ✅ onRemove+beforeRemove · beforeClear · afterUpload · ✅ timeout · onPastingError（批次2 补 uploadTrigger/onRemove/beforeRemove/timeout；beforeClear/afterUpload/onPastingError 待批次3）
**低**：renderPicPreviewIcon · renderPicClose · renderFileOperation · picHeight · picWidth · capture · itemStyle · onFileChange

### Tree（15）
**中**：renderFullLabel · searchRender · ✅ showFilteredOnly · ✅ onChangeWithObject · ✅ leafOnly · ✅ disableStrictly（批次2 已实现：core `conduct(disableStrictly)`+`collectLeafKeys`，Tree.svelte 接线）
**低**：searchStyle · searchClassName · showClear · onDoubleClick · treeDataSimpleJson · treeNodeFilterProp · expandAction · autoExpandWhenDragEnter · hideDraggingNode · renderDraggingNode · labelEllipsis · autoMergeValue · preventScroll
> 噪声（不计入）：`directory`（非 Tree prop，属 Upload）；`selectedKey`（≈ 现有 value 单选，已覆盖）。

### Select（15）
**中**：✅ triggerRender · ✅ searchPosition · ✅ insetLabel+insetLabelId（批次2 已实现）
**低**：dropdownClassName · dropdownStyle · dropdownMargin · defaultActiveFirstOption · inputProps · showArrow（隐藏开关）· clickToHide · onListScroll · preventScroll · expandRestTagsOnClick · zIndex · ellipsisTrigger · outerTopSlot · outerBottomSlot（inner 版已由 dropdownHeader/Footer 覆盖）

### Table（9）
**中**：✅ expandAllGroupRows+defaultExpandAllGroupRows+clickGroupedRowToExpand（可折叠分组，成套 — 批次2 已实现，纯 derived+SvelteMap，配套 onGroupExpandChange 受控通知）· renderPagination
**低**：expandIcon · hideExpandedColumn · rowSpanHover · headerStyle · onGroupedRow

### TreeSelect（8，全低）
filterTreeNode · emptyContent · dropdownClassName · dropdownStyle · zIndex · mouseEnterDelay · mouseLeaveDelay · searchRender

### DatePicker（4）
**中**：✅ defaultPickerValue · ✅ timeZone（批次2 已实现；timeZone 仅格式化显示层）
**低**：insetLabel · insetLabelId

### Form（4）— 关键架构真缺口 ✅ 批次1 已实现（除 validateFields 见下）
> **重要**：FormApi 经 Svelte context 只能被后代 Field 消费，**渲染 `<Form>` 的父组件无法拿到 API 句柄**做命令式 setValues/validate/reset。故下列属真缺口非纯架构替代。
**高**：✅ getFormApi（回传 FormApi 逃生舱，Form.svelte 一次性 $effect 回调）· ~~validateFields~~（**撤销**：Semi 中 validateFields 是 Form 级自定义校验器=废弃 `validator` 别名，非「外部触发字段校验」入口；本库无 Form 级 validator 故不加。外部触发校验能力已由 getFormApi 回传的 `formApi.validate(names?)` / `validateField(name)` 完整覆盖）
**中**：✅ onErrorChange（subscribe 里 lastErrors 引用比对）· ✅ onReset（`<form onreset>` handler 调 resetFields）
**低**：stopPropagation（未做，边角）

### Modal（4，全低）
modalRender · cancelLoading · maskFixed · getContainerContext（注：direction 已剔为架构替代=ConfigProvider dir）

### Tabs（3，全低）
tabBarClassName · tabBarStyle · visibleTabsStyle

### Cascader（2，全低）
dropdownClassName · dropdownMargin

### Dropdown（3，全低）
contentClassName · rePosKey · onEscKeyDown

## 2. 剔除的假阳（27，勿误报为缺口）

### A. 命名映射（16）
| 组件 | Semi prop | 本库 | 证据行 |
|---|---|---|---|
| Upload | draggable | drag | Upload.svelte:53 |
| Upload | defaultFileList | defaultValue | Upload.svelte:31 |
| Upload | fileName | uploadName | Upload.svelte:57 |
| Upload | showUploadList | listType='none' | Upload.svelte:52 |
| Tree | expandIcon | switcher Snippet | Tree.svelte:162 |
| Select | renderSelectedItem | label Snippet | Select.svelte:147 |
| Select | renderOptionItem | option Snippet | Select.svelte:145 |
| Select | innerTopSlot | dropdownHeader | Select.svelte:141 |
| Select | innerBottomSlot | dropdownFooter | Select.svelte:143 |
| Table | expandAllRows | defaultExpandAllRows | Table.svelte:107/188 |
| Table | onExpandedRowsChange | onExpandChange | Table.svelte:154-157 |
| Table | childrenRecordName | tree.childrenColumnName | Table.svelte:11 |
| Tabs | defaultActiveKey | defaultValue | Tabs.svelte:56 |
| Tabs | lazyRender | lazy | Tabs.svelte:76 |
| DatePicker | dateFnsLocale | locale + Intl | DatePicker.svelte:59 |
| Form | validator | rules[].validator | Field.svelte:41 |

### B. 架构替代（6）
| 组件 | Semi prop | 本库机制 |
|---|---|---|
| Table | getVirtualizedListRef | bind:this={scrollEl}（Table.svelte:1298） |
| Modal | getContainerContext→getContainer | Modal.svelte:46 |
| Modal | direction | ConfigProvider dir context |
| Form | form/getFormApi（部分） | context 共享给子 Field（**但父级够不到→§1 真缺口例外**） |

### C. validateStatus（5，已实现为 status）
Upload/Select/DatePicker/Cascader 的 validateStatus → 本库统一 `status?: 'default'|'warning'|'error'`；Form 字段 Field.svelte:51 直接同名。

## 3. 新 session 复验清单（先做这个，再实现）

逐条用**单条简单 grep**复验（本会话 Bash 对复合命令/含 `?:` 命令偶发解析失败，故拆单条）：

**复验真缺口（抽样，确认 0 命中）**：
- [x] `grep -rin crop packages/svelte/src/upload/`（0 命中 ✅）
- [x] `grep -rin getFormApi packages/svelte/src/form/`（0 命中 ✅）
- [x] `grep -rin previewFile packages/svelte/src/upload/`（0 命中 ✅）
- [x] `grep -rin triggerRender packages/svelte/src/select/`（0 命中 ✅）
- [x] `grep -rin defaultPickerValue packages/svelte/src/date-picker/`（0 命中 ✅）
- [x] `grep -rin disableStrictly packages/svelte/src/tree/`（0 命中 ✅）
- [x] `grep -rin expandAllGroupRows packages/svelte/src/table/`（0 命中 ✅）

**复验假阳甄别（确认别名真存在）**：
- [x] Upload drag（draggable 假阳）— 已验 Upload.svelte:53
- [x] Select label snippet（renderSelectedItem 假阳）— 已验 Select.svelte:147
- [x] `grep -rin switcher packages/svelte/src/tree/`（命中 Tree.svelte:162 ✅）
- [x] `grep -rin uploadName packages/svelte/src/upload/`（命中 Upload.svelte:57 ✅）
- [x] `grep -rin dropdownHeader packages/svelte/src/select/`（命中 Select.svelte:141 ✅）
- [x] `grep -rin defaultExpandAllRows packages/svelte/src/table/`（命中 Table.svelte:107/188 ✅）
- [x] `grep -rin lazy packages/svelte/src/tabs/`（命中 Tabs.svelte:76 ✅）

若复验发现 agent 误判（真缺口其实已实现，或假阳其实真缺），修正 §1/§2。

## 4. 实现批次建议（复验通过后执行）

**批次 1（高价值成套，优先）— ✅ 已完成（2026-07-06）**
1. ✅ Form 命令式 API：getFormApi（+ onReset/onErrorChange）——validateFields 撤销（见 §1 Form 段说明，非外部触发校验入口）。
2. ✅ Upload 裁剪集成：crop/beforeCrop/onCropError/cropModalProps——复用库内 Cropper + Modal。
3. ✅ Upload render 家族：renderFileItem/previewFile/renderThumbnail/showPicInfo+renderPicInfo。

**批次 2（中优先成套/常用）— ✅ 已完成（2026-07-06）**
4. ✅ Table 可折叠分组：expandAllGroupRows/defaultExpandAllGroupRows/clickGroupedRowToExpand（+onGroupExpandChange 受控通知）。
5. ✅ Tree onChange 语义族：onChangeWithObject/leafOnly/disableStrictly/showFilteredOnly（core conduct(disableStrictly)+collectLeafKeys）。
6. ✅ Select/DatePicker/Upload 交互增强：triggerRender/searchPosition/insetLabel+insetLabelId；defaultPickerValue/timeZone（时区仅格式化显示层，非完整值转换）；Upload uploadTrigger('custom' 经 export upload() 命令式触发)/onRemove/beforeRemove/timeout。
   > 注：Select searchPosition 默认取 'dropdown'（浮层内搜索），需触发器内联搜索者显式传 'trigger'（1.0 前无兼容包袱）。TreeSelect 的交互增强归入批次3 浮层横扫。

**批次 3（低优先边角，统一收口）**
7. 浮层通用属性横扫：给 Select/TreeSelect/Cascader/Dropdown 统一补 dropdownClassName/dropdownStyle/zIndex/dropdownMargin——**先确立库内统一浮层透传约定，再一次性铺开**，避免逐组件重复设计。
8. 其余单点边角随手补或按需响应。

## 5. 优先级分布汇总

- 高：~11（Upload render/crop 家族 9 + Form getFormApi/validateFields 2）
- 中：~20
- 低：~35（zIndex/dropdownMargin/xxxClassName/边角 render）
