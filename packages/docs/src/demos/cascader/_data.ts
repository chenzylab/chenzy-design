// Cascader 各 demo 共享的省市区 treeData（对齐 Semi 官方示例数据）。
export interface TreeNode {
  label: string;
  value: string | number;
  disabled?: boolean;
  isLeaf?: boolean;
  children?: TreeNode[];
}

export const treeData: TreeNode[] = [
  {
    label: '浙江省',
    value: 'zhejiang',
    children: [
      {
        label: '杭州市',
        value: 'hangzhou',
        children: [
          { label: '西湖区', value: 'xihu' },
          { label: '萧山区', value: 'xiaoshan' },
          { label: '临安区', value: 'linan' },
        ],
      },
      {
        label: '宁波市',
        value: 'ningbo',
        children: [
          { label: '海曙区', value: 'haishu' },
          { label: '江北区', value: 'jiangbei' },
        ],
      },
    ],
  },
];
