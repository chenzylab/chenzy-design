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
}
