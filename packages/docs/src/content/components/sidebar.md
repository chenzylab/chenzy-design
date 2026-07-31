---
title: SideBar 侧边信息栏
name: sidebar
category: ai
brief: AI 场景的侧边信息栏，承载参考来源、代码/JSON 预览、富文本编辑与 MCP 工具配置。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import BasicContainer from '../../demos/sidebar/01-basic-container.svelte';
  import basicContainerSrc from '../../demos/sidebar/01-basic-container.svelte?raw';
  import Resizable from '../../demos/sidebar/02-resizable.svelte';
  import resizableSrc from '../../demos/sidebar/02-resizable.svelte?raw';
  import MainOptions from '../../demos/sidebar/03-main-options.svelte';
  import mainOptionsSrc from '../../demos/sidebar/03-main-options.svelte?raw';
  import DetailBack from '../../demos/sidebar/04-detail-back.svelte';
  import detailBackSrc from '../../demos/sidebar/04-detail-back.svelte?raw';
  import Annotation from '../../demos/sidebar/05-annotation.svelte';
  import annotationSrc from '../../demos/sidebar/05-annotation.svelte?raw';
  import CodeContent from '../../demos/sidebar/05-code-content.svelte';
  import codeContentSrc from '../../demos/sidebar/05-code-content.svelte?raw';
  import McpConfigure from '../../demos/sidebar/06-mcp-configure.svelte';
  import mcpConfigureSrc from '../../demos/sidebar/06-mcp-configure.svelte?raw';
  import FileContent from '../../demos/sidebar/07-file-content.svelte';
  import fileContentSrc from '../../demos/sidebar/07-file-content.svelte?raw';
  import DetailContent from '../../demos/sidebar/08-detail-content.svelte';
  import detailContentSrc from '../../demos/sidebar/08-detail-content.svelte?raw';
</script>

## 使用场景

`SideBar` 用于 AI 会话场景的侧边信息栏，展示参考来源、代码/JSON 预览、富文本内容与 MCP 工具配置。

它由一组可独立使用的子组件构成：外层浮层壳 `SideBarContainer`，主壳 `SideBar`（按 `mode` 在主视图与详情视图间路由），以及内容组件 `SideBarAnnotation`、`SideBarCodeContent`、`SideBarFileContent`、`SideBarMcpConfigure`。

<Notice type="primary" title="与 Semi 的结构差异">

Semi 把浮层壳与主壳合成一个 `Sidebar` 组件（内部 `render()` 用 `Container` 包裹）。本库拆成 **`SideBarContainer`（浮层壳）+ `SideBar`（主壳）** 两层分别导出，使用方自行组合——这样只要主壳、不要浮层的场景（内嵌到已有面板里）无需绕过容器。

子组件命名前缀统一为 `SideBar*`（Semi 为 `Sidebar.Annotation` 这类静态属性挂载）。

</Notice>

## 代码演示

### 如何引入

```jsx
import {
  SideBar,
  SideBarContainer,
  SideBarAnnotation,
  SideBarCodeContent,
  SideBarFileContent,
  SideBarMcpConfigure,
} from '@chenzy-design/svelte';
```

### 基础容器

`SideBarContainer` 是贴视口右侧的可伸缩浮层壳：`role=dialog` + `aria-labelledby(title)`，打开移焦、焦点捕获与归还、Esc 关闭。

<DemoBox code={basicContainerSrc}><BasicContainer /></DemoBox>

### 可伸缩

`resizable` 为 true 时左边缘可拖拽调宽，受 `minWidth` / `maxWidth` 约束；把手支持键盘 ←→ / Home / End。

<DemoBox code={resizableSrc}><Resizable /></DemoBox>

### 主视图 Options 切换

`SideBar` 的 `mode='main'` 渲染顶部 Options 图标 tab 组与 `renderMainContent(activeKey)`。`activeKey` 受控，仅通过 `onActiveOptionChange` 通知，不回写。

<DemoBox code={mainOptionsSrc}><MainOptions /></DemoBox>

### 详情返回

`mode` 非 `main` 时进入详情视图，渲染返回按钮与详情内容。`onBackWard` 支持异步，await 期间按钮禁用以防重复触发。

<DemoBox code={detailBackSrc}><DetailBack /></DemoBox>

### 参考来源

`SideBarAnnotation` 用折叠面板渲染 `info` 分组，展开区渲染 video（封面/时长/播放态）与 text（站点 logo/名称/引用序号）卡片；`renderItem` 可整条覆盖。

<DemoBox code={annotationSrc}><Annotation /></DemoBox>

