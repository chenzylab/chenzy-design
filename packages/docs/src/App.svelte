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
    Popconfirm,
    Toast,
    notification,
    BackTop,
    LocaleProvider,
    zh_CN,
    en_US,
    ConfigProvider,
    ResizeObserver,
    LottieIcon,
  } from '@chenzy-design/svelte';
  import type { LottiePlayerFactory } from '@chenzy-design/svelte';

  // 演示用 mock player（真实场景注入 lottie-web 的 loadAnimation 包装）。
  // 这里用一个 CSS 旋转的方块模拟动画播放/暂停。
  const mockPlayer: LottiePlayerFactory = ({ container, autoplay }) => {
    const el = document.createElement('div');
    el.style.cssText =
      'width:100%;height:100%;border-radius:3px;background:var(--cd-color-primary);' +
      'animation:cd-demo-spin 1s linear infinite;animation-play-state:paused';
    container.appendChild(el);
    const setState = (s: string) => (el.style.animationPlayState = s);
    if (autoplay) setState('running');
    return {
      play: () => setState('running'),
      pause: () => setState('paused'),
      stop: () => {
        setState('paused');
        el.style.transform = 'rotate(0deg)';
      },
      goToFrame: () => setState('paused'),
      destroy: () => el.remove(),
    };
  };

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
  let calSelectedText = $state('（未选）');

  const hourData = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
    disabled: i === 3 || i === 4,
  }));
  let pickedHour = $state<string | number>(9);

  const overflowTags = ['设计', '研发', '测试', '产品', '运营', '市场', '财务', '法务'];
  let overflowWidth = $state(400);
  let overflowHidden = $state(0);

  let spinWrap = $state(true);

  let progressPct = $state(45);

  let skeletonLoading = $state(true);

  let bannerOpen = $state(true);

  let modalOpen = $state(false);
  let dangerModalOpen = $state(false);

  let drawerRight = $state(false);
  let drawerLeft = $state(false);
  let drawerBottom = $state(false);

  let popResult = $state('（无）');

  let localeIsZh = $state(true);

  let submitted = $state('');
  let warnSubmitted = $state('');
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
  let tags = $state<string[]>(['svelte', 'vite']);
  let color = $state('#3366ff');
  let dateVal = $state<Date | null>(null);
  let dateTimeVal = $state<Date | null>(null);
  let dateRangeVal = $state<[Date | null, Date | null] | null>(null);
