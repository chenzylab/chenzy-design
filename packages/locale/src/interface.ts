/**
 * Locale shape — grouped by component. key format: Component.field.
 * See specs/00-foundation/i18n.spec.md.
 */
export interface Locale {
  /** BCP-47 code, e.g. zh-CN */
  code: string;
  /** right-to-left language */
  rtl: boolean;
  Modal: {
    okText: string;
    cancelText: string;
    close: string;
  };
  Input: {
    clear: string;
    showPassword: string;
    hidePassword: string;
  };
  Textarea: {
    /** clear button aria-label */
    clear: string;
    /** count display template, uses {count} and {maxCount} */
    countFormat: string;
    /** count display template with no limit, uses {count} */
    countOnly: string;
    /** over-limit live announcement, uses {over} */
    overLimitAnnounce: string;
  };
  Pagination: {
    /** uses {total} placeholder */
    total: string;
    ariaLabel: string;
    prevPage: string;
    nextPage: string;
    /** uses {page} */
    pageLabel: string;
    /** uses {size} */
    pageSize: string;
    /** showSizeChanger 内置 Select 的可访问名 */
    itemsPerPage: string;
    jumpTo: string;
    jumpToSuffix: string;
    /** live-region 翻页播报，uses {page} and {count} */
    pageChangeAnnounce: string;
    /** live-region 每页条数变更播报，uses {size} and {page} */
    pageSizeChangeAnnounce: string;
  };
  Table: {
    emptyText: string;
    selectAll: string;
    selectRow: string;
    expandRow: string;
    collapseRow: string;
    /** uses {column} */
    sortBy: string;
    sortAscend: string;
    sortDescend: string;
    sortCancel: string;
    /** uses {count} */
    selectedCount: string;
    filter: string;
    filterReset: string;
    filterConfirm: string;
    resizeColumn: string;
    /** live-region 排序播报，uses {column} and {order} */
    sortedAnnounce: string;
    /** live-region 取消排序播报，uses {column} */
    sortClearedAnnounce: string;
    /** 升序（用于 sortedAnnounce 的 {order}） */
    sortOrderAscend: string;
    /** 降序（用于 sortedAnnounce 的 {order}） */
    sortOrderDescend: string;
    /** grid 行数（虚拟化焦点回收播报），uses {count} */
    rowCount: string;
    /** grid 列数，uses {count} */
    columnCount: string;
  };
  Empty: {
    noData: string;
    noResult: string;
    error: string;
    construction: string;
    success: string;
    noAccess: string;
  };
  Descriptions: {
    empty: string;
  };
  OverflowList: {
    /** uses {count} */
    moreLabel: string;
    /** uses {count} */
    moreAriaLabel: string;
    /** scroll 模式可滚动可见层的可访问名 */
    scrollAriaLabel: string;
  };
  Avatar: {
    /** AvatarGroup 折叠 +N 头像的可访问名，uses {count} */
    moreAlt: string;
  };
  Spin: {
    loading: string;
    loaded: string;
  };
  Progress: {
    ariaLabel: string;
    /** uses {percent} */
    valueText: string;
    success: string;
    error: string;
    indeterminate: string;
  };
  Skeleton: {
    loading: string;
    loaded: string;
    imageAlt: string;
  };
  Banner: {
    closeButtonAriaLabel: string;
    info: string;
    success: string;
    warning: string;
    danger: string;
  };
  Drawer: {
    close: string;
    title: string;
  };
  SideSheet: {
    closeAriaLabel: string;
    closeText: string;
    confirmText: string;
  };
  Popconfirm: {
    confirm: string;
    cancel: string;
    confirming: string;
  };
  Toast: {
    close: string;
    loading: string;
    typeLabelInfo: string;
    typeLabelSuccess: string;
    typeLabelWarning: string;
    typeLabelError: string;
    /** Toast.promise 默认文案：pending */
    promiseLoading: string;
    /** Toast.promise 默认文案：resolve */
    promiseSuccess: string;
    /** Toast.promise 默认文案：reject */
    promiseError: string;
  };
  Notification: {
    closeText: string;
    notification: string;
    /** 视觉隐藏类型前缀（屏幕阅读器先播报极性） */
    success: string;
    info: string;
    warning: string;
    error: string;
  };
  BackTop: {
    ariaLabel: string;
    arrived: string;
  };
  FloatButton: {
    /** FloatButtonGroup 的默认可访问名（role="group" 的 aria-label） */
    groupAriaLabel: string;
  };
  AudioPlayer: {
    /** 播放按钮 aria-label */
    play: string;
    /** 暂停按钮 aria-label */
    pause: string;
    /** 上一曲 aria-label */
    prev: string;
    /** 下一曲 aria-label */
    next: string;
    /** 快进 aria-label（uses {seconds}） */
    forward: string;
    /** 快退 aria-label（uses {seconds}） */
    backward: string;
    /** 重播 aria-label */
    refresh: string;
    /** 音量 aria-label */
    volume: string;
    /** 进度条 aria-label */
    progress: string;
    /** 倍速 aria-label */
    speed: string;
    /** 加载中播报 */
    loading: string;
    /** 播放出错播报 */
    error: string;
  };
  Switch: {
    on: string;
    off: string;
    loading: string;
    /** announceOnChange 播报（开） */
    announceChecked: string;
    /** announceOnChange 播报（关） */
    announceUnchecked: string;
  };
  Rating: {
    ariaLabel: string;
    /** uses {value} and {count} */
    valueText: string;
    cleared: string;
    unrated: string;
  };
  PinCode: {
    /** 分组无可视标签时的辅助名 */
    ariaLabel: string;
    /** 单格位次模板，uses {index} and {count} */
    cellAriaLabel: string;
  };
  HotKeys: {
    /** 修饰键在非 Apple 平台 / 屏幕阅读器可读的文字名（Apple 平台由组件替换为 ⌘⌥⌃⇧ 符号）。 */
    ctrl: string;
    meta: string;
    alt: string;
    shift: string;
  };
  LottieIcon: {
    loading: string;
    loadError: string;
    label: string;
  };
  ScrollList: {
    ariaLabel: string;
    empty: string;
    loading: string;
    /** uses {label} */
    announceSelected: string;
  };
  List: {
    loadMore: string;
    /** LiveAnnouncer：选中行，uses {label} */
    selectAnnounce: string;
    /** LiveAnnouncer：取消选中行，uses {label} */
    deselectAnnounce: string;
    /** selectable 模式 listbox 容器缺省可访问名 */
    selectableLabel: string;
  };
  Calendar: {
    today: string;
    prev: string;
    next: string;
    /** uses {count} */
    moreCount: string;
    noEvents: string;
    allDay: string;
    /** LiveAnnouncer：选中日期，uses {date} */
    selectedDateAnnounce: string;
  };
  Tree: {
    emptyText: string;
    searchPlaceholder: string;
    loading: string;
    /** uses {label} */
    a11yExpanded: string;
    /** uses {label} */
    a11yCollapsed: string;
    /** uses {label} */
    a11yChecked: string;
    expand: string;
    collapse: string;
  };
  Image: {
    errorAlt: string;
    previewAlt: string;
    previewTrigger: string;
    closePreview: string;
    previewMask: string;
    zoomIn: string;
    zoomOut: string;
    rotateLeft: string;
    rotateRight: string;
    reset: string;
    prev: string;
    next: string;
    /** LiveAnnouncer：预览翻页计数，uses {index} / {total} */
    previewCount: string;
  };
  CodeHighlight: {
    /** 代码块滚动区 aria-label（role=region 命名） */
    codeBlock: string;
  };
  Cropper: {
    /** 裁切容器 aria-label */
    container: string;
  };
  Timeline: {
    pending: string;
  };
  Sider: {
    expand: string;
    collapse: string;
    expanded: string;
    collapsed: string;
  };
  Select: {
    placeholder: string;
    /** combobox 触发器缺省可访问名 */
    ariaLabel: string;
    emptyText: string;
    searchPlaceholder: string;
    loading: string;
    clear: string;
    /** uses {label} */
    removeItem: string;
    /** uses {label} */
    create: string;
  };
  DatePicker: {
    placeholder: string;
    today: string;
    clear: string;
    prevMonth: string;
    nextMonth: string;
    prevYear: string;
    nextYear: string;
    prevDecade: string;
    nextDecade: string;
    triggerLabel: string;
    startPlaceholder: string;
    endPlaceholder: string;
    rangeTriggerLabel: string;
    /** 年月滚轮标题按钮 aria-label */
    switchYearMonth: string;
    /** 年月滚轮返回日期面板按钮文案 */
    backToDate: string;
    /** 年月滚轮年份列 aria-label */
    yearColumnLabel: string;
    /** 年月滚轮月份列 aria-label */
    monthColumnLabel: string;
  };
  TimePicker: {
    placeholder: string;
    now: string;
    confirm: string;
    clear: string;
    triggerLabel: string;
    hour: string;
    minute: string;
    second: string;
    am: string;
    pm: string;
    rangeStart: string;
    rangeEnd: string;
  };
  Transfer: {
    searchPlaceholder: string;
    /** uses {count} */
    itemsUnit: string;
    empty: string;
    titleSource: string;
    titleTarget: string;
    moveToRight: string;
    moveToLeft: string;
    /** oneWay 模式：移除单项的按钮 aria-label */
    remove: string;
    /** remote onSearch 加载中提示 */
    loading: string;
    /** 移动后 live 播报，uses {count} */
    movedToRight: string;
    /** 移动后 live 播报，uses {count} */
    movedToLeft: string;
  };
  Upload: {
    trigger: string;
    draggerText: string;
    /** uses {size} */
    sizeError: string;
    /** uses {size} — file smaller than minSize */
    minSizeError: string;
    /** uses {limit} */
    limitError: string;
    remove: string;
    /** 重试按钮/失败重传 */
    retry: string;
    /** live 播报：上传中，uses {name} {percent} */
    announceUploading: string;
    /** live 播报：上传成功，uses {name} */
    announceSuccess: string;
    /** live 播报：上传失败，uses {name} */
    announceError: string;
    /** 上传中进度条可访问名，uses {name} */
    uploadingProgress: string;
  };
  Form: {
    /** uses {label} */
    required: string;
    optional: string;
    /** uses {label} */
    typeError: string;
    /** uses {min} */
    minLength: string;
    /** uses {max} */
    maxLength: string;
    /** uses {min} */
    min: string;
    /** uses {max} */
    max: string;
    /** uses {label} */
    pattern: string;
    /** uses {count} */
    submitFailAnnounce: string;
    colon: string;
    /** announced/shown while a field is running async validation */
    validating: string;
  };
  TreeSelect: {
    clear: string;
    emptyText: string;
    searchPlaceholder: string;
  };
  AutoComplete: {
    /** combobox 输入框缺省可访问名 */
    ariaLabel: string;
    clear: string;
    loading: string;
    emptyText: string;
  };
  InputNumber: {
    increase: string;
    decrease: string;
    /** LiveAnnouncer：越界钳制后实际生效值，uses {value} */
    clampedAnnounce: string;
    /** 清除按钮 aria-label */
    clear: string;
  };
  Slider: {
    /** LiveAnnouncer：值到达最小边界 */
    minReachedAnnounce: string;
    /** LiveAnnouncer：值到达最大边界 */
    maxReachedAnnounce: string;
  };
  Cascader: {
    clear: string;
    loading: string;
    searchPlaceholder: string;
    emptyText: string;
    /** 每列 listbox 可访问名，uses {level} */
    columnLabel: string;
    /** 搜索结果 listbox 可访问名 */
    searchResults: string;
  };
  Carousel: {
    prev: string;
    next: string;
    indicators: string;
    /** 指示器/单张幻灯片可访问名，uses {index} */
    slideLabel: string;
    /** 走马灯整体可访问名（role=region） */
    ariaLabel: string;
    /** 开始自动播放按钮 */
    play: string;
    /** 暂停自动播放按钮 */
    pause: string;
    /** LiveAnnouncer：手动切换播报，uses {index} / {total} */
    slideAnnounce: string;
  };
  TagInput: {
    remove: string;
  };
  Breadcrumb: {
    ariaLabel: string;
    /** uses {count} */
    moreLabel: string;
  };
  Anchor: {
    ariaLabel: string;
  };
  Steps: {
    /** nav 类型外层 <nav> 的 aria-label */
    navAriaLabel: string;
    /** 视觉隐藏的步骤序号标签，uses {index} */
    stepLabel: string;
    /** 总数后缀，uses {total} */
    ofTotal: string;
    /** 状态前的朗读分隔符（zh「，」/ en「, 」） */
    statusSeparator: string;
    /** wait 状态朗读 */
    statusWait: string;
    /** process 状态朗读 */
    statusProcess: string;
    /** finish 状态朗读 */
    statusFinish: string;
    /** error 状态朗读 */
    statusError: string;
    /** warning 状态朗读 */
    statusWarning: string;
  };
  ColorPicker: {
    saturation: string;
    hue: string;
    alpha: string;
    hex: string;
    eyeDropper: string;
    recent: string;
    format: string;
    /** 预设色板列表的可访问名 */
    presets: string;
    /** 面板无显式 ariaLabel 时的兜底可访问名 */
    panelLabel: string;
  };
  Tag: {
    close: string;
    /** closable 关闭按钮无障碍名，uses {label}（标签文本） */
    closeAriaLabel: string;
  };
  Dropdown: {
    trigger: string;
  };
  Tabs: {
    scrollPrev: string;
    scrollNext: string;
    add: string;
    more: string;
    /** 关闭标签按钮 aria-label，uses {tab} */
    closeTab: string;
  };
  Tooltip: {
    warningLabel: string;
    errorLabel: string;
  };
  Popover: {
    /** 关闭按钮 aria-label（destroyOnClose/带关闭图标时） */
    close: string;
    /** dialog 模式无标题时的兜底 aria-label */
    dialogLabel: string;
    /** 确定按钮默认文案 */
    okText: string;
    /** 取消按钮默认文案 */
    cancelText: string;
  };
  Typography: {
    copy: string;
    copied: string;
    copyFailed: string;
    edit: string;
    editConfirm: string;
    editCancel: string;
    expand: string;
    collapse: string;
    ellipsisSuffix: string;
  };
  VideoPlayer: {
    /** play button aria-label */
    play: string;
    /** pause button aria-label */
    pause: string;
    /** replay button aria-label (after ended) */
    replay: string;
    /** mute button aria-label */
    mute: string;
    /** unmute button aria-label */
    unmute: string;
    /** volume slider aria-label */
    volume: string;
    /** enter-fullscreen button aria-label */
    fullscreen: string;
    /** exit-fullscreen button aria-label */
    exitFullscreen: string;
    /** picture-in-picture button aria-label */
    pictureInPicture: string;
    /** mirror button aria-label */
    mirror: string;
    /** playback-rate menu aria-label */
    playbackRate: string;
    /** quality menu aria-label */
    quality: string;
    /** route menu aria-label */
    route: string;
    /** progress slider aria-label */
    progress: string;
    /** buffering notification text */
    loading: string;
    /** stalled notification text */
    stall: string;
    /** error state text */
    error: string;
    /** mirror-on transient notification */
    mirrorOn: string;
    /** mirror-off transient notification */
    mirrorOff: string;
    /** rate-change notification, uses {rate} */
    rateChange: string;
    /** quality-change notification, uses {quality} */
    qualityChange: string;
    /** route-change notification, uses {route} */
    routeChange: string;
  };
  JsonViewer: {
    /** 编辑器容器 role=textbox 的可访问名 */
    editor: string;
    /** 搜索输入框占位/可访问名 */
    search: string;
    /** 单条替换按钮 aria-label */
    replace: string;
    /** 全部替换按钮 aria-label */
    replaceAll: string;
    /** 上一个匹配按钮 aria-label */
    prev: string;
    /** 下一个匹配按钮 aria-label */
    next: string;
    /** 区分大小写切换 aria-label */
    caseSensitive: string;
    /** 全字匹配切换 aria-label */
    wholeWord: string;
    /** 正则匹配切换 aria-label */
    regex: string;
    /** 打开搜索框按钮 aria-label */
    searchTrigger: string;
    /** 关闭搜索框按钮 aria-label */
    closeSearch: string;
    /** 替换输入框占位/可访问名 */
    replaceInput: string;
  };
  Chat: {
    /** send button aria-label */
    send: string;
    /** stop-generate button aria-label */
    stop: string;
    /** clear-context button aria-label */
    clear: string;
    /** copy-message action aria-label */
    copy: string;
    /** delete-message action aria-label */
    delete: string;
    /** reset/regenerate-message action aria-label */
    reset: string;
    /** like/good-feedback action aria-label */
    like: string;
    /** dislike/bad-feedback action aria-label */
    dislike: string;
    /** upload-attachment button aria-label */
    upload: string;
    /** input placeholder */
    placeholder: string;
    /** loading message status text */
    loading: string;
    /** error message status text */
    error: string;
    /** clear-context divider text */
    clearContext: string;
    /** back-to-bottom button aria-label */
    backToBottom: string;
    /** message list region aria-label */
    messageList: string;
  };
  AIChatDialogue: {
    /** message list region aria-label */
    messageList: string;
    /** back-to-bottom button aria-label */
    backToBottom: string;
    /** select-message checkbox aria-label */
    selectMessage: string;
    /** copy action aria-label */
    copy: string;
    /** reset action aria-label */
    reset: string;
    /** edit-message action aria-label */
    edit: string;
    /** delete action aria-label */
    delete: string;
    /** good-feedback action aria-label */
    like: string;
    /** bad-feedback action aria-label */
    dislike: string;
    /** loading status text */
    loading: string;
    /** error status text */
    error: string;
    /** reasoning block toggle label */
    reasoning: string;
    /** tool-call block fallback name */
    toolCall: string;
    /** tool-call arguments section label */
    toolArguments: string;
    /** tool-call input section label (custom tool) */
    toolInput: string;
    /** tool-call output/result section label */
    toolOutput: string;
    /** audio block placeholder */
    audio: string;
    /** file item fallback name */
    file: string;
  };
  AIChatInput: {
    /** rich-text editor region aria-label */
    editor: string;
    /** input placeholder */
    placeholder: string;
    /** send button aria-label */
    send: string;
    /** stop-generate button aria-label */
    stop: string;
    /** upload-attachment button aria-label */
    upload: string;
    /** delete-reference button aria-label */
    deleteReference: string;
    /** delete-attachment button aria-label */
    deleteAttachment: string;
    /** suggestions listbox aria-label */
    suggestions: string;
    /** skill list listbox aria-label */
    skills: string;
    /** delete-skill button aria-label */
    deleteSkill: string;
    /** template button label / toggle aria-label */
    template: string;
  };
  Resizable: {
    /** resize handle default aria-label */
    handleAriaLabel: string;
  };
  SideBar: {
    /** close button aria-label */
    close: string;
    /** detail back button aria-label */
    back: string;
    /** Annotation default panel title */
    annotationTitle: string;
    /** Annotation empty state text */
    annotationEmpty: string;
    /** video card duration accessible label; interpolates {duration} (mm:ss) */
    videoDuration: string;
    /** citation order accessible label; interpolates {order} */
    citationOrder: string;
    /** CodeContent item expand (fullscreen) button aria-label */
    expand: string;
    /** MCPConfigure default panel title */
    mcpTitle: string;
    /** MCPConfigure search input placeholder (fixes Semi hardcoded "请输入") */
    mcpSearchPlaceholder: string;
    /** MCPConfigure search input aria-label */
    mcpSearchLabel: string;
    /** MCPConfigure built-in tools group heading */
    mcpBuiltinGroup: string;
    /** MCPConfigure custom tools group heading */
    mcpCustomGroup: string;
    /** MCPConfigure active count summary; interpolates {count} and {total} */
    mcpActiveCount: string;
    /** MCPConfigure enable switch aria-label; interpolates {name} */
    mcpEnable: string;
    /** MCPConfigure preset (locked) switch title/tooltip */
    mcpPresetLocked: string;
    /** MCPConfigure per-item configure button aria-label; interpolates {name} */
    mcpConfigureItem: string;
    /** MCPConfigure per-item edit button aria-label; interpolates {name} */
    mcpEditItem: string;
    /** MCPConfigure add-custom-tool button label */
    mcpAddCustom: string;
    /** MCPConfigure custom-group empty state text */
    mcpEmptyCustom: string;
    /** MCPConfigure built-in-group empty state text */
    mcpEmptyBuiltin: string;
    /** MCPConfigure no-search-result text */
    mcpNoResult: string;
    /** FileContent rich-text editor aria-label */
    fileEditor: string;
    /** FileContent toolbar aria-label */
    fileToolbar: string;
    /** toolbar undo */
    undo: string;
    /** toolbar redo */
    redo: string;
    /** toolbar heading level 1 */
    heading1: string;
    /** toolbar heading level 2 */
    heading2: string;
    /** toolbar heading level 3 */
    heading3: string;
    /** toolbar bullet list */
    bulletList: string;
    /** toolbar ordered list */
    orderedList: string;
    /** toolbar blockquote */
    blockquote: string;
    /** toolbar align left */
    alignLeft: string;
    /** toolbar align center */
    alignCenter: string;
    /** toolbar align right */
    alignRight: string;
    /** toolbar bold */
    bold: string;
    /** toolbar italic */
    italic: string;
    /** toolbar strikethrough */
    strike: string;
    /** toolbar inline code */
    code: string;
    /** toolbar insert image */
    image: string;
    /** image upload drop-zone hint */
    uploadImage: string;
    /** image upload failure hint */
    uploadFail: string;
  };
  UserGuide: {
    /** skip button */
    skip: string;
    /** next-step button */
    next: string;
    /** previous-step button */
    prev: string;
    /** finish button (last step) */
    finish: string;
    /** progress aria-label / indicator template, uses {current} and {total} */
    stepIndicator: string;
  };
}
