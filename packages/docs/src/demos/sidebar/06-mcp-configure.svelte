<script lang="ts">
  // 对齐 Semi「MCP 配置」demo：onAddClick 弹出 Modal + Form 填写新增工具信息，
  // formApi.validate() 校验通过后追加到 customOptions（本库 validate 返回 Promise<boolean>，
  // 比 Semi 的 .then/.catch 更直接）。
  import { SideBarMCPConfigure, Button, Modal, Form } from '@chenzy-design/svelte';
  import type { SideBarMCPOption, FormApi } from '@chenzy-design/svelte';
  import { IconSemiLogo, IconFigma } from '@chenzy-design/icons';

  let visible = $state(false);
  let addModalVisible = $state(false);
  let formApi = $state<FormApi | undefined>(undefined);
  let nextId = 1;

  // 受控列表：onStatusChange 上抛下一份数组，父组件回写驱动重渲染（不回写子组件 prop）。
  // icon 支持字符串图片 URL 或 Snippet 自定义渲染（对齐 Semi options 每项均带 icon）。
  // 数据照搬 Semi md defaultOptions（108-124 行）：Semi 项 configure:true、无 active
  // （默认未激活）；Figma 项同样无 active。
  let options = $state<SideBarMCPOption[]>([
    {
      value: 'Semi mcp',
      label: 'Semi',
      desc: '支持 Semi 的文档、源码搜索，辅助开发',
      configure: true,
      icon: semiIcon,
    },
    {
      value: 'figma',
      label: 'Figma',
      desc: 'Figma MCP Server 连接Figma与AI开发工具的功能。它通过标准化的模型上下文协MCP），将组件、变量等设计数据和上下文暴露给AI，从而实现从设计稿到代码的智能生成，显著提升开发效率。',
      icon: figmaIcon,
    },
  ]);

  let customOptions = $state<SideBarMCPOption[]>([]);

  function handleStatusChange(next: SideBarMCPOption[], custom: boolean) {
    if (custom) customOptions = next;
    else options = next;
  }

  // 对齐 Semi 校验规则：URL 格式（md 156-165 行 urlRegex），非法地址提示重新输入。
  const urlPattern = /^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?::\d+)?(?:\/[^\s]*)?$/i;

  async function handleAddOk() {
    if (!formApi) return;
    const valid = await formApi.validate();
    if (!valid) return;
    const values = formApi.getValues() as { name: string; src: string; desc: string };
    customOptions = [
      ...customOptions,
      { value: `mcp-${nextId++}`, label: values.name, icon: values.src, desc: values.desc },
    ];
    addModalVisible = false;
  }
</script>

<Button onclick={() => (visible = true)}>打开 MCP 配置</Button>

<SideBarMCPConfigure
  {visible}
  {options}
  {customOptions}
  style="width: 500px;"
  resizable={false}
  onCancel={() => (visible = false)}
  onStatusChange={handleStatusChange}
  onAddClick={() => (addModalVisible = true)}
  onConfigureClick={(_e, o) => console.log('configure:', o.label)}
  onEditClick={(_e, o) => console.log('edit:', o.label)}
/>

<Modal
  title="自定义 MCP"
  visible={addModalVisible}
  onOk={handleAddOk}
  onCancel={() => (addModalVisible = false)}
  closeOnEsc
>
  <Form getFormApi={(api) => (formApi = api)} layout="vertical">
    <Form.Input field="name" label="MCP 名称" rules={[{ required: true, message: '请输入 MCP 名称' }]} />
    <Form.Input
      field="src"
      label="MCP 图标 URL"
      initValue="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png"
      rules={[
        { required: true, message: '请输入 MCP 图标 URL' },
        {
          validator: (value) =>
            urlPattern.test(value as string) ? undefined : '请输入有效的 MCP 图标 URL',
        },
      ]}
    />
    <Form.TextArea field="desc" label="MCP 介绍" rules={[{ required: true, message: '请输入 MCP 介绍' }]} />
  </Form>
</Modal>

{#snippet semiIcon()}
  <IconSemiLogo />
{/snippet}

{#snippet figmaIcon()}
  <IconFigma />
{/snippet}
