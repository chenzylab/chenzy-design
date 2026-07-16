---
'@chenzy-design/svelte': minor
'@chenzy-design/tokens': minor
'@chenzy-design/locale': minor
---

feat: 全库图标引用对齐 Semi + Upload 破坏性重写

- **Icon**：删自造实现，复用 `@chenzy-design/icons` 已对齐基类（font-size 驱动尺寸 8/12/16/20/24、`cd-icon-spinning`、恒 role=img、fill/type/inherit）；移除 Semi 无的 `status`/`color` prop 与孤儿 token `--cd-icon-*`。
- **IconButton**：去掉自造的 icon/ariaLabel 必填约束与 dev warn，三者可选；补齐 Semi 的 iconPosition/iconSize/iconStyle/noHorizontalPadding 等 props；新增「图标+文字」「iconPosition」demo。
- **消费方图标引用对齐 Semi**：约 30 个组件（Select/Cascader/TreeSelect/Tree/Transfer/Input/InputNumber/TextArea/TagInput/DatePicker/RangePicker/TimePicker/Tabs/BackTop/Breadcrumb/Nav/Carousel/Collapse/Form/Steps/Checkbox/Rating/ColorPicker/JsonViewer/Typography 等）约 70 处手写功能性 svg 改为 `@chenzy-design/icons` 具名图标；image/upload 内部及 descriptions/breadcrumb/divider demo 同步；upload/tag-input 字面字形（×/↻/!）改具名图标。Semi 也手写的（tooltip/popover TriangleArrow、fileCard ErrorSvg/ReplaceSvg/DirectorySvg）保持手写；纯几何/插画（spin/progress/illustrations）保留。
- **Upload 破坏性重写**：listType 改 `list`(默认)/`picture`/`none`；受控 prop 改 `fileList`/`defaultFileList`；`draggable`/`name`/`data`/`validateStatus`(+success) 对齐 Semi；删自造 `size`/`concurrency`；回调签名展开对齐 Semi（onSuccess/onError/onProgress/beforeUpload/beforeCrop）；拆独立 `FileCard.svelte`（renderPic/renderFile 双分支，引入 Button/Spin/Progress(circle)/Typography.Text/Tooltip）；DOM class 由 BEM `cd-upload__*` 全改 Semi 连字符 `cd-upload-*` 体系；补 ErrorSvg/DirectorySvg 手写图形；补 7 个 demo 场景（prompt/directory/pic-size/after-upload/before-upload/custom-drag-area/min-max-size）；4 个内部消费方（sidebar/chat/ai-chat-input/form）适配。
- **locale**：补 Upload 3 键（selectedFiles/fail/illegalSize）。
- **tokens**：删 icon 孤儿 token；upload placeholder-bg 由 fill-2 近似改 grey-3 精确对齐 Semi。
