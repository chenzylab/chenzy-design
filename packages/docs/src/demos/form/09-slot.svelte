<script lang="ts">
  // Form.Slot：放置自定义组件并保持与 Field 一致的布局样式；Form 上的 labelWidth /
  // labelAlign 会自动作用于 Slot，label 可传对象形态自定义宽度/对齐。对齐 Semi「Form.Slot」。
  import { Form } from '@chenzy-design/svelte';
</script>

<Form style="width: 600px" labelPosition="left" labelWidth={100}>
  <Form.Input field="effectName" label="特效名称" style="width: 250px" />
  <Form.Slot label={{ text: 'SlotA' }} error="我是 SlotA 的 ErrorMessage">
    <div style="display: flex; align-items: center; height: 32px;">
      我是 Form SlotA，一个自定义节点
    </div>
  </Form.Slot>
  <Form.Slot label={{ text: 'SlotB', width: 160, align: 'right' }}>
    <div style="display: flex; align-items: center; height: 32px;">
      我是 Form SlotB，Label 的 Align、Width 与众不同
    </div>
  </Form.Slot>
</Form>
