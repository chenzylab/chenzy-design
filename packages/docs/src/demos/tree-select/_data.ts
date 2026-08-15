// TreeSelect 各 demo 共享的地区 treeData（对齐 Semi 官方示例数据）。
export interface TreeNode {
  label: string;
  value?: string | number;
  key: string | number;
  disabled?: boolean;
  isLeaf?: boolean;
  children?: TreeNode[];
}

// 单选场景：中文 label 地区树。
// 注意：本库 TreeSelect 以节点 key 为选中标识（value/defaultValue 传的是 key），
// 故让 key 与 value 同为地名，defaultValue 直接写地名即可命中节点。
export const treeData: TreeNode[] = [
  {
    label: '亚洲',
    value: 'Asia',
    key: 'Asia',
    children: [
      {
        label: '中国',
        value: 'China',
        key: 'China',
        children: [
          { label: '北京', value: 'Beijing', key: 'Beijing' },
          { label: '上海', value: 'Shanghai', key: 'Shanghai' },
        ],
      },
    ],
  },
  {
    label: '北美洲',
    value: 'North America',
    key: 'North America',
  },
];

// 严格禁用 / 开启搜索的展开受控场景：亚洲下多一个"日本"叶子节点（对齐 Semi 这两处 demo 共用的数据结构）。
export const treeDataWithJapan: TreeNode[] = [
  {
    label: '亚洲',
    value: 'Asia',
    key: 'Asia',
    children: [
      {
        label: '中国',
        value: 'China',
        key: 'China',
        children: [
          { label: '北京', value: 'Beijing', key: 'Beijing' },
          { label: '上海', value: 'Shanghai', key: 'Shanghai' },
        ],
      },
      { label: '日本', value: 'Japan', key: 'Japan' },
    ],
  },
  {
    label: '北美洲',
    value: 'North America',
    key: 'North America',
  },
];

// Trigger 内多行换行场景：中国下多两个叶子（Shenzhen/Guangzhou），演示 defaultValue 4 项换行
// （对齐 Semi 该 demo 特意加的城市节点，用于展示 triggerTagWrap 的换行效果）。
export const treeDataEnWithCities: TreeNode[] = [
  {
    label: 'Asia',
    value: 'Asia',
    key: 'Asia',
    children: [
      {
        label: 'China',
        value: 'China',
        key: 'China',
        children: [
          { label: 'Beijing', value: 'Beijing', key: 'Beijing' },
          { label: 'Shanghai', value: 'Shanghai', key: 'Shanghai' },
          { label: 'Shenzhen', value: 'Shenzhen', key: 'Shenzhen' },
          { label: 'Guangzhou', value: 'Guangzhou', key: 'Guangzhou' },
        ],
      },
      {
        label: 'Japan',
        value: 'Japan',
        key: 'Japan',
        children: [{ label: 'Osaka', value: 'Osaka', key: 'Osaka' }],
      },
    ],
  },
  {
    label: 'North America',
    value: 'North America',
    key: 'North America',
    children: [
      { label: 'United States', value: 'United States', key: 'United States' },
      { label: 'Canada', value: 'Canada', key: 'Canada' },
    ],
  },
];

// 自定义渲染已选项场景：四大洲（中文），对齐 Semi 该 demo 的数据结构。
export const treeDataFourContinents: TreeNode[] = [
  {
    label: '亚洲',
    value: 'Asia',
    key: 'Asia',
    children: [
      {
        label: '中国',
        value: 'China',
        key: 'China',
        children: [
          { label: '北京', value: 'Beijing', key: 'Beijing' },
          { label: '上海', value: 'Shanghai', key: 'Shanghai' },
        ],
      },
    ],
  },
  { label: '北美洲', value: 'North America', key: 'North America' },
  { label: '南美洲', value: 'South America', key: 'South America' },
  { label: '南极洲', value: 'Antarctica', key: 'Antarctica' },
];

// 多选场景：更完整的英文 label 地区树（对齐 Semi 多选/限制标签展示数量两处 demo，China 下含 Chengdu）。
export const treeDataEn: TreeNode[] = [
  {
    label: 'Asia',
    value: 'Asia',
    key: 'Asia',
    children: [
      {
        label: 'China',
        value: 'China',
        key: 'China',
        children: [
          { label: 'Beijing', value: 'Beijing', key: 'Beijing' },
          { label: 'Shanghai', value: 'Shanghai', key: 'Shanghai' },
          { label: 'Chengdu', value: 'Chengdu', key: 'Chengdu' },
        ],
      },
      {
        label: 'Japan',
        value: 'Japan',
        key: 'Japan',
        children: [{ label: 'Osaka', value: 'Osaka', key: 'Osaka' }],
      },
    ],
  },
  {
    label: 'North America',
    value: 'North America',
    key: 'North America',
    children: [
      { label: 'United States', value: 'United States', key: 'United States' },
      { label: 'Canada', value: 'Canada', key: 'Canada' },
    ],
  },
];

// 可搜索的 / 搜索框位置两处 demo 专用（对齐 Semi 这两处 demo 各自的 treeData，China 下无 Chengdu，
// 与 treeDataEn 结构相同仅少一个叶子——Semi 不同章节各自内联 treeData 副本，非全站共用一份，
// 这两处恰好都没有 Chengdu，故不能直接复用 treeDataEn）。
export const treeDataEnNoChengdu: TreeNode[] = [
  {
    label: 'Asia',
    value: 'Asia',
    key: 'Asia',
    children: [
      {
        label: 'China',
        value: 'China',
        key: 'China',
        children: [
          { label: 'Beijing', value: 'Beijing', key: 'Beijing' },
          { label: 'Shanghai', value: 'Shanghai', key: 'Shanghai' },
        ],
      },
      {
        label: 'Japan',
        value: 'Japan',
        key: 'Japan',
        children: [{ label: 'Osaka', value: 'Osaka', key: 'Osaka' }],
      },
    ],
  },
  {
    label: 'North America',
    value: 'North America',
    key: 'North America',
    children: [
      { label: 'United States', value: 'United States', key: 'United States' },
      { label: 'Canada', value: 'Canada', key: 'Canada' },
    ],
  },
];