let monthVal = $state<Date | null>(null);
let yearVal = $state<Date | null>(null);
let disabledTimeVal = $state<Date | null>(null);
let presetVal = $state<Date | null>(null);
  let timeVal = $state<Date | null>(null);
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
let page2 = $state(1);
let pageSize2 = $state(10);
  let step = $state(1);
  let activeTab = $state<string | number>('a');
  let lastDropdown = $state('');
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
  const dropdownItems = [
    { key: 'edit', label: '编辑' },
    { key: 'copy', label: '复制' },
    { key: 'delete', label: '删除', danger: true },
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
  const transferData = [
    { key: 'a', label: '北京' },
    { key: 'b', label: '上海' },
    { key: 'c', label: '广州' },
    { key: 'd', label: '深圳' },
  ];
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

  // 虚拟化大数据：1000+ 选项，下拉只渲染视口内 ~15 个。
  const bigOptions = Array.from({ length: 2000 }, (_, i) => ({
    label: `选项 ${i + 1}`,
    value: i + 1,
  }));
  let bigVal = $state<string | number>('');

  let collapsed = $state(false);
  let inputVal = $state('');
  let switchOn = $state(true);
  let checks = $state<(string | number)[]>(['a']);
  let radioVal = $state<string | number | boolean>('1');
  let numVal = $state<number | null>(3);
  let amountVal = $state<number | null>(12000);
  let rateVal = $state(2.5);
  let sliderVal = $state(40);
  let rangeVal = $state<[number, number]>([20, 60]);

  let theme = $state<'light' | 'dark'>('light');
  $effect(() => {
    document.documentElement.dataset.theme = theme;
  });
</script>

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

  <Divider>分割线带文字</Divider>

  <Title heading={5}>Typography</Title>
  <Paragraph>
    这是一段正文 <Text type="secondary">次要文字</Text>、
    <Text mark>高亮</Text>、<Text code>code</Text>、
    <Text delete>删除线</Text>、<Text strong>加粗</Text>，以及
    <Link href="https://semi.design" target="_blank">一个链接</Link>。
  </Paragraph>

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
      <TimePicker value={timeVal} onChange={(t) => (timeVal = t)} />
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
  </Space>

  <Divider />

  <Title heading={5}>Empty / Descriptions / Collapse / Timeline</Title>
  <Space direction="vertical" align="start">
    <Empty image="noResult" description="换个关键词试试" />

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

    <Timeline
      dataSource={[
        { content: '创建订单', time: '09:00' },
        { content: '已发货', time: '12:30', color: 'var(--cd-color-success)' },
        { content: '运输中', time: '15:00' },
      ]}
      pending="等待签收"
    />
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

    <Highlight
      sourceString="chenzy-design 是一套对标 Semi 的 Svelte 组件库"
      searchWords={['design', 'Svelte']}
    />
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

  <Title heading={5}>ScrollList（滚轮选择）</Title>
  <Text type="tertiary">滚动 / 点击 / 方向键选择小时（03、04 禁用）</Text>
  <div style="width: 80px">
    <ScrollList
      data={hourData}
      defaultValue={9}
      ariaLabel="小时"
      onChange={(info) => (pickedHour = info.value)}
    />
  </div>
  <Text type="tertiary">选中小时：{pickedHour}</Text>

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
        onOpenChange={(info) => (bannerOpen = info.open)}
        title="可关闭横幅"
        description="点击右侧关闭按钮收起，受控 open 状态。"
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

  <Divider />

  <Title heading={5}>Drawer（抽屉 / SideSheet）</Title>
  <div style="display:flex; gap:12px">
    <Button type="primary" onclick={() => (drawerRight = true)}>右侧抽屉</Button>
    <Button onclick={() => (drawerLeft = true)}>左侧抽屉</Button>
    <Button onclick={() => (drawerBottom = true)}>底部抽屉</Button>
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
    open={drawerBottom}
    placement="bottom"
    title="筛选条件"
    onOpenChange={(o) => (drawerBottom = o)}
  >
    <p style="margin:0; line-height:1.8">底部抽屉从下方滑入，适合筛选面板等场景。</p>
  </Drawer>

  <Divider />

  <Title heading={5}>Popconfirm（气泡确认）</Title>
  <div style="display:flex; gap:24px; padding:40px 0">
    <Popconfirm
      type="danger"
      title="确定删除该项？"
      content="此操作无法撤销。"
      okText="删除"
      onConfirm={() => (popResult = '已删除')}
      onCancel={() => (popResult = '已取消')}
    >
      {#snippet trigger()}
        <Button type="danger">删除</Button>
      {/snippet}
    </Popconfirm>

    <Popconfirm
      placement="bottom"
      title="确定提交？"
      onConfirm={() => (popResult = '已提交')}
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
      onConfirm={() => (popResult = '已退出')}
    >
      {#snippet trigger()}
        <Button>退出</Button>
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

  <Divider />

  <Title heading={5}>Notification（通知提醒框 · 命令式）</Title>
  <div style="display:flex; gap:12px; flex-wrap:wrap">
    <Button type="primary" onclick={() => notification.success({ title: '上传完成', content: '文件已成功保存到云端。' })}>success（右上）</Button>
    <Button onclick={() => notification.info({ title: '新消息', content: '你有一条新的待办事项。', placement: 'topLeft' })}>info（左上）</Button>
    <Button type="warning" onclick={() => notification.warning({ title: '存储空间不足', content: '剩余空间不足 10%。', placement: 'bottomRight' })}>warning（右下）</Button>
    <Button type="danger" onclick={() => notification.error({ title: '保存失败', content: '网络中断，未保存的更改已暂存本地。', duration: 0 })}>error（常驻）</Button>
    <Button onclick={() => notification.destroyAll()}>清空全部</Button>
  </div>

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
      </div>
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
