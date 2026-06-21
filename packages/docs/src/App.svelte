<script lang="ts">
  import {
    Button,
    Icon,
    Divider,
    Space,
    Title,
    Text,
    Paragraph,
    Link,
    Row,
    Col,
    Layout,
    Input,
    TextArea,
    Switch,
    Checkbox,
    CheckboxGroup,
    Radio,
    RadioGroup,
    InputNumber,
    Rating,
    Slider,
    Form,
    Select,
    AutoComplete,
    TagInput,
    ColorPicker,
    DatePicker,
    RangePicker,
    TimePicker,
    Cascader,
    TreeSelect,
    Transfer,
    Upload,
    Breadcrumb,
    Pagination,
    Steps,
    Tabs,
    TabPane,
    Dropdown,
    Menu,
    Anchor,
    Tag,
    Avatar,
    Badge,
    Card,
    Tooltip,
    Popover,
    Empty,
    Descriptions,
    Collapse,
    Timeline,
    List,
    Image,
    Highlight,
    VirtualList,
    Carousel,
    Tree,
    Table,
    Calendar,
    ScrollList,
    OverflowList,
    Spin,
    Progress,
    Skeleton,
    SkeletonAvatar,
    SkeletonTitle,
    SkeletonParagraph,
    SkeletonImage,
    SkeletonButton,
    Banner,
    Modal,
    modal,
    Drawer,
    SideSheet,
    Popconfirm,
    Toast,
    notification,
    BackTop,
    LocaleProvider,
    zh_CN,
    en_US,
    registerLocale,
    ConfigProvider,
    ResizeObserver,
    resize,
    LottieIcon,
  } from '@chenzy-design/svelte';
  import type { LottiePlayerFactory, TreeNode, DropdownItem, UploadFileItem, Locale } from '@chenzy-design/svelte';
  import StarIcon from './StarIcon.svelte';

  // Icon svg 字符串渲染源演示（来源可信）。
  const heartSvg = '<svg viewBox="0 0 24 24" fill="currentColor" focusable="false"><path d="M12 21s-7.5-4.9-10-9.4C.6 8.9 2 5.5 5.2 5.1 7 4.9 8.7 5.8 12 9c3.3-3.2 5-4.1 6.8-3.9 3.2.4 4.6 3.8 3.2 6.5C19.5 16.1 12 21 12 21z"/></svg>';

  // 演示用 mock player（真实场景注入 lottie-web 的 loadAnimation 包装）。
  // 这里用一个 CSS 旋转的方块模拟动画播放/暂停。
  const mockPlayer: LottiePlayerFactory = ({ container, autoplay, segment, renderer }) => {
    const el = document.createElement('div');
    el.style.cssText =
      'width:100%;height:100%;border-radius:3px;background:var(--cd-color-primary);' +
      'animation:cd-demo-spin 1s linear infinite;animation-play-state:paused';
    container.appendChild(el);
    const setState = (s: string) => (el.style.animationPlayState = s);
    // 初始帧段：用 data-segment 标注，便于演示帧段被透传。
    if (segment) container.dataset.segment = `${segment[0]}-${segment[1]}`;
    // 渲染后端：用 data-renderer 标注，便于演示 canvas/renderer 透传（旧 adapter 不传则默认 svg）。
    container.dataset.renderer = renderer ?? 'svg';
    if (autoplay) setState('running');
    return {
      play: () => setState('running'),
      pause: () => setState('paused'),
      stop: () => {
        setState('paused');
        el.style.transform = 'rotate(0deg)';
      },
      goToFrame: () => setState('paused'),
      playSegments: (seg) => {
        container.dataset.segment = `${seg[0]}-${seg[1]}`;
        setState('running');
      },
      destroy: () => el.remove(),
    };
  };

  // src fetch 演示：把内联 JSON 转成 blob URL（无需真实网络/打包资源）。
  const lottieDemoUrl = URL.createObjectURL(
    new Blob([JSON.stringify({ v: '5.7.0', fr: 30, op: 60, markers: [{ cm: 'wave', tm: 10, dr: 20 }] })], {
      type: 'application/json',
    }),
  );
  // 受控 visible 演示开关。
  let lottieVisible = $state(true);
  // ResizeObserver 节流/去抖/多目标 demo 计数
  let roThrottleCount = $state(0);
  let roInstantCount = $state(0);
  let roMultiLast = $state('—');
  let roMultiCount = $state(0);
  // device-pixel-content-box / tag 自定义 / action 动态参数重建 demo
  let roDprLast = $state('—');
  let roActionBox = $state<'content-box' | 'device-pixel-content-box'>('content-box');
  let roActionLast = $state('—');
  let roActionBoxSeen = $state('—');
  // fallbackToWindow 降级 + onResizeStart/onResizeEnd 边界事件 demo
  let roFbLast = $state('—');
  let roFbCount = $state(0);
  let roSeStatus = $state('空闲');
  let roSeStart = $state(0);
  let roSeEnd = $state(0);
  let roSeLast = $state('—');

  const bigData = Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `第 ${i + 1} 行` }));
  // dynamic 不定高数据：不同行数文本（1~5 行），高度不一。
  const dynData = Array.from({ length: 2000 }, (_, i) => {
    const lines = (i % 5) + 1;
    return {
      id: i,
      text: `第 ${i + 1} 项 · ${lines} 行\n` + Array.from({ length: lines }, (_, l) => `内容 ${l + 1}`).join('\n'),
    };
  });
  let carouselIdx = $state(0);
  // ConfigProvider theme=auto demo：onThemeChange 回调里捕获 auto 解析后的实际主题。
  let cpAppliedTheme = $state<'light' | 'dark'>('light');
  // ConfigProvider reducedMotion demo：Switch 受控 + 回调捕获解析结果。
  let cpReduced = $state(false);
  let cpReducedApplied = $state(false);
  // ConfigProvider getValidateMessages demo：提交结果文案。
  let cpValidateMsg = $state('');
  // ConfigProvider getPopupContainer demo：浮层挂载宿主元素引用。
  let cpPopupHost = $state<HTMLElement | null>(null);
  // Popover custom 受控触发 demo：显隐完全由外部按钮控制。
  let popoverCustomOpen = $state(false);
  // Tooltip custom 触发 demo：显隐完全由本地受控状态驱动。
  let tooltipCustomOpen = $state(false);
  // VirtualList scrollToIndex demo：bind 组件实例 + 目标索引输入。
  let scrollToVL = $state<{ scrollToIndex: (i: number, o?: { align?: 'start' | 'center' | 'end' }) => void } | null>(null);
  let scrollToTarget = $state(500);
  // VirtualList horizontal demo 数据：120 列。
  const hData = Array.from({ length: 200 }, (_, i) => ({ id: i, text: `列 ${i + 1}` }));
  // VirtualList scrollTarget='window' demo 数据：2000 行整页长列表。
  const winData = Array.from({ length: 2000 }, (_, i) => ({ id: i, text: `窗口滚动行 ${i + 1}` }));

  const treeData = [
    {
      key: 'design',
      label: '设计',
      children: [
        { key: 'figma', label: 'Figma 规范' },
        { key: 'token', label: 'Design Token' },
      ],
    },
    {
      key: 'dev',
      label: '研发',
      children: [
        { key: 'fe', label: '前端' },
        {
          key: 'be',
          label: '后端',
          children: [
            { key: 'api', label: 'API' },
            { key: 'db', label: '数据库' },
          ],
        },
      ],
    },
    { key: 'qa', label: '测试' },
  ];
  let treeSel = $state<string | number>('figma');
  let treeChecked = $state<(string | number)[]>([]);

  // fieldNames 字段映射 demo：后端原始数据使用 { id, name, sub } 字段
  const treeFieldData = [
    {
      id: 'd1',
      name: '设计中心',
      sub: [
        { id: 'd1-1', name: 'Figma 规范' },
        { id: 'd1-2', name: 'Design Token' },
      ],
    },
    {
      id: 'd2',
      name: '研发中心',
      sub: [
        { id: 'd2-1', name: '前端组' },
        { id: 'd2-2', name: '后端组' },
      ],
    },
  ];
  const treeFieldNames = { key: 'id', label: 'name', children: 'sub' };
  let treeFieldSel = $state<string | number | null>(null);
  let treeFieldChecked = $state<(string | number)[]>([]);
  let treeSelectFieldVal = $state<string | number | null>(null);
  let treeSelectIconVal = $state<string | number | null>(null);
  let treeSelectAsyncVal = $state<string | number | null>(null);
  let treeSelectVirtualVal = $state<string | number | null>(null);

  // Tree 异步加载：根节点无 children，展开时按 key 拉取子节点；'leaf-x' 标记叶子。
  const treeAsyncRoots = [
    { key: 'east', label: '华东' },
    { key: 'south', label: '华南' },
    { key: 'leaf-hk', label: '香港（叶子）', isLeaf: true },
  ];
  function loadTreeChildren(node: { key: string | number; label: string }) {
    return new Promise<Array<{ key: string; label: string; isLeaf?: boolean }>>((resolve) => {
      setTimeout(() => {
        resolve([
          { key: `${node.key}-1`, label: `${node.label}·城市A`, isLeaf: true },
          { key: `${node.key}-2`, label: `${node.label}·城市B`, isLeaf: true },
        ]);
      }, 600);
    });
  }

  // Tree draggable：本地受控 treeData，onDrop 里实际重排演示拖拽生效（组件不内部改）。
  type DragNode = { key: string | number; label: string; children?: DragNode[] };
  let dragTreeData = $state<DragNode[]>([
    {
      key: 'a',
      label: '一级 A',
      children: [
        { key: 'a1', label: 'A-1' },
        { key: 'a2', label: 'A-2' },
      ],
    },
    {
      key: 'b',
      label: '一级 B',
      children: [{ key: 'b1', label: 'B-1' }],
    },
    { key: 'c', label: '一级 C' },
  ]);
  let dragInfo = $state('（未拖拽）');

  // 在受控数据上重排：先摘除 dragNode，再按 dropPosition 插回 dropNode 的前/后/内部。
  function reorderTree(
    data: DragNode[],
    dragKey: string | number,
    dropKey: string | number,
    pos: 'before' | 'inside' | 'after',
  ): DragNode[] {
    let dragged: DragNode | undefined;
    function remove(list: DragNode[]): DragNode[] {
      const out: DragNode[] = [];
      for (const n of list) {
        if (n.key === dragKey) {
          dragged = n;
          continue;
        }
        out.push(n.children ? { ...n, children: remove(n.children) } : n);
      }
      return out;
    }
    const pruned = remove(data);
    if (!dragged) return data;
    function insert(list: DragNode[]): DragNode[] {
      const out: DragNode[] = [];
      for (const n of list) {
        if (n.key === dropKey) {
          if (pos === 'before') out.push(dragged as DragNode, n);
          else if (pos === 'after') out.push(n, dragged as DragNode);
          else out.push({ ...n, children: [...(n.children ?? []), dragged as DragNode] });
        } else {
          out.push(n.children ? { ...n, children: insert(n.children) } : n);
        }
      }
      return out;
    }
    return insert(pruned);
  }

  // Tree virtualized：大数据树（50 个分组 × 20 子项 = 1050 节点）验证只渲染视口内行。
  const bigTreeData = Array.from({ length: 50 }, (_, g) => ({
    key: `g${g}`,
    label: `分组 ${g + 1}`,
    children: Array.from({ length: 20 }, (_, c) => ({
      key: `g${g}-c${c}`,
      label: `分组 ${g + 1} · 节点 ${c + 1}`,
    })),
  }));

  type TableRow = {
    key: number;
    name: string;
    age: number;
    city: string;
    [k: string]: unknown;
  };
  const tableData: TableRow[] = [
    { key: 1, name: '陈一', age: 32, city: '杭州' },
    { key: 2, name: '林二', age: 28, city: '上海' },
    { key: 3, name: '王三', age: 45, city: '北京' },
    { key: 4, name: '赵四', age: 23, city: '深圳' },
    { key: 5, name: '孙五', age: 38, city: '广州' },
    { key: 6, name: '周六', age: 30, city: '成都' },
    { key: 7, name: '吴七', age: 26, city: '武汉' },
  ];
  const tableColumns = [
    { dataIndex: 'name', title: '姓名', sorter: true },
    { dataIndex: 'age', title: '年龄', sorter: true, align: 'right' as const },
    { dataIndex: 'city', title: '城市' },
  ];
  let tableSelected = $state<(string | number)[]>([]);
  // 大数据虚拟滚动：1000+ 行，仅渲染视口内行
  const tableBigData: TableRow[] = Array.from({ length: 2000 }, (_, i) => ({
    key: i + 1,
    name: `用户 ${i + 1}`,
    age: 18 + (i % 50),
    city: (['杭州', '上海', '北京', '深圳', '广州', '成都'] as const)[i % 6]!,
  }));
  let tableExpandInfo = $state('（未操作）');
  let tableTreeInfo = $state('（未操作）');
  let tableTreeChecked = $state<(string | number)[]>([]);
  const tableTreeData: TableRow[] = [
    {
      key: 1,
      name: '研发中心',
      age: 120,
      city: '杭州',
      children: [
        {
          key: 11,
          name: '前端组',
          age: 40,
          city: '杭州',
          children: [
            { key: 111, name: '陈一', age: 32, city: '杭州' },
            { key: 112, name: '林二', age: 28, city: '杭州' },
          ],
        },
        { key: 12, name: '后端组', age: 80, city: '杭州' },
      ],
    },
    {
      key: 2,
      name: '设计中心',
      age: 35,
      city: '上海',
      children: [{ key: 21, name: '王三', age: 35, city: '上海' }],
    },
    { key: 3, name: '行政', age: 12, city: '北京' },
  ];
  const fixedData = [
    { key: 1, name: '张三', age: 28, city: '北京', email: 'zhang@x.com', phone: '139-0000', action: '编辑' },
    { key: 2, name: '李四', age: 32, city: '上海', email: 'li@x.com', phone: '138-1111', action: '编辑' },
    { key: 3, name: '王五', age: 25, city: '广州', email: 'wang@x.com', phone: '137-2222', action: '编辑' },
  ];
  const lazyRegionData = [
    { label: '华东', value: 'east' },
    { label: '华南', value: 'south' },
  ];
  function loadRegionChildren(node: { value: string | number }) {
    return new Promise<{ label: string; value: string; isLeaf?: boolean }[]>((resolve) => {
      setTimeout(() => {
        resolve([
          { label: `${node.value}-城市A`, value: `${node.value}-a`, isLeaf: true },
          { label: `${node.value}-城市B`, value: `${node.value}-b`, isLeaf: true },
        ]);
      }, 600);
    });
  }
  const demoImageSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#0066ff"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">IMG</text></svg>',
    );
  // 预览组多图示例：三张不同色块图。
  function makeImg(label: string, color: string): string {
    return (
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="${color}"/><text x="80" y="68" font-size="20" fill="#fff" text-anchor="middle">${label}</text></svg>`,
      )
    );
  }
  const groupImages = [
    { src: makeImg('A', '#0066ff'), alt: '图片 A' },
    { src: makeImg('B', '#00a854'), alt: '图片 B' },
    { src: makeImg('C', '#fa8c16'), alt: '图片 C' },
  ];
  // LQIP：低质 1px 模糊占位（纯色）+ 高清主图。
  const lqipPlaceholder = makeImg('', '#888');
  const lqipMain = makeImg('HD', '#5b21b6');
  let listMoreData = $state([
    { key: 1, name: '条目 1' },
    { key: 2, name: '条目 2' },
    { key: 3, name: '条目 3' },
  ]);
  let listLoadingMore = $state(false);
  function loadMoreItems() {
    listLoadingMore = true;
    setTimeout(() => {
      const start = listMoreData.length;
      listMoreData = [
        ...listMoreData,
        ...Array.from({ length: 3 }, (_, i) => ({
          key: start + i + 1,
          name: `条目 ${start + i + 1}`,
        })),
      ];
      listLoadingMore = false;
    }, 800);
  }

  // List 虚拟化 demo：5000 行大数据，仅渲染视口内行。
  const listVirtualData = Array.from({ length: 5000 }, (_, i) => ({
    key: i,
    name: `虚拟行 ${i}`,
  }));
  // List selectable demo：多选受控选中态（仅回调，不回写）。
  let listSelectedKeys = $state<(string | number)[]>([2]);
  const listSelectData = [
    { key: 1, name: '设计评审' },
    { key: 2, name: '前端开发' },
    { key: 3, name: '联调测试' },
    { key: 4, name: '上线发布' },
  ];

  // Calendar：锚定到固定月份（2026-06）便于演示事件
  const calAnchor = new Date(2026, 5, 1);
  const calEvents = [
    { key: 'm1', start: new Date(2026, 5, 3), title: '周会' },
    { key: 'm2', start: new Date(2026, 5, 10), title: '设计评审' },
    { key: 'm3', start: new Date(2026, 5, 10), title: '需求对齐' },
    { key: 'm4', start: new Date(2026, 5, 10), title: '联调' },
    { key: 'm5', start: new Date(2026, 5, 10), title: '复盘' },
    { key: 'm6', start: new Date(2026, 5, 15), end: new Date(2026, 5, 17), title: '出差', color: 'var(--cd-color-warning)' },
    { key: 'm7', start: new Date(2026, 5, 22), title: '发版', color: 'var(--cd-color-success)' },
  ];
  // Calendar 日视图：锚定到固定一天（2026-06-10），含定时事件 + 全天/跨天事件
  const calDayAnchor = new Date(2026, 5, 10);
  const calDayEvents = [
    { key: 'd0', start: new Date(2026, 5, 10), title: '团队站会（全天）', allDay: true },
    { key: 'd5', start: new Date(2026, 5, 9), end: new Date(2026, 5, 11), title: '出差（跨天）', color: 'var(--cd-color-warning)' },
    { key: 'd1', start: new Date(2026, 5, 10, 9, 30), title: '需求评审' },
    { key: 'd2', start: new Date(2026, 5, 10, 11, 0), title: '一对一' },
    { key: 'd3', start: new Date(2026, 5, 10, 14, 0), title: '设计联调', color: 'var(--cd-color-success)' },
    { key: 'd4', start: new Date(2026, 5, 10, 14, 45), title: '客户演示' },
  ];
  let calSelectedText = $state('（未选）');
  let calRangeText = $state('（未选）');
  let calPopupText = $state('（未选）');
  function fmtDay(d: Date) {
    return d.toLocaleDateString('zh-CN');
  }

  const hourData = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
    disabled: i === 3 || i === 4,
  }));
  let pickedHour = $state<string | number>(9);

  // 多列联动：年 / 月 / 日（日列范围随年月派生 —— 闰年/月份天数）
  const slYears = Array.from({ length: 6 }, (_, i) => ({ value: 2023 + i, label: `${2023 + i}` }));
  const slMonths = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` }));
  let slDate = $state<(string | number)[]>([2024, 2, 15]);
  function daysInMonth(y: number, m: number): number {
    return new Date(y, m, 0).getDate();
  }
  const slDayData = $derived(
    Array.from({ length: daysInMonth(Number(slDate[0]), Number(slDate[1])) }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}日`,
    })),
  );
  const slDateColumns = $derived([
    { data: slYears, ariaLabel: '年' },
    { data: slMonths, ariaLabel: '月' },
    { data: slDayData, ariaLabel: '日', cyclic: true },
  ]);

  // cyclic 循环单列（小时，无禁用）
  const slCyclicHours = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
  }));
  let slCyclicHour = $state<string | number>(12);

  // 虚拟化大数据列（1000 项）
  const slBigData = Array.from({ length: 1000 }, (_, i) => ({ value: i, label: `项 ${i}` }));
  let slBigPicked = $state<string | number>(500);

  // loadMore + status 演示
  let slMoreData = $state(Array.from({ length: 20 }, (_, i) => ({ value: i, label: `条目 ${i}` })));
  let slStatus = $state<'idle' | 'loading' | 'empty'>('idle');
  function slLoadMore() {
    if (slStatus === 'loading' || slMoreData.length >= 60) return;
    slStatus = 'loading';
    setTimeout(() => {
      const start = slMoreData.length;
      slMoreData = [
        ...slMoreData,
        ...Array.from({ length: 20 }, (_, i) => ({ value: start + i, label: `条目 ${start + i}` })),
      ];
      slStatus = 'idle';
    }, 600);
  }

  const overflowTags = ['设计', '研发', '测试', '产品', '运营', '市场', '财务', '法务'];
  let overflowWidth = $state(400);
  let overflowHidden = $state(0);
  // 命令式方法演示：forceMeasure（隐藏后重显手动重测）+ scrollTo（scroll 模式滚到指定项）
  let overflowForceRef = $state<{ forceMeasure: () => void } | undefined>();
  let overflowScrollRef = $state<{ scrollTo: (i: number, o?: { align?: 'start' | 'center' | 'end' }) => void } | undefined>();
  let overflowHiddenBox = $state(false);
  const longTags = ['标签一', '标签二', '标签三', '标签四', '标签五', '标签六', '标签七', '标签八', '标签九', '标签十', '标签十一', '标签十二'];

  let spinWrap = $state(true);

  let progressPct = $state(45);

  let skeletonLoading = $state(true);

  let bannerOpen = $state(true);

  let modalOpen = $state(false);
  let dangerModalOpen = $state(false);
  let destroyModalOpen = $state(false);
  let dragModalOpen = $state(false);

  let drawerRight = $state(false);
  let drawerLeft = $state(false);
  let drawerBottom = $state(false);
  let drawerTop = $state(false);
  let drawerDestroy = $state(false);
  let drawerNestOuter = $state(false);
  let drawerNestInner = $state(false);
  let drawerNoKbd = $state(false);
  let ssRight = $state(false);
  let ssLeft = $state(false);
  let ssTop = $state(false);
  let ssBottom = $state(false);
  let ssSmall = $state(false);
  let ssLarge = $state(false);
  let ssNoMask = $state(false);
  let ssFooter = $state(false);
  let ssDestroy = $state(false);
  let ssReason = $state('');

  let popResult = $state('（无）');
  let popContainerEl = $state<HTMLDivElement | null>(null);

  let localeIsZh = $state(true);

  // registerLocale 演示：注册一个法语自定义包，之后可用字符串码 'fr_FR' 引用。
  registerLocale('fr_FR', {
    ...en_US,
    code: 'fr-FR',
    Modal: { okText: 'Confirmer', cancelText: 'Annuler', close: 'Fermer' },
  });
  let localeCode = $state<'zh_CN' | 'en_US' | 'fr_FR'>('zh_CN');

  let submitted = $state('');
  let warnSubmitted = $state('');
  let valuePropSubmitted = $state('');
  let specPropsSubmitted = $state('');
  let nativeSubmitCount = $state(0);
  let fieldPropsSubmitted = $state('');
  let extStatus = $state<'default' | 'warning' | 'error'>('error');
  let selVal = $state<string | number>('');
  let selGroupVal = $state<string | number>('');
  // remote 搜索：模拟异步返回选项
  let remoteVal = $state<string | number>('');
  let remoteOptions = $state<{ label: string; value: string }[]>([]);
  let remoteLoading = $state(false);
  let remoteTimer: ReturnType<typeof setTimeout> | undefined;
  function handleRemoteSearch(q: string) {
    if (remoteTimer) clearTimeout(remoteTimer);
    if (!q.trim()) {
      remoteOptions = [];
      remoteLoading = false;
      return;
    }
    remoteLoading = true;
    remoteTimer = setTimeout(() => {
      remoteOptions = [1, 2, 3].map((i) => ({ label: `${q} 结果 ${i}`, value: `${q}-${i}` }));
      remoteLoading = false;
    }, 500);
  }
  let multiVal = $state<(string | number)[]>([]);
  let acVal = $state('');
  let acInsetVal = $state('');
  let acGroupVal = $state('');
  let acRemoteVal = $state('');
  let acRemoteData = $state<{ label: string; value: string }[]>([]);
  let acRemoteLoading = $state(false);
  let acRemoteTimer: ReturnType<typeof setTimeout> | undefined;
  function handleAcRemoteSearch(q: string) {
    if (acRemoteTimer) clearTimeout(acRemoteTimer);
    if (!q.trim()) {
      acRemoteData = [];
      acRemoteLoading = false;
      return;
    }
    acRemoteLoading = true;
    acRemoteTimer = setTimeout(() => {
      acRemoteData = [1, 2, 3].map((i) => ({ label: `${q}-suggestion-${i}`, value: `${q}-${i}` }));
      acRemoteLoading = false;
    }, 500);
  }
  let tags = $state<string[]>(['svelte', 'vite']);
  let tagsCtrl = $state<string[]>([]);
let tagsTrunc = $state<string[]>(['超长标签文本示例内容', '短']);
let tagsDrag = $state<string[]>(['一', '二', '三', '四']);
  let tagsI18n = $state<string[]>(['svelte', 'i18n']);
  let tagInputCtrl = $state('');
  let color = $state('#3366ff');
let colorInline = $state('#16a34a');
  let dateVal = $state<Date | null>(null);
  let dateTimeVal = $state<Date | null>(null);
  let dateRangeVal = $state<[Date | null, Date | null] | null>(null);
let monthVal = $state<Date | null>(null);
let yearVal = $state<Date | null>(null);
let disabledTimeVal = $state<Date | null>(null);
let presetVal = $state<Date | null>(null);
let formatVal = $state<Date | null>(null);
let maxRangeVal = $state<[Date | null, Date | null] | null>(null);
  let timeVal = $state<Date | null>(null);
  let timeVal12 = $state<Date | null>(null);
  let timeValDisabled = $state<Date | null>(null);
  let timeRangeVal = $state<[Date | null, Date | null]>([null, null]);
  let timeFormatVal = $state<Date | null>(null);
  let cascaderVal = $state<(string | number)[]>([]);
  let cascaderMultiVal = $state<(string | number)[][]>([]);
  let cascaderHoverVal = $state<(string | number)[]>([]);
  let cascaderDisplayVal = $state<(string | number)[]>([]);
  let cascaderCosVal = $state<(string | number)[]>([]);
  let treeVal = $state<string | number | null>(null);
  let treeMultiVal = $state<(string | number)[]>([]);
  let transferVal = $state<(string | number)[]>(['b']);
  let transferGroupVal = $state<(string | number)[]>(['hz']);
  let transferTreeVal = $state<(string | number)[]>(['hz']);
  let transferOneWayVal = $state<(string | number)[]>(['b']);
  // picture-card 上传：含一个初始已上传项（url 预览），便于直接看到缩略图
  let uploadImageVal = $state<
    { uid: string; name: string; size: number; status: 'ready' | 'uploading' | 'success' | 'error'; url?: string; file?: File }[]
  >([{ uid: 'img-1', name: 'sample.svg', size: 1024, status: 'success', url: demoImageSrc }]);
  let page = $state(1);
let breadcrumbMore = $state('—');
let page2 = $state(1);
let pageSize2 = $state(10);
  let step = $state(1);
  let activeTab = $state<string | number>('a');
  let lastDropdown = $state('');
  let dropdownPopupContainer = $state<HTMLDivElement | null>(null);
  const tabList = [
    { tab: '账户', itemKey: 'a' },
    { tab: '安全', itemKey: 'b' },
    { tab: '通知', itemKey: 'c', disabled: true },
  ];
  // 溢出滚动 demo：很多标签 + 窄容器触发滚动箭头
  let overflowActive = $state<string | number>('o1');
  const overflowTabs = [
    { tab: '概览', itemKey: 'o1' },
    { tab: '用户管理', itemKey: 'o2' },
    { tab: '权限配置', itemKey: 'o3' },
    { tab: '数据统计', itemKey: 'o4' },
    { tab: '消息中心', itemKey: 'o5' },
    { tab: '系统日志', itemKey: 'o6' },
    { tab: '安全审计', itemKey: 'o7' },
    { tab: '高级设置', itemKey: 'o8' },
  ];
  // overflow=dropdown demo：窄容器把放不下的标签收进末尾「更多」下拉
  let dropdownTabActive = $state<string | number>('o1');
  // type=button demo：分段按钮组
  let buttonTabActive = $state<string | number>('a');
  // addable demo：「+」按钮回调里父组件追加 tab（受控数据）
  let addableActive = $state<string | number>('t1');
  let addableTabs = $state([
    { tab: '标签 1', itemKey: 't1' },
    { tab: '标签 2', itemKey: 't2' },
  ]);
  let addableSeq = 2;
  function addTab() {
    addableSeq += 1;
    const key = `t${addableSeq}`;
    addableTabs = [...addableTabs, { tab: `标签 ${addableSeq}`, itemKey: key }];
    addableActive = key;
  }
  // 纯声明式自动收集 demo：不传 tabList，仅写 <Tabs.Pane>，标签栏自动推导
  let declActive = $state<string | number>('d1');
  // renderTabBar demo：完全自绘标签栏
  let renderBarActive = $state<string | number>('a');
  const dropdownItems = [
    { key: 'edit', label: '编辑' },
    { key: 'copy', label: '复制' },
    { key: 'delete', label: '删除', danger: true },
  ];
  // 嵌套子菜单 + divider + group demo（多层嵌套）
  const dropdownTreeItems: DropdownItem[] = [
    { key: 'new', label: '新建' },
    {
      key: 'export',
      label: '导出为',
      children: [
        { key: 'export-pdf', label: 'PDF' },
        { key: 'export-png', label: 'PNG' },
        {
          key: 'export-more',
          label: '更多格式',
          children: [
            { key: 'export-svg', label: 'SVG' },
            { key: 'export-webp', label: 'WebP' },
          ],
        },
      ],
    },
    { type: 'divider' },
    {
      type: 'group',
      label: '编辑操作',
      children: [
        { key: 'cut', label: '剪切' },
        { key: 'paste', label: '粘贴', disabled: true },
      ],
    },
    { type: 'divider' },
    { key: 'remove', label: '删除', danger: true },
  ];
  let menuSelected = $state<string | number>('overview');
  let menuCollapsed = $state(true);
  let menuMultiple = $state<(string | number)[]>(['overview']);
  function toggleMenuMultiple(k: string | number) {
    menuMultiple = menuMultiple.includes(k)
      ? menuMultiple.filter((x) => x !== k)
      : [...menuMultiple, k];
  }
  const menuItems = [
    { key: 'overview', label: '概览' },
    {
      key: 'settings',
      label: '设置',
      children: [
        { key: 'profile', label: '个人资料' },
        { key: 'security', label: '安全' },
      ],
    },
    { key: 'help', label: '帮助', disabled: true },
  ];
  // hover 浮层菜单：含两级嵌套，验证多级浮层
  const menuPopupItems = [
    { key: 'overview', label: '概览' },
    {
      key: 'settings',
      label: '设置',
      children: [
        { key: 'profile', label: '个人资料' },
        {
          key: 'security',
          label: '安全',
          children: [
            { key: 'password', label: '修改密码' },
            { key: '2fa', label: '两步验证' },
          ],
        },
      ],
    },
    { key: 'about', label: '关于' },
  ];
  // divider 分隔符 + group 分组标题
  const menuGroupItems = [
    {
      type: 'group' as const,
      key: 'g-main',
      label: '主导航',
      children: [
        { key: 'overview', label: '概览' },
        { key: 'analytics', label: '分析' },
      ],
    },
    { type: 'divider' as const },
    {
      type: 'group' as const,
      key: 'g-manage',
      label: '管理',
      children: [
        { key: 'users', label: '用户' },
        {
          key: 'settings',
          label: '设置',
          children: [
            { key: 'profile', label: '个人资料' },
            { key: 'security', label: '安全' },
          ],
        },
      ],
    },
    { type: 'divider' as const },
    { key: 'help', label: '帮助', disabled: true },
  ];
  // navigation 用途：站点导航，叶子带 href 渲染原生 <a>，含 inline 子导航
  let navCurrent = $state<string | number>('nav-docs');
  const navItems = [
    { key: 'nav-home', label: '首页', href: '#nav-home' },
    {
      key: 'nav-docs',
      label: '文档',
      children: [
        { key: 'nav-start', label: '快速开始', href: '#nav-start' },
        { key: 'nav-guide', label: '指南', href: '#nav-guide' },
      ],
    },
    { type: 'divider' as const },
    { key: 'nav-blog', label: '博客', href: '#nav-blog' },
    { key: 'nav-ext', label: 'GitHub', href: 'https://github.com', target: '_blank', rel: 'noopener noreferrer' },
    { key: 'nav-off', label: '停用项', href: '#nav-off', disabled: true },
  ];
  let anchorKey = $state('#sec-1');
  const anchorLinks = [
    { key: '#sec-1', href: '#sec-1', title: '第一节' },
    { key: '#sec-2', href: '#sec-2', title: '第二节' },
    { key: '#sec-3', href: '#sec-3', title: '第三节' },
  ];
  let anchorContainerEl = $state<HTMLElement | null>(null);
  let anchorContainerKey = $state('#cbox-1');
  const anchorContainerLinks = [
    { key: '#cbox-1', href: '#cbox-1', title: '容器节 1' },
    { key: '#cbox-2', href: '#cbox-2', title: '容器节 2' },
    { key: '#cbox-3', href: '#cbox-3', title: '容器节 3' },
  ];
  let anchorHKey = $state('#hsec-1');
  const anchorHLinks = [
    { key: '#hsec-1', href: '#hsec-1', title: '概述' },
    { key: '#hsec-2', href: '#hsec-2', title: '安装' },
    { key: '#hsec-3', href: '#hsec-3', title: '用法' },
  ];
  let anchorNestEl = $state<HTMLElement | null>(null);
  let anchorNestKey = $state('#nest-1');
  const anchorNestLinks = [
    {
      key: '#nest-1',
      href: '#nest-1',
      title: '开始',
      children: [
        { key: '#nest-1-1', href: '#nest-1-1', title: '安装' },
        { key: '#nest-1-2', href: '#nest-1-2', title: '快速上手' },
      ],
    },
    {
      key: '#nest-2',
      href: '#nest-2',
      title: '组件',
      children: [
        {
          key: '#nest-2-1',
          href: '#nest-2-1',
          title: '导航',
          children: [
            { key: '#nest-2-1-1', href: '#nest-2-1-1', title: 'Anchor' },
            { key: '#nest-2-1-2', href: '#nest-2-1-2', title: 'Menu' },
          ],
        },
        { key: '#nest-2-2', href: '#nest-2-2', title: '反馈' },
      ],
    },
    { key: '#nest-3', href: '#nest-3', title: '主题' },
  ];
  const transferData = [
    { key: 'a', label: '北京' },
    { key: 'b', label: '上海' },
    { key: 'c', label: '广州' },
    { key: 'd', label: '深圳' },
  ];
  // 大数据集：验证虚拟化（视口内仅渲染少量 DOM）。
  const transferBigData = Array.from({ length: 2000 }, (_, i) => ({
    key: `n${i}`,
    label: `选项 ${i}`,
  }));
  let transferBigVal = $state<(string | number)[]>([]);
  // draggable：右列已选项拖拽重排。
  let transferDragVal = $state<(string | number)[]>(['a', 'b', 'c', 'd']);
  // remote onSearch：模拟异步搜索（loading + 防抖）。
  const transferRemoteAll = Array.from({ length: 50 }, (_, i) => ({
    key: `r${i}`,
    label: `远程城市 ${i}`,
  }));
  let transferRemoteData = $state<{ key: string; label: string }[]>(
    transferRemoteAll.slice(0, 8),
  );
  let transferRemoteVal = $state<(string | number)[]>([]);
  let transferRemoteLoading = $state(false);
  let transferRemoteTimer: ReturnType<typeof setTimeout> | undefined;
  function transferRemoteSearch(q: string) {
    transferRemoteLoading = true;
    if (transferRemoteTimer) clearTimeout(transferRemoteTimer);
    transferRemoteTimer = setTimeout(() => {
      const kw = q.trim().toLowerCase();
      transferRemoteData = kw
        ? transferRemoteAll.filter((o) => o.label.toLowerCase().includes(kw))
        : transferRemoteAll.slice(0, 8);
      transferRemoteLoading = false;
    }, 500);
  }
  const transferGroupData = [
    {
      title: '华东',
      items: [
        { key: 'hz', label: '杭州' },
        { key: 'nj', label: '南京' },
        { key: 'sh', label: '上海' },
      ],
    },
    {
      title: '华南',
      items: [
        { key: 'gz', label: '广州' },
        { key: 'sz', label: '深圳' },
      ],
    },
  ];
  const transferTreeData = [
    {
      key: 'east',
      label: '华东',
      children: [
        { key: 'hz', label: '杭州' },
        { key: 'nj', label: '南京' },
        { key: 'sh', label: '上海' },
      ],
    },
    {
      key: 'south',
      label: '华南',
      children: [
        { key: 'gz', label: '广州' },
        { key: 'sz', label: '深圳' },
      ],
    },
    { key: 'cd', label: '成都' },
  ];
  const regionData = [
    {
      label: '浙江',
      value: 'zj',
      children: [
        { label: '杭州', value: 'hz', children: [{ label: '西湖区', value: 'xh' }, { label: '余杭区', value: 'yh' }] },
        { label: '宁波', value: 'nb', children: [{ label: '海曙区', value: 'hs' }] },
      ],
    },
    {
      label: '江苏',
      value: 'js',
      children: [{ label: '南京', value: 'nj', children: [{ label: '玄武区', value: 'xw' }] }],
    },
  ];
  const orgTree = [
    {
      key: 'eng',
      label: '研发',
      children: [
        { key: 'fe', label: '前端' },
        { key: 'be', label: '后端' },
      ],
    },
    { key: 'design', label: '设计' },
  ];
  const fruitOptions = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '橙子', value: 'orange' },
    { label: '葡萄', value: 'grape' },
  ];

  // 长文本选项：演示 maxTagTextLength 单 tag 截断。
  const longTagOptions = [
    { label: '人工智能与机器学习', value: 'ai' },
    { label: '云原生基础设施', value: 'cloud' },
    { label: '前端工程化', value: 'fe' },
  ];
  let multiTruncVal = $state<(string | number)[]>(['ai', 'cloud']);

  // 虚拟化大数据：1000+ 选项，下拉只渲染视口内 ~15 个。
  const bigOptions = Array.from({ length: 2000 }, (_, i) => ({
    label: `选项 ${i + 1}`,
    value: i + 1,
  }));
  let bigVal = $state<string | number>('');

  let collapsed = $state(false);
  let editableText = $state('双击或点击编辑图标修改这段文字');
  let inputVal = $state('');
  let switchOn = $state(true);
  let checks = $state<(string | number)[]>(['a']);
  let cardChecks = $state<(string | number)[]>(['pro']);
  let radioVal = $state<string | number | boolean>('1');
  let radioStatusVal = $state<string | number | boolean>('warn');
  let numVal = $state<number | null>(3);
  let amountVal = $state<number | null>(12000);
  let wheelVal = $state<number | null>(50);
  let strictVal = $state<number | null>(5);
  let sidesVal = $state<number | null>(2);
  let strictHit = $state('');
  let rateVal = $state(2.5);
  let sliderVal = $state(40);
  let rangeVal = $state<[number, number]>([20, 60]);

  // Upload concurrency + beforeUpload 演示
  let uploadConcVal = $state<UploadFileItem[]>([]);
  // Upload directory + minSize 演示
  let uploadDirVal = $state<UploadFileItem[]>([]);
  let uploadConcActive = $state(0);
  let uploadConcPeak = $state(0);
  // BackTop：自定义 target 容器 + 受控 visible + announceOnArrive 演示
  let backtopBox = $state<HTMLElement | null>(null);
  let backtopControlled = $state(false);
  // 模拟上传：每个请求 ~800ms 完成，返回 Promise 让 concurrency 调度（完成才补位）。
  function mockUpload(item: UploadFileItem): Promise<void> {
    uploadConcActive += 1;
    if (uploadConcActive > uploadConcPeak) uploadConcPeak = uploadConcActive;
    return new Promise<void>((resolve) => {
      let p = 0;
      const tick = setInterval(() => {
        p = Math.min(100, p + 25);
        uploadConcVal = uploadConcVal.map((it) =>
          it.uid === item.uid ? { ...it, status: 'uploading', percent: p } : it,
        );
        if (p >= 100) {
          clearInterval(tick);
          uploadConcActive -= 1;
          uploadConcVal = uploadConcVal.map((it) =>
            it.uid === item.uid ? { ...it, status: 'success', percent: 100 } : it,
          );
          resolve();
        }
      }, 200);
    });
  }
  // beforeUpload：拒绝大于 100KB 的文件（演示异步拦截）。
  async function uploadBefore(file: File): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 150));
    return file.size <= 100 * 1024;
  }

  let theme = $state<'light' | 'dark'>('light');
  $effect(() => {
    document.documentElement.dataset.theme = theme;
  });
</script>

{#snippet arrowIcon()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

<main class="p-6">
  <header class="flex items-center justify-between mb-6">
    <Title heading={3}>chenzy-design · M1 Basic</Title>
    <Button
      type="tertiary"
      onclick={() => (theme = theme === 'light' ? 'dark' : 'light')}
    >
      切换主题：{theme}
    </Button>
  </header>

  <Title heading={5}>Button</Title>
  <Space wrap>
    <Button type="primary">主要按钮</Button>
    <Button type="secondary">次要</Button>
    <Button type="tertiary">文字</Button>
    <Button type="warning">警告</Button>
    <Button type="danger">危险</Button>
    <Button type="primary" disabled>禁用</Button>
    <Button type="primary" loading>加载中</Button>
  </Space>

  <div style="margin-top: 12px;"><Paragraph type="tertiary">iconPosition 图标位置（left 默认 / right）：</Paragraph></div>
  <Space wrap>
    <Button type="primary" icon={arrowIcon}>左侧图标</Button>
    <Button type="primary" iconPosition="right" icon={arrowIcon}>右侧图标</Button>
  </Space>

  <Divider />

  <Title heading={5}>Icon</Title>
  <Space>
    <Icon size="small">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
      </svg>
    </Icon>
    <Icon status="success">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </Icon>
    <Icon status="error" size="large">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
      </svg>
    </Icon>
    <Icon spin label="加载中">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 3a9 9 0 1 0 9 9" stroke-linecap="round" />
      </svg>
    </Icon>
  </Space>

  <div style="margin-top: 12px;">
    <Paragraph type="tertiary">svg 字符串渲染源 + component 组件渲染源 + style 透传：</Paragraph>
  </div>
  <Space>
    <Icon svg={heartSvg} status="error" label="收藏" />
    <Icon component={StarIcon} status="warning" size="large" label="评分" />
    <Icon svg={heartSvg} style="color: var(--cd-color-primary); transform: scale(1.3);" />
  </Space>

  <Divider>分割线带文字</Divider>

  <Title heading={5}>Typography</Title>
  <Paragraph>
    这是一段正文 <Text type="secondary">次要文字</Text>、
    <Text mark>高亮</Text>、<Text code>code</Text>、
    <Text delete>删除线</Text>、<Text strong>加粗</Text>，以及
    <Link href="https://semi.design" target="_blank">一个链接</Link>。
  </Paragraph>

  <Title heading={6}>Typography · size 字号档（small / default / large）</Title>
  <Space direction="vertical" align="start">
    <Text size="small">size=small 小号文本</Text>
    <Text>size=default 默认文本</Text>
    <Text size="large">size=large 大号文本</Text>
    <Paragraph size="small">size=small 小号段落文本</Paragraph>
    <Paragraph size="large">size=large 大号段落文本</Paragraph>
  </Space>

  <Title heading={6}>Typography · ellipsis 省略</Title>
  <Paragraph type="tertiary">单行省略（鼠标悬浮看完整内容 tooltip）：</Paragraph>
  <div style="max-width: 320px; border: 1px dashed var(--cd-color-border, #ddd); padding: 8px;">
    <Text ellipsis={{ showTooltip: true }}>
      这是一段很长很长很长很长很长很长很长很长很长很长很长很长的单行文本会被省略
    </Text>
  </div>
  <div style="margin-top: 12px;"><Paragraph type="tertiary">多行省略 + 展开/收起（rows=2, expandable）：</Paragraph></div>
  <div style="max-width: 360px; border: 1px dashed var(--cd-color-border, #ddd); padding: 8px;">
    <Paragraph ellipsis={{ rows: 2, expandable: true }}>
      多行省略示例：这是一段较长的段落文本，超过两行后会被截断并显示展开按钮。点击展开查看完整内容，再次点击收起。
      省略逻辑由 @chenzy-design/core 的 createEllipsis 提供，CSS line-clamp 为默认路径，expandable/showTooltip/suffix 才启用 ResizeObserver 测量路径。
    </Paragraph>
  </div>

  <Title heading={6}>Typography · copyable 复制</Title>
  <Space>
    <Text copyable>npm i @chenzy-design/svelte</Text>
    <Text copyable={{ content: '自定义复制的内容 hello' }}>复制自定义内容</Text>
  </Space>

  <Title heading={6}>Typography · editable 可编辑</Title>
  <Text
    editable={{ trigger: 'dblclick', maxLength: 60 }}
    value={editableText}
    onChange={(v) => (editableText = v)}
  >
    {editableText}
  </Text>
  <div style="margin-top: 8px;"><Paragraph type="tertiary">
    点击右侧编辑图标或双击文字进入编辑；Enter 提交、Esc 取消、Shift+Enter 换行。受控 value + onChange（不回写）。
  </Paragraph></div>

  <Divider dashed />

  <Title heading={5}>Space（vertical）</Title>
  <Space direction="vertical" align="start">
    <Text>第一行</Text>
    <Text type="tertiary">第二行</Text>
    <Button type="primary" size="small">一个按钮</Button>
  </Space>

  <Divider />

  <Title heading={5}>Grid（24 栅格 + gutter）</Title>
  <Row gutter={16}>
    <Col span={6}><div class="demo-cell">span 6</div></Col>
    <Col span={6}><div class="demo-cell">span 6</div></Col>
    <Col span={6}><div class="demo-cell">span 6</div></Col>
    <Col span={6}><div class="demo-cell">span 6</div></Col>
  </Row>
  <div style="height: 8px"></div>
  <Row gutter={16}>
    <Col span={8}><div class="demo-cell">span 8</div></Col>
    <Col span={8} offset={4}><div class="demo-cell">span 8 offset 4</div></Col>
  </Row>

  <Text type="tertiary">响应式（缩放窗口看变化）：每格 xs=24 / sm=12 / lg=6，gutter 随断点变。</Text>
  <Row gutter={{ xs: 8, md: 16, lg: 24 }}>
    <Col xs={24} sm={12} lg={6}><div class="demo-cell">A</div></Col>
    <Col xs={24} sm={12} lg={6}><div class="demo-cell">B</div></Col>
    <Col xs={24} sm={12} lg={6}><div class="demo-cell">C</div></Col>
    <Col xs={24} sm={12} lg={6}><div class="demo-cell">D</div></Col>
  </Row>

  <Divider />

  <Title heading={5}>Layout（可折叠侧栏）</Title>
  <div class="demo-layout">
    <Layout hasSider>
      <Layout.Sider {collapsed} collapsible width={160} collapsedWidth={56}>
        <div class="demo-sider-body">侧栏</div>
      </Layout.Sider>
      <Layout>
        <Layout.Header>
          <div class="demo-bar">
            <Button
              size="small"
              type="tertiary"
              onclick={() => (collapsed = !collapsed)}
            >
              {collapsed ? '展开' : '收起'}
            </Button>
            <Text strong>页头</Text>
          </div>
        </Layout.Header>
        <Layout.Content padding>主体内容区</Layout.Content>
        <Layout.Footer>页脚</Layout.Footer>
      </Layout>
    </Layout>
  </div>

  <Divider />

  <Title heading={5}>M2 Input</Title>
  <Space direction="vertical" align="start">
    <Space>
      <Input
        placeholder="请输入"
        clearable
        value={inputVal}
        onChange={(v) => (inputVal = v)}
      />
      <Input type="password" placeholder="密码" />
      <Input status="error" placeholder="错误态" />
      <Input disabled placeholder="禁用" />
    </Space>
    <Text type="tertiary">受控值：{inputVal || '（空）'}</Text>

    <div data-testid="textarea-autosize">
      <TextArea placeholder="多行文本，autosize（随输入增高）" autosize showCount maxLength={100} />
    </div>
    <div data-testid="textarea-maxrows" style="margin-top:12px">
      <TextArea placeholder="autosize 限高 minRows=2 maxRows=4，超出滚动" autosize={{ minRows: 2, maxRows: 4 }} />
    </div>

    <Space>
      <Switch value={switchOn} onChange={(v) => (switchOn = v)} />
      <Text>开关：{switchOn ? '开' : '关'}</Text>
      <Switch disabled />
      <Switch loading />
    </Space>

    <CheckboxGroup
      value={checks}
      onChange={(v) => (checks = v)}
      options={[
        { label: '选项 A', value: 'a' },
        { label: '选项 B', value: 'b' },
        { label: '选项 C（禁用）', value: 'c', disabled: true },
      ]}
    />
    <Text type="tertiary">已选：{checks.join(', ') || '（无）'}</Text>

    <Text type="tertiary">type=card / pureCard 卡片形态（整卡命中区，Group 透传，单项可覆盖）：</Text>
    <div data-testid="checkbox-card">
      <CheckboxGroup
        type="card"
        direction="vertical"
        value={cardChecks}
        onChange={(v) => (cardChecks = v)}
      >
        <Checkbox value="pro" extra="解锁全部高级特性">专业版</Checkbox>
        <Checkbox value="team" extra="多人协作与权限管理">团队版</Checkbox>
        <Checkbox value="plain" type="pureCard" extra="本项用 pureCard 覆盖（无边框）"
          >无边框项</Checkbox
        >
      </CheckboxGroup>
    </div>
    <Text type="tertiary">卡片已选：{cardChecks.join(', ') || '（无）'}</Text>

    <Text type="tertiary">status 校验态（Group 透传，单项可覆盖）：</Text>
    <div data-testid="checkbox-status">
      <CheckboxGroup status="error" defaultValue={['a']}>
        <Checkbox value="a">error 透传</Checkbox>
        <Checkbox value="b">error 透传</Checkbox>
        <Checkbox value="c" status="warning">单项覆盖 warning</Checkbox>
      </CheckboxGroup>
    </div>

    <RadioGroup
      value={radioVal}
      onChange={(v) => (radioVal = v)}
      options={[
        { label: '单选 1', value: '1' },
        { label: '单选 2', value: '2' },
        { label: '单选 3', value: '3' },
      ]}
    />
    <Text type="tertiary">当前：{radioVal}</Text>

    <Text type="tertiary">Group status 透传（warning / error），单项可覆盖：</Text>
    <RadioGroup
      status="error"
      value={radioStatusVal}
      onChange={(v) => (radioStatusVal = v)}
    >
      <Radio value="warn" status="warning">本项覆盖为 warning</Radio>
      <Radio value="err">继承 Group 的 error</Radio>
      <Radio value="ok">同样继承 error</Radio>
    </RadioGroup>
  </Space>

  <Divider />

  <Title heading={5}>M2 数值组件</Title>
  <Space direction="vertical" align="start">
    <Space>
      <InputNumber value={numVal} min={0} max={10} onChange={(v) => (numVal = v)} />
      <Text type="tertiary">数值：{numVal}</Text>
    </Space>

    <div data-testid="inputnumber-fmt">
      <InputNumber
        value={amountVal}
        min={0}
        step={1000}
        formatter={(n) => `¥ ${n.toLocaleString('en-US')}`}
        parser={(s) => Number(s.replace(/[^\d.-]/g, ''))}
        onChange={(v) => (amountVal = v)}
      />
      <Text type="tertiary">金额：{amountVal}（长按 +/- 连续增减）</Text>
    </div>

    <div data-testid="inputnumber-wheel">
      <InputNumber
        value={wheelVal}
        min={0}
        max={100}
        mouseWheel
        selectOnFocus
        onChange={(v) => (wheelVal = v)}
      />
      <Text type="tertiary">滚轮调值（聚焦后滚动）+ 聚焦全选：{wheelVal}</Text>
    </div>

    <div data-testid="inputnumber-strict">
      <InputNumber
        value={strictVal}
        min={0}
        max={10}
        boundaryMode="strict"
        onChange={(v) => (strictVal = v)}
        onBoundaryHit={(e) => (strictHit = `${e.boundary} @ ${e.value}`)}
      />
      <Text type="tertiary">strict 越界拒绝回滚；boundaryHit：{strictHit || '—'}</Text>
    </div>

    <div data-testid="inputnumber-sides">
      <div style="width: 160px">
        <InputNumber
          value={sidesVal}
          min={0}
          max={9}
          controlsPosition="sides"
          onChange={(v) => (sidesVal = v)}
        />
      </div>
      <Text type="tertiary">controlsPosition=sides 两侧按钮：{sidesVal}</Text>
    </div>

    <div data-testid="inputnumber-inner">
      <div style="width: 160px">
        <InputNumber defaultValue={1} min={0} innerButtons />
      </div>
      <Text type="tertiary">innerButtons 内嵌按钮（hover/聚焦显形）</Text>
    </div>

    <div data-testid="inputnumber-locale">
      <InputNumber defaultValue={1234567} locale="de-DE" />
      <Text type="tertiary">locale=de-DE 千分位（无 formatter 时走 Intl）</Text>
    </div>

    <div data-testid="inputnumber-label">
      <label for="qty-demo"><Text type="tertiary">数量（id 关联 label）</Text></label>
      <InputNumber id="qty-demo" defaultValue={1} min={0} autofocus={false} />
    </div>

    <Space>
      <Rating value={rateVal} allowHalf onChange={(v) => (rateVal = v)} />
      <Text type="tertiary">评分：{rateVal}</Text>
    </Space>

    <div style="width: 280px">
      <Slider value={sliderVal} onChange={(v) => (sliderVal = v as number)} />
      <Text type="tertiary">单值：{sliderVal}</Text>
    </div>

    <div style="width: 280px">
      <Slider
        range
        value={rangeVal}
        onChange={(v) => (rangeVal = v as [number, number])}
      />
      <Text type="tertiary">区间：{rangeVal[0]} – {rangeVal[1]}</Text>
    </div>

    <div style="width: 280px" data-testid="slider-status">
      <Text type="tertiary">status 校验态：</Text>
      <Slider status="warning" defaultValue={40} />
      <Slider status="error" defaultValue={70} />
    </div>
  </Space>

  <Divider />

  <Title heading={5}>Form（校验 + 提交）</Title>
  <div style="max-width: 360px">
    <Form
      onSubmit={(r) =>
        (submitted = r.valid ? `提交成功：${JSON.stringify(r.values)}` : '校验未通过')}
    >
      <Form.Input field="email" label="邮箱" required rules={[{ type: 'email' }]} />
      <Form.Input field="name" label="昵称" required />
      {#snippet footer({ submitting })}
        <Button type="primary" htmlType="submit" loading={submitting}>提交</Button>
      {/snippet}
    </Form>
    <Text type="tertiary">{submitted}</Text>
  </div>

  <div style="max-width: 360px; margin-top: 16px" data-testid="form-inset">
    <Text type="tertiary">inset label（聚焦/有值时上浮）：</Text>
    <Form labelPosition="inset">
      <Form.Input field="city" label="城市" />
      <Form.Input field="company" label="公司" />
    </Form>
  </div>

  <div style="max-width: 360px; margin-top: 16px" data-testid="form-list">
    <Text type="tertiary">Form.List 动态字段数组（增/删联系人）：</Text>
    <Form>
      <Form.List name="contacts" initialCount={1}>
        {#snippet children({ items, name, add, remove })}
          {#each items as item, i (item.key)}
            <div style="display:flex; gap:8px; align-items:flex-start">
              <div style="flex:1">
                <Form.Input field={name(item, 'name')} label={`联系人 ${i + 1}`} required />
              </div>
              <button
                type="button"
                style="margin-top:28px"
                onclick={() => remove(item)}
              >删除</button>
            </div>
          {/each}
          <Button onclick={add}>+ 添加联系人</Button>
        {/snippet}
      </Form.List>
    </Form>
  </div>

  <div style="max-width: 360px; margin-top: 16px" data-testid="form-dependencies">
    <Text type="tertiary">字段联动 dependencies（确认密码依赖密码）：</Text>
    <Form>
      <Form.Input field="password" label="密码" type="password" required />
      <Form.Input
        field="confirm"
        label="确认密码"
        type="password"
        required
        dependencies={['password']}
        rules={[
          {
            validator: (v, values) =>
              v === values.password ? undefined : '两次输入的密码不一致',
          },
        ]}
      />
      {#snippet footer()}
        <Button type="primary" htmlType="submit">提交</Button>
      {/snippet}
    </Form>
  </div>

  <div style="max-width: 360px; margin-top: 16px" data-testid="form-scroll-to-error">
    <Text type="tertiary">scrollToError（提交滚动到首个错误字段）：</Text>
    <Form scrollToError>
      <Form.Input field="s_a" label="字段 A" required />
      <Form.Input field="s_b" label="字段 B" required />
      <Form.Input field="s_c" label="字段 C" required />
      {#snippet footer()}
        <Button type="primary" htmlType="submit">提交</Button>
      {/snippet}
    </Form>
  </div>

  <div style="max-width: 360px; margin-top: 16px" data-testid="form-validating">
    <Text type="tertiary">validating（异步校验中显示加载指示）：</Text>
    <Form>
      <Form.Input
        field="username"
        label="用户名"
        rules={[
          {
            validator: (v) =>
              new Promise((resolve) =>
                setTimeout(() => resolve(v === 'taken' ? '该用户名已被占用' : undefined), 800),
              ),
          },
        ]}
      />
    </Form>
  </div>

  <div style="max-width: 360px; margin-top: 16px" data-testid="form-warning">
    <Text type="tertiary">warningOnly（非阻塞警告，不影响提交）：</Text>
    <Form
      onSubmit={(r) => (warnSubmitted = r.valid ? `提交成功：${JSON.stringify(r.values)}` : '校验未通过')}
    >
      <Form.Input
        field="nickname"
        label="昵称"
        rules={[{ minLength: 6, warningOnly: true, message: '建议昵称不少于 6 个字符' }]}
      />
      {#snippet footer()}
        <Button type="primary" htmlType="submit">提交</Button>
      {/snippet}
    </Form>
    <Text type="tertiary">{warnSubmitted}</Text>
  </div>

  <div style="max-width: 360px; margin-top: 16px" data-testid="form-valueprop">
    <Text type="tertiary">valuePropName="checked"（Checkbox 接入表单字段）：</Text>
    <Form
      onSubmit={(r) =>
        (valuePropSubmitted = r.valid ? `提交成功：${JSON.stringify(r.values)}` : '校验未通过')}
    >
      <Form.Field
        field="agree"
        valuePropName="checked"
        required
        rules={[{ validator: (v) => (v === true ? undefined : '请勾选同意协议') }]}
      >
        {#snippet children({ checked, onChange })}
          <Checkbox checked={checked === true} onChange={(c) => onChange(c)}>
            我已阅读并同意用户协议
          </Checkbox>
        {/snippet}
      </Form.Field>
      {#snippet footer()}
        <Button type="primary" htmlType="submit">提交</Button>
      {/snippet}
    </Form>
    <Text type="tertiary">{valuePropSubmitted}</Text>
  </div>

  <div style="max-width: 360px; margin-top: 16px" data-testid="form-spec-props">
    <Text type="tertiary"
      >spec §4 props（labelAlign=right / validateTrigger=blur / showValidateIcon / stopValidateWithError
      / allowEmpty）：</Text
    >
    <Form
      labelPosition="left"
      labelWidth={88}
      labelAlign="right"
      validateTrigger="blur"
      showValidateIcon
      stopValidateWithError
      allowEmpty
      onSubmit={(r) =>
        (specPropsSubmitted = `valid=${r.valid} values=${JSON.stringify(r.values)}`)}
    >
      <Form.Input
        field="sp_email"
        label="邮箱"
        required
        rules={[{ type: 'email' }, { minLength: 20 }]}
      />
      <Form.Input field="sp_note" label="备注" trigger="change" />
      {#snippet footer()}
        <Button type="primary" htmlType="submit">提交</Button>
      {/snippet}
    </Form>
    <Text type="tertiary">{specPropsSubmitted}</Text>
  </div>

  <div style="max-width: 360px; margin-top: 16px" data-testid="form-prevent-default">
    <Text type="tertiary">preventDefault=false（不拦截原生 submit）：</Text>
    <Form
      preventDefault={false}
      onSubmit={() => {
        nativeSubmitCount += 1;
      }}
    >
      <Form.Input field="pd_name" label="名称" />
      {#snippet footer()}
        <Button type="primary" htmlType="submit">提交</Button>
      {/snippet}
    </Form>
    <Text type="tertiary">onSubmit 次数：{nativeSubmitCount}</Text>
  </div>

  <div style="max-width: 520px; margin-top: 16px" data-testid="form-field-props">
    <Text type="tertiary"
      >Form.Field spec §4.2（initValue / validateStatus / noStyle / span /
      transform）：</Text
    >
    <Form
      onSubmit={(r) =>
        (fieldPropsSubmitted = r.valid
          ? `提交值：${JSON.stringify(r.values)}`
          : '校验未通过')}
    >
      <!-- span: 字段在 grid 容器内占列 -->
      <div
        style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;align-items:start"
      >
        <!-- initValue: 字段级初值（容器未给该字段时生效） -->
        <Form.Input field="fp_first" label="名" initValue="三" span={1} />
        <Form.Input field="fp_last" label="姓" initValue="张" span={1} />
        <!-- transform: 提交前去空格并大写；live 值保持原样 -->
        <Form.Input
          field="fp_code"
          label="编码（提交时大写）"
          span={2}
          transform={(v) => String(v ?? '').trim().toUpperCase()}
        />
        <!-- validateStatus: 外部强制展示态（受控，不经内部校验） -->
        <Form.Input
          field="fp_ext"
          label="外部受控态"
          validateStatus={extStatus}
          span={2}
        />
        <!-- noStyle: 仅收集不渲染布局，控件直接平铺 -->
        <div style="grid-column:span 2">
          <Form.Field field="fp_hidden" initValue="hidden-collected" noStyle>
            {#snippet children({ value })}
              <Text type="tertiary"
                >noStyle 字段值（无布局，仍参与收集）：{String(value)}</Text
              >
            {/snippet}
          </Form.Field>
        </div>
      </div>
      {#snippet footer()}
        <Space>
          <Button type="primary" htmlType="submit">提交</Button>
          <Button
            onclick={() =>
              (extStatus =
                extStatus === 'error'
                  ? 'warning'
                  : extStatus === 'warning'
                    ? 'default'
                    : 'error')}>切换受控态（{extStatus}）</Button
          >
        </Space>
      {/snippet}
    </Form>
    <Text type="tertiary">{fieldPropsSubmitted}</Text>
  </div>

  <Divider />

  <Title heading={5}>Select / AutoComplete</Title>
  <Space direction="vertical" align="start">
    <div style="width: 220px">
      <Select
        options={fruitOptions}
        value={selVal}
        clearable
        onChange={(v) => (selVal = v as string | number)}
      />
      <Text type="tertiary">单选：{selVal || '（未选）'}</Text>
    </div>

    <div style="width: 220px" data-testid="select-group">
      <Select
        options={[
          { label: '水果', options: [
            { label: '苹果', value: 'apple' },
            { label: '香蕉', value: 'banana' },
          ] },
          { label: '蔬菜', options: [
            { label: '番茄', value: 'tomato' },
            { label: '黄瓜', value: 'cucumber' },
          ] },
        ]}
        filter
        clearable
        placeholder="分组选择"
        value={selGroupVal}
        onChange={(v) => (selGroupVal = v as string | number)}
      />
      <Text type="tertiary">分组单选：{selGroupVal || '（未选）'}</Text>
    </div>

    <div style="width: 220px" data-testid="select-remote">
      <Select
        options={remoteOptions}
        filter
        loading={remoteLoading}
        onSearch={handleRemoteSearch}
        clearable
        placeholder="远程搜索（输入触发）"
        value={remoteVal}
        onChange={(v) => (remoteVal = v as string | number)}
      />
      <Text type="tertiary">远程：{remoteVal || '（未选）'}</Text>
    </div>

    <div style="width: 260px" data-testid="select-multi">
      <Select
        options={fruitOptions}
        multiple
        filter
        allowCreate
        maxTagCount={2}
        value={multiVal}
        onChange={(v) => (multiVal = v as (string | number)[])}
      />
      <Text type="tertiary">多选（折叠 2 / 可创建）：{multiVal.join(', ') || '（无）'}</Text>
    </div>

    <div style="width: 260px" data-testid="select-multi-trunc">
      <Select
        options={longTagOptions}
        multiple
        maxTagTextLength={4}
        value={multiTruncVal}
        onChange={(v) => (multiTruncVal = v as (string | number)[])}
      />
      <Text type="tertiary">多选单 tag 截断（maxTagTextLength=4）：{multiTruncVal.join(', ') || '（无）'}</Text>
    </div>

    <div style="width: 260px" data-testid="select-virtualized">
      <Select
        options={bigOptions}
        virtualized
        filter
        clearable
        placeholder="虚拟化（2000 选项）"
        value={bigVal}
        onChange={(v) => (bigVal = v as string | number)}
      />
      <Text type="tertiary">虚拟化单选：{bigVal || '（未选）'}</Text>
    </div>

    <div style="width: 220px">
      <AutoComplete
        data={['gmail.com', 'outlook.com', 'qq.com', '163.com']}
        value={acVal}
        placeholder="输入邮箱后缀"
        onChange={(v) => (acVal = v)}
      />
      <Text type="tertiary">输入：{acVal || '（空）'}</Text>
    </div>

    <div style="width: 220px" data-testid="autocomplete-inset">
      <AutoComplete
        data={['gmail.com', 'outlook.com', 'qq.com', '163.com']}
        insetLabel="https://"
        openOnFocus
        value={acInsetVal}
        placeholder="聚焦展开 + 内嵌标签"
        onChange={(v) => (acInsetVal = v)}
      />
      <Text type="tertiary">内嵌：{acInsetVal || '（空）'}</Text>
    </div>

    <div style="width: 220px" data-testid="autocomplete-group">
      <AutoComplete
        data={[
          { label: '热门', options: ['gmail.com', 'outlook.com'] },
          { label: '国内', options: ['qq.com', '163.com', '126.com'] },
        ]}
        openOnFocus
        value={acGroupVal}
        placeholder="分组候选"
        onChange={(v) => (acGroupVal = v)}
      />
      <Text type="tertiary">分组：{acGroupVal || '（空）'}</Text>
    </div>

    <div style="width: 220px" data-testid="autocomplete-remote">
      <AutoComplete
        data={acRemoteData}
        loading={acRemoteLoading}
        onSearch={handleAcRemoteSearch}
        searchDebounce={300}
        maxCount={5}
        clearable
        placeholder="远程联想（输入触发）"
        value={acRemoteVal}
        onChange={(v) => (acRemoteVal = v)}
      />
      <Text type="tertiary">远程输入：{acRemoteVal || '（空）'}</Text>
    </div>
  </Space>

  <Divider />

  <Title heading={5}>TagInput / ColorPicker</Title>
  <Space direction="vertical" align="start">
    <div style="width: 320px">
      <TagInput
        value={tags}
        separator={[',', 'Enter']}
        placeholder="输入后回车或逗号"
        onChange={(t) => (tags = t)}
      />
      <Text type="tertiary">标签：{tags.join(' / ') || '（无）'}</Text>
    </div>

    <div style="width: 320px" data-testid="taginput-controlled-input">
      <TagInput
        value={tagsCtrl}
        inputValue={tagInputCtrl}
        separator={[',', 'Enter']}
        placeholder="受控输入：外部驱动文本"
        onChange={(t) => (tagsCtrl = t)}
        onInputChange={(v) => (tagInputCtrl = v.toUpperCase())}
      />
      <Text type="tertiary">输入(强制大写)：{tagInputCtrl || '（空）'}</Text>
    </div>

    <div style="width: 320px" data-testid="taginput-maxlen">
      <TagInput
        value={tagsTrunc}
        maxTagTextLength={6}
        separator={[',', 'Enter']}
        placeholder="超长标签截断显示（maxTagTextLength=6）"
        onChange={(t) => (tagsTrunc = t)}
      />
      <Text type="tertiary">实际值：{tagsTrunc.join(' / ') || '（无）'}</Text>
    </div>

    <div style="width: 320px" data-testid="taginput-draggable">
      <TagInput
        value={tagsDrag}
        draggable
        separator={[',', 'Enter']}
        placeholder="可拖拽重排标签"
        onChange={(t) => (tagsDrag = t)}
      />
      <Text type="tertiary">顺序：{tagsDrag.join(' / ') || '（无）'}</Text>
    </div>

    <Space>
      <span data-testid="colorpicker-demo">
        <ColorPicker
          value={color}
          presets={['#3366ff', '#16a34a', '#ef4444', '#f59e0b']}
          recentColors
          onChange={(c) => (color = c)}
        />
      </span>
      <Text type="tertiary">颜色：{color}（吸管按需显示 + 最近用色）</Text>
    </Space>

    <Space align="start">
      <span data-testid="colorpicker-inline">
        <ColorPicker
          inline
          value={colorInline}
          defaultFormat="rgb"
          presets={['#3366ff', '#16a34a', '#ef4444']}
          onChange={(c) => (colorInline = c)}
        />
      </span>
      <Text type="tertiary">内联 + format 切换：{colorInline}</Text>
    </Space>

    <div data-testid="colorpicker-status">
      <Space>
        <ColorPicker status="warning" defaultValue="#f59e0b" />
        <ColorPicker status="error" defaultValue="#ef4444" />
        <Text type="tertiary">status 校验态（仅触发器边框）</Text>
      </Space>
    </div>
  </Space>

  <Divider />

  <Title heading={5}>DatePicker / TimePicker</Title>
  <Space direction="vertical" align="start">
    <Space>
      <DatePicker value={dateVal} onChange={(d) => (dateVal = d)} />
      <Text type="tertiary">
        日期：{dateVal ? dateVal.toLocaleDateString('zh-CN') : '（未选）'}
      </Text>
    </Space>
    <Space>
      <span data-testid="datepicker-datetime" style="width:260px; display:inline-block">
        <DatePicker type="dateTime" value={dateTimeVal} onChange={(d) => (dateTimeVal = d)} />
      </span>
      <Text type="tertiary">
        日期时间：{dateTimeVal ? dateTimeVal.toLocaleString('zh-CN') : '（未选）'}
      </Text>
    </Space>
    <Space>
      <span data-testid="datepicker-month" style="width:260px; display:inline-block">
        <DatePicker type="month" value={monthVal} onChange={(d) => (monthVal = d)} />
      </span>
      <Text type="tertiary">
        月份：{monthVal ? `${monthVal.getFullYear()}-${monthVal.getMonth() + 1}` : '（未选）'}
      </Text>
    </Space>
    <Space>
      <span data-testid="datepicker-year" style="width:260px; display:inline-block">
        <DatePicker type="year" value={yearVal} onChange={(d) => (yearVal = d)} />
      </span>
      <Text type="tertiary">
        年份：{yearVal ? yearVal.getFullYear() : '（未选）'}
      </Text>
    </Space>
    <Space>
      <span data-testid="datepicker-disabledtime" style="width:260px; display:inline-block">
        <DatePicker
          type="dateTime"
          value={disabledTimeVal}
          onChange={(d) => (disabledTimeVal = d)}
          disabledTime={() => ({ disabledHours: () => Array.from({ length: 12 }, (_, i) => i) })}
        />
      </span>
      <Text type="tertiary">禁用时间：上午 0-11 时不可选</Text>
    </Space>
    <Space>
      <span data-testid="datepicker-presets" style="width:260px; display:inline-block">
        <DatePicker
          value={presetVal}
          onChange={(d) => (presetVal = d)}
          presets={[
            { label: '今天', value: () => new Date() },
            { label: '昨天', value: () => new Date(Date.now() - 86400000) },
            { label: '一周后', value: () => new Date(Date.now() + 7 * 86400000) },
          ]}
        />
      </span>
      <Text type="tertiary">
        快捷：{presetVal ? presetVal.toLocaleDateString('zh-CN') : '（未选）'}
      </Text>
    </Space>
    <Space>
      <span
        data-testid="rangepicker-dual"
        style="width:260px; display:inline-block"
      >
        <RangePicker value={dateRangeVal} onChange={(r) => (dateRangeVal = r)} />
      </span>
      <Text type="tertiary">
        范围（双面板，两个月并排）：{dateRangeVal && dateRangeVal[0] && dateRangeVal[1]
          ? `${dateRangeVal[0].toLocaleDateString('zh-CN')} ~ ${dateRangeVal[1].toLocaleDateString('zh-CN')}`
          : '（未选）'}
      </Text>
    </Space>
    <Space>
      <span data-testid="datepicker-format" style="width:260px; display:inline-block">
        <DatePicker format="YYYY-MM-DD" value={formatVal} onChange={(d) => (formatVal = d)} />
      </span>
      <Text type="tertiary">
        自定义 format（可手输 YYYY-MM-DD）：{formatVal
          ? formatVal.toLocaleDateString('zh-CN')
          : '（未选）'}
      </Text>
    </Space>
    <Space>
      <span data-testid="rangepicker-maxrange" style="width:260px; display:inline-block">
        <RangePicker maxRange={7} value={maxRangeVal} onChange={(r) => (maxRangeVal = r)} />
      </span>
      <Text type="tertiary">
        maxRange=7（最多 7 天跨度）：{maxRangeVal && maxRangeVal[0] && maxRangeVal[1]
          ? `${maxRangeVal[0].toLocaleDateString('zh-CN')} ~ ${maxRangeVal[1].toLocaleDateString('zh-CN')}`
          : '（未选）'}
      </Text>
    </Space>
    <Space>
      <TimePicker value={timeVal} onChange={(t) => (timeVal = Array.isArray(t) ? t[0] : t)} />
      <Text type="tertiary">
        时间：{timeVal ? timeVal.toLocaleTimeString('zh-CN') : '（未选）'}
      </Text>
    </Space>
  </Space>

  <Divider />

  <Title heading={5}>Cascader / TreeSelect</Title>
  <Space direction="vertical" align="start">
    <div style="width: 240px" data-testid="cascader-filter">
      <Cascader
        treeData={regionData}
        value={cascaderVal}
        clearable
        filterable
        placeholder="可搜索级联"
        onChange={(p) => (cascaderVal = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
      />
      <Text type="tertiary">级联（可搜索）：{cascaderVal.join(' / ') || '（未选）'}</Text>
    </div>
    <div style="width: 320px" data-testid="cascader-multiple">
      <Cascader
        treeData={regionData}
        multiple
        clearable
        placeholder="多选地区"
        value={cascaderMultiVal}
        onChange={(p) => (cascaderMultiVal = (Array.isArray(p[0]) ? p : p.length ? [p] : []) as (string | number)[][])}
      />
      <Text type="tertiary">多选级联：已选 {cascaderMultiVal.length} 条</Text>
    </div>
    <div style="width: 240px" data-testid="cascader-async">
      <Cascader treeData={lazyRegionData} loadData={loadRegionChildren} />
      <Text type="tertiary">异步 loadData（点击节点动态加载）</Text>
    </div>
    <div style="width: 240px" data-testid="cascader-hover">
      <Cascader
        treeData={regionData}
        expandTrigger="hover"
        clearable
        placeholder="悬停展开"
        value={cascaderHoverVal}
        onChange={(p) => (cascaderHoverVal = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
      />
      <Text type="tertiary">悬停展开（expandTrigger="hover"）：{cascaderHoverVal.join(' / ') || '（未选）'}</Text>
    </div>
    <div style="width: 240px" data-testid="cascader-display">
      <Cascader
        treeData={regionData}
        clearable
        placeholder="自定义回显"
        value={cascaderDisplayVal}
        displayRender={(labels) => labels.join('-')}
        onChange={(p) => (cascaderDisplayVal = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
      />
      <Text type="tertiary">displayRender 省-市-区 格式回显</Text>
    </div>
    <div style="width: 240px" data-testid="cascader-change-on-select">
      <Cascader
        treeData={regionData}
        changeOnSelect
        clearable
        placeholder="任意层级可选"
        value={cascaderCosVal}
        onChange={(p) => (cascaderCosVal = Array.isArray(p[0]) ? (p[0] as (string | number)[]) : (p as (string | number)[]))}
      />
      <Text type="tertiary"
        >changeOnSelect 任意层级可选：{cascaderCosVal.join(' / ') || '（未选）'}</Text
      >
    </div>
    <div style="width: 240px" data-testid="treeselect-filter">
      <TreeSelect
        treeData={orgTree}
        value={treeVal}
        clearable
        filterable
        placeholder="可搜索树选"
        onChange={(k) => (treeVal = Array.isArray(k) ? (k[0] ?? null) : k)}
      />
      <Text type="tertiary">树选（可搜索）：{treeVal ?? '（未选）'}</Text>
    </div>
    <div style="width: 280px" data-testid="treeselect-multiple">
      <TreeSelect
        treeData={orgTree}
        multiple
        clearable
        defaultExpandAll
        placeholder="多选部门"
        value={treeMultiVal}
        onChange={(k) => (treeMultiVal = Array.isArray(k) ? k : k === null ? [] : [k])}
      />
      <Text type="tertiary">已选 {treeMultiVal.length} 项</Text>
    </div>
    <div style="width: 240px" data-testid="treeselect-fieldnames">
      <TreeSelect
        treeData={treeFieldData as unknown as TreeNode[]}
        fieldNames={treeFieldNames}
        clearable
        defaultExpandAll
        placeholder="字段映射树选"
        value={treeSelectFieldVal}
        onChange={(k) => (treeSelectFieldVal = Array.isArray(k) ? (k[0] ?? null) : k)}
      />
      <Text type="tertiary">树选（fieldNames）：{treeSelectFieldVal ?? '（未选）'}</Text>
    </div>
    <div style="width: 240px" data-testid="treeselect-icon">
      <TreeSelect
        treeData={orgTree}
        clearable
        defaultExpandAll
        placeholder="带图标树选"
        value={treeSelectIconVal}
        onChange={(k) => (treeSelectIconVal = Array.isArray(k) ? (k[0] ?? null) : k)}
      >
        {#snippet icon({ node, expanded })}
          {#if node.children && node.children.length}
            <span class="tree-icon-glyph">{expanded ? '📂' : '📁'}</span>
          {:else}
            <span class="tree-icon-glyph">📄</span>
          {/if}
        {/snippet}
      </TreeSelect>
      <Text type="tertiary">树选（图标）：{treeSelectIconVal ?? '（未选）'}</Text>
    </div>
    <div style="width: 240px" data-testid="treeselect-async">
      <TreeSelect
        treeData={treeAsyncRoots as unknown as TreeNode[]}
        loadData={loadTreeChildren}
        clearable
        placeholder="异步加载树选"
        value={treeSelectAsyncVal}
        onChange={(k) => (treeSelectAsyncVal = Array.isArray(k) ? (k[0] ?? null) : k)}
      />
      <Text type="tertiary">异步 loadData：展开节点动态加载子项</Text>
    </div>
    <div style="width: 260px" data-testid="treeselect-virtual">
      <TreeSelect
        treeData={bigTreeData}
        virtualized
        defaultExpandAll
        clearable
        placeholder="虚拟化大树选"
        value={treeSelectVirtualVal}
        onChange={(k) => (treeSelectVirtualVal = Array.isArray(k) ? (k[0] ?? null) : k)}
      />
      <Text type="tertiary">virtualized 1050 节点：仅渲染视口内行</Text>
    </div>
  </Space>

  <Divider />

  <Title heading={5}>Transfer / Upload</Title>
  <Space direction="vertical" align="start">
    <Transfer
      dataSource={transferData}
      value={transferVal}
      titles={['可选城市', '已选城市']}
      onChange={(keys) => (transferVal = keys)}
    />
    <Text type="tertiary">已选：{transferVal.join(', ') || '（无）'}</Text>

    <div data-testid="transfer-group">
      <Transfer
        dataSource={transferGroupData}
        value={transferGroupVal}
        titles={['可选城市', '已选城市']}
        onChange={(keys) => (transferGroupVal = keys)}
      />
    </div>
    <Text type="tertiary">分组已选：{transferGroupVal.join(', ') || '（无）'}</Text>

    <Text type="tertiary">treeList 树状源面板（勾父连带勾子叶子、半选、已迁移叶子置灰）：</Text>
    <div data-testid="transfer-tree">
      <Transfer
        dataSource={transferTreeData}
        value={transferTreeVal}
        titles={['可选城市', '已选城市']}
        onChange={(keys) => (transferTreeVal = keys)}
      />
    </div>
    <Text type="tertiary">树已选：{transferTreeVal.join(', ') || '（无）'}</Text>

    <Text type="tertiary">oneWay 单向迁移（右侧项各带移除按钮）：</Text>
    <div data-testid="transfer-oneway">
      <Transfer
        oneWay
        dataSource={transferData}
        value={transferOneWayVal}
        titles={['可选城市', '已选城市']}
        onChange={(keys) => (transferOneWayVal = keys)}
      />
    </div>
    <Text type="tertiary">单向已选：{transferOneWayVal.join(', ') || '（无）'}</Text>

    <Text type="tertiary">virtualize 虚拟化（2000 项，仅渲染视口内）：</Text>
    <div data-testid="transfer-virtual">
      <Transfer
        virtualize
        dataSource={transferBigData}
        value={transferBigVal}
        titles={['可选（2000）', '已选']}
        onChange={(keys) => (transferBigVal = keys)}
      />
    </div>

    <Text type="tertiary">draggable 目标列拖拽重排：</Text>
    <div data-testid="transfer-drag">
      <Transfer
        draggable
        filter={false}
        dataSource={transferData}
        value={transferDragVal}
        titles={['可选城市', '已选（可拖拽）']}
        onChange={(keys) => (transferDragVal = keys)}
      />
    </div>
    <Text type="tertiary">拖拽后顺序：{transferDragVal.join(', ') || '（无）'}</Text>

    <Text type="tertiary">remote onSearch 远程搜索（防抖 + loading）：</Text>
    <div data-testid="transfer-remote">
      <Transfer
        dataSource={transferRemoteData}
        value={transferRemoteVal}
        loading={transferRemoteLoading}
        onSearch={transferRemoteSearch}
        titles={['远程结果', '已选']}
        onChange={(keys) => (transferRemoteVal = keys)}
      />
    </div>
    <Text type="tertiary">远程已选：{transferRemoteVal.join(', ') || '（无）'}</Text>

    <Upload multiple drag accept="image/*" />

    <Text type="tertiary">真实上传（action + 进度）：</Text>
    <div data-testid="upload-action">
      <Upload action="/api/upload" multiple />
    </div>

    <Text type="tertiary">picture-card（缩略图网格）：</Text>
    <div data-testid="upload-image">
      <Upload
        listType="picture-card"
        multiple
        accept="image/*"
        value={uploadImageVal}
        onChange={(list) => (uploadImageVal = list)}
      />
    </div>

    <Text type="tertiary">组件级 size 尺寸（small / default / large，影响触发按钮/拖拽区）：</Text>
    <div data-testid="upload-size">
      <Space>
        <Upload size="small">small</Upload>
        <Upload size="default">default</Upload>
        <Upload size="large">large</Upload>
      </Space>
    </div>

    <Text type="tertiary">组件级 status 校验态（warning / error，影响上传区边框色，区别于文件项 file.status）：</Text>
    <div data-testid="upload-status">
      <Space direction="vertical" align="start">
        <Upload status="warning" drag accept="image/*" />
        <Upload status="error" drag accept="image/*" />
      </Space>
    </div>
  </Space>

  <Divider />

  <Title heading={5}>M3 导航：Breadcrumb / Pagination / Steps</Title>
  <Space direction="vertical" align="start">
    <Breadcrumb
      routes={[
        { label: '首页', href: '#' },
        { label: '组件', href: '#' },
        { label: '导航' },
      ]}
    />

    <div data-testid="breadcrumb-collapse">
      <Breadcrumb
        maxItemCount={3}
        routes={[
          { label: '首页', href: '#' },
          { label: '一级', href: '#' },
          { label: '二级', href: '#' },
          { label: '三级', href: '#' },
          { label: '四级', href: '#' },
          { label: '当前页' },
        ]}
      />
    </div>

    <div data-testid="breadcrumb-declarative">
      <Breadcrumb>
        <Breadcrumb.Item href="#">首页</Breadcrumb.Item>
        <Breadcrumb.Item href="#">组件</Breadcrumb.Item>
        <Breadcrumb.Item>导航</Breadcrumb.Item>
      </Breadcrumb>
    </div>

    <div data-testid="breadcrumb-tooltip" style="max-inline-size: 360px">
      <Breadcrumb
        showTooltip
        routes={[
          { label: '首页', href: '#' },
          { label: '这是一个非常非常非常长以至于会被截断的中间项标题', href: '#' },
          { label: '另一个同样很长很长很长很长会被省略号截断的当前页标题' },
        ]}
      />
    </div>

    <div data-testid="breadcrumb-more-popover">
      <Breadcrumb
        maxItemCount={3}
        moreType="popover"
        onClick={(r) => (breadcrumbMore = r.label)}
        routes={[
          { label: '首页', href: '#' },
          { label: '一级', href: '#' },
          { label: '二级', href: '#' },
          { label: '三级', href: '#' },
          { label: '四级', href: '#' },
          { label: '当前页' },
        ]}
      />
      <Text type="tertiary">popover 点击折叠项：{breadcrumbMore}</Text>
    </div>

    <div data-testid="breadcrumb-more-tooltip">
      <Breadcrumb
        maxItemCount={3}
        moreType="tooltip"
        routes={[
          { label: '首页', href: '#' },
          { label: '一级', href: '#' },
          { label: '二级', href: '#' },
          { label: '三级', href: '#' },
          { label: '四级', href: '#' },
          { label: '当前页' },
        ]}
      />
    </div>

    <Pagination total={256} currentPage={page} showTotal onChange={(p) => (page = p)} />
    <Text type="tertiary">当前页：{page}</Text>

    <Pagination
      total={256}
      currentPage={page2}
      pageSize={pageSize2}
      showTotal
      showSizeChanger
      showQuickJumper
      onChange={(p, s) => {
        page2 = p;
        pageSize2 = s;
      }}
    />
    <Text type="tertiary">页 {page2} · 每页 {pageSize2} 条</Text>

    <div style="width: 480px">
      <Steps
        current={step}
        clickable
        steps={[
          { title: '填写信息', description: '基本资料' },
          { title: '确认订单', description: '核对内容' },
          { title: '完成', description: '提交成功' },
        ]}
        onChange={(c) => (step = c)}
      />
    </div>
    <Text type="tertiary">当前步：{step}</Text>

    <Text type="tertiary">dot 点状（横向）：</Text>
    <div style="width: 480px" data-testid="steps-dot">
      <Steps
        current={step}
        dot
        clickable
        steps={[
          { title: '填写信息' },
          { title: '确认订单' },
          { title: '完成' },
        ]}
        onChange={(c) => (step = c)}
      />
    </div>

    <Text type="tertiary">dot 点状（纵向）：</Text>
    <div style="width: 240px" data-testid="steps-dot-vertical">
      <Steps
        current={1}
        dot
        direction="vertical"
        steps={[
          { title: '已下单', description: '14:02' },
          { title: '运输中', description: '配送员已揽件' },
          { title: '已签收' },
        ]}
      />
    </div>

    <Text type="tertiary">type=basic 线框型（描边圆，非实心填充）：</Text>
    <div style="width: 480px" data-testid="steps-basic">
      <Steps
        current={1}
        type="basic"
        steps={[
          { title: '填写信息', description: '基本资料' },
          { title: '确认订单', description: '核对内容' },
          { title: '完成', description: '提交成功' },
        ]}
      />
    </div>

    <Text type="tertiary">icon 自定义图标（emoji 替代默认序号/✓/✕）：</Text>
    <div style="width: 480px" data-testid="steps-icon">
      <Steps
        current={1}
        steps={[
          { title: '登录', description: '账号验证' },
          { title: '配送', description: '正在派送' },
          { title: '收货', description: '确认签收' },
        ]}
      >
        {#snippet icon({ index })}
          <span>{['🔑', '🚚', '📦'][index]}</span>
        {/snippet}
      </Steps>
    </div>
  </Space>

  <Divider />

  <Title heading={5}>Tabs / Dropdown</Title>
  <Space direction="vertical" align="start">
    <div style="width: 360px">
      <Tabs {tabList} value={activeTab} onChange={(k) => (activeTab = k)} />
    </div>
    <Text type="tertiary">当前标签：{activeTab}</Text>

    <Tabs {tabList} type="card" value={activeTab} onChange={(k) => (activeTab = k)} />

    <Text type="tertiary">tabPosition=left + lazy（首次激活才挂载内容）：</Text>
    <div style="width: 420px" data-testid="tabs-left-lazy">
      <Tabs {tabList} tabPosition="left" lazy keepDOM value={activeTab} onChange={(k) => (activeTab = k)}>
        <TabPane itemKey="a"><div class="tab-pane-demo">账户内容</div></TabPane>
        <TabPane itemKey="b"><div class="tab-pane-demo">安全内容</div></TabPane>
        <TabPane itemKey="c"><div class="tab-pane-demo">通知内容</div></TabPane>
      </Tabs>
    </div>

    <Text type="tertiary">溢出滚动（窄容器 + 多标签，出现前/后滚动箭头）：</Text>
    <div style="width: 280px" data-testid="tabs-overflow">
      <Tabs
        tabList={overflowTabs}
        value={overflowActive}
        onChange={(k) => (overflowActive = k)}
      />
    </div>

    <Text type="tertiary">溢出收纳 overflow=dropdown（放不下的标签进末尾「更多」下拉，激活标签始终可见）：</Text>
    <div style="width: 280px" data-testid="tabs-overflow-dropdown">
      <Tabs
        tabList={overflowTabs}
        overflow="dropdown"
        value={dropdownTabActive}
        onChange={(k) => (dropdownTabActive = k)}
      />
    </div>

    <Text type="tertiary">type=button（分段按钮组）：</Text>
    <div data-testid="tabs-button">
      <Tabs
        type="button"
        tabList={tabList}
        value={buttonTabActive}
        onChange={(k) => (buttonTabActive = k)}
      />
    </div>

    <Text type="tertiary">addable（点「+」追加标签，当前 {addableTabs.length} 个）：</Text>
    <div style="width: 360px" data-testid="tabs-addable">
      <Tabs
        type="card"
        tabList={addableTabs}
        addable
        onAdd={addTab}
        value={addableActive}
        onChange={(k) => (addableActive = k)}
      />
    </div>

    <Text type="tertiary">纯声明式自动收集（不传 tabList，仅写 &lt;Tabs.Pane&gt;，标签栏自动推导）：</Text>
    <div style="width: 360px" data-testid="tabs-declarative">
      <Tabs value={declActive} onChange={(k) => (declActive = k)}>
        <TabPane itemKey="d1" tab="文档">
          <div class="tab-pane-demo">文档内容（声明式收集）</div>
        </TabPane>
        <TabPane itemKey="d2" tab="评论">
          <div class="tab-pane-demo">评论内容（声明式收集）</div>
        </TabPane>
        <TabPane itemKey="d3" tab="设置" disabled>
          <div class="tab-pane-demo">设置内容（禁用项）</div>
        </TabPane>
      </Tabs>
    </div>
    <Text type="tertiary">当前声明式标签：{declActive}</Text>

    <Text type="tertiary">renderTabBar（完全自绘标签栏）：</Text>
    <div style="width: 360px" data-testid="tabs-render-bar">
      <Tabs {tabList} value={renderBarActive} onChange={(k) => (renderBarActive = k)}>
        {#snippet renderTabBar(items, active, setActive)}
          <div style="display:flex; gap:8px; padding:4px 0;">
            {#each items as it (it.itemKey)}
              <Button
                size="small"
                type={it.itemKey === active ? 'primary' : 'tertiary'}
                disabled={it.disabled ?? false}
                onclick={() => setActive(it.itemKey)}
              >{it.tab}</Button>
            {/each}
          </div>
        {/snippet}
        <TabPane itemKey="a"><div class="tab-pane-demo">账户内容</div></TabPane>
        <TabPane itemKey="b"><div class="tab-pane-demo">安全内容</div></TabPane>
        <TabPane itemKey="c"><div class="tab-pane-demo">通知内容</div></TabPane>
      </Tabs>
    </div>
    <Text type="tertiary">当前自绘标签：{renderBarActive}</Text>

    <Dropdown
      items={dropdownItems}
      trigger="click"
      onSelect={(k) => (lastDropdown = String(k))}
    >
      {#snippet triggerContent()}
        <Button type="secondary">操作菜单 ▾</Button>
      {/snippet}
    </Dropdown>
    <Text type="tertiary">上次选择：{lastDropdown || '（无）'}</Text>

    <div data-testid="dropdown-contextmenu">
      <Text type="tertiary">右键菜单（菜单定位到光标处）</Text>
      <Dropdown
        items={dropdownItems}
        trigger="contextMenu"
        onSelect={(k) => (lastDropdown = String(k))}
      >
        {#snippet triggerContent()}
          <div
            style="display:flex;align-items:center;justify-content:center;width:240px;height:80px;border:1px dashed var(--cd-color-border);border-radius:6px;color:var(--cd-color-text-2)"
          >
            在此区域点击右键
          </div>
        {/snippet}
      </Dropdown>
    </div>

    <div data-testid="dropdown-submenu">
      <Text type="tertiary">嵌套子菜单 + divider 分隔 + group 分组（多层）</Text>
      <Dropdown
        items={dropdownTreeItems}
        trigger="click"
        onSelect={(k) => (lastDropdown = String(k))}
      >
        {#snippet triggerContent()}
          <Button type="secondary">文件菜单 ▾</Button>
        {/snippet}
      </Dropdown>
    </div>

    <div data-testid="dropdown-destroy">
      <Text type="tertiary">destroyOnClose：关闭即卸载浮层 DOM，重开重建</Text>
      <Dropdown
        items={dropdownItems}
        trigger="click"
        destroyOnClose
        onSelect={(k) => (lastDropdown = String(k))}
      >
        {#snippet triggerContent()}
          <Button type="secondary">destroyOnClose ▾</Button>
        {/snippet}
      </Dropdown>
    </div>

    <div data-testid="dropdown-container">
      <Text type="tertiary">getPopupContainer：浮层挂到指定容器（非 body）</Text>
      <div
        bind:this={dropdownPopupContainer}
        style="position:relative;padding:16px;border:1px dashed var(--cd-color-border);border-radius:6px;overflow:hidden"
      >
        <Dropdown
          items={dropdownTreeItems}
          trigger="click"
          getPopupContainer={() => dropdownPopupContainer}
          onSelect={(k) => (lastDropdown = String(k))}
        >
          {#snippet triggerContent()}
            <Button type="secondary">挂到容器 ▾</Button>
          {/snippet}
        </Dropdown>
      </div>
    </div>
  </Space>

  <Divider />

  <Title heading={5}>Menu / Anchor</Title>
  <div style="display: flex; gap: 24px; align-items: flex-start">
    <div style="width: 200px" data-testid="menu-icon">
      <Text type="tertiary">inline 内联展开（带图标）</Text>
      {#snippet iconOverview()}<span>📊</span>{/snippet}
      {#snippet iconSettings()}<span>⚙️</span>{/snippet}
      {#snippet iconHelp()}<span>❓</span>{/snippet}
      <Menu
        items={[
          { key: 'overview', label: '概览', icon: iconOverview },
          {
            key: 'settings',
            label: '设置',
            icon: iconSettings,
            children: [
              { key: 'profile', label: '个人资料' },
              { key: 'security', label: '安全' },
            ],
          },
          { key: 'help', label: '帮助', icon: iconHelp, disabled: true },
        ]}
        mode="inline"
        selectedKeys={[menuSelected]}
        defaultOpenKeys={['settings']}
        onSelect={(k) => (menuSelected = k)}
      />
      <Text type="tertiary">菜单选中：{menuSelected}</Text>
    </div>
    <div style="width: 200px" data-testid="menu-popup">
      <Text type="tertiary">vertical hover 浮层（多级）</Text>
      <Menu
        items={menuPopupItems}
        mode="vertical"
        selectedKeys={[menuSelected]}
        onSelect={(k) => (menuSelected = k)}
      />
    </div>
    <div style="width: 160px" data-testid="anchor-demo">
      <Anchor links={anchorLinks} value={anchorKey} affix updateHash onChange={(k) => (anchorKey = k)} />
      <Text type="tertiary">锚点：{anchorKey}</Text>
    </div>
  </div>

  <div style="margin-top:16px" data-testid="menu-multiple">
    <Text type="tertiary">multiple 多选（点击 toggle，多项可同时高亮 + 勾选）</Text>
    <div style="width: 200px">
      <Menu
        mode="inline"
        multiple
        items={[
          { key: 'overview', label: '概览' },
          { key: 'analytics', label: '分析' },
          { key: 'reports', label: '报表' },
          { key: 'settings', label: '设置' },
        ]}
        selectedKeys={menuMultiple}
        onSelect={(k) => toggleMenuMultiple(k)}
      />
      <Text type="tertiary">已选：{menuMultiple.join(', ') || '（无）'}</Text>
    </div>
  </div>

  <div style="margin-top:16px" data-testid="menu-horizontal">
    <Text type="tertiary">horizontal 菜单栏（hover 子菜单 + ←→ 导航）</Text>
    <Menu
      items={menuPopupItems}
      mode="horizontal"
      selectedKeys={[menuSelected]}
      onSelect={(k) => (menuSelected = k)}
    />
  </div>

  <div style="margin-top:16px" data-testid="menu-collapsed">
    <Text type="tertiary">inlineCollapsed 折叠图标轨（只显图标 + hover 浮层）</Text>
    {#snippet iconCOverview()}<span>📊</span>{/snippet}
    {#snippet iconCSettings()}<span>⚙️</span>{/snippet}
    {#snippet iconCHelp()}<span>❓</span>{/snippet}
    <div>
      <Button size="small" onclick={() => (menuCollapsed = !menuCollapsed)}>
        {menuCollapsed ? '展开' : '收起'}
      </Button>
    </div>
    <div style="margin-top:8px">
      <Menu
        mode="inline"
        inlineCollapsed={menuCollapsed}
        items={[
          { key: 'overview', label: '概览', icon: iconCOverview },
          {
            key: 'settings',
            label: '设置',
            icon: iconCSettings,
            children: [
              { key: 'profile', label: '个人资料' },
              { key: 'security', label: '安全' },
            ],
          },
          { key: 'help', label: '帮助', icon: iconCHelp, disabled: true },
        ]}
        defaultOpenKeys={['settings']}
        selectedKeys={[menuSelected]}
        onSelect={(k) => (menuSelected = k)}
      />
    </div>
  </div>

  <div style="margin-top:16px" data-testid="menu-divider-group">
    <Text type="tertiary">divider 分隔符 + group 分组标题（inline）</Text>
    <div style="width: 200px">
      <Menu
        mode="inline"
        items={menuGroupItems}
        defaultOpenKeys={['settings']}
        selectedKeys={[menuSelected]}
        onSelect={(k) => (menuSelected = k)}
      />
    </div>
  </div>

  <div style="margin-top:16px" data-testid="menu-navigation">
    <Text type="tertiary">
      purpose="navigation" 站点导航（nav landmark + 原生 &lt;a href&gt;，aria-current=page，Tab 键序）
    </Text>
    <div style="width: 200px; margin-top:8px">
      <Menu
        mode="inline"
        purpose="navigation"
        items={navItems}
        defaultOpenKeys={['nav-docs']}
        selectedKeys={[navCurrent]}
        ariaLabel="主站导航"
        onSelect={(k) => (navCurrent = k)}
      />
    </div>
    <Text type="tertiary">horizontal navigation（顶部导航栏）</Text>
    <Menu
      mode="horizontal"
      purpose="navigation"
      items={navItems}
      selectedKeys={[navCurrent]}
      ariaLabel="顶部站点导航"
      onSelect={(k) => (navCurrent = k)}
    />
    <Text type="tertiary">当前：{navCurrent}</Text>
  </div>

  <div style="margin-top:16px" data-testid="anchor-container">
    <Text type="tertiary">getContainer 自定义滚动容器（锚点定位/激活随容器滚动）</Text>
    <div style="display:flex; gap:16px; margin-top:8px">
      <div style="width:120px">
        <Anchor
          links={anchorContainerLinks}
          value={anchorContainerKey}
          getContainer={() => anchorContainerEl}
          onChange={(k) => (anchorContainerKey = k)}
        />
      </div>
      <div
        bind:this={anchorContainerEl}
        data-testid="anchor-container-scroll"
        style="height:160px; overflow:auto; flex:1; border:1px solid var(--cd-color-border); padding:8px"
      >
        <div id="cbox-1" style="height:140px">容器节 1 内容</div>
        <div id="cbox-2" style="height:140px">容器节 2 内容</div>
        <div id="cbox-3" style="height:140px">容器节 3 内容</div>
      </div>
    </div>
    <Text type="tertiary">容器锚点：{anchorContainerKey}</Text>
  </div>

  <div style="margin-top:16px" data-testid="anchor-horizontal">
    <Text type="tertiary">horizontal 水平模式（链接横排 + 底部 ink）</Text>
    <Anchor
      horizontal
      links={anchorHLinks}
      value={anchorHKey}
      onChange={(k) => (anchorHKey = k)}
    />
    <Text type="tertiary">水平锚点：{anchorHKey}</Text>
  </div>

  <div style="margin-top:16px" data-testid="anchor-nested">
    <Text type="tertiary">多级嵌套链接树（children 逐级缩进，父子皆跳转/高亮）</Text>
    <div style="display:flex; gap:16px; margin-top:8px">
      <div style="width:160px">
        <Anchor
          links={anchorNestLinks}
          value={anchorNestKey}
          getContainer={() => anchorNestEl}
          onChange={(k) => (anchorNestKey = k)}
        />
      </div>
      <div
        bind:this={anchorNestEl}
        data-testid="anchor-nested-scroll"
        style="height:180px; overflow:auto; flex:1; border:1px solid var(--cd-color-border); padding:8px"
      >
        <div id="nest-1" style="height:120px">开始</div>
        <div id="nest-1-1" style="height:120px">安装</div>
        <div id="nest-1-2" style="height:120px">快速上手</div>
        <div id="nest-2" style="height:120px">组件</div>
        <div id="nest-2-1" style="height:120px">导航</div>
        <div id="nest-2-1-1" style="height:120px">Anchor</div>
        <div id="nest-2-1-2" style="height:120px">Menu</div>
        <div id="nest-2-2" style="height:120px">反馈</div>
        <div id="nest-3" style="height:120px">主题</div>
      </div>
    </div>
    <Text type="tertiary">嵌套锚点：{anchorNestKey}</Text>
  </div>

  <Divider />

  <Title heading={5}>M4 展示：Tag / Avatar / Badge / Card</Title>
  <Space direction="vertical" align="start">
    <Space>
      <Tag color="primary">主要</Tag>
      <Tag color="success" type="solid">成功</Tag>
      <Tag color="danger" type="ghost">危险</Tag>
      <Tag closable>可关闭</Tag>
      <Tag checkable>可选中</Tag>
    </Space>

    <Space>
      <Avatar>U</Avatar>
      <Avatar shape="square" color="primary">陈</Avatar>
      <Avatar size="large" src="https://invalid.example/x.png" alt="降级A" />
      <Avatar dot status="error">E</Avatar>
    </Space>

    <div data-testid="avatar-group">
      <Space direction="vertical" align="start">
        <Avatar.Group
          maxCount={3}
          items={[
            { color: 'auto', content: '陈' },
            { color: 'auto', content: '李' },
            { color: 'auto', content: '王' },
            { color: 'auto', content: '赵' },
            { color: 'auto', content: '孙' },
          ]}
        />
        <Avatar.Group size="small" shape="square">
          <Avatar color="primary">陈</Avatar>
          <Avatar color="auto" alt="李" />
          <Avatar color="auto" alt="王" />
        </Avatar.Group>
      </Space>
    </div>

    <Space>
      <Badge count={5}><Avatar shape="square">消</Avatar></Badge>
      <Badge count={128}><Avatar shape="square">多</Avatar></Badge>
      <Badge dot><Avatar shape="square">点</Avatar></Badge>
      <Badge status="success" count="在线" />
    </Space>

    <div style="width: 280px">
      <Card title="卡片标题" bordered hoverable>
        {#snippet extra()}<Text type="tertiary">更多</Text>{/snippet}
        这是卡片正文内容。
        {#snippet actions()}
          <Button type="tertiary" size="small">操作一</Button>
          <Button type="tertiary" size="small">操作二</Button>
        {/snippet}
      </Card>
    </div>

    <Space>
      <Tooltip content="这是一条提示文字" placement="top">
        <Button type="secondary">悬停看提示</Button>
      </Tooltip>
      <Tooltip content="点击触发的提示" trigger="click" theme="light">
        <Button type="secondary">点击提示</Button>
      </Tooltip>
      <Popover title="弹出卡片" trigger="click" position="bottom">
        {#snippet contentSlot()}
          <div style="width: 160px">这是 Popover 的富内容区域。</div>
        {/snippet}
        <Button type="primary">点击弹出</Button>
      </Popover>
    </Space>

    <Space>
      <span data-testid="popover-custom-toggle">
        <Button
          type="secondary"
          onclick={() => (popoverCustomOpen = !popoverCustomOpen)}
        >
          外部按钮 {popoverCustomOpen ? '关闭' : '打开'}
        </Button>
      </span>
      <Popover
        title="受控卡片"
        trigger="custom"
        position="bottom"
        open={popoverCustomOpen}
        onOpenChange={(o) => (popoverCustomOpen = o)}
      >
        {#snippet contentSlot()}
          <div data-testid="popover-custom-content" style="width: 180px">
            显隐完全由外部按钮控制（custom 受控触发）。
          </div>
        {/snippet}
        <Button>受控锚点（不响应交互）</Button>
      </Popover>
    </Space>

    <div data-testid="tooltip-collision" style="display:flex; justify-content:space-between; margin-top:8px">
      <Tooltip content="贴顶触发 flip：请求 top，空间不足应翻到 bottom" placement="top" defaultOpen>
        <Button type="secondary">贴顶</Button>
      </Tooltip>
      <Tooltip content="贴右触发 flip：请求 right，空间不足应翻到 left" placement="right" defaultOpen>
        <Button type="secondary">贴右</Button>
      </Tooltip>
    </div>

    <div data-testid="tooltip-arrow-center" style="display:flex; gap:120px; margin-top:24px">
      <Tooltip content="默认：箭头贴对齐边" placement="bottomStart" defaultOpen>
        <span style="display:inline-block; width:200px; text-align:center">
          <Button type="secondary">bottomStart 默认</Button>
        </span>
      </Tooltip>
      <Tooltip
        content="arrowPointAtCenter：箭头指向中心"
        placement="bottomStart"
        arrowPointAtCenter
        defaultOpen
      >
        <span style="display:inline-block; width:200px; text-align:center">
          <Button type="secondary">bottomStart 指中心</Button>
        </span>
      </Tooltip>
    </div>

    <Text type="tertiary">status 语义图标（warning / error，图标在内容前）：</Text>
    <div data-testid="tooltip-status">
      <Space>
        <Tooltip content="表单校验未通过的警示提示" status="warning" theme="light" defaultOpen>
          <Button type="secondary">warning 态</Button>
        </Tooltip>
        <Tooltip content="操作失败：请稍后重试" status="error" theme="light" defaultOpen>
          <Button type="secondary">error 态</Button>
        </Tooltip>
      </Space>
    </div>

    <Text type="tertiary">custom 触发（完全受控，外部按钮切换显隐）：</Text>
    <div data-testid="tooltip-custom">
      <Space>
        <Button type="primary" onclick={() => (tooltipCustomOpen = !tooltipCustomOpen)}>
          {tooltipCustomOpen ? '隐藏' : '显示'}提示
        </Button>
        <Tooltip
          content="由外部状态控制显隐，不响应 hover/click/focus"
          trigger="custom"
          open={tooltipCustomOpen}
          onOpenChange={(o) => (tooltipCustomOpen = o)}
        >
          <Button type="secondary">受控目标（hover 无效）</Button>
        </Tooltip>
      </Space>
    </div>
  </Space>

  <Divider />

  <Title heading={5}>Empty / Descriptions / Collapse / Timeline</Title>
  <Space direction="vertical" align="start">
    <Empty image="noResult" description="换个关键词试试" />

    <Empty
      layout="horizontal"
      title="暂无项目"
      description="创建第一个项目以开始协作"
    />

    <div style="width: 280px; border: 1px dashed var(--cd-color-border)">
      <Empty
        layout="horizontal"
        title="窄容器自动降级"
        description="宽度小于断点时 horizontal 切回 vertical 并缩小插画"
      />
    </div>

    <Empty
      image="https://lf-scm-cn.semi.design/obj/semi-tos/files/Illustration-NoContent.svg"
      title="外部图片"
      description="image 传 URL 时渲染外部图"
    />

    <Space>
      <Empty image="construction" />
      <Empty image="success" />
      <Empty image="noAccess" />
    </Space>

    <div style="width: 420px">
      <Descriptions
        bordered
        column={2}
        data={[
          { label: '姓名', value: '陈某' },
          { label: '年龄', value: 28 },
          { label: '邮箱', value: 'a@b.com', span: 2 },
          { label: '备注', value: null },
        ]}
      />
    </div>

    <Text type="tertiary">声明式 Descriptions.Item（children 可放富内容，span 跨列、bordered、column 换行均生效）：</Text>
    <div style="width: 420px" data-testid="descriptions-item">
      <Descriptions bordered column={2}>
        <Descriptions.Item label="姓名">陈某</Descriptions.Item>
        <Descriptions.Item label="年龄">28</Descriptions.Item>
        <Descriptions.Item label="邮箱" span={2}>a@b.com</Descriptions.Item>
        <Descriptions.Item label="备注" />
      </Descriptions>
    </div>

    <Text type="tertiary">响应式 column 断点对象（缩放窗口宽度，列数随视口断点变化）：</Text>
    <div data-testid="descriptions-responsive">
      <Descriptions
        bordered
        column={{ xs: 1, sm: 2, lg: 3, xl: 4 }}
        data={[
          { label: '姓名', value: '陈某' },
          { label: '年龄', value: 28 },
          { label: '邮箱', value: 'a@b.com' },
          { label: '城市', value: '杭州' },
          { label: '部门', value: '设计' },
          { label: '职级', value: 'P7' },
          { label: '入职', value: '2020' },
          { label: '状态', value: '在职' },
        ]}
      />
    </div>

    <Text type="tertiary">align（value 右对齐）+ justify（label/value 两端对齐）：</Text>
    <div style="width: 420px" data-testid="descriptions-align">
      <Descriptions
        bordered
        column={1}
        align="right"
        justify="between"
        data={[
          { label: '订单号', value: 'NO.20240620' },
          { label: '金额', value: '¥1,280.00' },
          { label: '状态', value: '已支付' },
        ]}
      />
    </div>

    <div style="width: 420px">
      <Collapse panels={[{ key: 'p1', header: '面板一' }, { key: 'p2', header: '面板二' }]}>
        {#snippet children({ key })}
          {#if key === 'p1'}面板一的内容{:else}面板二的内容{/if}
        {/snippet}
      </Collapse>
    </div>

    <Text type="tertiary">lazyRender（首次展开才渲染内容）：</Text>
    <div style="width: 420px" data-testid="collapse-lazy">
      <Collapse
        lazyRender
        keepDOM={false}
        panels={[{ key: 'la', header: '懒面板 A' }, { key: 'lb', header: '懒面板 B' }]}
      >
        {#snippet children({ key })}
          {#if key === 'la'}<span data-testid="lazy-la">懒内容 A</span>{:else}<span data-testid="lazy-lb">懒内容 B</span>{/if}
        {/snippet}
      </Collapse>
    </div>

    <Text type="tertiary">声明式 &lt;Collapse.Panel&gt;（accordion + 面板级 disabled）：</Text>
    <div style="width: 420px" data-testid="collapse-declarative">
      <Collapse accordion defaultActiveKey="d1">
        <Collapse.Panel itemKey="d1" header="声明式面板一">
          <span data-testid="decl-d1">声明式内容一</span>
        </Collapse.Panel>
        <Collapse.Panel itemKey="d2" header="声明式面板二">
          <span data-testid="decl-d2">声明式内容二</span>
        </Collapse.Panel>
        <Collapse.Panel itemKey="d3" header="禁用面板（不可展开）" disabled>
          <span data-testid="decl-d3">不应出现的内容</span>
        </Collapse.Panel>
      </Collapse>
    </div>

    <Timeline
      dataSource={[
        { content: '创建订单', time: '09:00' },
        { content: '已发货', time: '12:30', color: 'var(--cd-color-success)' },
        { content: '运输中', time: '15:00' },
      ]}
      pending="等待签收"
    />

    <Text type="tertiary">horizontal 水平方向：</Text>
    <div data-testid="timeline-horizontal" style="width: 480px">
      <Timeline
        direction="horizontal"
        dataSource={[
          { content: '创建订单', time: '09:00' },
          { content: '已发货', time: '12:30', color: 'var(--cd-color-success)' },
          { content: '运输中', time: '15:00' },
          { content: '已签收', time: '18:20' },
        ]}
      />
    </div>

    <Text type="tertiary">center 居中模式（轴居中、两侧朝轴对称对齐）：</Text>
    <div data-testid="timeline-center" style="width: 360px">
      <Timeline
        mode="center"
        dataSource={[
          { content: '创建订单', time: '09:00' },
          { content: '已发货', time: '12:30', color: 'var(--cd-color-success)' },
          { content: '运输中', time: '15:00' },
        ]}
      />
    </div>

    <Text type="tertiary">right 靠右模式（轴线在右、内容靠右对齐，left 镜像）：</Text>
    <div data-testid="timeline-right" style="width: 360px">
      <Timeline
        mode="right"
        dataSource={[
          { content: '创建订单', time: '09:00' },
          { content: '已发货', time: '12:30', color: 'var(--cd-color-success)' },
          { content: '运输中', time: '15:00' },
        ]}
      />
    </div>

    <Text type="tertiary">声明式 Timeline.Item（children 可放富内容，alternate 交替布局生效）：</Text>
    <div data-testid="timeline-item" style="width: 360px">
      <Timeline mode="alternate">
        <Timeline.Item time="09:00">
          <strong>创建订单</strong>
        </Timeline.Item>
        <Timeline.Item time="12:30" dotColor="var(--cd-color-success)">
          已发货 — <Text type="success">顺丰快递</Text>
        </Timeline.Item>
        <Timeline.Item time="15:00" lineStyle="dashed">
          运输中
        </Timeline.Item>
        <Timeline.Item time="18:20">
          已签收
        </Timeline.Item>
      </Timeline>
    </div>

    <Text type="tertiary">virtualized 虚拟化（1000 项，只渲染视口内项，轴线连续）：</Text>
    <div data-testid="timeline-virtual" style="width: 360px">
      <Timeline
        virtualized
        itemHeight={56}
        maxHeight={320}
        dataSource={Array.from({ length: 1000 }, (_, i) => ({
          key: `v${i}`,
          content: `事件 #${i + 1}`,
          time: `节点 ${i + 1}`,
          ...(i % 7 === 0 ? { color: 'var(--cd-color-success)' } : {}),
        }))}
      />
    </div>

    <Text type="tertiary">interactive 键盘 roving（点击聚焦后 ↑↓ 移动焦点、Enter 激活）：</Text>
    <div data-testid="timeline-interactive" style="width: 360px">
      <Timeline
        interactive
        dataSource={[
          { key: 'a', content: '可聚焦节点 A', time: '09:00', onClick: () => console.log('click A') },
          { key: 'b', content: '可聚焦节点 B', time: '12:30', onClick: () => console.log('click B') },
          { key: 'c', content: '可聚焦节点 C', time: '15:00', onClick: () => console.log('click C') },
          { key: 'd', content: '可聚焦节点 D', time: '18:20', onClick: () => console.log('click D') },
        ]}
      />
    </div>

    <Text type="tertiary">virtualized + interactive（1000 项可键盘漫游，焦点滚动跟随）：</Text>
    <div data-testid="timeline-virtual-interactive" style="width: 360px">
      <Timeline
        virtualized
        interactive
        itemHeight={56}
        maxHeight={320}
        dataSource={Array.from({ length: 1000 }, (_, i) => ({
          key: `vi${i}`,
          content: `可漫游事件 #${i + 1}`,
          time: `节点 ${i + 1}`,
          onClick: () => console.log('vi click', i),
        }))}
      />
    </div>
  </Space>

  <Divider />

  <Title heading={5}>List / Image / Highlight</Title>
  <Space direction="vertical" align="start">
    <div style="width: 320px">
      <List
        bordered
        header="任务列表"
        dataSource={[
          { key: 1, name: '设计评审' },
          { key: 2, name: '前端开发' },
          { key: 3, name: '联调测试' },
        ]}
      >
        {#snippet renderItem(item)}
          <span>{(item as { name: string }).name}</span>
        {/snippet}
      </List>
    </div>

    <Text type="tertiary">loadMore（加载更多按钮）：</Text>
    <div style="width: 320px" data-testid="list-loadmore">
      <List
        bordered
        dataSource={listMoreData}
        hasMore={listMoreData.length < 9}
        loadingMore={listLoadingMore}
        onLoadMore={loadMoreItems}
      >
        {#snippet renderItem(item)}
          <span>{(item as { name: string }).name}</span>
        {/snippet}
      </List>
    </div>

    <Text type="tertiary">grid 网格（3 列）：</Text>
    <div style="width: 360px" data-testid="list-grid">
      <List
        grid={{ column: 3, gutter: 12 }}
        dataSource={[1, 2, 3, 4, 5, 6]}
      >
        {#snippet renderItem(item)}
          <div style="padding:16px;background:var(--cd-color-fill-1);border-radius:8px;text-align:center">
            {item}
          </div>
        {/snippet}
      </List>
    </div>

    <Text type="tertiary">pagination 分页（每页 3）：</Text>
    <div style="width: 320px" data-testid="list-pagination">
      <List
        bordered
        dataSource={Array.from({ length: 8 }, (_, i) => ({ key: i + 1, name: `条目 ${i + 1}` }))}
        pagination={{ pageSize: 3 }}
      >
        {#snippet renderItem(item)}
          <span>{(item as { name: string }).name}</span>
        {/snippet}
      </List>
    </div>

    <Text type="tertiary">虚拟化（5000 行，仅渲染视口内）：</Text>
    <div style="width: 320px" data-testid="list-virtual">
      <List
        bordered
        dataSource={listVirtualData}
        virtualized={{ itemSize: 40, height: 240 }}
      >
        {#snippet renderItem(item)}
          <span>{(item as { name: string }).name}</span>
        {/snippet}
      </List>
    </div>

    <Text type="tertiary">selectable 多选（受控选中，仅回调不回写）：</Text>
    <div style="width: 320px" data-testid="list-selectable">
      <List
        bordered
        dataSource={listSelectData}
        selectable="multiple"
        selectedKeys={listSelectedKeys}
        onSelectionChange={(keys) => (listSelectedKeys = keys)}
      >
        {#snippet renderItem(item)}
          <span>{(item as { name: string }).name}</span>
        {/snippet}
      </List>
      <Text type="tertiary">已选 {listSelectedKeys.length} 项</Text>
    </div>

    <Text type="tertiary">声明式 List.Item / List.Item.Meta：</Text>
    <div style="width: 360px" data-testid="list-declarative">
      <List bordered>
        <List.Item>
          <List.Item.Meta
            avatar="🦊"
            title="Ant Fox"
            description="资深前端工程师 · 设计系统"
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar="🐼"
            title="Panda Zhang"
            description="交互设计师 · 无障碍方向"
          />
        </List.Item>
      </List>
    </div>

    <Image
      src="https://invalid.example/photo.jpg"
      alt="示例图片"
      width={160}
      height={100}
      preview
    />

    <Text type="tertiary">预览缩放/旋转（点击图片打开，工具栏操作）：</Text>
    <div data-testid="image-preview">
      <Image
        src={demoImageSrc}
        alt="可预览示例"
        width={160}
        height={120}
        lazy={false}
        preview
      />
    </div>

    <Text type="tertiary">预览组多图切换（点任一图进入，← → 按钮或键盘箭头切换）：</Text>
    <div data-testid="image-preview-group">
      <Image.PreviewGroup>
        <Space>
          {#each groupImages as img (img.src)}
            <Image src={img.src} alt={img.alt} width={120} height={90} lazy={false} preview />
          {/each}
        </Space>
      </Image.PreviewGroup>
    </div>

    <Text type="tertiary">LQIP 模糊占位 → 主图淡入清晰：</Text>
    <div data-testid="image-lqip">
      <Image
        src={lqipMain}
        placeholder={lqipPlaceholder}
        alt="LQIP 示例"
        width={160}
        height={120}
        lazy={false}
      />
    </div>

    <Text type="tertiary">响应式图源 srcset/sizes + 跨域 crossorigin（属性透传到原生 img）：</Text>
    <div data-testid="image-srcset">
      <Image
        src={demoImageSrc}
        srcset={`${demoImageSrc} 1x, ${demoImageSrc} 2x`}
        sizes="(max-width: 600px) 120px, 160px"
        crossorigin="anonymous"
        alt="响应式示例"
        width={160}
        height={120}
        lazy={false}
      />
    </div>

    <Highlight
      sourceString="chenzy-design 是一套对标 Semi 的 Svelte 组件库"
      searchWords={['design', 'Svelte']}
    />

    <Text type="tertiary">重叠区间合并（"foo" + "ooba" + "bar" → 单一连续高亮，不重复包裹）：</Text>
    <div data-testid="highlight-overlap">
      <Highlight sourceString="foobar baz" searchWords={['foo', 'ooba', 'bar']} />
    </div>

    <Text type="tertiary">自定义命中片段 snippet（彩色徽标替代默认 mark）：</Text>
    <div data-testid="highlight-custom">
      <Highlight sourceString="Svelte 5 runes 让 Svelte 更强" searchWords="Svelte">
        {#snippet highlight({ chunk, index })}
          <strong
            style="color: var(--cd-color-primary); border-bottom: 2px solid var(--cd-color-primary)"
            data-hit={index}>{chunk}</strong>
        {/snippet}
      </Highlight>
    </div>
  </Space>

  <Divider />

  <Title heading={5}>VirtualList（1 万行） / Carousel</Title>
  <Space direction="vertical" align="start">
    <div style="width: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px">
      <VirtualList data={bigData} height={200} itemSize={36} getKey={(it) => it.id}>
        {#snippet renderItem(item)}
          <div style="padding: 0 12px; line-height: 36px; border-bottom: 1px solid var(--cd-color-border)">
            {(item as { text: string }).text}
          </div>
        {/snippet}
      </VirtualList>
    </div>

    <Text type="tertiary">dynamic 不定高（itemSize="auto" + ResizeObserver 实测）：</Text>
    <div
      style="width: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px"
      data-testid="virtuallist-dynamic"
    >
      <VirtualList
        data={dynData}
        height={300}
        itemSize="auto"
        estimatedItemSize={48}
        getKey={(it) => it.id}
      >
        {#snippet renderItem(item)}
          <div
            style="padding: 8px 12px; border-bottom: 1px solid var(--cd-color-border); white-space: pre-line"
          >
            {(item as { text: string }).text}
          </div>
        {/snippet}
      </VirtualList>
    </div>

    <Text type="tertiary">horizontal 横向虚拟化（itemSize 作列宽 + scrollLeft）：</Text>
    <div
      style="width: 360px; height: 80px; border: 1px solid var(--cd-color-border); border-radius: 8px"
      data-testid="virtuallist-horizontal"
    >
      <VirtualList
        data={hData}
        horizontal
        height={360}
        itemSize={96}
        getKey={(it) => it.id}
      >
        {#snippet renderItem(item)}
          <div
            style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-right: 1px solid var(--cd-color-border)"
          >
            {(item as { text: string }).text}
          </div>
        {/snippet}
      </VirtualList>
    </div>

    <Text type="tertiary">scrollToIndex 命令式跳转：</Text>
    <Space align="center">
      <InputNumber
        value={scrollToTarget}
        min={0}
        max={9999}
        onChange={(v) => (scrollToTarget = v ?? 0)}
      />
      <Button
        onclick={() => scrollToVL?.scrollToIndex(scrollToTarget, { align: 'start' })}
      >
        跳到第 N 项
      </Button>
    </Space>
    <div
      style="width: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px"
      data-testid="virtuallist-scrollto"
    >
      <VirtualList
        bind:this={scrollToVL}
        data={bigData}
        height={200}
        itemSize={36}
        getKey={(it) => it.id}
      >
        {#snippet renderItem(item)}
          <div style="padding: 0 12px; line-height: 36px; border-bottom: 1px solid var(--cd-color-border)">
            {(item as { text: string }).text}
          </div>
        {/snippet}
      </VirtualList>
    </div>

    <Text type="tertiary">scrollTarget="window" 整页长列表（虚拟化跟随窗口滚动）：</Text>
    <div
      style="width: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px"
      data-testid="virtuallist-window"
    >
      <VirtualList
        data={winData}
        scrollTarget="window"
        itemSize={36}
        getKey={(it) => it.id}
      >
        {#snippet renderItem(item)}
          <div style="padding: 0 12px; line-height: 36px; border-bottom: 1px solid var(--cd-color-border)">
            {(item as { text: string }).text}
          </div>
        {/snippet}
      </VirtualList>
    </div>

    <div style="width: 360px">
      <Carousel
        slides={[slideA, slideB, slideC]}
        value={carouselIdx}
        onChange={(i) => (carouselIdx = i)}
        height={160}
      />
    </div>
    <Text type="tertiary">当前轮播：{carouselIdx + 1}</Text>

    <Text type="tertiary">autoplay（1.2s 间隔，悬停暂停）：</Text>
    <div style="width: 360px" data-testid="carousel-autoplay">
      <Carousel slides={[slideA, slideB, slideC]} autoplay interval={1200} height={160} />
    </div>

    <Text type="tertiary">slidesToShow=2 多图同屏（slidesToScroll=2，可拖拽）：</Text>
    <div style="width: 480px" data-testid="carousel-multi">
      <Carousel
        slides={[slideA, slideB, slideC, slideD, slideE]}
        slidesToShow={2}
        slidesToScroll={2}
        loop={false}
        height={160}
      />
    </div>

    <Text type="tertiary">vertical 纵向（拖拽 / 箭头上下 / 右侧指示器）：</Text>
    <div style="width: 360px" data-testid="carousel-vertical">
      <Carousel
        slides={[slideA, slideB, slideC]}
        vertical
        height={200}
      />
    </div>

    <Text type="tertiary">draggable 拖拽手势切换：</Text>
    <div style="width: 360px" data-testid="carousel-drag">
      <Carousel slides={[slideA, slideB, slideC]} height={160} />
    </div>

    <Text type="tertiary">indicatorType="line" 横线条指示器：</Text>
    <div style="width: 360px" data-testid="carousel-indicator-line">
      <Carousel slides={[slideA, slideB, slideC]} indicatorType="line" height={160} />
    </div>

    <Text type="tertiary">indicatorType="columnar" 竖栏指示器：</Text>
    <div style="width: 360px" data-testid="carousel-indicator-columnar">
      <Carousel slides={[slideA, slideB, slideC]} indicatorType="columnar" height={160} />
    </div>

    <Text type="tertiary">vertical + line 指示器（右侧纵向）：</Text>
    <div style="width: 360px" data-testid="carousel-indicator-vertical-line">
      <Carousel slides={[slideA, slideB, slideC]} vertical indicatorType="line" height={200} />
    </div>
  </Space>

  <Divider />

  <Title heading={5}>Tree</Title>
  <div style="display: flex; align-items: flex-start; gap: 48px; flex-wrap: wrap">
    <div style="width: 240px" data-testid="tree-icon">
      <Text type="tertiary">单选 + 节点图标</Text>
      <Tree
        {treeData}
        defaultExpandAll
        value={treeSel}
        onChange={(info) => (treeSel = info.value as string | number)}
        ariaLabel="部门树"
      >
        {#snippet icon({ node, expanded })}
          {#if node.children && node.children.length}
            <span class="tree-icon-glyph">{expanded ? '📂' : '📁'}</span>
          {:else}
            <span class="tree-icon-glyph">📄</span>
          {/if}
        {/snippet}
      </Tree>
      <Text type="tertiary">已选：{treeSel}</Text>
    </div>

    <div style="width: 240px">
      <Text type="tertiary">可勾选（父子联动）+ 可搜索</Text>
      <Tree
        {treeData}
        checkable
        filterable
        defaultExpandAll
        checkedKeys={treeChecked}
        onCheck={(info) => (treeChecked = info.checked)}
        ariaLabel="可勾选部门树"
      />
      <Text type="tertiary">已勾选 {treeChecked.length} 项</Text>
    </div>

    <div style="width: 240px" data-testid="tree-showline">
      <Text type="tertiary">showLine 层级连接线</Text>
      <Tree {treeData} showLine showIcon={false} defaultExpandAll ariaLabel="连接线树" />
    </div>

    <div style="width: 240px" data-testid="tree-accordion">
      <Text type="tertiary">accordion 手风琴（同层级只展开一个）</Text>
      <Tree {treeData} accordion ariaLabel="手风琴树" />
    </div>

    <div style="width: 240px" data-testid="tree-loaddata">
      <Text type="tertiary">异步加载（展开拉取子节点）</Text>
      <Tree treeData={treeAsyncRoots} loadData={loadTreeChildren} ariaLabel="异步加载树" />
    </div>

    <div style="width: 280px" data-testid="tree-virtualized">
      <Text type="tertiary">虚拟滚动（1050 节点，仅渲染视口内行）</Text>
      <Tree
        treeData={bigTreeData}
        virtualized
        height={320}
        defaultExpandAll
        ariaLabel="大数据虚拟树"
      />
    </div>

    <div style="width: 240px" data-testid="tree-draggable">
      <Text type="tertiary">draggable 拖拽排序（before / inside / after）</Text>
      <Tree
        treeData={dragTreeData}
        draggable
        defaultExpandAll
        showLine
        showIcon={false}
        ariaLabel="可拖拽树"
        onDrop={(info) => {
          dragTreeData = reorderTree(
            dragTreeData,
            info.dragNode.key,
            info.dropNode.key,
            info.dropPosition,
          );
          dragInfo = `${info.dragNode.label} → ${info.dropNode.label}（${info.dropPosition}）`;
        }}
      />
      <Text type="tertiary">最近一次拖拽：{dragInfo}</Text>
    </div>

    <div style="width: 240px" data-testid="tree-fieldnames">
      <Text type="tertiary">fieldNames 字段映射（数据用 id/name/sub）</Text>
      <Tree
        treeData={treeFieldData as unknown as TreeNode[]}
        fieldNames={treeFieldNames}
        checkable
        defaultExpandAll
        value={treeFieldSel}
        checkedKeys={treeFieldChecked}
        onChange={(info) => (treeFieldSel = info.value as string | number)}
        onCheck={(info) => (treeFieldChecked = info.checked)}
        ariaLabel="字段映射树"
      />
      <Text type="tertiary">已选：{treeFieldSel ?? '（未选）'}，已勾选 {treeFieldChecked.length} 项</Text>
    </div>
  </div>

  <Divider />

  <Title heading={5}>Table</Title>
  <Text type="tertiary">可排序（姓名/年龄）+ 行选择 + 分页（每页 5）</Text>
  <Table
    columns={tableColumns}
    dataSource={tableData}
    rowKey="key"
    bordered
    stripe
    pagination={{ pageSize: 5 }}
    rowSelection={{
      selectedRowKeys: tableSelected,
      onChange: (keys) => (tableSelected = keys),
    }}
  />
  <Text type="tertiary">已选 {tableSelected.length} 行</Text>

  <Text type="tertiary">行展开（点击 ▶ 展开详情）：</Text>
  <div data-testid="table-expand">
    <Table
      columns={tableColumns}
      dataSource={tableData}
      rowKey="key"
      bordered
      expandable={{
        expandedRowRender: tableExpandRow,
        onExpand: (expanded, record) =>
          (tableExpandInfo = `${expanded ? '展开' : '收起'} ${record.name}`),
      }}
    />
  </div>
  <Text type="tertiary">{tableExpandInfo}</Text>

  <Text type="tertiary">固定列（横向滚动，姓名列左固定 / 操作列右固定）：</Text>
  <div data-testid="table-fixed" style="max-width:520px">
    <Table
      columns={[
        { dataIndex: 'name', title: '姓名', width: 120, fixed: 'left' },
        { dataIndex: 'age', title: '年龄', width: 200 },
        { dataIndex: 'city', title: '城市', width: 200 },
        { dataIndex: 'email', title: '邮箱', width: 240 },
        { dataIndex: 'phone', title: '电话', width: 200 },
        { dataIndex: 'action', title: '操作', width: 100, fixed: 'right' },
      ]}
      dataSource={fixedData}
      rowKey="key"
      bordered
    />
  </div>

  <Text type="tertiary">列筛选（城市列漏斗多选）：</Text>
  <div data-testid="table-filter">
    <Table
      columns={[
        { dataIndex: 'name', title: '姓名' },
        { dataIndex: 'age', title: '年龄', align: 'right' as const },
        {
          dataIndex: 'city',
          title: '城市',
          filters: [
            { text: '北京', value: '北京' },
            { text: '上海', value: '上海' },
            { text: '广州', value: '广州' },
          ],
        },
      ]}
      dataSource={tableData}
      rowKey="key"
      bordered
    />
  </div>

  <Text type="tertiary">列宽拖拽（拖动姓名 / 城市列头右侧手柄调整列宽，最小 40px）：</Text>
  <div data-testid="table-resizable" style="max-width:560px">
    <Table
      columns={[
        { dataIndex: 'name', title: '姓名', width: 160, resizable: true },
        { dataIndex: 'age', title: '年龄', width: 100, align: 'right' as const },
        { dataIndex: 'city', title: '城市', width: 160, resizable: true },
        { dataIndex: 'email', title: '邮箱', width: 200 },
      ]}
      dataSource={tableData}
      rowKey="key"
      bordered
    />
  </div>

  <Text type="tertiary">树形数据（行含 children，第一列展开三角 + 缩进；默认展开「研发中心」）：</Text>
  <div data-testid="table-tree" style="max-width:520px">
    <Table
      columns={[
        { dataIndex: 'name', title: '部门 / 姓名' },
        { dataIndex: 'age', title: '人数', align: 'right' as const },
        { dataIndex: 'city', title: '城市' },
      ]}
      dataSource={tableTreeData}
      rowKey="key"
      bordered
      tree={{
        defaultExpandedRowKeys: [1],
        onExpand: (expanded, key) =>
          (tableTreeInfo = `${expanded ? '展开' : '收起'} 行 ${key}`),
      }}
    />
  </div>
  <Text type="tertiary">{tableTreeInfo}</Text>

  <Text type="tertiary">树形行选择父子联动（勾「研发中心」连带勾所有后代；取消一个子行父行变半选；checkStrictly 默认联动）：</Text>
  <div data-testid="table-tree-checkable" style="max-width:520px">
    <Table
      columns={[
        { dataIndex: 'name', title: '部门 / 姓名' },
        { dataIndex: 'age', title: '人数', align: 'right' as const },
        { dataIndex: 'city', title: '城市' },
      ]}
      dataSource={tableTreeData}
      rowKey="key"
      bordered
      tree={{ defaultExpandedRowKeys: [1, 11] }}
      rowSelection={{
        onChange: (keys) => (tableTreeChecked = keys),
      }}
    />
  </div>
  <Text type="tertiary">已选 keys：{tableTreeChecked.join(', ') || '（无）'}</Text>

  <Text type="tertiary">行虚拟滚动（2000 行，仅渲染视口内 ~十几行，滚动流畅；表头 sticky 固定；排序仍生效）：</Text>
  <div data-testid="table-virtualized" style="max-width:520px">
    <Table
      columns={tableColumns}
      dataSource={tableBigData}
      rowKey="key"
      bordered
      virtualized
      height={400}
      rowHeight={48}
    />
  </div>

  {#snippet tableExpandRow({ record }: { record: TableRow; index: number })}
    <div style="line-height:1.8">
      <strong>{record.name}</strong> 的详细资料：年龄 {record.age}，城市 {record.city}。
    </div>
  {/snippet}

  <Divider />

  <Title heading={5}>Calendar（月视图）</Title>
  <Text type="tertiary">事件展示 + 6/10 当天溢出折叠 + 跨天事件</Text>
  <Calendar
    defaultValue={calAnchor}
    events={calEvents}
    maxEventsPerDay={3}
    onSelect={(info) => (calSelectedText = info.date.toLocaleDateString('zh-CN'))}
  />
  <Text type="tertiary">选中日期：{calSelectedText}</Text>

  <Divider />

  <Title heading={5}>Calendar（周视图）</Title>
  <Text type="tertiary">mode="week"：单行 7 天，周导航前后切换</Text>
  <div data-testid="calendar-week">
    <Calendar mode="week" defaultValue={calAnchor} events={calEvents} maxEventsPerDay={4} />
  </div>

  <Divider />

  <Title heading={5}>Calendar（日视图 / 单日时间轴）</Title>
  <Text type="tertiary">
    mode="day"：纵向逐小时时间轴（8–20 时），带时间的事件入对应时段，全天/跨天事件入顶部「全天」区；天导航 ±1 切换
  </Text>
  <div data-testid="calendar-day">
    <Calendar
      mode="day"
      defaultValue={calDayAnchor}
      dayStartHour={8}
      dayEndHour={20}
      events={calDayEvents}
    />
  </div>

  <Divider />

  <Title heading={5}>Calendar（范围选择）</Title>
  <Text type="tertiary">selectionMode="range"：点两天选范围，自动排序，区间高亮 + hover 预览</Text>
  <div data-testid="calendar-range">
    <Calendar
      selectionMode="range"
      defaultValue={calAnchor}
      onRangeChange={(info) =>
        (calRangeText = `${fmtDay(info.range[0])} ~ ${fmtDay(info.range[1])}`)}
    />
  </div>
  <Text type="tertiary">选中范围：{calRangeText}</Text>

  <Divider />

  <Title heading={5}>Calendar（弹层模式）</Title>
  <Text type="tertiary">popup：点击 trigger 弹出日历浮层，外部点击 / Esc 关闭</Text>
  <div data-testid="calendar-popup">
    <Calendar
      popup
      defaultValue={calAnchor}
      events={calEvents}
      onSelect={(info) => (calPopupText = info.date.toLocaleDateString('zh-CN'))}
    />
  </div>
  <Text type="tertiary">弹层选中：{calPopupText}</Text>

  <Divider />

  <Title heading={5}>Calendar（roving 键盘焦点 + 虚拟化日轴）</Title>
  <Text type="tertiary">
    月视图聚焦日格后方向键移动焦点（←→天 / ↑↓周 / PageUp-Down月 / Home-End），Enter 选中；day 视图 0–23 时虚拟化滚动
  </Text>
  <div data-testid="calendar-virtual">
    <Calendar
      mode="day"
      defaultValue={calDayAnchor}
      dayStartHour={0}
      dayEndHour={23}
      events={calDayEvents}
    />
  </div>

  <Divider />

  <Title heading={5}>ScrollList（滚轮选择）</Title>
  <Text type="tertiary">滚动 / 点击 / 方向键选择小时（03、04 禁用）</Text>
  <div style="width: 80px">
    <ScrollList
      data={hourData}
      defaultValue={9}
      ariaLabel="小时"
      onChange={(info) => (pickedHour = info.value as string | number)}
    />
  </div>
  <Text type="tertiary">选中小时：{pickedHour}</Text>

  <div style="margin-top:16px"><Text type="tertiary">多列联动：年 / 月 / 日（日列范围随年月派生，含闰年；日列 cyclic 循环）</Text></div>
  <div style="width: 240px" data-testid="scrolllist-multi">
    <ScrollList
      columns={slDateColumns}
      value={slDate}
      onChange={(info) => {
        const vals = info.value as (string | number)[];
        const y = Number(vals[0]);
        const m = Number(vals[1]);
        const maxDay = new Date(y, m, 0).getDate();
        const d = Math.min(Number(vals[2]), maxDay);
        slDate = [y, m, d];
      }}
    />
  </div>
  <Text type="tertiary">选中日期：{slDate[0]}-{slDate[1]}-{slDate[2]}</Text>

  <div style="margin-top:16px"><Text type="tertiary">cyclic 循环单列（无限轮，向上/下持续滚动接回）</Text></div>
  <div style="width: 80px" data-testid="scrolllist-cyclic">
    <ScrollList
      data={slCyclicHours}
      value={slCyclicHour}
      cyclic
      ariaLabel="循环小时"
      onChange={(info) => (slCyclicHour = info.value as string | number)}
    />
  </div>
  <Text type="tertiary">循环选中：{slCyclicHour}</Text>

  <div style="margin-top:16px"><Text type="tertiary">虚拟化（1000 项，仅渲染视口）</Text></div>
  <div style="width: 120px" data-testid="scrolllist-virtual">
    <ScrollList
      data={slBigData}
      value={slBigPicked}
      virtualized
      ariaLabel="大数据列"
      onChange={(info) => (slBigPicked = info.value as string | number)}
    />
  </div>
  <Text type="tertiary">虚拟化选中：{slBigPicked}</Text>

  <div style="margin-top:16px"><Text type="tertiary">loadMore + status（滚到末尾加载更多，加载中显示状态）</Text></div>
  <div style="width: 140px" data-testid="scrolllist-loadmore">
    <ScrollList
      data={slMoreData}
      status={slStatus}
      ariaLabel="加载更多列"
      onLoadMore={slLoadMore}
    />
  </div>
  <Text type="tertiary">已加载 {slMoreData.length} 条（最多 60）· 状态 {slStatus}</Text>

  <Divider />

  <Title heading={5}>OverflowList（溢出折叠）</Title>
  <Text type="tertiary">拖动滑块改变容器宽度，溢出标签自动收纳进 +N</Text>
  <input type="range" min="120" max="640" bind:value={overflowWidth} style="width: 320px; display: block" aria-label="容器宽度" />
  <div style="width: {overflowWidth}px; border: 1px dashed var(--cd-color-border); padding: 8px; border-radius: 6px">
    <OverflowList
      items={overflowTags}
      ariaLabel="部门标签"
      onOverflowChange={(info) => (overflowHidden = info.overflowCount)}
    >
      {#snippet item({ item })}
        <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
      {/snippet}
    </OverflowList>
  </div>
  <Text type="tertiary">容器宽 {overflowWidth}px，已折叠 {overflowHidden} 项</Text>

  <div style="margin-top:12px"><Text type="tertiary">collapseFrom="start"（从头部折叠，尾部最新项保留）</Text></div>
  <div style="width: {overflowWidth}px; border: 1px dashed var(--cd-color-border); padding: 8px; border-radius: 6px">
    <OverflowList items={overflowTags} collapseFrom="start" ariaLabel="部门标签（头部折叠）">
      {#snippet item({ item })}
        <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
      {/snippet}
    </OverflowList>
  </div>

  <div style="margin-top:12px"><Text type="tertiary">mode="scroll"（不折叠，横向滚动查看）</Text></div>
  <div style="width: {overflowWidth}px; border: 1px dashed var(--cd-color-border); padding: 8px; border-radius: 6px">
    <OverflowList items={overflowTags} mode="scroll" ariaLabel="部门标签（滚动）">
      {#snippet item({ item })}
        <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
      {/snippet}
    </OverflowList>
  </div>

  <div style="margin-top:12px"><Text type="tertiary">direction="vertical"（纵向折叠，容器高 120px）</Text></div>
  <div style="height:120px; width:160px; border: 1px dashed var(--cd-color-border); padding: 8px; border-radius: 6px">
    <OverflowList items={overflowTags} direction="vertical" ariaLabel="部门标签（纵向）">
      {#snippet item({ item })}
        <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
      {/snippet}
    </OverflowList>
  </div>

  <div style="margin-top:12px"><Text type="tertiary">forceMeasure()（命令式：父级 display 切回后手动重测）</Text></div>
  <div style="display:flex;gap:8px;margin-bottom:8px">
    <Button onclick={() => (overflowHiddenBox = !overflowHiddenBox)}>{overflowHiddenBox ? '显示容器' : '隐藏容器'}</Button>
    <Button onclick={() => overflowForceRef?.forceMeasure()}>forceMeasure()</Button>
  </div>
  <div style="display:{overflowHiddenBox ? 'none' : 'block'}; width: 360px; border: 1px dashed var(--cd-color-border); padding: 8px; border-radius: 6px" data-testid="overflow-force-box">
    <OverflowList bind:this={overflowForceRef} items={overflowTags} ariaLabel="部门标签（forceMeasure）">
      {#snippet item({ item })}
        <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
      {/snippet}
    </OverflowList>
  </div>

  <div style="margin-top:12px"><Text type="tertiary">scrollTo(index)（scroll 模式命令式滚动到指定项）</Text></div>
  <div style="display:flex;gap:8px;margin-bottom:8px">
    <Button onclick={() => overflowScrollRef?.scrollTo(0)}>滚到首项</Button>
    <Button onclick={() => overflowScrollRef?.scrollTo(6, { align: 'center' })}>居中第 7 项</Button>
    <Button onclick={() => overflowScrollRef?.scrollTo(11, { align: 'end' })}>滚到末项</Button>
  </div>
  <div style="width: 300px; border: 1px dashed var(--cd-color-border); padding: 8px; border-radius: 6px" data-testid="overflow-scroll-box">
    <OverflowList bind:this={overflowScrollRef} items={longTags} mode="scroll" ariaLabel="标签（scrollTo）">
      {#snippet item({ item })}
        <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
      {/snippet}
    </OverflowList>
  </div>

  <Divider />

  <Title heading={5}>Spin（加载指示器）</Title>
  <div style="display:flex; align-items:center; gap:48px; flex-wrap:wrap">
    <div>
      <Text type="tertiary">三尺寸 inline</Text>
      <div style="display:flex; align-items:center; gap:24px; margin-top:8px">
        <Spin size="small" />
        <Spin size="default" />
        <Spin size="large" />
      </div>
    </div>
    <div>
      <Text type="tertiary">带文案</Text>
      <div style="margin-top:8px"><Spin tip="加载中" /></div>
    </div>
  </div>

  <div style="margin-top:16px">
    <Button onclick={() => (spinWrap = !spinWrap)}>{spinWrap ? '停止' : '开始'}加载</Button>
    <div style="margin-top:8px; width:280px">
      <Spin spinning={spinWrap} tip="数据加载中">
        <div style="padding:24px; background:var(--cd-color-fill-0); border-radius:8px; line-height:1.8">
          这是被包裹的卡片内容。<br />加载时上方会覆盖半透明遮罩 + 居中指示器，内容不可交互。
        </div>
      </Spin>
    </div>
  </div>

  <Divider />

  <Title heading={5}>Progress（进度条）</Title>
  <input type="range" min="0" max="100" bind:value={progressPct} style="width:320px; display:block" aria-label="进度" />
  <div style="max-width:400px; margin-top:12px; display:flex; flex-direction:column; gap:12px">
    <Progress percent={progressPct} ariaLabel="普通进度" />
    <Progress percent={progressPct} status="success" ariaLabel="成功进度" />
    <Progress percent={progressPct} status="error" ariaLabel="失败进度" />
    <Progress percent={progressPct} size="small" ariaLabel="小尺寸进度" />
  </div>
  <div style="display:flex; gap:32px; align-items:center; margin-top:16px; flex-wrap:wrap">
    <Progress type="circle" percent={progressPct} ariaLabel="环形进度" />
    <Progress type="circle" percent={100} status="success" successWhenFull ariaLabel="完成环形" />
    <Progress type="dashboard" percent={progressPct} ariaLabel="仪表盘进度" />
    <Progress type="line" indeterminate ariaLabel="不确定进度" />
  </div>

  <Divider />

  <Title heading={5}>Skeleton（骨架屏）</Title>
  <div style="display:flex; gap:48px; flex-wrap:wrap; align-items:flex-start">
    <div>
      <Text type="tertiary">静态原子形状</Text>
      <div style="display:flex; gap:16px; align-items:center; margin-top:8px">
        <SkeletonAvatar />
        <SkeletonAvatar shape="square" size="large" />
        <SkeletonButton pill />
        <SkeletonImage width={120} height={80} />
      </div>
    </div>
  </div>

  <div style="margin-top:16px">
    <Button onclick={() => (skeletonLoading = !skeletonLoading)}>
      {skeletonLoading ? '加载完成' : '重新加载'}
    </Button>
    <div style="width:360px; margin-top:12px; padding:16px; border:1px solid var(--cd-color-border); border-radius:8px">
      <Skeleton loading={skeletonLoading} active>
        {#snippet placeholder()}
          <div style="display:flex; gap:16px">
            <SkeletonAvatar size="large" />
            <div style="flex:1">
              <SkeletonTitle width="50%" />
              <div style="margin-top:12px">
                <SkeletonParagraph rows={3} />
              </div>
            </div>
          </div>
        {/snippet}
        <div style="display:flex; gap:16px">
          <div style="width:40px; height:40px; border-radius:50%; background:var(--cd-color-primary); flex:0 0 auto"></div>
          <div>
            <strong>陈一</strong>
            <p style="margin:8px 0 0; color:var(--cd-color-text-1); line-height:1.6">
              这是加载完成后的真实内容。骨架屏在数据返回前占位，避免布局抖动。
            </p>
          </div>
        </div>
      </Skeleton>
    </div>

    <div style="margin-top:16px">
      <Text type="tertiary">keepDOM 模式（unmountPlaceholder=false，display:none 切换，保留 DOM）</Text>
    </div>
    <div style="width:360px; margin-top:8px; padding:16px; border:1px solid var(--cd-color-border); border-radius:8px">
      <Skeleton loading={skeletonLoading} active unmountPlaceholder={false}>
        {#snippet placeholder()}
          <div style="display:flex; gap:16px">
            <SkeletonAvatar size="large" />
            <div style="flex:1">
              <SkeletonTitle width="50%" />
              <div style="margin-top:12px">
                <SkeletonParagraph rows={2} />
              </div>
            </div>
          </div>
        {/snippet}
        <div data-testid="skeleton-keepdom-content" style="display:flex; gap:16px">
          <div style="width:40px; height:40px; border-radius:50%; background:var(--cd-color-primary); flex:0 0 auto"></div>
          <div>
            <strong>陈一</strong>
            <p style="margin:8px 0 0; color:var(--cd-color-text-1); line-height:1.6">
              keepDOM 模式下真实内容始终在 DOM，靠 display 切换。
            </p>
          </div>
        </div>
      </Skeleton>
    </div>
  </div>

  <Divider />

  <Title heading={5}>Banner（横幅）</Title>
  <div style="display:flex; flex-direction:column; gap:12px; max-width:640px">
    <Banner type="info" title="系统提示" description="这是一条信息横幅，用于展示当前页面的全局状态。" />
    <Banner type="success" title="保存成功" description="你的更改已成功保存。" />
    <Banner type="warning" fullMode={false} bordered title="存储空间不足" description="剩余空间不足 10%，请及时清理。" />
    <Banner type="danger" fullMode={false} bordered title="订阅已过期" description="高级功能已停用，续费后立即恢复。">
      {#snippet action({ close })}
        <Button type="primary" size="small" onclick={close}>立即续费</Button>
      {/snippet}
    </Banner>
  </div>

  <div style="margin-top:16px; max-width:640px">
    <Button onclick={() => (bannerOpen = true)} disabled={bannerOpen}>显示可关闭横幅</Button>
    <div style="margin-top:8px">
      <Banner
        type="info"
        open={bannerOpen}
        closeOnEsc
        onOpenChange={(info) => (bannerOpen = info.open)}
        title="可关闭横幅"
        description="点击右侧关闭按钮收起，或按 Esc 关闭；受控 open 状态。"
      />
    </div>
  </div>

  <Divider />

  <Title heading={5}>Modal（模态对话框）</Title>
  <div style="display:flex; gap:12px; flex-wrap:wrap">
    <Button type="primary" onclick={() => (modalOpen = true)}>打开对话框</Button>
    <Button type="danger" onclick={() => (dangerModalOpen = true)}>删除确认</Button>
  </div>

  <Text type="tertiary">命令式 modal.confirm/info/...（mount 到 body、堆叠、async 确认）：</Text>
  <div style="display:flex; gap:12px; flex-wrap:wrap" data-testid="modal-command">
    <Button
      onclick={() =>
        modal.confirm({
          title: '确认操作',
          content: '确定要执行此操作吗？',
          onOk: () => {
            popResult = 'confirm-ok';
          },
          onCancel: () => {
            popResult = 'confirm-cancel';
          },
        })}>confirm</Button
    >
    <Button onclick={() => modal.info({ title: '提示', content: '这是一条信息。' })}>info</Button>
    <Button onclick={() => modal.success({ title: '成功', content: '操作已完成。' })}>success</Button>
    <Button
      onclick={() =>
        modal.confirm({
          title: '异步提交',
          content: '点击确定后将等待 1 秒（模拟请求）。',
          onOk: () => new Promise((r) => setTimeout(r, 1000)),
        })}>async confirm</Button
    >
  </div>

  <Modal
    open={modalOpen}
    title="编辑资料"
    onOpenChange={(o) => (modalOpen = o)}
    onOk={() => (modalOpen = false)}
  >
    <p style="margin:0; line-height:1.8">
      这是模态对话框的内容区。打开时焦点被捕获在面板内，Tab 循环不逃逸；按 Esc 或点击遮罩可关闭；背景滚动被锁定。
    </p>
  </Modal>

  <Modal
    open={dangerModalOpen}
    title="删除项目"
    okType="danger"
    okText="删除"
    onOpenChange={(o) => (dangerModalOpen = o)}
    onOk={() => (dangerModalOpen = false)}
  >
    <p style="margin:0; line-height:1.8">
      确定删除此项目？此操作不可撤销，项目下的全部数据将被永久移除。
    </p>
  </Modal>

  <Text type="tertiary">Modal.confirm 工厂 + 堆叠 z-index（点确认再开一层，后开者在上）：</Text>
  <div style="display:flex; gap:12px; flex-wrap:wrap" data-testid="modal-stack">
    <Button
      onclick={() =>
        Modal.confirm({
          title: '第一层',
          content: '点击确定将在上层再弹出一个确认框（验证堆叠）。',
          onOk: () => {
            Modal.confirm({
              title: '第二层（更高 z-index）',
              content: '这一层叠在第一层之上。',
            });
          },
        })}>Modal.confirm 堆叠</Button
    >
  </div>

  <Text type="tertiary">destroyOnClose：关闭即卸载内容，重开重置内部状态（输入框）：</Text>
  <div style="display:flex; gap:12px; flex-wrap:wrap" data-testid="modal-destroy">
    <Button onclick={() => (destroyModalOpen = true)}>打开（destroyOnClose）</Button>
  </div>
  <Modal
    open={destroyModalOpen}
    title="destroyOnClose 演示"
    destroyOnClose
    onOpenChange={(o) => (destroyModalOpen = o)}
    onOk={() => (destroyModalOpen = false)}
  >
    <p style="margin:0 0 8px; line-height:1.6">在下方输入内容后关闭再重开，内容会被重置（内容随关闭卸载）：</p>
    <input
      placeholder="输入草稿…"
      style="inline-size:100%; box-sizing:border-box; padding:6px 10px; border:1px solid var(--cd-color-border); border-radius:6px"
    />
  </Modal>

  <Text type="tertiary">draggable：按住标题栏拖动对话框到新位置（重开重置位置）：</Text>
  <div style="display:flex; gap:12px; flex-wrap:wrap" data-testid="modal-drag">
    <Button onclick={() => (dragModalOpen = true)}>打开（draggable）</Button>
  </div>
  <Modal
    open={dragModalOpen}
    title="可拖拽对话框"
    draggable
    onOpenChange={(o) => (dragModalOpen = o)}
    onOk={() => (dragModalOpen = false)}
  >
    <p style="margin:0; line-height:1.8">
      按住上方标题栏即可拖动整个对话框。拖拽是鼠标增强，键盘 Tab 焦点循环与 Esc 关闭不受影响；重新打开会回到初始居中位置。
    </p>
  </Modal>

  <Divider />

  <Title heading={5}>Drawer（抽屉 / SideSheet）</Title>
  <div style="display:flex; gap:12px; flex-wrap:wrap">
    <Button type="primary" onclick={() => (drawerRight = true)}>右侧抽屉</Button>
    <Button onclick={() => (drawerLeft = true)}>左侧抽屉</Button>
    <Button onclick={() => (drawerTop = true)}>顶部抽屉</Button>
    <Button onclick={() => (drawerBottom = true)}>底部抽屉</Button>
    <Button onclick={() => (drawerDestroy = true)}>destroyOnClose</Button>
    <Button onclick={() => (drawerNestOuter = true)}>嵌套抽屉</Button>
    <Button onclick={() => (drawerNoKbd = true)}>keyboard=false（禁键盘）</Button>
  </div>

  <Drawer
    open={drawerRight}
    placement="right"
    title="编辑用户"
    onOpenChange={(o) => (drawerRight = o)}
  >
    <p style="margin:0; line-height:1.8">
      右侧抽屉从视口右边缘滑入，承载较长的编辑表单。按 Esc 或点击遮罩关闭，背景滚动被锁定，焦点被捕获在面板内。
    </p>
    {#snippet footer()}
      <Button onclick={() => (drawerRight = false)}>取消</Button>
      <Button type="primary" onclick={() => (drawerRight = false)}>保存</Button>
    {/snippet}
  </Drawer>

  <Drawer
    open={drawerLeft}
    placement="left"
    size="small"
    title="导航菜单"
    onOpenChange={(o) => (drawerLeft = o)}
  >
    <p style="margin:0; line-height:1.8">左侧小尺寸抽屉，常用于移动端导航菜单。</p>
  </Drawer>

  <Drawer
    open={drawerTop}
    placement="top"
    title="系统通知"
    onOpenChange={(o) => (drawerTop = o)}
  >
    <p style="margin:0; line-height:1.8">顶部抽屉从上方滑入，适合通知横幅、公告等场景。</p>
  </Drawer>

  <Drawer
    open={drawerBottom}
    placement="bottom"
    title="筛选条件"
    onOpenChange={(o) => (drawerBottom = o)}
  >
    <p style="margin:0; line-height:1.8">底部抽屉从下方滑入，适合筛选面板等场景。</p>
  </Drawer>

  <Drawer
    open={drawerDestroy}
    placement="right"
    title="destroyOnClose 演示"
    destroyOnClose
    onOpenChange={(o) => (drawerDestroy = o)}
  >
    <p style="margin:0 0 12px; line-height:1.8">
      destroyOnClose 时关闭即从 DOM 卸载内部内容，重开重建并重置内部状态。下方输入框的值在关闭后不会保留。
    </p>
    <Input placeholder="输入点内容再关闭重开试试" />
  </Drawer>

  <Drawer
    open={drawerNestOuter}
    placement="right"
    title="外层抽屉"
    onOpenChange={(o) => (drawerNestOuter = o)}
  >
    <p style="margin:0 0 12px; line-height:1.8">
      嵌套抽屉：在外层抽屉中再打开一层，内层 z-index 自动递增（与 Modal 共享层栈），叠在外层之上。
    </p>
    <Button type="primary" onclick={() => (drawerNestInner = true)}>打开内层抽屉</Button>
  </Drawer>

  <Drawer
    open={drawerNestInner}
    placement="right"
    size="small"
    title="内层抽屉"
    onOpenChange={(o) => (drawerNestInner = o)}
  >
    <p style="margin:0; line-height:1.8">内层抽屉叠在外层之上，关闭后回收 z-index。</p>
  </Drawer>

  <Drawer
    open={drawerNoKbd}
    placement="right"
    title="keyboard=false 总开关"
    keyboard={false}
    onOpenChange={(o) => (drawerNoKbd = o)}
  >
    <p style="margin:0 0 12px; line-height:1.8">
      keyboard=false 停用全部键盘交互：按 Esc 不会关闭（覆盖 closeOnEsc），Tab/Shift+Tab 也不做焦点循环捕获。请用关闭按钮或点击遮罩关闭。
    </p>
    <Input placeholder="Tab 不被锁在面板内" />
  </Drawer>

  <Divider />

  <Title heading={5}>SideSheet（侧边滑出浮层）</Title>
  <Text type="tertiary">受控 open + onOpenChange，reason: {ssReason || '—'}</Text>
  <div data-testid="ss-buttons" style="display:flex; gap:12px; flex-wrap:wrap; margin-top:8px">
    <Button type="primary" onclick={() => (ssRight = true)}>右侧（模态）</Button>
    <Button onclick={() => (ssLeft = true)}>左侧</Button>
    <Button onclick={() => (ssTop = true)}>顶部</Button>
    <Button onclick={() => (ssBottom = true)}>底部</Button>
    <Button onclick={() => (ssSmall = true)}>small</Button>
    <Button onclick={() => (ssLarge = true)}>large</Button>
    <Button onclick={() => (ssNoMask = true)}>非模态 mask=false</Button>
    <Button onclick={() => (ssFooter = true)}>Footer close()</Button>
    <Button onclick={() => (ssDestroy = true)}>destroyOnClose</Button>
  </div>

  <SideSheet
    open={ssRight}
    placement="right"
    title="编辑用户"
    onOpenChange={(e) => {
      ssRight = e.open;
      ssReason = e.reason;
    }}
  >
    <p style="margin:0; line-height:1.8">
      右侧模态面板：焦点捕获、背景滚动锁定、Esc/遮罩关闭，关闭后焦点归还触发按钮。
    </p>
  </SideSheet>

  <SideSheet
    open={ssLeft}
    placement="left"
    title="导航菜单"
    onOpenChange={(e) => (ssLeft = e.open)}
  >
    <p style="margin:0; line-height:1.8">左侧滑入。</p>
  </SideSheet>

  <SideSheet
    open={ssTop}
    placement="top"
    title="系统通知"
    onOpenChange={(e) => (ssTop = e.open)}
  >
    <p style="margin:0; line-height:1.8">顶部滑入。</p>
  </SideSheet>

  <SideSheet
    open={ssBottom}
    placement="bottom"
    title="筛选条件"
    onOpenChange={(e) => (ssBottom = e.open)}
  >
    <p style="margin:0; line-height:1.8">底部滑入。</p>
  </SideSheet>

  <SideSheet
    open={ssSmall}
    placement="right"
    size="small"
    title="small 尺寸"
    onOpenChange={(e) => (ssSmall = e.open)}
  >
    <p style="margin:0; line-height:1.8">small 预设宽度。</p>
  </SideSheet>

  <SideSheet
    open={ssLarge}
    placement="right"
    size="large"
    title="large 尺寸"
    onOpenChange={(e) => (ssLarge = e.open)}
  >
    <p style="margin:0; line-height:1.8">large 预设宽度（90%）。</p>
  </SideSheet>

  <SideSheet
    open={ssNoMask}
    placement="right"
    mask={false}
    outsideClosable
    title="通知中心（非模态）"
    onOpenChange={(e) => (ssNoMask = e.open)}
  >
    <p style="margin:0; line-height:1.8">
      mask=false：无遮罩、不锁背景滚动、不抢焦点，打开时仍可与主页面交互。点击面板外部关闭（outsideClosable）。
    </p>
  </SideSheet>

  <SideSheet
    open={ssFooter}
    placement="right"
    title="高级筛选"
    onOpenChange={(e) => (ssFooter = e.open)}
  >
    <p style="margin:0; line-height:1.8">Footer 暴露 close()，按钮可关闭面板。</p>
    {#snippet footer({ close })}
      <Button onclick={close}>取消</Button>
      <Button type="primary" onclick={close}>应用筛选</Button>
    {/snippet}
  </SideSheet>

  <SideSheet
    open={ssDestroy}
    placement="right"
    title="destroyOnClose"
    destroyOnClose
    onOpenChange={(e) => (ssDestroy = e.open)}
  >
    <p style="margin:0 0 12px; line-height:1.8">关闭即卸载，重开重置内部状态。</p>
    <Input placeholder="输入后关闭重开会清空" />
  </SideSheet>

  <Divider />

  <Title heading={5}>Popconfirm（气泡确认）</Title>
  <div style="display:flex; gap:24px; padding:40px 0">
    <Popconfirm
      type="danger"
      title="确定删除该项？"
      content="此操作无法撤销。"
      okText="删除"
      onConfirm={() => { popResult = '已删除'; }}
      onCancel={() => (popResult = '已取消')}
    >
      {#snippet trigger()}
        <Button type="danger">删除</Button>
      {/snippet}
    </Popconfirm>

    <Popconfirm
      placement="bottom"
      title="确定提交？"
      onConfirm={() => { popResult = '已提交'; }}
    >
      {#snippet trigger()}
        <Button type="primary">提交</Button>
      {/snippet}
    </Popconfirm>

    <Popconfirm
      type="warning"
      placement="right"
      title="退出登录？"
      content="退出后需重新登录。"
      onConfirm={() => { popResult = '已退出'; }}
    >
      {#snippet trigger()}
        <Button>退出</Button>
      {/snippet}
    </Popconfirm>

    <Popconfirm
      triggerType="hover"
      title="悬停触发"
      content="移开指针延迟关闭。"
      onConfirm={() => { popResult = '悬停已确认'; }}
    >
      {#snippet trigger()}
        <Button>悬停（hover）</Button>
      {/snippet}
    </Popconfirm>

    <Popconfirm
      type="danger"
      title="异步删除该项？"
      content="确认后等待 1s 模拟请求。"
      okText="删除"
      onConfirm={() =>
        new Promise((resolve) => setTimeout(() => {
          popResult = '异步删除完成';
          resolve(undefined);
        }, 1000))}
    >
      {#snippet trigger()}
        <Button type="danger">异步删除</Button>
      {/snippet}
    </Popconfirm>
  </div>
  <div bind:this={popContainerEl} style="position:relative"></div>
  <div style="padding:12px 0">
    <Popconfirm
      title="挂载到自定义容器"
      content="浮层 portal 到下方容器而非 body。"
      getPopupContainer={() => popContainerEl}
      onConfirm={() => { popResult = '容器确认'; }}
    >
      {#snippet trigger()}
        <Button>getPopupContainer</Button>
      {/snippet}
    </Popconfirm>
  </div>
  <Text type="tertiary">操作结果：{popResult}</Text>

  <Divider />

  <Title heading={5}>Toast（轻提示 · 命令式）</Title>
  <div style="display:flex; gap:12px; flex-wrap:wrap">
    <Button onclick={() => Toast.info('这是一条信息提示')}>info</Button>
    <Button type="primary" onclick={() => Toast.success('已保存草稿')}>success</Button>
    <Button type="warning" onclick={() => Toast.warning('存储空间不足')}>warning</Button>
    <Button type="danger" onclick={() => Toast.error('网络异常，请重试')}>error</Button>
    <Button onclick={() => Toast.loading('正在上传…', { duration: 0 })}>loading（常驻）</Button>
    <Button onclick={() => Toast.destroyAll()}>清空全部</Button>
  </div>
  <div style="margin-top:12px"><Text type="tertiary">6 方位（每方位独立纵向堆叠）</Text></div>
  <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:4px">
    <Button onclick={() => Toast.info('左上角', { position: 'topLeft' })}>topLeft</Button>
    <Button onclick={() => Toast.info('顶部居中', { position: 'top' })}>top</Button>
    <Button onclick={() => Toast.info('右上角', { position: 'topRight' })}>topRight</Button>
    <Button onclick={() => Toast.info('左下角', { position: 'bottomLeft' })}>bottomLeft</Button>
    <Button onclick={() => Toast.info('底部居中', { position: 'bottom' })}>bottom</Button>
    <Button onclick={() => Toast.info('右下角', { position: 'bottomRight' })}>bottomRight</Button>
  </div>
  <div style="margin-top:12px"><Text type="tertiary">theme（卡片主题）+ promise</Text></div>
  <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:4px">
    <Button onclick={() => Toast.success('深色卡片', { theme: 'dark', position: 'topRight' })}>theme dark</Button>
    <Button
      type="primary"
      onclick={() =>
        Toast.promise(
          new Promise((resolve) => setTimeout(() => resolve('done'), 1800)),
          { loading: '保存中…', success: '已保存', error: '保存失败' },
          { position: 'bottom' },
        )}>promise（resolve）</Button>
    <Button
      type="danger"
      onclick={() =>
        Toast.promise(
          new Promise((_, reject) => setTimeout(() => reject(new Error('网络中断')), 1800)),
          { loading: '提交中…', success: '已提交', error: (e) => `失败：${(e as Error).message}` },
          { position: 'bottom' },
        ).catch(() => {})}>promise（reject）</Button>
  </div>

  <Divider />

  <Title heading={5}>Notification（通知提醒框 · 命令式）</Title>
  <div style="display:flex; gap:12px; flex-wrap:wrap">
    <Button type="primary" onclick={() => notification.success({ title: '上传完成', content: '文件已成功保存到云端。' })}>success（右上）</Button>
    <Button onclick={() => notification.info({ title: '新消息', content: '你有一条新的待办事项。', placement: 'topLeft' })}>info（左上）</Button>
    <Button type="warning" onclick={() => notification.warning({ title: '存储空间不足', content: '剩余空间不足 10%。', placement: 'bottomRight' })}>warning（右下）</Button>
    <Button type="danger" onclick={() => notification.error({ title: '保存失败', content: '网络中断，未保存的更改已暂存本地。', duration: 0 })}>error（常驻）</Button>
    <Button onclick={() => notification.destroyAll()}>清空全部</Button>
  </div>
  <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:12px">
    <Button onclick={() => notification.info({ title: '同步中', content: '将在倒计时结束后自动关闭，悬停暂停。', showProgress: true, duration: 6 })}>showProgress（进度条）</Button>
    <Button onclick={() => notification.open({ title: '深色通知', content: 'theme=dark 深色卡片。', theme: 'dark', duration: 0 })}>theme dark</Button>
    <Button onclick={() => notification.open({ title: '收到协作邀请', content: 'Alice 邀请你加入「设计系统」项目。', duration: 0, footer: notifFooter })}>footer（操作区）</Button>
  </div>
  <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:12px">
    <Button onclick={() => notification.info({ title: 'مرحبا بك', content: 'هذا إشعار باتجاه من اليمين إلى اليسار.', direction: 'rtl', duration: 0 })}>RTL（右上→镜像左上）</Button>
    <Button onclick={() => notification.success({ title: 'تم الحفظ', content: 'شريط التقدم ينكمش من اليمين.', direction: 'rtl', showProgress: true, duration: 6, placement: 'topLeft' })}>RTL + 进度（左上→镜像右上）</Button>
    <Button onclick={() => notification.open({ title: '按 Esc 关闭', content: '弹出后按 Esc 键关闭最近一条。', duration: 0 })}>Esc 关闭</Button>
  </div>
  {#snippet notifFooter()}
    <Button size="small" type="primary" onclick={() => notification.destroyAll()}>接受</Button>
    <Button size="small" onclick={() => notification.destroyAll()}>忽略</Button>
  {/snippet}

  <Divider />

  <Title heading={5}>LocaleProvider（语言上下文 · renderless）</Title>
  <Button onclick={() => (localeIsZh = !localeIsZh)}>切换语言：{localeIsZh ? '中文' : 'English'}</Button>
  <div style="margin-top:8px">
    <LocaleProvider locale={localeIsZh ? zh_CN : en_US}>
      {#snippet children({ locale, t, formatNumber, direction })}
        <div style="line-height:2">
          <div>生效 locale：<strong>{locale}</strong>（方向 {direction}）</div>
          <div>Modal.okText：<strong>{t('Modal.okText')}</strong> / Modal.cancelText：<strong>{t('Modal.cancelText')}</strong></div>
          <div>Pagination.total：<strong>{t('Pagination.total', { total: 1234 })}</strong></div>
          <div>格式化数字 1234567.89：<strong>{formatNumber(1234567.89)}</strong></div>
        </div>
      {/snippet}
    </LocaleProvider>
  </div>

  <div style="margin-top:16px" data-testid="i18n-consumer-demo">
    <Text type="tertiary">下列组件被同一 LocaleProvider 包裹，其内部文案应随上方语言切换：</Text>
    <LocaleProvider locale={localeIsZh ? zh_CN : en_US}>
      <div style="margin-top:8px; max-width:420px">
        <Empty />
        <div style="margin-top:8px">
          <Pagination total={1234} showTotal currentPage={1} pageSize={10} />
        </div>
        <div style="margin-top:8px" data-testid="taginput-i18n">
          <TagInput value={tagsI18n} onChange={(t) => (tagsI18n = t)} />
        </div>
      </div>
    </LocaleProvider>
  </div>

  <div style="margin-top:16px" data-testid="locale-string-code-demo">
    <Text type="tertiary">字符串码解析（内置 zh_CN/en_US + registerLocale 注册的 fr_FR）：</Text>
    <div style="margin-top:8px; display:flex; gap:8px">
      <Button size="small" onclick={() => (localeCode = 'zh_CN')}>zh_CN</Button>
      <Button size="small" onclick={() => (localeCode = 'en_US')}>en_US</Button>
      <Button size="small" onclick={() => (localeCode = 'fr_FR')}>fr_FR（自定义）</Button>
    </div>
    <LocaleProvider locale={localeCode}>
      {#snippet children({ locale, t })}
        <div style="margin-top:8px; line-height:2">
          <div>locale 码 <strong>"{localeCode}"</strong> → 生效 <strong data-testid="locale-code-out">{locale}</strong></div>
          <div>Modal.okText：<strong data-testid="locale-code-ok">{t('Modal.okText')}</strong></div>
        </div>
      {/snippet}
    </LocaleProvider>
  </div>

  <div style="margin-top:16px" data-testid="locale-inherit-demo">
    <Text type="tertiary">嵌套 inherit 深合并：外层 zh_CN，内层仅覆盖 Modal.okText，其余继承外层。</Text>
    <LocaleProvider locale="zh_CN">
      <LocaleProvider locale={{ Modal: { okText: '好的（覆盖）' } } as unknown as Locale}>
        {#snippet children({ locale, t })}
          <div style="margin-top:8px; line-height:2">
            <div>生效 locale：<strong data-testid="inherit-code">{locale}</strong>（继承外层）</div>
            <div>Modal.okText（覆盖）：<strong data-testid="inherit-ok">{t('Modal.okText')}</strong></div>
            <div>Modal.cancelText（继承）：<strong data-testid="inherit-cancel">{t('Modal.cancelText')}</strong></div>
          </div>
        {/snippet}
      </LocaleProvider>
    </LocaleProvider>
  </div>

  <div style="margin-top:16px" data-testid="locale-tz-currency-demo">
    <Text type="tertiary">timeZone / currency：注入 formatDate / currency 风格 formatNumber。</Text>
    <LocaleProvider locale="zh_CN" timeZone="Asia/Shanghai" currency="CNY">
      {#snippet children({ formatDate, formatNumber })}
        <div style="margin-top:8px; line-height:2">
          <div>UTC 2026-01-01T00:00 在 Asia/Shanghai：<strong data-testid="tz-out">{formatDate(new Date(Date.UTC(2026, 0, 1, 0, 0)), { hour: '2-digit', minute: '2-digit', hour12: false })}</strong></div>
          <div>货币 1234.5（默认 CNY）：<strong data-testid="currency-out">{formatNumber(1234.5, { style: 'currency' })}</strong></div>
        </div>
      {/snippet}
    </LocaleProvider>
  </div>

  <Divider />

  <Title heading={5}>ConfigProvider（全局配置 · 局部暗色作用域）</Title>
  <Text type="tertiary">用 ConfigProvider wrap + theme=dark 在子树内建立独立暗色作用域</Text>
  <ConfigProvider wrap theme="dark">
    <div style="margin-top:8px; padding:24px; border-radius:8px; background:var(--cd-color-bg-0); color:var(--cd-color-text-0)">
      <p style="margin:0 0 12px; line-height:1.8">
        这个区块被 ConfigProvider theme="dark" 包裹，内部所有 <code>var(--cd-color-*)</code> 自动切换为暗色调色板。
      </p>
      <div style="display:flex; gap:12px">
        <Button type="primary">主要按钮</Button>
        <Button>次要按钮</Button>
        <Tag color="success">标签</Tag>
      </div>
    </div>
  </ConfigProvider>

  <Divider />

  <Title heading={5}>ConfigProvider theme=auto（跟随系统）</Title>
  <Text type="tertiary">theme="auto" 跟随系统 prefers-color-scheme 实时切 light/dark，切换系统外观会即时响应</Text>
  <ConfigProvider
    wrap
    theme="auto"
    onThemeChange={(info) => (cpAppliedTheme = info.applied)}
  >
    <div data-testid="cp-auto" style="margin-top:8px; padding:24px; border-radius:8px; background:var(--cd-color-bg-0); color:var(--cd-color-text-0)">
      <p style="margin:0 0 12px; line-height:1.8">
        当前系统解析主题：<strong data-testid="cp-auto-applied">{cpAppliedTheme}</strong>
      </p>
      <div style="display:flex; gap:12px">
        <Button type="primary">主要按钮</Button>
        <Tag color="success">标签</Tag>
      </div>
    </div>
  </ConfigProvider>

  <Divider />

  <Title heading={5}>ConfigProvider reducedMotion（降级动画）</Title>
  <Text type="tertiary">reducedMotion 显式开启时写全局 data-reduced-motion 标记，令依赖 motion-duration token 的动画退化为 0ms</Text>
  <ConfigProvider
    reducedMotion={cpReduced}
    onReducedMotionChange={(info) => (cpReducedApplied = info.reduced)}
  >
    <div data-testid="cp-reduced" style="margin-top:8px; display:flex; align-items:center; gap:8px">
      <Switch value={cpReduced} onChange={(v) => (cpReduced = v)} />
      <Text type="tertiary">
        reducedMotion={String(cpReduced)} · reduced={String(cpReducedApplied)}
      </Text>
    </div>
  </ConfigProvider>

  <Divider />

  <Title heading={5}>ConfigProvider · as 自定义包裹标签</Title>
  <Text type="tertiary">wrap=true 时 as 可把包裹元素改为 section/article/main 等语义标签（display:contents 不打断 a11y 树）</Text>
  <ConfigProvider wrap as="section">
    <div data-testid="cp-as" style="margin-top:8px; padding:16px; border:1px dashed var(--cd-color-border); border-radius:8px">
      <Text type="tertiary">外层包裹元素标签为 <code>&lt;section&gt;</code>（见 DOM）</Text>
    </div>
  </ConfigProvider>

  <Divider />

  <Title heading={5}>ConfigProvider · getValidateMessages 全局校验文案</Title>
  <Text type="tertiary">getValidateMessages 在 locale 内置文案之上按 Form.* 键覆盖校验提示（支持 {'{label}'} 插值），不传字段回退默认</Text>
  <ConfigProvider
    getValidateMessages={() => ({
      'Form.required': '【{label}】这一项必须填写哦',
    })}
  >
    <div data-testid="cp-validate" style="max-width:360px; margin-top:8px">
      <Form onSubmit={(r) => (cpValidateMsg = r.valid ? '校验通过' : '校验未通过（看上方提示）')}>
        <Form.Input field="nickname" label="昵称" required />
        {#snippet footer({ submitting })}
          <Button type="primary" htmlType="submit" loading={submitting}>提交（不填触发）</Button>
        {/snippet}
      </Form>
      <Text type="tertiary">{cpValidateMsg}</Text>
    </div>
  </ConfigProvider>

  <Divider />

  <Title heading={5}>ConfigProvider · getPopupContainer 全局浮层容器</Title>
  <Text type="tertiary">getPopupContainer 经 context 提供全局默认容器；Dropdown 未传自身 prop 时浮层 portal 到此容器（而非 body）</Text>
  <div
    bind:this={cpPopupHost}
    data-testid="cp-popup-host"
    style="position:relative; margin-top:8px; padding:16px; border:1px dashed var(--cd-color-border); border-radius:8px"
  >
    <Text type="tertiary">浮层挂载宿主（下方菜单将 portal 进这里）：</Text>
    <div style="margin-top:8px">
      <ConfigProvider getPopupContainer={() => cpPopupHost ?? document.body}>
        <Dropdown
          items={[
            { key: 'a', label: '选项 A' },
            { key: 'b', label: '选项 B' },
          ]}
          trigger="click"
        >
          {#snippet triggerContent()}
            <Button>打开菜单</Button>
          {/snippet}
        </Dropdown>
      </ConfigProvider>
    </div>
  </div>

  <Divider />

  <Title heading={5}>ResizeObserver（尺寸监听 · renderless）</Title>
  <Text type="tertiary">拖拽右下角调整容器大小，slot 实时显示尺寸</Text>
  <div style="margin-top:8px; resize:both; overflow:auto; width:280px; height:120px; min-width:160px; min-height:80px; border:1px dashed var(--cd-color-border); border-radius:8px">
    <ResizeObserver>
      {#snippet children({ width, height })}
        <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--cd-color-text-1)">
          {Math.round(width)} × {Math.round(height)} px
        </div>
      {/snippet}
    </ResizeObserver>
  </div>

  <div style="margin-top:16px"><Text type="tertiary">throttle 节流（200ms，leading+trailing）：拖拽时回调计数受控，对比下方即时</Text></div>
  <div style="display:flex; gap:16px; margin-top:8px">
    <div style="resize:both; overflow:auto; width:240px; height:110px; min-width:140px; min-height:70px; border:1px dashed var(--cd-color-border); border-radius:8px">
      <ResizeObserver throttle={200} onResize={() => (roThrottleCount += 1)}>
        {#snippet children({ width, height })}
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:4px; color:var(--cd-color-text-1)">
            <span>{Math.round(width)} × {Math.round(height)}</span>
            <span data-testid="ro-throttle-count">throttle 回调：{roThrottleCount}</span>
          </div>
        {/snippet}
      </ResizeObserver>
    </div>
    <div style="resize:both; overflow:auto; width:240px; height:110px; min-width:140px; min-height:70px; border:1px dashed var(--cd-color-border); border-radius:8px">
      <ResizeObserver onResize={() => (roInstantCount += 1)}>
        {#snippet children({ width, height })}
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:4px; color:var(--cd-color-text-1)">
            <span>{Math.round(width)} × {Math.round(height)}</span>
            <span data-testid="ro-instant-count">即时 回调：{roInstantCount}</span>
          </div>
        {/snippet}
      </ResizeObserver>
    </div>
  </div>

  <div style="margin-top:16px"><Text type="tertiary">multiple 多目标 + debounce（150ms trailing）：观测两个子元素，停止拖拽后才更新</Text></div>
  <div style="margin-top:8px; border:1px dashed var(--cd-color-border); border-radius:8px; padding:8px">
    <ResizeObserver multiple debounce={150} onResize={(e) => { roMultiLast = `${Math.round(e.width)}×${Math.round(e.height)}`; roMultiCount += 1; }}>
      <div style="resize:horizontal; overflow:auto; width:160px; height:40px; min-width:80px; background:var(--cd-color-fill-0); border-radius:6px; margin-bottom:8px; display:flex; align-items:center; padding-left:8px; color:var(--cd-color-text-1)">子元素 A（横向可拖）</div>
      <div style="resize:horizontal; overflow:auto; width:200px; height:40px; min-width:80px; background:var(--cd-color-fill-0); border-radius:6px; display:flex; align-items:center; padding-left:8px; color:var(--cd-color-text-1)">子元素 B（横向可拖）</div>
    </ResizeObserver>
    <div style="margin-top:8px"><Text type="tertiary"><span data-testid="ro-multi">最后变化：{roMultiLast}（debounced 回调 {roMultiCount} 次）</span></Text></div>
  </div>

  <div style="margin-top:16px"><Text type="tertiary">device-pixel-content-box（物理像素，含 DPR）+ tag 自定义包裹标签（section）</Text></div>
  <div style="margin-top:8px; resize:both; overflow:auto; width:240px; height:90px; min-width:140px; min-height:60px; border:1px dashed var(--cd-color-border); border-radius:8px">
    <ResizeObserver tag="section" box="device-pixel-content-box" onResize={(e) => (roDprLast = `${Math.round(e.width)}×${Math.round(e.height)} 物理px (box=${e.box})`)}>
      {#snippet children({ width, height })}
        <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--cd-color-text-1)">
          <span data-testid="ro-dpr">{Math.round(width)} × {Math.round(height)} 物理px</span>
        </div>
      {/snippet}
    </ResizeObserver>
  </div>
  <div style="margin-top:8px"><Text type="tertiary"><span data-testid="ro-dpr-last">{roDprLast}</span></Text></div>

  <div style="margin-top:16px"><Text type="tertiary">use:resize action 动态参数重建：切换 box 即 disconnect 旧 observer 重建</Text></div>
  <div style="display:flex; gap:12px; align-items:center; margin-top:8px">
    <Button size="small" onclick={() => (roActionBox = roActionBox === 'content-box' ? 'device-pixel-content-box' : 'content-box')}>切换 box（当前 {roActionBox}）</Button>
  </div>
  <div
    use:resize={{ box: roActionBox, onResize: (e) => { roActionLast = `${Math.round(e.width)}×${Math.round(e.height)}`; roActionBoxSeen = e.box; } }}
    style="margin-top:8px; resize:both; overflow:auto; width:220px; height:80px; min-width:120px; min-height:50px; border:1px dashed var(--cd-color-border); border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--cd-color-text-1)"
  >
    <span data-testid="ro-action">{roActionLast} · box={roActionBoxSeen}</span>
  </div>

  <div style="margin-top:16px"><Text type="tertiary">fallbackToWindow 降级：显式开启后改用 window.resize 近似重测（缩放浏览器窗口触发）</Text></div>
  <div style="margin-top:8px; width:100%; max-width:360px; height:64px; border:1px dashed var(--cd-color-border); border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--cd-color-text-1)">
    <ResizeObserver fallbackToWindow onResize={(e) => { roFbLast = `${Math.round(e.width)}×${Math.round(e.height)}`; roFbCount += 1; }}>
      {#snippet children()}
        <span data-testid="ro-fallback">window 降级测得：{roFbLast}（{roFbCount} 次）</span>
      {/snippet}
    </ResizeObserver>
  </div>

  <div style="margin-top:16px"><Text type="tertiary">onResizeStart / onResizeEnd：拖拽开始即 start，静默约 150ms 后 end</Text></div>
  <div style="margin-top:8px; resize:both; overflow:auto; width:240px; height:90px; min-width:140px; min-height:60px; border:1px dashed var(--cd-color-border); border-radius:8px">
    <ResizeObserver
      onResizeStart={() => { roSeStatus = '调整中…'; roSeStart += 1; }}
      onResizeEnd={(e) => { roSeStatus = '已完成'; roSeEnd += 1; roSeLast = `${Math.round(e.width)}×${Math.round(e.height)}`; }}
    >
      {#snippet children({ width, height })}
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:4px; color:var(--cd-color-text-1)">
          <span>{Math.round(width)} × {Math.round(height)}</span>
          <span data-testid="ro-startend">状态：{roSeStatus}（start {roSeStart} / end {roSeEnd}，末值 {roSeLast}）</span>
        </div>
      {/snippet}
    </ResizeObserver>
  </div>

  <Divider />

  <Title heading={5}>LottieIcon（动画图标 · 依赖注入 player）</Title>
  <Text type="tertiary">库不绑定 lottie-web，用户注入 player 工厂；此处用 mock player 演示</Text>
  <div style="display:flex; gap:32px; align-items:center; margin-top:8px">
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
      <LottieIcon data={{}} player={mockPlayer} size="large" decorative={false} label="自动播放" />
      <Text type="tertiary">auto（自动播放）</Text>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
      <LottieIcon data={{}} player={mockPlayer} size="large" trigger="hover" decorative={false} label="悬停播放" />
      <Text type="tertiary">hover（悬停播放）</Text>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
      <LottieIcon data={{}} player={mockPlayer} size="large" reducedMotion decorative={false} label="降级静止" />
      <Text type="tertiary">reducedMotion（静止）</Text>
    </div>
  </div>
  <div style="display:flex; gap:32px; align-items:center; margin-top:16px">
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
      <LottieIcon src={lottieDemoUrl} player={mockPlayer} size="large" decorative={false} label="远程加载" />
      <Text type="tertiary">src（URL 异步 fetch）</Text>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
      <LottieIcon data={{}} player={mockPlayer} size="large" segments={[10, 60]} decorative={false} label="帧段播放" />
      <Text type="tertiary">segments（[10,60] 帧段）</Text>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
      <LottieIcon data={{}} player={mockPlayer} size="large" flipRtl decorative={false} label="RTL 镜像" />
      <Text type="tertiary">flipRtl（水平镜像）</Text>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
      <LottieIcon src="https://invalid.invalid/nope.json" player={mockPlayer} size="large" decorative={false} label="加载失败" />
      <Text type="tertiary">src 失败（error 态）</Text>
    </div>
  </div>
  <div style="display:flex; gap:32px; align-items:center; margin-top:16px">
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
      <LottieIcon data={{}} player={mockPlayer} size="large" canvas decorative={false} label="canvas 渲染" />
      <Text type="tertiary">canvas（renderer=canvas）</Text>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
      <LottieIcon data={{}} player={mockPlayer} size="large" renderer="html" decorative={false} label="html 渲染" />
      <Text type="tertiary">renderer="html"</Text>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:8px">
      <div id="lottie-visible-demo" style="display:flex; gap:8px; align-items:center">
        <LottieIcon data={{}} player={mockPlayer} size="large" visible={lottieVisible} decorative={false} label="受控显隐" />
        <Button size="small" onclick={() => (lottieVisible = !lottieVisible)}>
          {lottieVisible ? '隐藏' : '显示'}
        </Button>
      </div>
      <Text type="tertiary">visible（受控显隐 + 暂停）</Text>
    </div>
  </div>

  <Title heading={5}>TimePicker · 12 小时制 + 禁用项</Title>
  <Space direction="vertical" align="start">
    <Space>
      <TimePicker use12Hours value={timeVal12} onChange={(t) => (timeVal12 = Array.isArray(t) ? t[0] : t)} />
      <Text type="tertiary">
        12h（AM/PM）：{timeVal12 ? timeVal12.toLocaleTimeString('en-US') : '（未选）'}
      </Text>
    </Space>
    <Space>
      <TimePicker
        value={timeValDisabled}
        onChange={(t) => (timeValDisabled = Array.isArray(t) ? t[0] : t)}
        disabledHours={() => [0, 1, 2, 3, 4, 5, 6]}
        disabledMinutes={(h) => (h === 9 ? [0, 15, 30] : [])}
      />
      <Text type="tertiary">
        禁用 0-6 时、9 时的 0/15/30 分（置灰）：{timeValDisabled
          ? timeValDisabled.toLocaleTimeString('zh-CN')
          : '（未选）'}
      </Text>
    </Space>
    <Space>
      <TimePicker
        defaultValue={null}
        hideDisabledOptions
        disabledHours={() => [0, 1, 2, 3, 4, 5, 6]}
      />
      <Text type="tertiary">hideDisabledOptions：禁用的 0-6 时直接从列中隐藏</Text>
    </Space>
  </Space>

  <Title heading={5}>TimePicker · 范围选择 + format 字符串 + 字符串入参</Title>
  <Space direction="vertical" align="start">
    <Space>
      <div data-testid="timepicker-range">
        <TimePicker
          type="timeRange"
          value={timeRangeVal}
          onChange={(v) => (timeRangeVal = Array.isArray(v) ? v : [v, null])}
        />
      </div>
      <Text type="tertiary">
        timeRange：起 {timeRangeVal[0] ? timeRangeVal[0].toLocaleTimeString('zh-CN') : '--'} / 止
        {timeRangeVal[1] ? timeRangeVal[1].toLocaleTimeString('zh-CN') : '--'}
      </Text>
    </Space>
    <Space>
      <div data-testid="timepicker-format">
        <TimePicker
          format="hh:mm A"
          value={timeFormatVal}
          onChange={(t) => (timeFormatVal = Array.isArray(t) ? t[0] : t)}
        />
      </div>
      <Text type="tertiary">format="hh:mm A"：仅时分 + 12h（不显示秒列）</Text>
    </Space>
    <Space>
      <div data-testid="timepicker-string">
        <TimePicker defaultValue="12:30:45" format="HH:mm:ss" />
      </div>
      <Text type="tertiary">字符串入参 defaultValue="12:30:45"（经 core parseTimeString 解析）</Text>
    </Space>
  </Space>

  <Divider />

  <Title heading={5}>Upload：concurrency 并发限制 + 异步 beforeUpload</Title>
  <Space direction="vertical" align="start">
    <Text type="tertiary">
      concurrency=2（模拟上传，同时进行不超过 2 个，完成一个补一个）；beforeUpload 异步拒绝大于 100KB 的文件。
    </Text>
    <div data-testid="upload-concurrency">
      <Upload
        multiple
        concurrency={2}
        beforeUpload={uploadBefore}
        customRequest={mockUpload}
        value={uploadConcVal}
        onChange={(list) => (uploadConcVal = list)}
      />
    </div>
    <Text type="tertiary">
      当前进行中：<strong data-testid="upload-conc-active">{uploadConcActive}</strong> · 峰值并发：<strong
        data-testid="upload-conc-peak">{uploadConcPeak}</strong>
    </Text>
  </Space>

  <Divider />

  <Title heading={5}>Upload：directory 目录上传 + minSize 最小文件校验</Title>
  <Space direction="vertical" align="start">
    <Text type="tertiary">
      directory：选择整个目录（递归选其下所有文件，保留相对路径）；minSize=10KB / maxSize=2048KB：过小或过大的文件标记 error 并提示。
    </Text>
    <div data-testid="upload-directory">
      <Upload
        directory
        minSize={10}
        maxSize={2048}
        value={uploadDirVal}
        onChange={(list) => (uploadDirVal = list)}
      />
    </div>
  </Space>

  <Divider />

  <Title heading={5}>BackTop：自定义 target 滚动容器 + 受控 visible + announceOnArrive</Title>
  <Space direction="vertical" align="start">
    <Text type="tertiary">
      下方滚动盒为自定义滚动容器：BackTop 监听该容器（而非 window）的滚动，回顶也滚该容器；右侧按钮受控显隐；回到顶部经 ARIA live 播报。
    </Text>
    <Switch
      value={backtopControlled}
      onChange={(v) => (backtopControlled = v)}
      checkedChildren="受控显示"
      uncheckedChildren="阈值自动"
    />
    <div
      bind:this={backtopBox}
      data-testid="backtop-scrollbox"
      style="position:relative;inline-size:320px;block-size:200px;overflow:auto;border:1px solid var(--cd-color-border);border-radius:6px;padding:12px"
    >
      <div style="block-size:1200px">
        <Text>容器顶部（向下滚动 ≥ 120px 触发按钮）</Text>
      </div>
      {#if backtopControlled}
        <BackTop
          target={() => backtopBox}
          visible={true}
          visibilityHeight={120}
          announceOnArrive
          bottom={16}
          right={16}
          size="small"
        />
      {:else}
        <BackTop
          target={() => backtopBox}
          visibilityHeight={120}
          announceOnArrive
          bottom={16}
          right={16}
          size="small"
        />
      {/if}
    </div>
  </Space>
</main>

<BackTop visibilityHeight={300} />

{#snippet slideA()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-primary);color:#fff;font-size:20px">幻灯片 1</div>
{/snippet}
{#snippet slideB()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-success);color:#fff;font-size:20px">幻灯片 2</div>
{/snippet}
{#snippet slideC()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-warning);color:#fff;font-size:20px">幻灯片 3</div>
{/snippet}
{#snippet slideD()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-danger);color:#fff;font-size:20px">幻灯片 4</div>
{/snippet}
{#snippet slideE()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-tertiary);color:#fff;font-size:20px">幻灯片 5</div>
{/snippet}

<style>
  @keyframes -global-cd-demo-spin {
    to {
      transform: rotate(360deg);
    }
  }
  .demo-cell {
    background: var(--cd-color-primary);
    color: var(--cd-color-text-inverse);
    text-align: center;
    padding: var(--cd-spacing-2);
    border-radius: var(--cd-radius-1);
    font-size: var(--cd-font-size-1);
  }
  .demo-layout {
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-radius-2);
    overflow: hidden;
    height: 220px;
  }
  .demo-sider-body {
    padding: var(--cd-spacing-3);
    color: var(--cd-color-text-1);
  }
  .demo-bar {
    display: flex;
    align-items: center;
    gap: var(--cd-spacing-3);
    padding-inline: var(--cd-spacing-3);
    height: 100%;
  }
</style>
