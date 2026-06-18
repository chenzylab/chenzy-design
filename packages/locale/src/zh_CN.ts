import type { Locale } from './interface.js';

export const zh_CN: Locale = {
  code: 'zh-CN',
  rtl: false,
  Modal: { okText: '确定', cancelText: '取消', close: '关闭' },
  Input: { clear: '清除', showPassword: '显示密码', hidePassword: '隐藏密码' },
  Pagination: { total: '共 {total} 条' },
  Table: { emptyText: '暂无数据' },
  Sider: {
    expand: '展开侧边栏',
    collapse: '收起侧边栏',
    expanded: '侧边栏已展开',
    collapsed: '侧边栏已收起',
  },
};
