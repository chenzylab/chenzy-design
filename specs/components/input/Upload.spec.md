# SPEC · Upload
> 分类：input · 阶段：M2
> 对标 Semi：Upload

## 1. 概述

Upload 用于将本地文件上传至服务端，支持点击选择与拖拽两种触发方式，提供上传列表、进度反馈、单文件/批量校验与重试能力。它是表单密集场景（资料提交、附件、头像、图片墙）的核心输入组件。

核心场景：
- 单文件 / 多文件上传，受控或非受控管理文件列表。
- 拖拽区域（drag-and-drop），支持目录拖入（`directory`）与拖拽区高亮态。
- 上传进度（确定进度条 + 不确定 indeterminate）、成功 / 失败 / 上传中 / 校验失败状态。
- 文件预上传校验（类型 `accept`、大小、数量上限、自定义 `beforeUpload`），校验失败进入 error 列表项而非静默丢弃。
- 列表形态：默认列表 `list` / 图片墙 `picture` / 头像 `avatar` / 自定义渲染。
- 重试、删除、预览、暂停（基于可中断的请求实现）。

非目标：不内置文件分片/断点续传协议（通过 `customRequest` 暴露给业务实现）；不内置裁剪（由独立 ImageCrop 组件组合）。

与同类组件区别：Upload 是“触发 + 列表 + 传输状态机”的组合控件，文件项展示态与传输态解耦，便于自定义渲染与对接任意后端。

## 2. 设计语义

- **触发区（trigger）**：按钮型或拖拽区型。拖拽区为虚线边框矩形，默认 `--cd-color-border`，hover/drag-over 时边框与背景切换为 `--cd-color-primary` 语义的浅色派生（`--cd-upload-drag-active-bg`）。拖拽区未传 `dragIcon` 时默认渲染云上传图标（居中，主色，对齐 Semi drag-area 默认图标）。当 `children` 存在时触发按钮退化为无样式裸容器（外观由 children 决定，如 Avatar 头像上传），不漏默认按钮灰底/边框。
- **状态语义映射**：
  - uploading → 中性信息色 + 进度条（`--cd-color-primary`）。
  - success → 成功色（Alias `--cd-color-success` 派生的 `--cd-upload-status-success`）。
  - uploadFail / validateFail → 危险色 `--cd-color-danger`，文件项整体描边变红，附错误文案（仅 uploadFail 显示重试按钮）。
  - wait → 次级文本 `--cd-color-text-2`。
- **尺寸**：`small | default | large` 影响触发按钮高度、列表项行高、图片墙缩略图边长（small 48 / default 64 / large 80，token 化为 `--cd-upload-thumb-size`）。
- **密度**：列表项垂直内边距走 `--cd-upload-item-gap`，与全局间距阶梯对齐。
- **图片墙**：缩略图为正方形圆角卡片，悬浮显示预览 / 删除遮罩层；新增触发块与缩略图同尺寸。
- **运动**：列表项进入/移除使用 120ms ease 高度+透明度过渡；进度条宽度 200ms ease；尊重 `prefers-reduced-motion` 时禁用过渡仅保留最终态。
- **校验态**：组件级 `status` 与表单联动（error 时触发区描边走 `--cd-color-danger`）。

## 3. 分层实现

属于强交互 + a11y 复合控件，采用 core/svelte 分层。

**@chenzy-design/core · `createUpload`（headless 状态机）**
- 文件项状态机（`UploadFileItem.status`，对齐 Semi）：`wait → validating →(fail)validateFail | (pass)uploading → success | uploadFail`。**仅 `uploadFail`（网络/超时失败）可 `retry()` 回到 `wait`；`validateFail`（accept/maxSize/minSize 等校验失败）不可重试**（对齐 Semi FAQ：只有网络原因失败才显示重试）。枚举值：`'wait' | 'uploading' | 'success' | 'validateFail' | 'uploadFail'`。
- 队列调度：并发上限 `concurrency`，超出排队；暴露 `start/pause/abort/remove/retry/clear`。
- 校验管线：内置 `accept`、`maxSize`、`limit`、`maxCount`，串接异步 `beforeUpload`（可返回 transform 后的 File 或 reject 原因）。
- 传输抽象：默认 `XMLHttpRequest`（可读 `progress`/可 `abort`），允许注入 `customRequest`。
- 复用原语：`useId`（input/list/描述符 id 关联）、`useLiveAnnouncer`（进度与结果播报）、`useDismiss`（图片墙预览浮层关闭，若启用内置预览）。拖拽事件计数防止子元素抖动（dragenter/dragleave 配对计数）。
- 纯逻辑、可在 Node 测试，不触碰 DOM 渲染。