### 代码展示

`SideBarCodeContent` 以折叠列表展示代码/JSON：`isJson` 为 true 走 JsonViewer，否则走 CodeHighlight。

<DemoBox code={codeContentSrc}><CodeContent /></DemoBox>

### MCP 配置

`SideBarMcpConfigure` 渲染 MCP 工具配置面板：搜索过滤、内置/自定义列表、启用开关与配置/编辑/添加动作。

<Notice type="primary" title="与 Semi 的差异">

Semi 用单选（radio）在「内置 / 自定义」间二选一切换列表；本库改为**并列双列表**，同屏可见两组工具，减少一次切换操作。

</Notice>

<DemoBox code={mcpConfigureSrc}><McpConfigure /></DemoBox>

### 富文本编辑器

`SideBarFileContent` 以折叠列表展示富文本，每项是一个 tiptap 编辑器；`editable` 控制查看/编辑，编辑态渲染格式工具栏与图片上传节点。

<DemoBox code={fileContentSrc}><FileContent /></DemoBox>

### 侧边信息栏

`SideBar` 有主视图（`mode='main'`）和详情视图（`mode='code'`、`'file'` 及其他）。

**不传 `renderDetailContent` 时，详情区由组件按 `mode` 内置渲染**：`code` 走 CodeHighlight / JsonViewer（按 `detailContent.isJson` 分流），`file` 走可编辑富文本（`fileEditable` / `onFileContentChange`）。详情头也由组件内置渲染——返回按钮 + `detailContent.name` + 复制按钮（复制结果回传 `onDetailContentCopy`）。

<DemoBox code={detailContentSrc}><DetailContent /></DemoBox>

## API 参考

### SideBar

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| activeKey | 主视图激活的 option key（受控，不回写） | string | - |
| class | 自定义类名 | string | - |
| detailContent | 详情区域的内容。`mode='code'` 走 CodeHighlight / JsonViewer，`mode='file'` 走可编辑富文本 | `SideBarDetailContent` | - |
| fileEditable | 文件内容是否可编辑 | boolean | true |
| imgUploadProps | 图片上传相关配置属性 | `SideBarImageUploadOptions` | - |
| mode | 展示模式，可选值为 `main`、`code`、`file` 或其他自定义字符串 | string | `main` |
| onActiveOptionChange | 激活选项变更时的回调函数 | `(e: Event, activeKey: string) => void` | - |
| onBackWard | 返回操作的回调函数，支持异步（await 期间按钮禁用防重复触发） | `(e: Event, mode: string) => void \| Promise<void>` | - |
| onDetailContentCopy | 详情内容复制操作的回调函数 | `(e: MouseEvent, content: string, res: boolean) => void` | - |
| onFileContentChange | 文件内容变更时的回调函数 | `(content: string) => void` | - |
| options | 顶部图标 tab 组 | `SideBarOption[]` | `[]` |
| renderDetailContent | 自定义详情区域内容；传了则完全接管，不再走内置 code/file 渲染 | `Snippet<[mode]>` | - |
| renderDetailHeader | 自定义详情区域头部（返回按钮之后） | `Snippet<[mode, detailContent]>` | - |
| renderMainContent | 自定义主内容区域 | `Snippet<[activeKey]>` | - |
| style | 自定义内联样式 | string | - |

### SideBarContainer

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| afterVisibleChange | 可见状态变化后的回调函数 | `(isVisible: boolean) => void` | - |
| children | 容器内容 | Snippet | - |
| class | 自定义类名 | string | - |
| defaultSize | 默认尺寸，仅在 resizable 为 true 时生效 | `{ width?: number \| string; height?: number \| string }` | - |
| maxWidth | 最大宽度，仅在 resizable 为 true 时生效 | `string \| number` | - |
| minWidth | 最小宽度，仅在 resizable 为 true 时生效 | `string \| number` | - |
| motion | 是否开启动画效果 | boolean | true |
| onCancel | 取消操作的回调函数 | `(e: Event) => void` | - |
| renderHeader | 自定义头部渲染 | Snippet | - |
| resizable | 是否可拉伸 | boolean | true |
| showClose | 是否显示关闭按钮 | boolean | true |
| style | 自定义内联样式 | string | - |
| title | 标题内容 | `string \| Snippet` | - |
| visible | 是否可见 | boolean | - |

### SideBarMcpConfigure

