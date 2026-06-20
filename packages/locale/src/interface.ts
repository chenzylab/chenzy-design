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
    jumpTo: string;
    jumpToSuffix: string;
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
  };
  Empty: {
    noData: string;
    noResult: string;
    error: string;
  };
  Descriptions: {
    empty: string;
  };
  OverflowList: {
    /** uses {count} */
    moreLabel: string;
    /** uses {count} */
    moreAriaLabel: string;
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
  };
  Notification: {
    closeText: string;
    notification: string;
  };
  BackTop: {
    ariaLabel: string;
    arrived: string;
  };
  LottieIcon: {
    loading: string;
    loadError: string;
    label: string;
  };
  ScrollList: {
    ariaLabel: string;
    empty: string;
    /** uses {label} */
    announceSelected: string;
  };
  List: {
    loadMore: string;
  };
  Calendar: {
    today: string;
    prev: string;
    next: string;
    /** uses {count} */
    moreCount: string;
    noEvents: string;
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
    triggerLabel: string;
    startPlaceholder: string;
    endPlaceholder: string;
    rangeTriggerLabel: string;
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
  };
  Upload: {
    trigger: string;
    draggerText: string;
    /** uses {size} */
    sizeError: string;
    /** uses {limit} */
    limitError: string;
    remove: string;
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
  };
  TreeSelect: {
    clear: string;
    emptyText: string;
    searchPlaceholder: string;
  };
  AutoComplete: {
    clear: string;
  };
  InputNumber: {
    increase: string;
    decrease: string;
  };
  Cascader: {
    clear: string;
    loading: string;
    searchPlaceholder: string;
    emptyText: string;
  };
  Carousel: {
    prev: string;
    next: string;
    indicators: string;
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
  ColorPicker: {
    saturation: string;
    hue: string;
    alpha: string;
    hex: string;
    eyeDropper: string;
    recent: string;
  };
  Tag: {
    close: string;
  };
  Dropdown: {
    trigger: string;
  };
}
