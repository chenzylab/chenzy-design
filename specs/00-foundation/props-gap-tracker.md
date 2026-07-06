# Props 级对标缺口追踪（第三层核实）

> 对标 Semi 2.101.0。前两层已零遗漏：①目录级（组件存在）②导出符号级（子组件/具名导出）。
> 本文件是**第三层 props 级**核实的产物——已有组件的 props 是否齐全（AGENTS.md §9.1 最高发缺口区）。
> 核实日期：2026-07-06。方法：逐组件读 Semi 的 props interface/propTypes，对本库对应目录 `grep -rni` 逐 prop 验证。

## 0. 核实链与状态

- **初报**：props 级 agent 报 ~93 个候选缺口（抽验 4/4 命中：onRemove/disableStrictly/validateStatus/crop 均真缺）。
- **精验**：去假阳 agent 逐个亲验 → **假阳 27，真缺口 66**。
- **甄别质量抽验（进行中）**：新 session 需据本文档 §3 逐条复验 agent 甄别，确认净单可信后再实现。已验通过：
  - ✅ `draggable→drag`（假阳）：Upload.svelte:53 `drag?: boolean` 确存在。
  - ✅ `renderSelectedItem→label snippet`（假阳）：Select.svelte:147 `label?: Snippet<[{option}]>` + 注释 L19 确证。
  - ⏳ `crop`（真缺）：待复验（Upload 目录 grep crop 是否 0 命中）。
  - ⏳ 其余见 §3 复验清单。

## 1. 真缺口净单（66 个，按组件+优先级）

### Upload（20）
**高**：previewFile · renderFileItem · renderThumbnail · showPicInfo+renderPicInfo（成套）· crop+beforeCrop+onCropError+cropModalProps（裁剪整套，本库有独立 cropper 组件但 Upload 零集成）
**中**：uploadTrigger · onRemove+beforeRemove · beforeClear · afterUpload · timeout · onPastingError
**低**：renderPicPreviewIcon · renderPicClose · renderFileOperation · picHeight · picWidth · capture · itemStyle · onFileChange

### Tree（15）
**中**：renderFullLabel · searchRender · showFilteredOnly · onChangeWithObject · leafOnly · disableStrictly
**低**：searchStyle · searchClassName · showClear · onDoubleClick · treeDataSimpleJson · treeNodeFilterProp · expandAction · autoExpandWhenDragEnter · hideDraggingNode · renderDraggingNode · labelEllipsis · autoMergeValue · preventScroll
> 噪声（不计入）：`directory`（非 Tree prop，属 Upload）；`selectedKey`（≈ 现有 value 单选，已覆盖）。

### Select（15）
**中**：triggerRender · searchPosition · insetLabel+insetLabelId
**低**：dropdownClassName · dropdownStyle · dropdownMargin · defaultActiveFirstOption · inputProps · showArrow（隐藏开关）· clickToHide · onListScroll · preventScroll · expandRestTagsOnClick · zIndex · ellipsisTrigger · outerTopSlot · outerBottomSlot（inner 版已由 dropdownHeader/Footer 覆盖）

### Table（9）
**中**：expandAllGroupRows+defaultExpandAllGroupRows+clickGroupedRowToExpand（可折叠分组，成套）· renderPagination
**低**：expandIcon · hideExpandedColumn · rowSpanHover · headerStyle · onGroupedRow

### TreeSelect（8，全低）
filterTreeNode · emptyContent · dropdownClassName · dropdownStyle · zIndex · mouseEnterDelay · mouseLeaveDelay · searchRender

### DatePicker（4）
**中**：defaultPickerValue · timeZone
**低**：insetLabel · insetLabelId

### Form（4）— 关键架构真缺口
> **重要**：FormApi 经 Svelte context 只能被后代 Field 消费，**渲染 `<Form>` 的父组件无法拿到 API 句柄**做命令式 setValues/validate/reset。故下列属真缺口非纯架构替代。
**高**：getFormApi（回传 FormApi 逃生舱）· validateFields（外部触发字段校验）
**中**：onErrorChange · onReset
**低**：stopPropagation

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
- [ ] `grep -rin crop packages/svelte/src/upload/`（预期：仅 test 或 0，无 crop prop）
- [ ] `grep -rin getFormApi packages/svelte/src/form/`（预期 0）
- [ ] `grep -rin previewFile packages/svelte/src/upload/`（预期 0）
- [ ] `grep -rin triggerRender packages/svelte/src/select/`（预期 0）
- [ ] `grep -rin defaultPickerValue packages/svelte/src/date-picker/`（预期 0）
- [ ] `grep -rin disableStrictly packages/svelte/src/tree/`（预期 0）
- [ ] `grep -rin expandAllGroupRows packages/svelte/src/table/`（预期 0）

**复验假阳甄别（确认别名真存在）**：
- [x] Upload drag（draggable 假阳）— 已验 Upload.svelte:53
- [x] Select label snippet（renderSelectedItem 假阳）— 已验 Select.svelte:147
- [ ] `grep -rin switcher packages/svelte/src/tree/`（expandIcon→switcher，预期命中）
- [ ] `grep -rin uploadName packages/svelte/src/upload/`（fileName→uploadName，预期命中）
- [ ] `grep -rin "dropdownHeader\|dropdownFooter" packages/svelte/src/select/`（inner slots，预期命中）
- [ ] `grep -rin defaultExpandAllRows packages/svelte/src/table/`（expandAllRows，预期命中）
- [ ] `grep -rin lazy packages/svelte/src/tabs/`（lazyRender→lazy，预期命中）

若复验发现 agent 误判（真缺口其实已实现，或假阳其实真缺），修正 §1/§2。

## 4. 实现批次建议（复验通过后执行）

**批次 1（高价值成套，优先）**
1. Form 命令式 API：getFormApi + validateFields（+ onReset/onErrorChange）——唯一「外部无法触达」的架构级缺口，影响可编程性。
2. Upload 裁剪集成：crop/beforeCrop/onCropError/cropModalProps——本库已有 cropper 组件，集成成本可控。
3. Upload render 家族：renderFileItem/previewFile/renderThumbnail/showPicInfo+renderPicInfo。

**批次 2（中优先成套/常用）**
4. Table 可折叠分组：expandAllGroupRows/defaultExpandAllGroupRows/clickGroupedRowToExpand。
5. Tree onChange 语义族：onChangeWithObject/leafOnly/disableStrictly/showFilteredOnly。
6. Select/TreeSelect/DatePicker 交互增强：triggerRender/searchPosition/insetLabel；defaultPickerValue/timeZone；Upload uploadTrigger/onRemove/beforeRemove/timeout。

**批次 3（低优先边角，统一收口）**
7. 浮层通用属性横扫：给 Select/TreeSelect/Cascader/Dropdown 统一补 dropdownClassName/dropdownStyle/zIndex/dropdownMargin——**先确立库内统一浮层透传约定，再一次性铺开**，避免逐组件重复设计。
8. 其余单点边角随手补或按需响应。

## 5. 优先级分布汇总

- 高：~11（Upload render/crop 家族 9 + Form getFormApi/validateFields 2）
- 中：~20
- 低：~35（zIndex/dropdownMargin/xxxClassName/边角 render）
