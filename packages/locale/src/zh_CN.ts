import type { Locale } from './interface.js';

export const zh_CN: Locale = {
  code: 'zh-CN',
  rtl: false,
  Modal: { okText: '确定', cancelText: '取消', close: '关闭' },
  Input: { clear: '清除', showPassword: '显示密码', hidePassword: '隐藏密码' },
  Pagination: { total: '共 {total} 条' },
  Table: { emptyText: '暂无数据' },
  Empty: {
    noData: '暂无数据',
    noResult: '无搜索结果',
    error: '加载失败',
  },
  Descriptions: { empty: '-' },
  Sider: {
    expand: '展开侧边栏',
    collapse: '收起侧边栏',
    expanded: '侧边栏已展开',
    collapsed: '侧边栏已收起',
  },
  Select: {
    placeholder: '请选择',
    emptyText: '无匹配项',
    searchPlaceholder: '搜索',
    loading: '加载中',
  },
  DatePicker: {
    placeholder: '请选择日期',
    today: '今天',
    clear: '清除',
    prevMonth: '上个月',
    nextMonth: '下个月',
  },
  TimePicker: {
    placeholder: '请选择时间',
    now: '此刻',
    confirm: '确定',
  },
  Transfer: {
    searchPlaceholder: '搜索',
    itemsUnit: '{count} 项',
    empty: '暂无数据',
  },
  Upload: {
    trigger: '选择文件',
    draggerText: '点击或拖拽文件到此处上传',
    sizeError: '文件大小不能超过 {size}',
    limitError: '最多上传 {limit} 个文件',
    remove: '移除',
  },
  Form: {
    required: '{label}为必填项',
    optional: '选填',
    typeError: '{label}格式不正确',
    minLength: '至少输入 {min} 个字符',
    maxLength: '最多输入 {max} 个字符',
    min: '不能小于 {min}',
    max: '不能大于 {max}',
    pattern: '{label}格式不符合要求',
    submitFailAnnounce: '{count} 个字段校验未通过',
    colon: '：',
  },
};
