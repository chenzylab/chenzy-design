<script lang="ts">
  import { SideBarMCPConfigure, Button } from '@chenzy-design/svelte';
  import type { SideBarMCPOption } from '@chenzy-design/svelte';
  import { IconFolder, IconFigma } from '@chenzy-design/icons';

  let visible = $state(false);

  // 受控列表：onStatusChange 上抛下一份数组，父组件回写驱动重渲染（不回写子组件 prop）。
  // icon 支持字符串图片 URL 或 Snippet 自定义渲染（对齐 Semi options 每项均带 icon）。
  let options = $state<SideBarMCPOption[]>([
    {
      value: 'fs',
      label: '文件系统',
      desc: '读写本地文件与目录',
      active: true,
      configure: true,
      icon: fsIcon,
    },
    {
      value: 'figma',
      label: 'Figma',
      desc: 'Figma MCP Server，将设计数据暴露给 AI，实现从设计稿到代码的智能生成',
      active: true,
      configure: true,
      icon: figmaIcon,
    },
    { value: 'preset', label: '预设知识库', desc: '内置只读工具，不可关闭', active: true, disabled: true },
  ]);

  let customOptions = $state<SideBarMCPOption[]>([
    { value: 'my-db', label: '我的数据库', desc: 'Postgres 只读连接', active: false },
  ]);

  function handleStatusChange(next: SideBarMCPOption[], custom: boolean) {
    if (custom) customOptions = next;
    else options = next;
  }
</script>

<Button onclick={() => (visible = true)}>打开 MCP 配置</Button>

<SideBarMCPConfigure
  {visible}
  {options}
  {customOptions}
  onCancel={() => (visible = false)}
  onStatusChange={handleStatusChange}
  onAddClick={() => console.log('add custom tool')}
  onConfigureClick={(_e, o) => console.log('configure:', o.label)}
  onEditClick={(_e, o) => console.log('edit:', o.label)}
/>

{#snippet fsIcon()}
  <IconFolder />
{/snippet}

{#snippet figmaIcon()}
  <IconFigma />
{/snippet}
