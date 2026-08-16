---
title: Upload 上传
name: upload
category: input
brief: 文件选择上传。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/upload/01-basic.svelte';
  import basicSrc from '../../demos/upload/01-basic.svelte?raw';
  import Tooltip from '../../demos/upload/02-tooltip.svelte';
  import tooltipSrc from '../../demos/upload/02-tooltip.svelte?raw';
  import Prompt from '../../demos/upload/03-prompt.svelte';
  import promptSrc from '../../demos/upload/03-prompt.svelte?raw';
  import AvatarTrigger from '../../demos/upload/04-avatar-trigger.svelte';
  import avatarTriggerSrc from '../../demos/upload/04-avatar-trigger.svelte?raw';
  import UploadData from '../../demos/upload/05-upload-data.svelte';
  import uploadDataSrc from '../../demos/upload/05-upload-data.svelte?raw';
  import FileType from '../../demos/upload/06-file-type.svelte';
  import fileTypeSrc from '../../demos/upload/06-file-type.svelte?raw';
  import Directory from '../../demos/upload/07-directory.svelte';
  import directorySrc from '../../demos/upload/07-directory.svelte?raw';
  import Multiple from '../../demos/upload/08-multiple.svelte';
  import multipleSrc from '../../demos/upload/08-multiple.svelte?raw';
  import LimitAccept from '../../demos/upload/09-limit-accept.svelte';
  import limitAcceptSrc from '../../demos/upload/09-limit-accept.svelte?raw';
  import MinMaxSize from '../../demos/upload/10-min-max-size.svelte';
  import minMaxSizeSrc from '../../demos/upload/10-min-max-size.svelte?raw';
  import RenderFileOperation from '../../demos/upload/11-render-file-operation.svelte';
  import renderFileOperationSrc from '../../demos/upload/11-render-file-operation.svelte?raw';
  import FileListTitle from '../../demos/upload/12-file-list-title.svelte';
  import fileListTitleSrc from '../../demos/upload/12-file-list-title.svelte?raw';
  import PreviewFile from '../../demos/upload/13-preview-file.svelte';
  import previewFileSrc from '../../demos/upload/13-preview-file.svelte?raw';
  import DefaultList from '../../demos/upload/14-default-list.svelte';
  import defaultListSrc from '../../demos/upload/14-default-list.svelte?raw';
  import Controlled from '../../demos/upload/15-controlled.svelte';
  import controlledSrc from '../../demos/upload/15-controlled.svelte?raw';
  import PictureCard from '../../demos/upload/16-picture-card.svelte';
  import pictureCardSrc from '../../demos/upload/16-picture-card.svelte?raw';
  import PicturePreview from '../../demos/upload/17-picture-preview.svelte';
  import picturePreviewSrc from '../../demos/upload/17-picture-preview.svelte?raw';
  import PicSize from '../../demos/upload/18-pic-size.svelte';
  import picSizeSrc from '../../demos/upload/18-pic-size.svelte?raw';
  import Disabled from '../../demos/upload/19-disabled.svelte';
  import disabledSrc from '../../demos/upload/19-disabled.svelte?raw';
  import Manual from '../../demos/upload/20-manual.svelte';
  import manualSrc from '../../demos/upload/20-manual.svelte?raw';
  import Drag from '../../demos/upload/21-drag.svelte';
  import dragSrc from '../../demos/upload/21-drag.svelte?raw';
  import BeforeUpload from '../../demos/upload/22-before-upload.svelte';
  import beforeUploadSrc from '../../demos/upload/22-before-upload.svelte?raw';
  import AfterUpload from '../../demos/upload/23-after-upload.svelte';
  import afterUploadSrc from '../../demos/upload/23-after-upload.svelte?raw';
  import CustomRequest from '../../demos/upload/24-custom-request.svelte';
  import customRequestSrc from '../../demos/upload/24-custom-request.svelte?raw';
  import Crop from '../../demos/upload/25-crop.svelte';
  import cropSrc from '../../demos/upload/25-crop.svelte?raw';
  import CropCustomConfig from '../../demos/upload/26-crop-custom-config.svelte';
  import cropCustomConfigSrc from '../../demos/upload/26-crop-custom-config.svelte?raw';
  import CropRound from '../../demos/upload/27-crop-round.svelte';
  import cropRoundSrc from '../../demos/upload/27-crop-round.svelte?raw';
  import CropBeforeConfirm from '../../demos/upload/28-crop-before-confirm.svelte';
  import cropBeforeConfirmSrc from '../../demos/upload/28-crop-before-confirm.svelte?raw';
  import CropDrag from '../../demos/upload/29-crop-drag.svelte';
  import cropDragSrc from '../../demos/upload/29-crop-drag.svelte?raw';
  import CropModalProps from '../../demos/upload/30-crop-modal-props.svelte';
  import cropModalPropsSrc from '../../demos/upload/30-crop-modal-props.svelte?raw';
  import FailRetry from '../../demos/upload/31-fail-retry.svelte';
  import failRetrySrc from '../../demos/upload/31-fail-retry.svelte?raw';
  import ReplaceHideList from '../../demos/upload/32-replace-hide-list.svelte';
  import replaceHideListSrc from '../../demos/upload/32-replace-hide-list.svelte?raw';
  import OnProgress from '../../demos/upload/33-on-progress.svelte';
  import onProgressSrc from '../../demos/upload/33-on-progress.svelte?raw';
  import Imperative from '../../demos/upload/34-imperative.svelte';
  import imperativeSrc from '../../demos/upload/34-imperative.svelte?raw';
  import ClearConfirm from '../../demos/upload/35-clear-confirm.svelte';
  import clearConfirmSrc from '../../demos/upload/35-clear-confirm.svelte?raw';
  import RenderFileItem from '../../demos/upload/36-render-file-item.svelte';
  import renderFileItemSrc from '../../demos/upload/36-render-file-item.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Upload } from '@chenzy-design/svelte';
