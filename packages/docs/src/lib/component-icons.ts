// 组件侧边栏语义图标：lowercase 组件名 -> 内联 SVG（viewBox 0 0 24 24）。
// 线性图标：描边/填充由 SidebarIcon 的 <svg> 统一设 fill=none / stroke=currentColor，
// 各元素可用 fill/stroke/opacity/stroke-dasharray 等属性覆盖。颜色按分类着色。
// 分批手绘，docs 侧维护。缺失组件回退到 _fallback。

// 分类配色（对齐 token 色系，各分类一色）
export const categoryColor: Record<string, string> = {
  basic: '#165dff', // 蓝
  input: '#00b42a', // 绿
  navigation: '#ff7d00', // 橙
  show: '#722ed1', // 紫
  feedback: '#f53f3f', // 红
  other: '#86909c', // 灰
  _default: '#165dff',
};

export const componentIcons: Record<string, string> = {
  _fallback: `<rect x="4" y="4" width="16" height="16" rx="3"/>`,

  // —— basic ——
  button: `<rect x="3" y="8" width="18" height="8" rx="4"/><path d="M8 12h8"/>`,
  icon: `<path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/>`,
  divider: `<path d="M3 12h18M7 7v0M17 7v0M7 17v0M17 17v0"/>`,
  space: `<rect x="3" y="9" width="5" height="6" rx="1"/><rect x="10" y="9" width="5" height="6" rx="1"/><rect x="17" y="9" width="4" height="6" rx="1"/>`,
  typography: `<path d="M5 6h14M9 6v12M7 18h4"/><path d="M15 11h5M17.5 11v7M16 18h3"/>`,
  grid: `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
  layout: `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>`,

  // —— input ——
  input: `<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 10v4"/>`,
  textarea: `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h10M7 17h6"/>`,
  switch: `<rect x="3" y="8" width="18" height="8" rx="4"/><circle cx="15" cy="12" r="2"/>`,
  checkbox: `<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/>`,
  radio: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor"/>`,
  inputnumber: `<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M15 10l2-2 2 2M15 14l2 2 2-2"/>`,
  rating: `<path d="M12 4l2.3 4.7 5.2.8-3.7 3.6.9 5.1L12 15.8 7.3 18.3l.9-5.1L4.5 9.5l5.2-.8z"/>`,
  slider: `<path d="M3 12h18"/><circle cx="9" cy="12" r="3"/>`,
  form: `<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h4M8 12h8M8 16h8"/>`,
  select: `<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M14 11l2 2 2-2"/>`,
  autocomplete: `<rect x="3" y="5" width="14" height="6" rx="2"/><circle cx="16" cy="16" r="3"/><path d="M18.5 18.5L21 21"/>`,
  taginput: `<rect x="3" y="6" width="18" height="12" rx="2"/><rect x="6" y="10" width="4" height="4" rx="1"/><rect x="12" y="10" width="4" height="4" rx="1"/>`,
  colorpicker: `<path d="M16 4l4 4-9 9-4 1 1-4z"/><path d="M4 20h6"/>`,
  datepicker: `<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/>`,
  rangepicker: `<rect x="3" y="6" width="7" height="13" rx="2"/><rect x="14" y="6" width="7" height="13" rx="2"/><path d="M10 12h4"/>`,
  timepicker: `<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>`,
  cascader: `<path d="M4 6h6M10 12h6M16 18h4"/><path d="M4 6v12h2"/>`,
  treeselect: `<path d="M6 4v12M6 10h6M6 16h6"/><rect x="14" y="7" width="6" height="6" rx="1"/><path d="M15.5 10l1 1 2-2.5"/>`,
  transfer: `<rect x="3" y="5" width="6" height="14" rx="1"/><rect x="15" y="5" width="6" height="14" rx="1"/><path d="M10 9l2 2-2 2M14 13l-2 2 2 2"/>`,
  upload: `<path d="M12 15V5M8 9l4-4 4 4"/><path d="M5 17v2h14v-2"/>`,

  // —— show ——
  tag: `<path d="M3 7v5l8 8 6-6-8-8H4z"/><circle cx="7" cy="7" r="1.2"/>`,
  avatar: `<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>`,
  badge: `<rect x="4" y="4" width="13" height="13" rx="2.5"/><circle cx="18" cy="6" r="2.5"/>`,
  card: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>`,
  tooltip: `<rect x="4" y="4" width="16" height="11" rx="2"/><path d="M9 15l3 4 3-4"/>`,
  popover: `<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 9h8M8 12h5M10 17l2 4 2-4"/>`,
  empty: `<path d="M4 8l3-4h10l3 4M4 8v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M4 8h16"/>`,
  descriptions: `<path d="M4 7h6M14 7h6M4 12h6M14 12h6M4 17h6M14 17h6"/>`,
  collapse: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M14 7l2 1.5-2 1.5"/>`,
  timeline: `<path d="M7 4v16"/><circle cx="7" cy="8" r="2"/><circle cx="7" cy="16" r="2"/><path d="M11 8h8M11 16h6"/>`,
  list: `<circle cx="5" cy="7" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="5" cy="17" r="1"/><path d="M9 7h11M9 12h11M9 17h11"/>`,
  image: `<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="M4 18l5-5 4 3 3-3 4 4"/>`,
  highlight: `<path d="M4 17h16" stroke-width="3.5"/><path d="M7 13l5-8 5 8"/>`,
  virtuallist: `<path d="M4 6h12M4 11h12M4 16h12"/><path d="M20 4v6" stroke-width="3"/><path d="M20 13v3" opacity="0.4"/>`,
  carousel: `<rect x="6" y="6" width="12" height="10" rx="2"/><path d="M3 8v6M21 8v6"/><circle cx="9" cy="20" r="0.6"/><circle cx="12" cy="20" r="0.6"/><circle cx="15" cy="20" r="0.6"/>`,
  tree: `<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-2h12v2"/>`,
  table: `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/>`,
  calendar: `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>`,
  scrolllist: `<rect x="4" y="10" width="16" height="4" rx="1"/><path d="M5 6h14" opacity="0.4"/><path d="M7 18h10" opacity="0.4"/>`,
  overflowlist: `<rect x="3" y="9" width="4" height="6" rx="1"/><rect x="9" y="9" width="4" height="6" rx="1"/><circle cx="19" cy="12" r="3"/><path d="M19 10.7v2.6M17.7 12h2.6"/>`,

  // —— navigation ——
  breadcrumb: `<path d="M4 12h4"/><path d="M11 7l3 5-3 5"/><path d="M17 12h3"/>`,
  pagination: `<rect x="3" y="9" width="5" height="6" rx="1"/><rect x="10" y="9" width="4" height="6" rx="1"/><rect x="16" y="9" width="5" height="6" rx="1"/>`,
  steps: `<circle cx="5" cy="12" r="2"/><path d="M7 12h4"/><circle cx="13" cy="12" r="2"/><path d="M15 12h2"/><path d="M18 11l1.5 1.5L22 9.5"/>`,
  tabs: `<path d="M4 8h5l1-2h4v2h6"/><rect x="4" y="8" width="16" height="11" rx="2"/>`,
  dropdown: `<rect x="4" y="5" width="16" height="6" rx="1.5"/><path d="M9 8h3"/><path d="M15 14l-3 3-3-3"/>`,
  menu: `<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>`,
  anchor: `<path d="M6 4v16"/><circle cx="6" cy="8" r="1.5"/><path d="M10 8h9"/><path d="M10 14h6"/>`,

  // —— feedback ——
  spin: `<path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 12a9 9 0 0 0-4.5-7.8"/>`,
  progress: `<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M3 12h9"/>`,
  skeleton: `<rect x="4" y="6" width="16" height="3" rx="1.5"/><rect x="4" y="12" width="16" height="3" rx="1.5"/><rect x="4" y="18" width="9" height="3" rx="1.5"/>`,
  banner: `<rect x="3" y="7" width="18" height="10" rx="2"/><circle cx="8" cy="12" r="1.5"/><path d="M12 10h5"/><path d="M12 14h5"/>`,
  modal: `<rect x="3" y="4" width="18" height="16" rx="2" opacity="0.4"/><rect x="7" y="8" width="10" height="8" rx="1.5"/>`,
  popconfirm: `<path d="M4 5h16v10H9l-4 4v-4H4z"/><path d="M8.5 10l2 2 3.5-4"/>`,
  drawer: `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M14 4v16"/><path d="M17 12h-1"/>`,
  sidesheet: `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M11 4v16"/><path d="M17 9l-2 3 2 3"/>`,
  toast: `<rect x="3" y="9" width="18" height="6" rx="3"/><circle cx="7.5" cy="12" r="1.5"/><path d="M11 12h7"/>`,
  notification: `<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/>`,

  // —— other ——
  backtop: `<path d="M5 5h14"/><path d="M12 20V10"/><path d="M8 13l4-4 4 4"/>`,
  localeprovider: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>`,
  configprovider: `<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2"/>`,
  resizeobserver: `<rect x="4" y="4" width="16" height="16" rx="1.5" stroke-dasharray="3 3"/><path d="M9 9l6 6"/><path d="M9 13v-4h4"/><path d="M15 11v4h-4"/>`,
  lottieicon: `<circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3z" fill="currentColor"/>`,
};
