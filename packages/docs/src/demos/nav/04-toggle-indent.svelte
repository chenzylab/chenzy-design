<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';

  // toggleIconPosition='left'：展开箭头置于文案前；limitIndent=false：多级逐级缩进。
  const items = [
    { itemKey: 'user', text: '用户管理' },
    {
      itemKey: 'job',
      text: '任务平台',
      items: [
        { itemKey: 'job-list', text: '任务管理' },
        {
          itemKey: 'mission1',
          text: '任务拆解',
          items: [
            { itemKey: 'sub1', text: '子任务一' },
            { itemKey: 'sub2', text: '子任务二' },
          ],
        },
      ],
    },
  ];
</script>

<div style="width: 240px; height: 300px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav
    mode="vertical"
    toggleIconPosition="left"
    limitIndent={false}
    defaultOpenKeys={['job', 'mission1']}
    defaultSelectedKeys={['sub1']}
    {items}
    style="height: 100%;"
  />
</div>
