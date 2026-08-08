/**
 * Locale shape — grouped by component. key format: Component.field.
 * See specs/00-foundation/i18n.spec.md.
 */
export interface Locale {
  /** BCP-47 code, e.g. zh-CN */
  code: string;
  /** right-to-left language */
  rtl: boolean;
  /**
   * 该语言对应的 date-fns locale 对象（对齐 Semi locale bundle 的 `dateFnsLocale`）。
   * 消费方（DatePicker / TimePicker）未显式传 dateFnsLocale prop 时回退到它，
   * 使 `a`（上午/下午）、月份名等**跟随当前语言**而非恒为英文。
   * 类型用结构性声明而非 `import('date-fns').Locale`，避免 locale 包被迫依赖 date-fns。
   */
  dateFnsLocale: {
    code?: string;
    formatLong?: unknown;
    localize?: unknown;
    match?: unknown;
    options?: unknown;
  };
  Modal: {
    confirm: string;
    cancel: string;
    close: string;
  };
  Input: {
    showPassword: string;
    hidePassword: string;
  };
  Textarea: {
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
    page: string;
    /** 省略号项的可访问名（对齐 Semi aria-label="More"） */
    more: string;
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
    ascend: string;
    descend: string;
    cancelSort: string;
    filter: string;
    resetFilter: string;
    confirmFilter: string;
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
    /** 分页 range 文案（对齐 Semi pageText），uses {currentStart} {currentEnd} {total} */
    pageText: string;
  };
  Avatar: {
    /** AvatarGroup 折叠 +N 头像的可访问名，uses {count} */
    moreAlt: string;
    /** AvatarGroup 容器可访问名 */
    groupLabel: string;
  };
  Spin: {
    loading: string;
  };
  Banner: {
    closeButtonAriaLabel: string;
  };
  SideSheet: {
    closeAriaLabel: string;
  };
  Popconfirm: {
    confirm: string;
    cancel: string;
  };
  Toast: {
    /** 关闭按钮可访问名 */
    close: string;
  };
  Notification: {
    closeText: string;
  };
  BackTop: {
    ariaLabel: string;
  };
  AudioPlayer: {
    /** 快退 Tooltip（uses {seconds}，对齐 Semi backward） */
    backward: string;
    /** 快进 Tooltip（uses {seconds}，对齐 Semi forward） */
    forward: string;
    /** 上一曲 Tooltip（对齐 Semi prev） */
    prev: string;
    /** 下一曲 Tooltip（对齐 Semi next） */
    next: string;
    /** 音量 Tooltip（对齐 Semi volume） */
    volume: string;
    /** 进度条 aria-label（本库自建 slider a11y 必需，Semi 无此项） */
    progress: string;
  };
  Rating: {
    /** uses {value} and {count} */
    valueText: string;
    cleared: string;
    unrated: string;
  };
  Feedback: {
    /** 提交按钮文案 */
    submit: string;
    /** 取消按钮文案 */
    cancel: string;
  };
  PinCode: {
    /** 分组无可视标签时的辅助名 */
    ariaLabel: string;
    /** 单格位次模板，uses {index} and {count} */
    cellAriaLabel: string;
  };
  List: {
    /** 空列表缺省展示文案（对齐 Semi List locale.emptyText） */
    emptyText: string;
  };
  Calendar: {
    /** 全天事件标签（Semi allDay） */
    allDay: string;
    /** 时间列上午刻度，uses {time}（Semi AM） */
    AM: string;
    /** 时间列下午刻度，uses {time}（Semi PM） */
    PM: string;
    /** 月视图 +N 折叠文案，uses {count}（Semi remaining，${remained}） */
    remaining: string;
    /**
     * 月视图每月 1 号日期后的单位后缀（对齐 Semi datestring）。
     * **英文为空串**——中文显示「7月 1日」，英文只显示「Jul 1」。
     */
    datestring: string;
  };
  Tree: {
    emptyText: string;
    searchPlaceholder: string;
    expand: string;
    collapse: string;
  };
  Image: {
    /** 图片 hover 蒙层「预览」文字 */
    preview: string;
    /** 预览工具栏 tooltip（对齐 Semi） */
    prevTip: string;
    nextTip: string;
    zoomInTip: string;
    zoomOutTip: string;
    rotateTip: string;
    downloadTip: string;
    adaptiveTip: string;
    originTip: string;
    errorAlt: string;
    previewAlt: string;
    closePreview: string;
    /** LiveAnnouncer：预览翻页计数，uses {index} / {total} */
    previewCount: string;
  };
  Cropper: {
    /** 裁切容器 aria-label */
    container: string;
  };
  Navigation: {
    collapseText: string;
    expandText: string;
  };
  Select: {
    /** combobox 触发器缺省可访问名 */
    ariaLabel: string;
    emptyText: string;
    searchPlaceholder: string;
    loading: string;
    clear: string;
    /** uses {label} */
    removeItem: string;
    /** 新建选项的「创建」提示前缀（对齐 Semi createText，无占位符；输入值由组件另行渲染） */
    createText: string;
  };
  DatePicker: {
    /** 按 type 分派的占位（照搬 Semi）：range 类型为 [start, end] 数组 */
    placeholder: {
      date: string;
      dateTime: string;
      dateRange: [string, string];
      dateTimeRange: [string, string];
      monthRange: [string, string];
    };
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
    /** dateTime 面板切换到日期视图按钮 aria-label */
    selectDate: string;
    /** dateTime 面板切换到时间视图按钮 aria-label */
    selectTime: string;
    /**
     * 日历面板顶部「年 月」标题模板（对齐 Semi locale.monthText）。
     * 占位符 `${year}` / `${month}`，由语言决定顺序：中文 '${year}年 ${month}'、英文 '${month} ${year}'。
     * 不用标准 date token 是因为要做字符串 replace，月份 token `M` 可能误伤月名（如 May）——同 Semi 注释。
     */
    monthText: string;
    /**
     * 语言相关的日期格式串（对齐 Semi locale.localeFormatToken）。
     * FORMAT_SWITCH_DATE：dateTime 面板底部 Switch 的日期文案格式，
     * 英文 'MM/dd/yyyy'（07/29/2026）、中文 'yyyy-MM-dd'（2026-07-29）。
     */
    localeFormatToken: {
      FORMAT_SWITCH_DATE: string;
    };
    /** 月名（key=1..12，对齐 Semi locale.months；用于 YearAndMonth 月列展示） */
    months: Record<number, string>;
    /** 完整月名（滚轮定制，对齐 Semi locale.fullMonths） */
    fullMonths: Record<number, string>;
    /** 星期表头文案（key=Sun/Mon…，对齐 Semi locale.weeks） */
    weeks: {
      Mon: string;
      Tue: string;
      Wed: string;
      Thu: string;
      Fri: string;
      Sat: string;
      Sun: string;
    };
    /** 面板底部确认/取消（needConfirm 时，对齐 Semi footer） */
    footer: {
      confirm: string;
      cancel: string;
    };
    /** 快捷选择区标题（对齐 Semi presets） */
    presets: string;
  };
  TimePicker: {
    /**
     * 按 type 分派的占位（照搬 Semi locale.TimePicker.placeholder）：
     * `time` 单选、`timeRange` 范围选择。原先本库是扁平单串，范围模式也显示
     * 「请选择时间」而非「请选择时间范围」，属真 bug，已按 Semi 拆成两键。
     */
    placeholder: {
      time: string;
      timeRange: string;
    };
    triggerLabel: string;
    /**
     * 选中项后缀单位（对齐 Semi locale.TimePicker.hour/minute/second）。
     * **英文为空串**——Semi 英文选中项只显示数字 `08`，中文才显示 `08时`。
     * 这三个键只用于选中项文案拼接，勿拿来当列 aria-label（那是 hourLabel/minuteLabel/secondLabel）。
     */
    hour: string;
    minute: string;
    second: string;
    /** 时/分/秒列的 aria-label（本库 a11y 补充，Semi 无；与上面的后缀单位是两码事，不可合并） */
    hourLabel: string;
    minuteLabel: string;
    secondLabel: string;
    AM: string;
    PM: string;
    begin: string;
    end: string;
  };
  Transfer: {
    placeholder: string;
    /** 分组回退标题 / 源栏标题 */
    titleSource: string;
    /** 左侧空态 */
    emptyLeft: string;
    /** 搜索无结果空态 */
    emptySearch: string;
    /** 右侧空态 */
    emptyRight: string;
    /** 右侧清空按钮 */
    clear: string;
    /** 左侧全选按钮 */
    selectAll: string;
    /** 左侧取消全选按钮 */
    clearSelectAll: string;
    /** 左侧计数，uses {total} */
    total: string;
    /** 右侧计数，uses {total} */
    selected: string;
    /** 移动按钮 aria-label */
    moveToRight: string;
    /** 右侧删除单项按钮 aria-label */
    remove: string;
    /** 拖拽手柄 aria-label */
    dragSort: string;
    /** remote onSearch 加载中提示 */
    loading: string;
  };
  Upload: {
    trigger: string;
    /** 拖拽区主文案（对齐 Semi mainText） */
    mainText: string;
    /** uses {size} */
    sizeError: string;
    /** uses {size} — file smaller than minSize */
    minSizeError: string;
    remove: string;
    /** 重试按钮/失败重传 */
    retry: string;
    /** 替换已上传文件按钮（showReplace） */
    replace: string;
    /** 批量清空按钮 */
    clear: string;
    /** live 播报：上传中，uses {name} {percent} */
    announceUploading: string;
    /** live 播报：上传成功，uses {name} */
    announceSuccess: string;
    /** live 播报：上传失败，uses {name} */
    announceError: string;
    /** 裁切弹窗默认标题 */
    cropTitle: string;
    /** 上传超时错误文案（列表项 error + live 播报，uses {name}） */
    timeoutError: string;
    /** 拖拽区合法拖入时的提示文案（松开鼠标开始上传） */
    legalTips: string;
    /** 文件列表默认标题（对齐 Semi selectedFiles） */
    selectedFiles: string;
    /** 上传失败默认校验信息（对齐 Semi fail） */
    fail: string;
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
    /** announced/shown while a field is running async validation */
    validating: string;
  };
  TreeSelect: {
    clear: string;
    emptyText: string;
    searchPlaceholder: string;
    /** 多选 maxTagCount 折叠出的 +N 触发器可访问名（hover 弹出剩余 Tag 浮层），uses {count}（被折叠的标签数） */
    restTagsCount: string;
  };
  AutoComplete: {
    /** combobox 输入框缺省可访问名 */
    ariaLabel: string;
    emptyText: string;
  };
  InputNumber: {
    increase: string;
    decrease: string;
    /** LiveAnnouncer：越界钳制后实际生效值，uses {value} */
    clampedAnnounce: string;
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
    clear: string;
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
    format: string;
  };
  TagGroup: {
    /** TagGroup +N 折叠标签的可访问名，uses {count}（被折叠的标签数） */
    restTagsAriaLabel: string;
  };
  Tabs: {
    scrollPrev: string;
    scrollNext: string;
    more: string;
    /** 关闭标签按钮 aria-label，uses {tab} */
    closeTab: string;
  };
  Popover: {
    /** dialog 模式（click/custom 触发）无标题时的兜底 aria-label */
    dialogLabel: string;
  };
  Typography: {
    copy: string;
    copied: string;
    expand: string;
    collapse: string;
  };
  VideoPlayer: {
    // —— Semi 对齐的 9 key（通知文案/mediaError，对齐 Semi VideoPlayer locale）——
    /** 切换速率通知，uses {rate}（对齐 Semi rateChange） */
    rateChange: string;
    /** 切换清晰度通知，uses {quality}（对齐 Semi qualityChange） */
    qualityChange: string;
    /** 切换线路通知，uses {route}（对齐 Semi routeChange） */
    routeChange: string;
    /** 镜像通知/按钮（对齐 Semi mirror） */
    mirror: string;
    /** 取消镜像通知（对齐 Semi cancelMirror） */
    cancelMirror: string;
    /** 加载中通知（对齐 Semi loading） */
    loading: string;
    /** 加载失败通知（对齐 Semi stall） */
    stall: string;
    /** 暂无资源（对齐 Semi noResource） */
    noResource: string;
    /** 视频加载错误（对齐 Semi videoError） */
    videoError: string;
    // —— 本库无障碍必需的 aria-label 超集（Semi 控制栏按钮无 aria-label，属 Semi 缺陷；本库补齐）——
    /** 播放按钮 aria-label */
    play: string;
    /** 暂停按钮 aria-label */
    pause: string;
    /** 静音按钮 aria-label */
    mute: string;
    /** 取消静音按钮 aria-label */
    unmute: string;
    /** 音量滑块 aria-label */
    volume: string;
    /** 进入全屏按钮 aria-label */
    fullscreen: string;
    /** 退出全屏按钮 aria-label */
    exitFullscreen: string;
    /** 画中画按钮 aria-label */
    pictureInPicture: string;
    /** 进度滑块 aria-label */
    progress: string;
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
    /** 输入框 aria-label（本库补充：Semi 未给该 textarea 无障碍名，axe 判 critical 违规） */
    editor: string;
    /** send button aria-label */
    send: string;
    /** stop-generate button aria-label */
    stop: string;
    /** clear-context button aria-label */
    clear: string;
    /** copy-message action aria-label */
    copy: string;
    /** 代码块复制成功后的即时反馈文案（对齐 Semi Chat.copied） */
    copied: string;
    /** 消息级复制成功 Toast 文案（对齐 Semi Chat.copySuccess，与 copied 是 Semi 保留的两个独立 key） */
    copySuccess: string;
    /** delete-message action aria-label */
    delete: string;
    /** 删除消息二次确认气泡文案（对齐 Semi Chat.deleteConfirm） */
    deleteConfirm: string;
    /** reset/regenerate-message action aria-label */
    reset: string;
    /** like/good-feedback action aria-label */
    like: string;
    /** dislike/bad-feedback action aria-label */
    dislike: string;
    /** upload-attachment button aria-label */
    upload: string;
    /** clear-context divider text */
    clearContext: string;
    /** 拖拽上传遮罩提示文案（对齐 Semi dropAreaText） */
    dropAreaText: string;
    /** back-to-bottom button aria-label */
    backToBottom: string;
    /** message list region aria-label */
    messageList: string;
  };
  AIChatDialogue: {
    /** message list region aria-label */
    messageList: string;
    /** more-actions dropdown trigger aria-label */
    more: string;
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
    /** share action aria-label（对齐 Semi onMessageShare 的分享按钮） */
    share: string;
    /** good-feedback action aria-label */
    like: string;
    /** bad-feedback action aria-label */
    dislike: string;
    /** loading status text */
    loading: string;
    /**
     * reasoning block header text（对齐 Semi：嵌套两态而非单串）。
     * status==='completed' 用 completed，否则用 thinking。
     */
    reasoning: {
      /** finished state header */
      completed: string;
      /** in-progress state header */
      thinking: string;
    };
    /** annotation count suffix（对齐 Semi annotationText） */
    annotationText: string;
    /** copy-success toast text（对齐 Semi copySuccess） */
    copySuccess: string;
    /** delete confirm title（对齐 Semi deleteConfirm） */
    deleteConfirm: string;
    /** delete confirm body（对齐 Semi deleteContent） */
    deleteContent: string;
    /** audio block placeholder */
    audio: string;
    /** references region label */
    references: string;
  };
  AIChatInput: {
    /** rich-text editor region aria-label */
    editor: string;
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
    /** MCP 下拉头部「配置」按钮文案 */
    configure: string;
    /** MCP 下拉头部已选计数，含 ${count} 占位符 */
    selected: string;
    /** attachment scroller left button aria-label */
    scrollLeft: string;
    /** attachment scroller right button aria-label */
    scrollRight: string;
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
    mcpConfigure: string;
    /** MCPConfigure search input placeholder (fixes Semi hardcoded "请输入") */
    searchPlaceholder: string;
    /** MCPConfigure search input aria-label */
    mcpSearchLabel: string;
    /** MCPConfigure active count summary; interpolates {count} and {total} */
    activeMCPNumber: string;
    /** MCPConfigure enable switch aria-label; interpolates {name} */
    mcpEnable: string;
    /** MCPConfigure preset (locked) switch title/tooltip */
    defaultMcpInfo: string;
    /** MCPConfigure per-item configure button aria-label; interpolates {name} */
    mcpConfigureItem: string;
    /** MCPConfigure per-item edit button aria-label; interpolates {name} */
    mcpEditItem: string;
    /** MCPConfigure add-custom-tool button label */
    newMcpAdd: string;
    /** MCPConfigure custom-group empty state text */
    emptyCustomMcpInfo: string;
    /** MCPConfigure no-search-result text */
    mcpNoResult: string;
    /** FileContent rich-text editor aria-label */
    fileEditor: string;
    /** FileContent toolbar aria-label */
    fileToolbar: string;
    /** Hn 下拉触发器 */
    heading: string;
    /** 正文按钮 */
    paragraph: string;
    /** 代码块按钮 */
    codeBlock: string;
    /** 分割线按钮 */
    divider: string;
    /** 两端对齐按钮 */
    alignJustify: string;
    /** 链接按钮 */
    link: string;
    /** 链接弹层确认按钮 */
    linkConfirm: string;
    /** 链接弹层移除按钮 */
    linkRemove: string;
    /** 链接输入占位（对齐 Semi enterLinkAddress） */
    enterLinkAddress: string;
    /** 链接添加成功 Toast（对齐 Semi） */
    linkAddSuccess: string;
    /** 链接移除成功 Toast（对齐 Semi） */
    linkRemoveSuccess: string;
    /** toolbar undo */
    undo: string;
    /** toolbar redo */
    redo: string;
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
    uploadImgInfo: string;
    /** image upload failure hint */
    uploadFailInfo: string;
    /** 图片**校验**失败提示（对齐 Semi validateFailInfo；与 uploadFail 是两条不同文案） */
    validateFailInfo: string;
    /** 详情内容复制按钮无障碍名（本库补充：Semi 该按钮无 aria-label，axe 判 critical） */
    copy: string;
    /** 详情内容复制成功提示（对齐 Semi Sidebar.copySuccess） */
    copySuccess: string;
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
  };
}