除下列参数外，还支持 [SideBarContainer](#sidebarcontainer) 的全部参数。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| customOptions | 自定义选项列表 | `SideBarMcpOption[]` | - |
| filter | 筛选函数，用于根据输入值过滤选项 | `(inputValue: string, option: SideBarMcpOption) => boolean` | - |
| onAddClick | 新增按钮点击事件回调 | `(e: MouseEvent) => void` | - |
| onConfigureClick | 配置按钮点击事件回调 | `(e: MouseEvent, option: SideBarMcpOption) => void` | - |
| onEditClick | 编辑按钮点击事件回调 | `(e: MouseEvent, option: SideBarMcpOption) => void` | - |
| onSearch | 搜索事件回调，返回输入值和是否为自定义标识 | `(inputValue: string, custom: boolean) => void` | - |
| onStatusChange | 状态变化事件回调，返回选项列表和是否为自定义标识 | `(options: SideBarMcpOption[], custom: boolean) => void` | - |
| options | 基础选项列表 | `SideBarMcpOption[]` | - |
| placeholder | 输入框占位提示文字 | string | 走 locale `SideBar.searchPlaceholder` |
| renderItem | 自定义选项渲染 | `Snippet<[option, custom]>` | - |

#### SideBarMcpOption

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| active | 是否处于激活状态 | boolean | false |
| configure | 是否显示配置相关操作/标识 | boolean | false |
| desc | 描述内容 | `string \| Snippet` | - |
| disabled | 是否禁用，为 true 时用户无法更改激活状态 | boolean | false |
| icon | 图标（图片地址或 Snippet） | `string \| Snippet` | - |
| label | 标签文本 | string | - |
| value | 对应的值 | string | - |

### SideBarAnnotation

除下列参数外，还支持 [SideBarContainer](#sidebarcontainer) 的全部参数。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| activeKey | 当前激活项的键值，支持单个或多个 | `string \| string[]` | - |
| info | 注解信息列表 | `SideBarAnnotationGroup[]` | - |
| onChange | 激活项变更时的回调函数 | `(key: string \| string[]) => void` | - |
| onClick | 点击参考来源时的回调函数 | `(e: MouseEvent, item: SideBarAnnotationItem) => void` | - |
| renderItem | 自定义参考来源的渲染 | `Snippet<[item]>` | - |

#### SideBarAnnotationItem

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| detail | 内容详情/补充说明 | string | - |
| duration | 时长（视频时长，单位：秒） | number | - |
| img | 图片地址（视频封面图、文本配图） | string | - |
| logo | 站点/内容所属平台的 logo 图片地址 | string | - |
| onClick | 点击事件回调函数 | `(e: MouseEvent, item: SideBarAnnotationItem) => void` | - |
| title | 标题 | string | - |
| type | 卡片类型，`video` 渲染视频卡片，`text`（默认）渲染文本卡片 | `'video' \| 'text'` | `text` |
| url | 来源地址，存在时点击在新窗口打开 | string | - |

### SideBarCodeContent

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| activeKey | 当前激活项的标识，支持单个或多个 | `string \| string[]` | - |
| class | 自定义类名 | string | - |
| codes | 代码详情列表 | `CodeItemProps[]` | - |
| onChange | 激活项变更时的回调函数 | `(activeKey: string \| string[]) => void` | - |
| onExpand | 展开操作的回调函数 | `(e: MouseEvent, code: CodeItemProps) => void` | - |
| style | 自定义内联样式 | string | - |

#### CodeItemProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| codeHighlightProps | 透传给 CodeHighlight 的参数 | object | - |
| content | 代码/文本内容 | string | - |
| isJson | 是否为 JSON 格式内容 | boolean | - |
| jsonViewerProps | 透传给 JsonViewer 的参数 | object | - |
| key | 唯一标识 | string | - |
| language | 代码语言类型 | string | - |
| name | 折叠头显示名 | string | - |

### SideBarFileContent

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| activeKey | 当前激活项的标识，支持单个或多个 | `string \| string[]` | - |
| class | 自定义类名 | string | - |
| files | 文件信息列表 | `FileItemProps[]` | - |
| onChange | 激活项变更时的回调函数 | `(activeKey: string \| string[]) => void` | - |
| onExpand | 展开文件项的回调函数 | `(e: MouseEvent, file: FileItemProps) => void` | - |
| style | 自定义内联样式 | string | - |

#### FileItemProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 编辑区域的文本/内容（HTML） | string | - |
| editable | 是否可编辑 | boolean | false |
| extensions | 追加的 tiptap 扩展 | `Extension[]` | - |
| key | 唯一标识 | string | - |
| name | 折叠头显示名 | string | - |
| onContentChange | 内容变更回调 | `(html: string) => void` | - |
