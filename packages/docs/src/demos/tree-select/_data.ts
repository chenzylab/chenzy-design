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

// 多选场景：更完整的英文 label 地区树。
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
