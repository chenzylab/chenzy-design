import type { Locale } from './interface.js';

export const en_US: Locale = {
  code: 'en-US',
  rtl: false,
  Modal: { okText: 'OK', cancelText: 'Cancel', close: 'Close' },
  Input: { clear: 'Clear', showPassword: 'Show password', hidePassword: 'Hide password' },
  Pagination: { total: '{total} items in total' },
  Table: { emptyText: 'No data' },
  Sider: {
    expand: 'Expand sidebar',
    collapse: 'Collapse sidebar',
    expanded: 'Sidebar expanded',
    collapsed: 'Sidebar collapsed',
  },
};
