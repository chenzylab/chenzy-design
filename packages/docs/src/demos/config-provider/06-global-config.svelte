<script lang="ts">
  // cdGlobal 全局覆盖组件默认 props（对齐 Semi semiGlobal.config.overrideDefaultProps）。
  //
  // ⚠️ 真实用法是**在站点入口一次性赋值**，本 demo 也照此演示：配置在模块顶层执行一次，
  // 下方组件挂载时即读到。`cdGlobal` 是普通对象（与 Semi 的普通单例一致），改它**不会**
  // 主动触发已挂载组件重渲染 —— Semi 的 Proxy 同样只在 React 重渲染时才读到新值。
  // 故此处不做「点按钮实时切换」的演示，以免暗示一个两库都不具备的能力。
  import { Button, Select, Space, Text, cdGlobal } from '@chenzy-design/svelte';

  // ——— 站点入口处该写的就是这一段 ———
  cdGlobal.config.overrideDefaultProps = {
    Button: { theme: 'solid' },
    Select: { borderless: true },
  };

  const selectOptions = [
    { label: '选项 A', value: 'a' },
    { label: '选项 B', value: 'b' },
  ];
</script>

<Space vertical align="start">
  <Text type="tertiary">
    已在本 demo 顶层配置：<Text code>Button.theme = 'solid'</Text> 、
    <Text code>Select.borderless = true</Text>
  </Text>

  <Text type="tertiary">① 不传对应 prop → 取 cdGlobal 的默认值：</Text>
  <Space>
    <Button>未传 theme（呈 solid）</Button>
    <div style="width: 240px"><Select placeholder="未传 borderless（无边框）" optionList={selectOptions} /></div>
  </Space>

  <Text type="tertiary">② 显式传值 → 恒优先，不受全局默认影响：</Text>
  <Space>
    <Button theme="borderless">显式 borderless</Button>
    <div style="width: 240px">
      <Select borderless={false} placeholder="显式 borderless=false（有边框）" optionList={selectOptions} />
    </div>
  </Space>
</Space>