**@chenzy-design/svelte · `Upload.svelte`**
- 消费 `createUpload` store，渲染隐藏 `<input type="file">`、触发区/拖拽区、文件列表（list/picture/avatar 三态）与进度条。
- 绑定原生拖拽 / 选择事件，转发给 core；负责 slot 透传与遮罩层 DOM。
- `dragOver` 高亮、键盘聚焦样式、`reduced-motion` 媒体查询应用在此层。

## 4. API

### Props

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `value` | `UploadFileItem[]` | `[]` | 受控文件列表（含状态/进度），配合 `on:change` |
| `defaultValue` | `UploadFileItem[]` | `[]` | 非受控初始列表 |
| `action` | `string` | — | 上传目标 URL（未提供 `customRequest` 时必填） |
| `customRequest` | `(opt: UploadRequestOptions) => void` | — | 自定义上传实现，接管传输与进度回调 |
| `accept` | `string` | — | 接受的文件类型（同原生 input accept） |
| `multiple` | `boolean` | `false` | 是否允许多选 |
| `directory` | `boolean` | `false` | 是否上传目录（webkitdirectory） |
| `limit` | `number` | — | 列表最大文件数；超出阻止新增并 `on:exceed`。**`limit=1` 为替换语义**：始终用最新选中文件替换当前项，不触发 `onExceed`（对齐 Semi） |
| `maxSize` | `number` (KB) | — | 单文件大小上限 |
| `minSize` | `number` (KB) | — | 单文件大小下限 |
| `concurrency` | `number` | `3` | 并发上传数 |
| `autoUpload` | `boolean` | `true` | 选择后自动上传，false 时手动 `start()` |
| `beforeUpload` | `(file, fileList) => boolean \| File \| Promise<...>` | — | 上传前异步校验/转换 |
| `headers` (`headers`) | `Record<string,string> \| ((file: File) => Record<string,string>)` | — | 请求头；静态对象或按当前 file 求值的函数。对标 Semi headers |
| `uploadData` (Semi `data`) | `Record<string,string> \| ((file: File) => Record<string,string>)` | — | 附加表单字段；静态对象或按当前 file 求值的函数。对标 Semi data（本仓库命名 `uploadData`） |
| `uploadName` (Semi `name`) | `string` | `'file'` | 表单文件字段名（本仓库命名 `uploadName`） |
| `withCredentials` | `boolean` | `false` | 跨域携带 cookie |
| `listType` | `'list' \| 'picture' \| 'avatar'` | `'list'` | 列表展示形态 |
| `draggable` | `boolean` | `false` | 启用拖拽区 |
| `showUploadList` | `boolean` | `true` | 是否展示文件列表 |
| `disabled` | `boolean` | `false` | 禁用 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态（表单联动） |
| `previewable` | `boolean` | `true` | 是否启用内置预览（picture/avatar） |
| `transformFile` | `(file)=>File\|Promise<File>` | — | 上传前文件转换（压缩等） |
| `crop` | `boolean \| UploadCropProps` | `false` | 启用图片裁切：image/* 文件先进裁切弹窗（Modal + 内建 Cropper），确认后用裁切结果（canvas→toBlob→File，保留原名/type）替换原文件再上传；非图片文件正常上传。传对象自定义宽高比/形状/质量等（对标 Semi CropProps） |
| `beforeCrop` | `(file: File) => boolean \| Promise<boolean>` | — | 裁切前钩子：返回 `false` 跳过裁切直接上传该文件，支持异步 |
| `onCropError` | `(err: unknown) => void` | — | 裁切失败（如 canvas.toBlob 失败）回调 |
| `cropModalProps` | `Record<string, unknown>` | — | 透传给裁切 Modal 的额外 props（样式/宽度等） |
| `renderFileItem` | `Snippet<[{ fileItem, remove, retry, preview }]>` | — | 完全自定义单个文件项渲染，替换默认列表项（list/text listType）。`fileItem` 上另挂 `onRemove`/`onRetry`/`onPreview` 方法（对标 Semi `fileItem.onRemove()` 直接可调，与外层分开传的 `remove`/`retry`/`preview` 等价并存）。对标 Semi renderFileItem |
| `previewFile` | `Snippet<[{ fileItem }]>` | — | 自定义缩略图预览内容，替换默认缩略图 `<img>`（image/picture-card）。对标 Semi previewFile |
| `renderThumbnail` | `Snippet<[{ fileItem }]>` | — | 自定义整个缩略图容器（picture-card），接管图片本身，常配合放大预览。对标 Semi renderThumbnail |
| `showPicInfo` | `boolean` | `false` | 是否显示 picture-card 图片信息浮层（文件名等），只在 picture-card 有效。对标 Semi showPicInfo |
| `renderPicInfo` | `Snippet<[{ fileItem }]>` | — | 自定义 picture-card 图片信息浮层渲染（`showPicInfo` 为 true 时生效）。对标 Semi renderPicInfo |
| `beforeRemove` | `(file: UploadFileItem, fileList: UploadFileItem[]) => boolean \| Promise<boolean>` | — | 移除文件前钩子：返回 `false`/`Promise.resolve(false)`/reject 阻止移除，支持异步。对标 Semi beforeRemove |
| `onRemove` | `(currentFile: File \| undefined, fileList: UploadFileItem[], currentFileItem: UploadFileItem) => void` | — | 文件被移除后的回调（移除完成后触发）。对标 Semi onRemove |
| `timeout` | `number` (ms) | `0` | 单文件上传超时；`>0` 启用，超时中止 XHR 并标 error（`Upload.timeoutError`）。仅对内置 XHR 上传生效，`customRequest` 自管超时 |
| `uploadTrigger` | `'auto' \| 'custom'` | `'auto'` | 上传触发时机：`auto`=选文件即自动上传；`custom`=选文件后停在 ready 态，需命令式 `upload()` 触发。对标 Semi uploadTrigger |
| `beforeClear` | `(fileList: UploadFileItem[]) => boolean \| Promise<boolean>` | — | 批量清除前钩子：返回 `false`/`Promise.resolve(false)`/reject 阻止清除，支持异步。对标 Semi beforeClear |
| `afterUpload` | `(payload: { response, file, fileList }) => { autoRemove?, status?, validateMessage?, name?, url? } \| void` | — | 单文件上传成功后钩子（同步返回，不支持异步）：据返回值改该项 `status`/`validateMessage`(→`error`)/`name`/`url`，或 `autoRemove` 自动移除。对标 Semi afterUpload |
| `onPastingError` | `(error: unknown) => void` | — | 粘贴上传出错回调（`addOnPasting` 场景，读取剪贴板失败）。对标 Semi onPastingError |
| `renderPicPreviewIcon` | `Snippet<[{ fileItem, remove, retry, preview }]>` | — | 自定义照片墙 hover 预览图标（picture-card），常配合 `onPreviewClick`。`fileItem` 上另挂 `onRemove`/`onRetry`/`onPreview` 方法。对标 Semi renderPicPreviewIcon |
| `renderPicClose` | `Snippet<[{ className, remove }]>` | — | 自定义照片墙关闭（移除）按钮（picture-card）。对标 Semi renderPicClose |
| `renderFileOperation` | `Snippet<[{ fileItem, remove, retry, preview }]>` | — | 自定义文件列表项操作区（text/list，替换默认重试/移除）。`fileItem` 上另挂 `onRemove`/`onRetry`/`onPreview` 方法（对标 Semi `fileItem.onRemove()` 直接可调）。对标 Semi renderFileOperation |
| `picHeight` | `number \| string` | — | 照片墙缩略图高度（number 视为 px），写入卡片 inline style。对标 Semi picHeight |
| `picWidth` | `number \| string` | — | 照片墙缩略图宽度（number 视为 px），写入卡片 inline style。对标 Semi picWidth |
| `capture` | `boolean \| 'user' \| 'environment'` | — | 透传给 file input 的 `capture` 属性（移动端拍照/录像来源），命令式设置。对标 Semi capture |
| `itemStyle` | `string \| Record<string, string \| number>` | — | 每个文件列表项/卡片的自定义 style（合并进容器；对象值为 `number` 时按 CSS 数字属性惯例补 px，如 `{ width: 300 }` → `width: 300px`）。对标 Semi itemStyle |
| `onFileChange` | `(files: File[]) => void` | — | 选中原始 File 列表变化回调（经 accept/limit 过滤后），区别于 `onChange` 的 `UploadFileItem` 列表。对标 Semi onFileChange |
| `onProgress` | `(percent: number, item: UploadFileItem) => void` | — | 单文件上传进度回调（仅内置 XHR 上传触发，`customRequest` 外部自管）。对标 Semi onProgress |
| `showReplace` | `boolean` | `false` | 已上传（success）文件项显示"替换"按钮，点击重选文件替换该项；text/picture-card 均支持。对标 Semi showReplace |
| `showTooltip` | `boolean \| { type?: 'tooltip'\|'popover'; opts?: Record<string, unknown>; renderTooltip?: Snippet<[{ content, children }]> }` | `true` | 文件名提示：boolean=原生 `title` 属性；对象 `type`=用 Tooltip/Popover 包裹文件名；`renderTooltip` **完全接管浮层**（对标 Semi `(content, children) => ReactNode`）：入参 `content`=文件名文案、`children`=渲染文件名节点的 Snippet，由用户自行组织（如 `<Tooltip content={content}>{@render children()}</Tooltip>`），传了 `renderTooltip` 时不再套内置 Tooltip/Popover（也不要求先声明 `type`）。对标 Semi showTooltip |
| `showClear` | `boolean` | `false` | 是否显示批量清除按钮（文案 `Upload.clear`）。**注：Semi 默认 `true`（limit≠1 且已上传>1 时显示），本仓库为不破坏现有行为保持 `false`** |
| `fileListTitle` | `string \| false \| Snippet<[{ fileList, onClear, clearText }]>` | — | 文件列表标题：string=仅替换标题文字（保留默认清空按钮）；false=不渲染；Snippet=完全自定义标题区（含清空按钮）。对标 Semi fileListTitle |

> `showUploadList`（见上表）默认 `true`；`false` 时不渲染列表区（text 列表/picture 网格），但触发器与上传逻辑照常。

### Methods（命令式，via `bind:this`）

| Method | 类型 | 说明 |
|---|---|---|
| `upload` | `() => void` | 手动触发上传（配合 `uploadTrigger='custom'`），批量上传所有 ready 文件。对标 Semi `ref.upload` |
| `addFiles` | `(fileList: FileList \| File[]) => void` | 命令式添加文件，走完整 accept/limit/校验/上传管线 |
| `insert` | `(files: File[], index?: number) => void` | 命令式插入文件到指定 `index`（不传则末尾），走完整 accept/limit/校验/上传管线。`limit=1` 时同替换语义。对标 Semi insert |
| `openFileDialog` | `() => void` | 命令式打开文件选择器（等价点击触发器）。对标 Semi openFileDialog |

> renderThumbnail vs previewFile：`previewFile` 只替换缩略图内容（默认操作/信息浮层保留）；`renderThumbnail` 接管整个缩略图区域（含图片本身），二者互斥（renderThumbnail 优先）。

### UploadFileItem（`value` / `defaultValue` 元素类型）

| 字段 | 类型 | 说明 |
|---|---|---|
| `uid` | `string` | 唯一标识（列表 diff key） |
| `name` | `string` | 文件名 |
| `size` | `number` | 字节体积 |
| `status` | `'wait' \| 'uploading' \| 'success' \| 'validateFail' \| 'uploadFail'` | 上传状态（对齐 Semi）。`validateFail`=校验失败不可重试；`uploadFail`=网络失败可重试 |
| `percent` | `number?` | 上传进度百分比 |
| `file` | `File?` | 原始 File。对标 Semi `fileInstance`（本仓库统一命名 `file`，二者等价——Semi demo 读 `fileItem.fileInstance` 处改用 `fileItem.file`） |
| `preview` | `boolean?` | 是否启用缩略图预览（对标 Semi preview）。`true` 或有 `url` 时显示缩略图；显式 `false` 禁用预览（即便有 url） |
| `url` | `string?` | 远程预览地址（image/picture-card 优先用它，否则由 `file` 生成 objectURL） |
| `error` | `string?` | 校验失败提示（`status==='validateFail'` / 超时时展示） |
| `relativePath` | `string?` | 目录上传时的相对路径（webkitRelativePath） |

### Events

| Event | payload | 说明 |
|---|---|---|
| `on:change` | `{ value: UploadFileItem[], file: UploadFileItem }` | 列表或某文件状态变化（受控同步） |
| `on:select` | `{ files: File[] }` | 用户选择/拖入文件（校验前） |
| `on:beforeUpload` | `{ file, allow: boolean, reason?: string }` | 校验结果通知 |
| `on:progress` | `{ file, percent: number }` | 单文件进度更新 |
| `on:success` | `{ file, response: unknown }` | 单文件上传成功 |
| `on:error` | `{ file, error: Error }` | 单文件失败 |
| `on:remove` | `{ file }` | 文件被移除（可 `preventDefault` 拦截，返回 false 阻止） |
| `on:retry` | `{ file }` | 重试某文件 |
| `on:exceed` | `{ files: File[], limit: number }` | 超出 `limit` |
| `on:drop` | `{ files: File[], event: DragEvent }` | 拖拽放下 |
| `on:preview` | `{ file }` | 点击预览 |
| `on:openChange` | `{ open: boolean }` | 内置预览浮层显隐 |

### Slots

| Slot | props | 说明 |
|---|---|---|
| `default` | — | 触发区内容（按钮 / 拖拽提示文案） |
| `dragArea` | `{ dragOver: boolean }` | 自定义拖拽区（draggable 时） |
| `fileItem` | `{ file, remove, retry, preview }` | 自定义单文件项渲染 |
| `previewIcon` / `removeIcon` / `retryIcon` | `{ file }` | 操作图标自定义 |
| `tip` | — | 触发区下方辅助说明（accept/大小提示） |
| `preview` | `{ file, close }` | 自定义预览浮层内容 |

## 5. 主题 / Token 表

组件仅消费 Alias / Component token，不写死值。

| Component Token | 引用 Alias / Global | 用途 |
|---|---|---|
| `--cd-upload-text` | `--cd-color-text-0` | 文件名主文本 |
| `--cd-upload-text-secondary` | `--cd-color-text-2` | 大小/提示文本 |
| `--cd-upload-bg` | `--cd-color-bg-0` | 拖拽区/图片墙底色 |
| `--cd-upload-border` | `--cd-color-border` | 拖拽区/文件项边框 |
| `--cd-upload-drag-active-border` | `--cd-color-primary` | drag-over 边框 |
| `--cd-upload-drag-active-bg` | `--cd-color-primary` (派生浅色) | drag-over 背景 |
| `--cd-upload-progress` | `--cd-color-primary` | 进度条填充 |
| `--cd-upload-status-success` | `--cd-color-success` | 成功状态色 |
| `--cd-upload-status-error` | `--cd-color-danger` | 失败/校验失败色 |
| `--cd-upload-thumb-size` | Global spacing 阶梯 | 图片墙缩略图边长（48/64/80） |
| `--cd-upload-item-gap` | Global spacing 阶梯 | 列表项间距/内边距 |
| `--cd-upload-radius` | `--cd-radius` (Alias) | 卡片/缩略图圆角 |
| `--cd-upload-mask-bg` | Global overlay 黑透明 | 图片墙悬浮遮罩 |

暗色模式：通过 Alias 自动切换（success/danger/border 在暗色主题下重映射），组件层无需分支。

## 6. 无障碍

遵循 WCAG 2.1 AA 与 WAI-ARIA APG（button + list 模式）。

- **触发区**：渲染为原生 `<button>`（或 `role="button"` 的可聚焦元素）触发隐藏 input；`aria-disabled` 反映 `disabled`。拖拽区使用 `role="button"` + `aria-describedby` 指向 `tip` 文案，并明确提供等效的点击选择路径（拖拽不是唯一手段）。
- **隐藏 input**：`<input type="file">` 用视觉隐藏（非 `display:none`，保持可被辅助技术触达），`aria-hidden` 不设，由 label 关联。
- **文件列表**：`<ul role="list">`，每项 `role="listitem"`；删除/重试/预览为带 `aria-label`（含文件名）的按钮，如 `移除 {name}`。
- **进度**：进度条 `role="progressbar"` + `aria-valuenow/valuemin/valuemax`，不确定态省略 `aria-valuenow`。通过 `useLiveAnnouncer`（`aria-live="polite"`）播报“{name} 上传中 60%”“{name} 上传成功”“{name} 上传失败”。
- **键盘**：Tab 进入触发区与各操作按钮；Enter/Space 触发选择；列表内操作按钮可 Tab 到达，Delete/Backspace 在聚焦文件项时移除（可选增强）。
- **焦点管理**：移除某项后焦点移至相邻项或触发区，避免焦点丢失。内置预览浮层用 `useFocusTrap` + `useDismiss`（Esc 关闭，归还触发元素焦点）。
- **对比度**：状态色文本/边框对背景 ≥ 3:1（非文本图形）/ 4.5:1（文本）；error 不仅靠颜色，附图标 + 文案。
- **reduced-motion**：禁用进度/列表过渡动画。
- **RTL**：列表项布局、进度条方向、缩略图遮罩按 `dir` 镜像。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n key；文件大小用 `Intl.NumberFormat`（字节换算后带单位），时间（若展示上传时间）用 `Intl.DateTimeFormat`。

| i18n key | 默认（zh-CN） | 说明 |
|---|---|---|
| `Upload.trigger` | 点击上传 | 触发按钮默认文案 |
| `Upload.dragText` | 点击或拖拽文件到此处上传 | 拖拽区主文案 |
| `Upload.dragHint` | 支持单个或批量上传 | 拖拽区副文案 |
| `Upload.uploading` | 上传中 | 状态 |
| `Upload.success` | 上传成功 | 状态 |
| `Upload.error` | 上传失败 | 状态 |
| `Upload.retry` | 重试 | 操作 |
| `Upload.remove` | 移除 | 操作（aria-label：移除 {name}） |
| `Upload.preview` | 预览 | 操作 |
| `Upload.exceed` | 最多上传 {limit} 个文件 | 数量超限 |
| `Upload.sizeError` | 文件大小不能超过 {size} | 大小超限（size 经 Intl 格式化） |
| `Upload.typeError` | 不支持的文件类型 | 类型校验失败 |
| `Upload.fileSize` | {size} | 文件大小展示（Intl 格式化值占位） |

## 8. 文案

遵循 content-guidelines：动词开头、简洁、句首大写（西文）；避免“非法/错误”等指责性措辞，改为“不支持/超出限制”。

- 触发按钮：动作式短语（“点击上传”），不加句号。
- 校验提示放在文件项内或 `tip` slot，明确限制值（“文件大小不能超过 5 MB”）而非笼统“文件无效”。
- 状态文案保持中性陈述（“上传失败”+ 可选具体原因）。

**危险操作（单列）**：移除已上传成功的文件不弹二次确认（可逆性低但成本低），但若 `value` 为表单关键附件，建议业务侧对“移除”二次确认；删除按钮 `aria-label` 必须含文件名（“移除 报表.xlsx”）以防误删，删除文案使用中性“移除”而非“删除”，避免暗示销毁服务端资源。

## 9. 性能

| 维度 | Budget | 说明 |
|---|---|---|
| gzip 体积（svelte 层） | ≤ 6 KB | 不含图标；核心上传/列表/预览 |
| gzip 体积（core 层） | ≤ 4 KB | 状态机 + 校验 + 传输抽象 |
| gzip 体积（`{ Upload }` 完整入口） | ≤ 9.9 KB | size-limit 口径，含 crop 集成（Modal+Cropper）+ render 家族 + 图标 |
| 大列表渲染 | ≥ 200 项时启用虚拟化（`virtualized` 内部阈值） | list 形态用虚拟滚动，picture 墙按需 |
| 进度更新 | rAF 节流，≤ 16ms/帧合并 progress 事件 | 避免高频 setState 抖动 |
| 缩略图 | `URL.createObjectURL` 惰性生成 + 组件卸载/移除时 `revokeObjectURL` | 防内存泄漏 |
| 预览浮层 | `destroyOnClose` 默认 true | 关闭即卸载大图 DOM |
| 并发 | `concurrency` 默认 3，避免占满连接 | 队列调度 |

运行时关键场景：批量选择 100 文件时，校验异步分批执行不阻塞主线程；progress 通过 rAF 合并；列表 diff 以文件 uid 为 key 避免整列重渲染。

## 10. AI 元数据

提供 `component.meta.ts`，包含：
- `name: 'Upload'`、`category: 'input'`、`stage: 'M2'`、`semiEquivalent: 'Upload'`。
- `props`/`events`/`slots` 的结构化描述（类型、默认值、枚举、是否受控）。
- `tokens`：组件级 token 清单及其 Alias 引用。
- `a11y`：role/aria 摘要、键盘交互表、APG 模式标记（button + list）。
- `i18nKeys`：上方 key 列表。
- `examples`：基础上传 / 拖拽 / 图片墙 / 手动上传 / 自定义请求 五个用法片段（供 AI 生成参考）。
- `dangerousActions: ['remove']` 标注危险操作。

## 11. 测试

- **core 单测（Node）**：状态机迁移（waiting→uploading→success/error、retry 回流）；校验管线（accept/maxSize/minSize/limit/beforeUpload reject 与 transform）；并发调度（concurrency 上限、排队顺序）；abort/pause 行为；dragenter/dragleave 计数。
- **svelte 组件测试**：受控 `value` 同步、`on:change` 派发；选择/拖拽触发链路；进度条 aria 属性；list/picture/avatar 三态渲染；slot 透传（fileItem/tip/preview）。
- **a11y 测试**：axe 无违规；键盘可达（触发、移除、重试、预览）；焦点管理（移除后焦点迁移、预览 focus-trap + Esc 归还）；live region 播报断言。
- **i18n 测试**：无硬编码文案（扫描）；Intl 大小/日期格式化在不同 locale 正确。
- **视觉回归**：三种 listType × 三种 size × 状态（uploading/success/error）快照；drag-over 高亮态；reduced-motion 下无动画。
- **性能测试**：200+ 项虚拟化生效；progress 高频更新帧率；objectURL 释放（无泄漏）断言。

## 12. 验收标准 checklist

- [ ] headless 逻辑位于 `@chenzy-design/core` 的 `createUpload`，渲染在 `@chenzy-design/svelte`，复用 useId/useLiveAnnouncer/useDismiss/useFocusTrap。
- [ ] 类名前缀 `cd-`，BEM-like（`cd-upload`、`cd-upload__item`、`cd-upload--picture` 等）。
- [ ] 仅消费 `--cd-` Alias/Component token，无写死颜色/尺寸值。
- [ ] 受控 API：`value` + `on:change`；预览浮层 `open` + `on:openChange`；`size` 三档；`status` 三态。
- [ ] 支持点击 + 拖拽两种触发，拖拽区有等效点击路径与可见高亮态。
- [ ] 校验（accept/maxSize/minSize/limit/beforeUpload）失败进入 error 项并给出本地化原因，不静默丢弃。
- [ ] 进度（确定/不确定）、success/error/retry/remove/abort 全状态可用。
- [ ] listType 支持 list/picture/avatar，slot 可自定义文件项与预览。
- [ ] WCAG 2.1 AA：role/aria-* 完整，progressbar + live region 播报，键盘全可达，焦点管理正确，reduced-motion/RTL 适配。
- [ ] 所有可见文案走 i18n key，文件大小/日期用 Intl 格式化，零硬编码。
- [ ] 危险操作（remove）文案中性且 aria-label 含文件名，meta 标注 dangerousActions。
- [ ] Perf Budget 达标：svelte ≤6KB / core ≤4KB gzip（完整入口 `{ Upload }` ≤9.9KB，含 crop+render 家族）；大列表虚拟化；progress rAF 节流；objectURL 释放；预览 destroyOnClose。
- [ ] 提供 `component.meta.ts`（props/events/slots/tokens/a11y/i18nKeys/examples/dangerousActions）。
- [ ] core 单测 + 组件测试 + axe a11y + i18n + 视觉回归 + 性能测试全部通过。