```

### 基本

最基本的用法，在 children 内放置一个 Button，点击 children 内容激活文件选择框，选择完成后自动开始上传。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 文件名超长省略

通过 `showTooltip` 属性，自定义设置文件名弹出提示。

<DemoBox code={tooltipSrc}><Tooltip /></DemoBox>

### 添加提示文本

通过 `prompt` 插槽设置自定义提示文本，通过 `promptPosition` 设置插槽位置，可选 `left`、`right`、`bottom`，默认为 `right`。当 listType 为 picture 时，promptPosition 位置的参照对象为图片墙列表整体。

<DemoBox code={promptSrc}><Prompt /></DemoBox>

### 点击头像触发上传

<DemoBox code={avatarTriggerSrc}><AvatarTrigger /></DemoBox>

### 自定义上传属性

通过设置 `data`、`headers` 可添加自定义上传属性。

<DemoBox code={uploadDataSrc}><UploadData /></DemoBox>

### 上传文件类型

通过 `accept` 属性（`input` 的原生 `html` 属性）可以限制上传的文件类型。`accept` 支持传入文件后缀名集合（推荐，如 `.jpg`、`.png`）或文件类型的 MIME types 集合。

<Notice type="primary" title="注意事项">Upload 会在内部拦截掉不符合 accept 格式的文件，当拦截到不符合格式要求的文件时，会触发 onAcceptInvalid 方法；accept 使用后缀可以避免因为浏览器或者操作系统的不同导致 file.type 与 MIME 不兼容问题。</Notice>

<DemoBox code={fileTypeSrc}><FileType /></DemoBox>

### 上传文件夹

通过传入 `directory` 为 `true`，可以支持上传文件夹下的所有文件。

<DemoBox code={directorySrc}><Directory /></DemoBox>

### 一次选中多个文件

通过设置 `multiple` 属性可以支持同时选中多个文件上传。

<DemoBox code={multipleSrc}><Multiple /></DemoBox>

### 限制文件总数量

通过设置 `limit` 属性可以限制最大可上传的文件数。当 `limit` 为 1 时，始终用最新上传的代替当前，并不会触发 onExceed 回调。照片墙模式下，当已上传文件数量等于 limit 时，会自动隐藏上传入口。

<DemoBox code={limitAcceptSrc}><LimitAccept /></DemoBox>

### 限制上传文件大小

通过 `maxSize` 和 `minSize` 属性可以自定义上传文件大小的限制（单位 KB），通过设置 `onSizeError` 可以设置超出限制时的回调。

<DemoBox code={minMaxSizeSrc}><MinMaxSize /></DemoBox>

### 自定义列表操作区

`listType` 为 `list` 时，可以通过传入 `renderFileOperation` 来自定义列表操作区。

<DemoBox code={renderFileOperationSrc}><RenderFileOperation /></DemoBox>

### 自定义文件列表标题

`listType` 为 `list` 时，可以通过 `fileListTitle` 自定义文件列表顶部的标题区域。支持两种形式：传入字符串或节点时仅替换标题文字，清空按钮保持默认样式；传入函数时可以完全自定义标题区域（包括清空按钮），函数接收 `fileList`、`onClear`、`clearText` 参数。

<DemoBox code={fileListTitleSrc}><FileListTitle /></DemoBox>

### 自定义预览逻辑

`listType` 为 `list` 时，可以通过传入 `previewFile` 自定义预览逻辑。例如不需要对图片类型进行缩略图预览时，可以在 `previewFile` 中恒定返回一个图标；假如希望点击图片时放大预览，则可以结合 `renderFileOperation` 放置一些自定义元素（如图标）实现点击放大。

<DemoBox code={previewFileSrc}><PreviewFile /></DemoBox>

### 默认文件列表

通过 `defaultFileList` 可以展示已上传的文件。当需要预览默认文件的缩略图时，可以将对应 item 的 `preview` 属性设为 `true`。

<Notice type="primary" title="注意事项">defaultFileList 中 uid 必须唯一，不可重复。</Notice>

<DemoBox code={defaultListSrc}><DefaultList /></DemoBox>

### 受控组件

当传入 `fileList` 时，作为受控组件使用。需要监听 `onChange` 回调，并且将 fileList 回传给 Upload（注意需传入一个新的数组对象）。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 图片墙

设置 `listType="picture"`，用户可以上传图片并在列表中显示缩略图。如果通过 defaultFileList 或 fileList 设置已上传的文件列表时，会自动读取对象数组中的 url 属性用于展示图片。设置 `showPicInfo`，可以查看图片基础信息。

<DemoBox code={pictureCardSrc}><PictureCard /></DemoBox>

### 图片墙放大预览

配合 Image 组件，通过 `renderThumbnail` 可以实现点击图片放大预览。也可以通过 `renderPicPreviewIcon`、`onPreviewClick` 来自定义预览图标；当显示替换图标 `showReplace` 时，不会再显示预览图标。

<DemoBox code={picturePreviewSrc}><PicturePreview /></DemoBox>

### 图片墙设置宽高

通过设置 `picHeight`、`picWidth`（v2.42 后提供），可以统一设置图片墙元素的宽高。如果同时使用 `renderThumbnail` 返回 Image 组件来实现点击放大预览，需要同时指定 Image 组件的 width 和 height。设置 `hotSpotLocation` 自定义点击热区的顺序，默认在照片墙列表结尾。

<DemoBox code={picSizeSrc}><PicSize /></DemoBox>

### 禁用

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 手动触发上传

`uploadTrigger='custom'`，选中文件后将不会自动触发上传。需要手动调用实例上的 `upload` 方法触发。

<DemoBox code={manualSrc}><Manual /></DemoBox>

### 拖拽上传

`draggable={true}`，可以使用拖拽功能。可以通过 `dragIcon`、`dragMainText`、`dragSubText` 快捷设置拖拽区内容，还可以通过 `children` 完全自定义拖拽区的显示。

<Notice type="primary" title="注意事项">在 directory 为 true 的情况下，因为浏览器自动做了限制，所以点击上传时不允许选单个文件，拖拽时我们认为同时允许文件夹、文件都能拖动更合理，所以不做另外的拦截处理。</Notice>

<DemoBox code={dragSrc}><Drag /></DemoBox>

### 上传前自定义校验

可通过 `beforeUpload` 钩子，对文件状态进行更新。这是在网络上传前、选择文件后进行校验，同步校验时需返回 boolean 或对象，异步校验时需返回 Promise，Promise resolve 代表校验通过，reject 代表校验失败。也可通过 `transformFile` 对文件进行自定义转换处理。

<DemoBox code={beforeUploadSrc}><BeforeUpload /></DemoBox>

### 上传后更新文件信息

可以通过 `afterUpload` 钩子，对文件状态、校验信息、文件名进行更新。afterUpload 在上传完成后且没有发生错误的情况下触发，需返回一个对象（不支持异步返回）。

<DemoBox code={afterUploadSrc}><AfterUpload /></DemoBox>

### 自定义请求

当传入 `customRequest` 时，相当于使用自定义的请求方法替换了 upload 内置的 xhr 请求，用户需自行接管上传行为，并在适当的时候调用入参中的 onProgress、onError、onSuccess 更新组件内部状态。

<DemoBox code={customRequestSrc}><CustomRequest /></DemoBox>

### 图片裁切

通过 `crop` 属性启用图片裁切功能。支持点击选择、拖拽、粘贴、替换文件时进行裁切。

#### 基本用法

设置 `crop={true}` 启用默认裁切配置。

<DemoBox code={cropSrc}><Crop /></DemoBox>

#### 自定义裁切配置

通过对象形式配置裁切参数，包括宽高比、形状、质量等。

<DemoBox code={cropCustomConfigSrc}><CropCustomConfig /></DemoBox>

#### 圆形裁切

适用于头像上传场景，设置 `shape: 'round'` 启用圆形裁切。

<DemoBox code={cropRoundSrc}><CropRound /></DemoBox>

#### 裁切前确认

通过 `beforeCrop` 回调，在裁切前进行确认或其他处理。返回 `false` 可跳过裁切直接上传。

<DemoBox code={cropBeforeConfirmSrc}><CropBeforeConfirm /></DemoBox>

#### 拖拽上传裁切

拖拽上传时也会触发裁切功能。

<DemoBox code={cropDragSrc}><CropDrag /></DemoBox>

#### 自定义裁切弹窗样式

通过 `cropModalProps` 自定义裁切弹窗的样式和属性。

<DemoBox code={cropModalPropsSrc}><CropModalProps /></DemoBox>

### 失败态与重试

> 本节为本库补充演示，Semi 官方文档无对应章节（能力本身来自 Semi showRetry/status 契约）。

上传失败时展示失败卡片，`showRetry` 为 true 且失败由网络原因导致时，hover 展示重试按钮。

<DemoBox code={failRetrySrc}><FailRetry /></DemoBox>

### 替换与隐藏列表

> 本节为本库补充演示，Semi 官方文档无对应章节（能力本身来自 Semi showReplace/showUploadList 契约）。

`showReplace` 为 true 且文件状态为已上传时，展示替换按钮；`showUploadList={false}` 可隐藏文件列表。

<DemoBox code={replaceHideListSrc}><ReplaceHideList /></DemoBox>

### 进度回调

> 本节为本库补充演示，Semi 官方文档无对应章节（能力本身来自 Semi onProgress 契约）。

通过 `onProgress` 回调获取上传进度百分比。

<DemoBox code={onProgressSrc}><OnProgress /></DemoBox>

### 命令式操作

> 本节为本库补充演示，Semi 官方文档无对应章节（能力本身来自 Semi ref insert/openFileDialog/clear/remove 契约）。

通过 `bind:this` 拿到实例后，可以调用 `insert`（上传文件，可指定插入位置）、`openFileDialog`（打开文件选择窗口）、`clear`（清空文件列表）、`remove`（移除指定文件项）等方法。

<DemoBox code={imperativeSrc}><Imperative /></DemoBox>

### 批量清空确认

> 本节为本库补充演示，Semi 官方文档无对应章节（能力本身来自 Semi showClear/beforeClear 契约）。

`showClear` 展示清空按钮，通过 `beforeClear` 在清空文件前进行二次确认。

<DemoBox code={clearConfirmSrc}><ClearConfirm /></DemoBox>

### 完全自定义列表项

> 本节为本库补充演示，Semi 官方文档无对应章节（能力本身来自 Semi renderFileItem/showPicInfo/renderPicInfo 契约）。

通过 `renderFileItem` 完全自定义 fileCard 的渲染；照片墙模式下可用 `showPicInfo`、`renderPicInfo` 自定义图片信息。

<DemoBox code={renderFileItemSrc}><RenderFileItem /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| accept | html 原生属性，接受上传的文件类型（MIME types 字符串或文件后缀） | string | - |
| action | 文件上传地址，必填 | string | - |
| addOnPasting | 按下 ctrl/command + v 时，是否自动将剪贴板中的文件添加至 fileList（仅支持图片类型） | boolean | false |
| afterUpload | 文件上传后的钩子，根据 return 的 object 更新文件状态 | `(props) => afterUploadResult` | - |
| beforeClear | 清空文件前回调，返回 false / Promise.resolve(false) / Promise.reject() 会阻止移除 | `(fileList) => boolean \| Promise` | - |
| beforeCrop | 图片裁切前的回调，返回 false 可跳过裁切直接上传 | `(file, fileList) => boolean \| Promise` | - |
| beforeRemove | 移除文件前的回调，返回 false / Promise.resolve(false) / Promise.reject() 会阻止移除 | `(file, fileList) => boolean \| Promise` | - |
| beforeUpload | 上传文件前的钩子，根据 return 的 object 更新文件状态，控制是否上传 | `(props) => beforeUploadResult \| Promise \| boolean` | - |
| capture | 文件上传控件中媒体拍摄的方式 | `boolean \| string` | - |
| class | 类名 | string | - |
| crop | 启用图片裁切功能，传入 true 使用默认配置，传入对象可自定义裁切参数 | `boolean \| CropProps` | - |
| cropModalProps | 自定义裁切弹窗的属性 | object | - |
| customRequest | 自定义上传使用的异步请求方法 | `(args) => void` | - |
| data | 上传时附带的额外参数或返回上传额外参数的方法 | `object \| ((file) => object)` | `{}` |
| defaultFileList | 已上传的文件列表 | `FileItem[]` | `[]` |
| directory | 文件夹类型上传 | boolean | false |
| disabled | 是否禁用 | boolean | false |
| dragIcon | 拖拽区左侧 Icon | Snippet | IconUpload |
| dragMainText | 拖拽区主文本 | `string \| Snippet` | 点击上传文件或拖拽文件到这里 |
| dragSubText | 拖拽区帮助文本 | `string \| Snippet` | - |
| draggable | 是否支持拖拽上传 | boolean | false |
| fileList | 已上传的文件列表，传入时 upload 即为受控组件 | `FileItem[]` | - |
| fileListTitle | 自定义文件列表标题区域，传入节点仅替换标题文字，传入函数可完全自定义 | `string \| Snippet \| ((props) => node)` | - |
| fileName | 作用与 name 相同，主要在 Form.Upload 中使用；为避免与 Field 的 props.name 冲突提供的重命名 props | string | - |
| headers | 上传时附带的 headers 或返回上传额外 headers 的方法 | `object \| ((file) => object)` | `{}` |
| hotSpotLocation | 照片墙点击热区的放置位置，可选 `start`、`end` | string | end |
| itemStyle | fileCard 的内联样式 | string | - |
| limit | 最大允许上传文件个数 | number | - |
| listType | 文件列表展示类型，可选 `picture`、`list` | string | list |
| maxSize | 文件体积最大限制，单位 KB | number | - |
| minSize | 文件体积最小限制，单位 KB | number | - |
| multiple | 是否允许单次选中多个文件 | boolean | false |
| name | 上传时使用的文件名 | string | - |
| onPastingError | `addOnPasting` 为 true 时，粘贴读取失败时的回调 | `(error) => void` | - |
| picHeight | 图片墙模式下定制图片展示高度 | `string \| number` | - |
| picWidth | 图片墙模式下定制图片展示宽度 | `string \| number` | - |
| previewFile | 自定义预览逻辑，该函数返回内容将替换原缩略图 | `(fileItem) => node` | - |
| prompt | 自定义插槽，可用于插入提示文本，点击时不会触发上传 | Snippet | - |
| promptPosition | 提示文本的位置，可选 `left`、`right`、`bottom` | string | right |
| renderFileItem | fileCard 的自定义渲染 | `(props) => node` | - |
| renderFileOperation | 自定义列表项操作区 | `(props) => node` | - |
| renderPicClose | 自定义照片墙 close 按钮，只在照片墙模式下有效 | `(props) => node` | - |
| renderPicInfo | 自定义照片墙信息，只在照片墙模式下有效 | `(props) => node` | - |
| renderPicPreviewIcon | 自定义照片墙 hover 时展示的预览图标，只在照片墙模式下有效 | `(props) => node` | - |
| renderThumbnail | 自定义图片墙缩略图，只在照片墙模式下有效 | `(props) => node` | - |
| showClear | limit 不为 1 且当前已上传文件数大于 1 时，是否展示清空按钮 | boolean | true |
| showPicInfo | 是否显示图片信息，只在照片墙模式下有效 | boolean | false |
| showReplace | 上传成功时，是否在 fileCard 内部展示替换按钮 | boolean | false |
| showRetry | 上传失败时，是否在 fileCard 内部展示重试按钮 | boolean | true |
| showTooltip | 文件名超长时，是否展示 tooltip 及相关配置 | `boolean \| object` | true |
| showUploadList | 是否显示文件列表 | boolean | true |
| style | 样式 | string | - |
| transformFile | 选中文件后、上传文件前的回调，可用于对文件进行自定义转换处理 | `(file) => FileItem` | - |
| uploadTrigger | 触发上传时机，可选 `auto`、`custom` | string | auto |
| validateMessage | Upload 整体的错误信息 | `string \| Snippet` | - |
| withCredentials | 是否带上 Cookie 信息 | boolean | false |
| onAcceptInvalid | 当接收到的文件不符合 accept 规范时触发 | `(files) => void` | - |
| onChange | 文件状态发生变化时调用，回调入参含 fileList、currentFile | `({ fileList, currentFile }) => void` | - |
| onClear | 点击清空时的回调 | `() => void` | - |
| onCropError | 图片裁切失败时的回调 | `(error) => void` | - |
| onDrop | 当拖拽的元素在拖拽区上被释放时触发 | `(e, files, fileList) => void` | - |
| onError | 上传错误时的回调 | `(error, file, fileList, xhr) => void` | - |
| onExceed | 上传文件总数超出 limit 时的回调 | `(fileList) => void` | - |
| onFileChange | 选中文件后的回调 | `(files) => void` | - |
| onOpenFileDialog | 打开系统文件选择弹窗时触发 | `() => void` | - |
| onPreviewClick | 点击文件卡片时的回调 | `(fileItem) => void` | - |
| onProgress | 上传文件时的回调 | `(percent, file, fileList) => void` | - |
| onRemove | 移除文件的回调 | `(currentFile, fileList, currentFileItem) => void` | - |
| onRetry | 上传重试的回调 | `(file) => void` | - |
| onSizeError | 文件尺寸非法的回调 | `(file, fileList) => void` | - |
| onSuccess | 上传成功后的回调 | `(responseBody, file, fileList) => void` | - |

### FileItem

> uid 为文件唯一标识符，Upload 的更新、删除等逻辑对该值强依赖。通过 upload 选中添加的会自动生成 uid；通过 defaultFileList / fileList 传入的必传且需自行保证不重复。

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| uid | 文件唯一标识符 | string |
| name | 文件名 | string |
| size | 文件大小的格式化展示串（如 "1.2KB"/"3.4MB"） | string |
| status | 文件状态，可选 success / uploading / uploadFail / validateFail / validating | string |
| url | 文件地址（预览用） | string |
| percent | 上传进度百分比 | number |
| preview | 是否预览缩略图 | boolean |

### CropProps

`crop` 属性传入对象时的配置项：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| aspectRatio | 裁切框宽高比，如 16/9、1、4/3 | number | - |
| shape | 裁切框形状，可选 `rect`、`round`、`roundRect` | string | rect |
| minZoom | 最小缩放比例 | number | 0.1 |
| maxZoom | 最大缩放比例 | number | 3 |
| zoomStep | 每次滚轮缩放步长 | number | 0.1 |
| quality | 输出图片质量（0-1） | number | 0.92 |
| fill | 裁切结果中非图片区域的填充色 | string | rgba(0, 0, 0, 0) |
| modalTitle | 裁切弹窗标题 | string | - |
| modalOkText | 确认按钮文字 | string | - |
| modalCancelText | 取消按钮文字 | string | - |

## Methods

绑定在组件实例上的方法，可以通过 `bind:this` 拿到实例后调用：

| 名称 | 描述 |
| --- | --- |
| insert | 上传文件，当 index 传入时插入到指定位置，不传则插入到最后 |
| upload | 手动开始上传，配合 uploadTrigger="custom" 使用 |
| openFileDialog | 打开文件选择窗口 |
| clear | 清空文件列表，会走 beforeClear 钩子 |
| remove | 移除指定文件项，入参为完整的 FileItem 对象 |

## Accessibility

Upload 组件是一个可交互的控件，在点击或拖拽时触发文件选择，文件选中后会在文件列表内展示状态。

### ARIA

- 为可点击元素添加 `role="button"`。
- 文件列表添加 `role="list"`，并用 `aria-label` 描述。

## 文案规范

- **上传按钮**：关于表单按钮的文案规范，参考 [Button 组件的文案规范](/components/button#文案规范)。
- **帮助文本**：使用语句书写规范，首字母大写（西文场景），可以不加句号。
- **用户出错提示**：清晰地告诉用户为什么文件无法被上传，并告知用户如何操作能够成功上传；简洁的用语让用户能够一眼读懂，如"文件大小不能超过 20MB""文件类型必须是 .gif、.jpg、.png 或 .svg"。

## FAQ

- **什么时候会展示重试按钮？** 当 `showRetry` 为 true，且当前文件是由于网络原因错误导致的上传失败时，会展示重试按钮。其他如校验失败、上传成功等状态不会展示重试按钮。
- **什么时候会展示替换按钮？** 当 `showReplace` 为 true，且当前文件状态为已上传时，会展示替换按钮。
- **Upload 把图片存到哪里了？** Upload 不负责图片的保存，使用时需要自定义 action，指向你自己的服务器地址或图片服务地址。
- **Form.Upload 的 `name` 无效？** Form.Field 有 `props.name`，Upload 也有 `props.name`，同名 props 会冲突。使用 Form.Upload 时可以改用 `props.fileName`，避免冲突。
- **上传后没有调用某个方法？** 若设置了 `accept`，可尝试先去掉该属性观察方法是否被调用。若去掉后能调用，说明当前环境下获取到的文件 type 与设置的 accept 不符，上传行为在校验阶段就被提前终止了。

<Notice type="primary" title="关于进度条">进度条表示上传进度，分为数据上载和服务器返回两部分。若数据已全部发出但服务器尚未返回响应，进度条会停留在接近完成的位置提示用户上传尚未真正结束，此时开发者工具中的请求处于 pending 状态，这是正常现象。仅当服务器返回响应，上传流程才真正结束，进度才会达到 100%。</Notice>
