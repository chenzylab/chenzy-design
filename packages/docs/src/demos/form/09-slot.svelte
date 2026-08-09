<script lang="ts">
  // Form.Slot：放置自定义组件并保持与 Field 一致的布局样式；Form 上的 labelWidth /
  // labelAlign 会自动作用于 Slot，label 可传对象形态自定义宽度/对齐。对齐 Semi「Form.Slot」。
  import { Form } from '@chenzy-design/svelte';
</script>

<Form
  style="width: 600px"
  labelPosition="left"
  labelWidth={100}
  onChange={(v) => console.log(v)}
  onSubmit={(r) => console.log(r.values)}
>
  <Form.Input field="特效名称" style="width: 250px" />
  <Form.Slot label={{ text: 'SlotA' }} error="我是SlotA的ErrorMessage">
    <div style="display: flex; align-items: center; height: 32px; margin-top: 8px;">
      我是 Form SlotA, 我是自定义的节点
    </div>
  </Form.Slot>
  <Form.Slot label={{ text: 'SlotB', width: 160, align: 'right' }}>
    <div style="display: flex; align-items: center; height: 100%;">
      我是 Form SlotB, 我的Label Align、Width与众不同
    </div>
  </Form.Slot>
</Form>
