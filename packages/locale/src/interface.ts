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
}
