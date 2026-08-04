// Cascader 各 demo 共享的省市区 treeData（对齐 Semi 官方示例数据）。
import type { CascaderNode } from '@chenzy-design/svelte';

/** 与 CascaderNode 保持同一类型，避免独立维护一份重复定义在组件类型变化时脱节。 */
export type TreeNode = CascaderNode;

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
          { label: '临平区', value: 'linping' },
          { label: '拱墅区', value: 'gongshu' },
          { label: '滨江区', value: 'binjiang' },
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
