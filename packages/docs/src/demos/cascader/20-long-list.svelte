<script lang="ts">
  import { Cascader } from '@chenzy-design/svelte';
  import type { TreeNode } from './_data';

  const treeData: TreeNode[] = [
    {
      label: 'A',
      value: 'A',
      children: [
        {
          label: 'B',
          value: 'B',
          children: [
            {
              label: 'C',
              value: 'C',
              children: [
                {
                  label: 'D',
                  value: 'D',
                  children: [
                    {
                      label: 'E',
                      value: 'E',
                      children: [{ label: 'F', value: 'F' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
</script>

<Cascader
  dropdownClassName="components-cascader-demo"
  style="width: 300px"
  {treeData}
  placeholder="请选择所在地区"
/>

<style>
  /* 照搬 Semi demo 的 .components-cascader-demo（demo 级覆盖，非组件缺陷）：
     数据结构层级特别深时下拉菜单会超出屏幕，建议给下拉面板设 max-width + overflow-x:auto，
     宽度以 N+0.5 列为准（最右侧显示半列），给用户"可横向滚动"的视觉暗示。
     面板 portal 到 body，故必须 :global 打洞；本库类名是 cd-cascader-option-lists（非 Semi 的 semi- 前缀）。 */
  :global(.components-cascader-demo .cd-cascader-option-lists) {
    max-width: 510px;
    overflow-x: auto;
  }
</style>
