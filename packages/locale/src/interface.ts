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
  };
  Table: {
    emptyText: string;
    selectAll: string;
    selectRow: string;
    /** uses {column} */
    sortBy: string;
    sortAscend: string;
    sortDescend: string;
    sortCancel: string;
    /** uses {count} */
    selectedCount: string;
  };
  Empty: {
    noData: string;
    noResult: string;
    error: string;
  };
  Descriptions: {
    empty: string;
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
  };
  DatePicker: {
    placeholder: string;
    today: string;
    clear: string;
    prevMonth: string;
    nextMonth: string;
  };
  TimePicker: {
    placeholder: string;
    now: string;
    confirm: string;
  };
  Transfer: {
    searchPlaceholder: string;
    /** uses {count} */
    itemsUnit: string;
    empty: string;
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
}
