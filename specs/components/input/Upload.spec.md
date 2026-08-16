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
- 文件项状态机（`UploadFileItem.status`，对齐 Semi）：`wait → validating →(fail)validateFail | (pass)uploading → success | uploadFail`。**仅 `uploadFail`（网络/超时失败）可 `retry()` 回到 `wait`；`validateFail`（accept/maxSize/minSize 等校验失败）不可重试**（对齐 Semi FAQ：只有网络原因失败才显示重试）。枚举值：`'wait' | 'validating' | 'uploading' | 'success' | 'validateFail' | 'uploadFail'`（`validating`=异步 beforeUpload/transformFile 进行中的中间态）。
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

> 本表由 `packages/svelte/src/upload/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| fileList | `UploadFileItem[]` | `undefined` | 受控文件列表（对齐 Semi fileList）；提供则受控。UploadFileItem.status：'wait'\|'validating'\|'uploading'\|'success'\|'validateFail'\|'uploadFail'；preview?:boolean 控制缩略图；file 即 Semi fileInstance；项级 showReplace/showRetry 覆盖组件级；response/event/validateMessage 对齐 Semi FileItem |
| defaultFileList | `UploadFileItem[]` | `[]` | 非受控初始文件列表（对齐 Semi defaultFileList） |
| accept | `string` | `undefined` | 接受的文件类型（input accept） |
| multiple | `boolean` | `false` |  |
| directory | `boolean` | `false` | 上传整个目录（webkitdirectory），递归选择目录下所有文件，保留 relativePath（对齐 Semi directory） |
| limit | `number` | `undefined` | 最大文件数；超出触发 onExceed；limit=1 替换语义 |
| maxSize | `number` | `undefined` | 单文件最大体积（KB）；超限标 validateFail（对齐 Semi maxSize） |
| minSize | `number` | `undefined` | 单文件最小体积（KB）；过小标 validateFail（对齐 Semi minSize） |
| disabled | `boolean` | `false` |  |
| validateStatus | `'default'\|'error'\|'warning'\|'success'` | `'default'` | 组件级校验态（表单联动，影响上传区/边框色）。对齐 Semi validateStatus，枚举含 success |
| listType | `'list'\|'picture'\|'none'` | `'list'` | 文件列表展示类型（对齐 Semi listType）：list 文本卡片、picture 照片墙、none 不渲染列表 |
| draggable | `boolean` | `false` | true 渲染拖拽区，false 渲染按钮（对齐 Semi draggable） |
| action | `string` | `undefined` | 上传地址；有则选文件后自动 XHR 上传 |
| name | `string` | `undefined` | 表单字段名（对齐 Semi name）。回退链 `name \|\| fileName \|\| fileInstance.name` |
| fileName | `string` | `undefined` | 同 name，避免 Form.Upload 中 props.name 冲突（对齐 Semi fileName）；name 未传时回退到此 |
| headers | `Record<string,string> \| ((file: File) => Record<string,string>)` | `undefined` | 额外请求头；静态对象或按当前 file 求值的函数（对齐 Semi headers） |
| data | `Record<string,string> \| ((file: File) => Record<string,string>)` | `undefined` | 额外表单字段；静态对象或按当前 file 求值的函数（对齐 Semi data） |
| beforeUpload | `(props: { file, fileList }) => boolean \| BeforeUploadObjectResult \| Promise<...>` | `undefined` | 上传前钩子（对齐 Semi beforeUpload）：入参 { file, fileList }。返回 false 拒绝；true/undefined 上传；返回富对象 BeforeUploadObjectResult（shouldUpload/autoRemove/status/validateMessage/fileInstance）精细控制。支持异步 |
| customRequest | `(args: CustomRequestArgs) => void \| Promise<void>` | `undefined` | 自定义上传实现（对齐 Semi customRequest，优先于 action）。入参含 fileName/data/file/fileInstance/onProgress/onError/onSuccess/withCredentials/action 完整字段（对齐 Semi customRequestArgs） |
| afterUpload | `(props: { response, file, fileList }) => AfterUploadResult \| void` | `undefined` | 上传成功后钩子（同步返回）：据返回值改该项 status/validateMessage/name/url 或 autoRemove（对齐 Semi afterUpload） |
| onChange | `(props: { fileList, currentFile }) => void` | `undefined` | 文件列表变化回调（对齐 Semi onChange，入参 { fileList, currentFile }） |
| onExceed | `(files: File[]) => void` | `undefined` |  |
| onSuccess | `(responseBody, file, fileList) => void` | `undefined` | 上传成功回调（对齐 Semi onSuccess(responseBody, file, fileList)） |
| onError | `(error, file, fileList, xhr) => void` | `undefined` | 上传失败回调（对齐 Semi onError(error, file, fileList, xhr)） |
| onProgress | `(percent, file, fileList) => void` | `undefined` | 上传进度回调（仅内置 XHR 上传，对齐 Semi onProgress(percent, file, fileList)） |
| children | `Snippet` | `undefined` | 自定义触发器/拖拽区内容 |
| showRetry | `boolean` | `true` | 上传失败是否显示重试按钮（对齐 Semi showRetry） |
| showReplace | `boolean` | `false` | 已上传（success）项显示替换按钮（对齐 Semi showReplace）；list/picture 均支持 |
| showUploadList | `boolean` | `true` | 是否渲染文件列表（对齐 Semi showUploadList） |
| showClear | `boolean` | `true` | 是否显示批量清除按钮（对齐 Semi showClear 默认 true） |
| onClear | `() => void` | `undefined` | 清除按钮点击回调 |
| beforeClear | `(fileList) => boolean \| Promise<boolean>` | `undefined` | 批量清除前钩子（对齐 Semi beforeClear） |
| fileListTitle | `string \| false \| Snippet<[{ fileList, onClear, clearText }]>` | `undefined` | 文件列表标题：string=替换标题文字；false=不渲染；Snippet=完全自定义（对齐 Semi fileListTitle） |
| showTooltip | `boolean \| { type?: 'tooltip'\|'popover'; opts?; renderTooltip? }` | `true` | 文件名超长提示（对齐 Semi showTooltip），经 Typography.Text ellipsis 消费 |
| prompt | `string \| Snippet` | `undefined` | 上传区提示内容（对齐 Semi prompt） |
| promptPosition | `'left'\|'right'\|'bottom'` | `'right'` | 提示位置（对齐 Semi promptPosition，默认 right） |
| onDrop | `(e, files, fileList) => void` | `undefined` | 拖拽放下回调（对齐 Semi onDrop(e, files, fileList)） |
| onOpenFileDialog | `() => void` | `undefined` |  |
| onPreviewClick | `(fileItem: UploadFileItem) => void` | `undefined` | 预览图/卡片点击回调 |
| onAcceptInvalid | `(files: File[]) => void` | `undefined` | accept 校验失败回调（对齐 Semi onAcceptInvalid） |
| onRetry | `(fileItem: UploadFileItem) => void` | `undefined` |  |
| onSizeError | `(file, fileList) => void` | `undefined` | 大小校验失败回调（对齐 Semi onSizeError(file, fileList)） |
| validateMessage | `string` | `undefined` | 校验失败统一文案（对齐 Semi validateMessage） |
| withCredentials | `boolean` | `false` |  |
| transformFile | `(file: File) => File \| Promise<File>` | `undefined` | 上传前文件转换（对齐 Semi transformFile） |
| dragIcon | `Snippet` | `undefined` | 拖拽区自定义图标；未传默认云上传图标 |
| dragMainText | `string \| Snippet` | `undefined` | 拖拽区主文案 |
| dragSubText | `string \| Snippet` | `undefined` | 拖拽区副文案 |
| addOnPasting | `boolean` | `false` | 粘贴添加文件（对齐 Semi addOnPasting） |
| onPastingError | `(error: unknown) => void` | `undefined` | 粘贴上传出错回调（对齐 Semi onPastingError） |
| hotSpotLocation | `'start'\|'end'` | `'end'` | 照片墙添加瓦片位置（对齐 Semi hotSpotLocation，默认 end） |
| onFileChange | `(files: File[]) => void` | `undefined` | 选中原始 File 列表变化回调（对齐 Semi onFileChange） |
| beforeRemove | `(file, fileList) => boolean \| Promise<boolean>` | `undefined` | 移除前钩子（对齐 Semi beforeRemove） |
| onRemove | `(currentFile, fileList, currentFileItem) => void` | `undefined` | 移除后回调（对齐 Semi onRemove） |
| timeout | `number` | `0` | 单文件上传超时（毫秒），>0 启用 |
| uploadTrigger | `'auto' \| 'custom'` | `'auto'` | 上传触发时机（对齐 Semi uploadTrigger）：auto 选即传；custom 停 wait 需 upload() 触发 |
| itemStyle | `string \| Record<string, string \| number>` | `undefined` | 每个文件卡片自定义 style（对齐 Semi itemStyle） |
| picWidth | `number \| string` | `undefined` | 照片墙缩略图宽度（对齐 Semi picWidth，number→px） |
| picHeight | `number \| string` | `undefined` | 照片墙缩略图高度（对齐 Semi picHeight，number→px） |
| capture | `boolean \| 'user' \| 'environment'` | `undefined` | 透传给 file input 的 capture 属性（对齐 Semi capture） |
| crop | `boolean \| UploadCropProps` | `false` | 启用图片裁切：image/* 文件先进裁切弹窗（Modal+Cropper）（对齐 Semi crop） |
| beforeCrop | `(file: File, fileList: File[]) => boolean \| Promise<boolean>` | `undefined` | 裁切前钩子（对齐 Semi beforeCrop(file, fileList)） |
| onCropError | `(err: unknown) => void` | `undefined` | 裁切失败回调（对齐 Semi onCropError） |
| cropModalProps | `Record<string, unknown>` | `undefined` | 透传给裁切 Modal 的额外 props（对齐 Semi cropModalProps） |
| renderFileItem | `Snippet<[RenderFileItemProps]>` | `undefined` | 完全自定义单个文件项渲染（替换 FileCard）。入参对齐 Semi RenderFileItemProps（index/listType/onRemove/onRetry/onReplace/onPreviewClick…） |
| previewFile | `Snippet<[RenderFileItemProps]>` | `undefined` | 自定义缩略图预览内容（对齐 Semi previewFile） |
| renderThumbnail | `Snippet<[RenderFileItemProps]>` | `undefined` | 自定义整个缩略图容器（picture，对齐 Semi renderThumbnail） |
| showPicInfo | `boolean` | `false` | 照片墙图片信息浮层（序号，对齐 Semi showPicInfo） |
| renderPicInfo | `Snippet<[RenderFileItemProps]>` | `undefined` | 自定义照片墙信息浮层（对齐 Semi renderPicInfo） |
| renderPicPreviewIcon | `Snippet<[RenderFileItemProps]>` | `undefined` | 自定义照片墙 hover 预览图标（对齐 Semi renderPicPreviewIcon） |
| renderPicClose | `Snippet<[{ className, remove }]>` | `undefined` | 自定义照片墙关闭按钮（对齐 Semi renderPicClose） |
| renderFileOperation | `Snippet<[RenderFileItemProps]>` | `undefined` | 自定义文件条操作区（list，对齐 Semi renderFileOperation） |
| class | `string` | `undefined` | 根容器额外 class（对齐 Semi className） |
| style | `string` | `undefined` | 根容器 style（对齐 Semi style） |

**子组件**：`FileCard`

> `showUploadList`（见上表）默认 `true`；`false` 时不渲染列表区（text 列表/picture 网格），但触发器与上传逻辑照常。

### Methods（命令式，via `bind:this`）

| Method | 类型 | 说明 |
|---|---|---|
| `upload` | `() => void` | 手动触发上传（配合 `uploadTrigger='custom'`），批量上传所有 ready 文件。对标 Semi `ref.upload` |
| `insert` | `(files: File[], index?: number) => void` | 命令式插入文件到指定 `index`（不传则末尾），走完整 accept/limit/校验/上传管线。`limit=1` 时同替换语义。对标 Semi insert |
| `openFileDialog` | `() => void` | 命令式打开文件选择器（等价点击触发器）。对标 Semi openFileDialog |
| `clear` | `() => void` | 命令式清空文件列表（对标 Semi `ref.clear`），走 `beforeClear` 钩子 |
| `remove` | `(fileItem: UploadFileItem) => void` | 命令式移除指定文件项（对标 Semi `ref.remove`，入参为完整文件项对象而非 uid） |

> `addFiles` 已删除（Semi 无对应方法，语义与 `insert` 不传 `index` 完全等价，统一改用 `insert`）。

> renderThumbnail vs previewFile：`previewFile` 只替换缩略图内容（默认操作/信息浮层保留）；`renderThumbnail` 接管整个缩略图区域（含图片本身），二者互斥（renderThumbnail 优先）。

### UploadFileItem（`value` / `defaultValue` 元素类型）

| 字段 | 类型 | 说明 |
|---|---|---|
| `uid` | `string` | 唯一标识（列表 diff key） |
| `name` | `string` | 文件名 |
| `size` | `number` | 字节体积（**与 Semi 差异**：Semi 为 `string`，本仓库用 `number` 更便于计算，展示时格式化） |
| `status` | `'wait' \| 'validating' \| 'uploading' \| 'success' \| 'validateFail' \| 'uploadFail'` | 上传状态（对齐 Semi FileItemStatus）。`validating`=异步校验中；`validateFail`=校验失败不可重试；`uploadFail`=网络失败可重试 |
| `percent` | `number?` | 上传进度百分比 |
| `file` | `File?` | 原始 File。对标 Semi `fileInstance`（本仓库统一命名 `file`，二者等价——Semi demo 读 `fileItem.fileInstance` 处改用 `fileItem.file`） |
| `preview` | `boolean?` | 是否启用缩略图预览（对标 Semi preview）。`true` 或有 `url` 时显示缩略图；显式 `false` 禁用预览（即便有 url） |
| `url` | `string?` | 远程预览地址（image/picture-card 优先用它，否则由 `file` 生成 objectURL） |
| `error` | `string?` | 校验失败提示（`status==='validateFail'` / 超时时展示） |
| `validateMessage` | `string?` | 校验/上传信息文案（对标 Semi validateMessage）。与 `error` 等价并存，展示时 `validateMessage` 优先 |
| `showReplace` | `boolean?` | 项级：单独控制该项 success 态是否显示替换按钮（覆盖组件级，对标 Semi FileItem.showReplace） |
| `showRetry` | `boolean?` | 项级：单独控制该项 uploadFail 态是否显示重试按钮（覆盖组件级，对标 Semi FileItem.showRetry） |
| `response` | `unknown?` | 服务端响应体（对标 Semi FileItem.response）。XHR success 后写入（优先解析 JSON） |
| `event` | `Event?` | 关联 XHR 事件（对标 Semi FileItem.event）。失败时写入原始事件 |
| `relativePath` | `string?` | 目录上传时的相对路径（webkitRelativePath） |

### Events

> 本组件无事件回调 prop（meta.events 为空）。此前本表列的回调均未实现，已删。

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

> 本表由 `packages/locale/src/zh_CN.ts` 真源生成（2026-07-30 重校）。键名与键值都是 Semi 契约，勿手写「规划中」的键——历史上本表列过大量从未实现的键名，见 [[locale-dangling-keys-render-raw-key]]。

| i18n key | 默认（zh-CN） |
| --- | --- |
| `Upload.trigger` | 选择文件 |
| `Upload.mainText` | 点击上传文件或拖拽文件到这里 |
| `Upload.sizeError` | 文件大小不能超过 {size} |
| `Upload.minSizeError` | 文件大小不能小于 {size} |
| `Upload.remove` | 移除 |
| `Upload.retry` | 重试 |
| `Upload.replace` | 替换 |
| `Upload.clear` | 清空 |
| `Upload.announceUploading` | {name} 上传中 {percent}% |
| `Upload.announceSuccess` | {name} 上传成功 |
| `Upload.announceError` | {name} 上传失败 |
| `Upload.cropTitle` | 裁切图片 |
| `Upload.timeoutError` | 上传超时 |
| `Upload.legalTips` | 松开鼠标开始上传 |
| `Upload.selectedFiles` | 已选择文件 |
| `Upload.fail` | 上传失败 |

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
| gzip 体积（`{ Upload }` 完整入口） | ≤ 13 KB | size-limit 口径，含 crop（Modal+Cropper）+ render 家族 + Tooltip/Popover（showTooltip）+ Icon（拖拽/预览图标）+ 预览盒/legal 态。2026-07 按实测 11.69KB + 余量校准 |
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
- [ ] 类名前缀 `cd-`，BEM-like（`cd-upload`、`cd-upload-file-card`、`cd-upload-picture` 等）。
- [ ] 仅消费 `--cd-` Alias/Component token，无写死颜色/尺寸值。
- [ ] 受控 API：`value` + `on:change`；预览浮层 `open` + `on:openChange`；`size` 三档；`status` 三态。
- [ ] 支持点击 + 拖拽两种触发，拖拽区有等效点击路径与可见高亮态。
- [ ] 校验（accept/maxSize/minSize/limit/beforeUpload）失败进入 error 项并给出本地化原因，不静默丢弃。
- [ ] 进度（确定/不确定）、success/error/retry/remove/abort 全状态可用。
- [ ] listType 支持 list/picture/avatar，slot 可自定义文件项与预览。
- [ ] WCAG 2.1 AA：role/aria-* 完整，progressbar + live region 播报，键盘全可达，焦点管理正确，reduced-motion/RTL 适配。
- [ ] 所有可见文案走 i18n key，文件大小/日期用 Intl 格式化，零硬编码。
- [ ] 危险操作（remove）文案中性且 aria-label 含文件名，meta 标注 dangerousActions。
- [ ] Perf Budget 达标：svelte ≤6KB / core ≤4KB gzip（完整入口 `{ Upload }` ≤13KB，含 crop+render 家族+Tooltip/Popover+Icon+预览盒/legal）；大列表虚拟化；progress rAF 节流；objectURL 释放；预览 destroyOnClose。
- [ ] 提供 `component.meta.ts`（props/events/slots/tokens/a11y/i18nKeys/examples/dangerousActions）。
- [ ] core 单测 + 组件测试 + axe a11y + i18n + 视觉回归 + 性能测试全部通过。
