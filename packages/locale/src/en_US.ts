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
  Form: {
    required: '{label} is required',
    optional: 'optional',
    typeError: '{label} has an invalid format',
    minLength: 'Enter at least {min} characters',
    maxLength: 'Enter at most {max} characters',
    min: 'Cannot be less than {min}',
    max: 'Cannot be greater than {max}',
    pattern: '{label} does not match the required format',
    submitFailAnnounce: '{count} field(s) failed validation',
    colon: ':',
  },
};
