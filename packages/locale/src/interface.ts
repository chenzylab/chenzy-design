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
