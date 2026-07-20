<script lang="ts">
  // 隐藏 Label：noLabel 关闭自动插入的 Label（仍保留 ErrorMessage，DOM 与原控件有别）；
  // pure 则连 wrapper 也不插入，DOM 与普通 Input 完全一致（需自行负责 ErrorMessage）。
  // 对齐 Semi「隐藏 Label」。
  import { Form } from '@chenzy-design/svelte';
</script>

<Form onSubmit={(r) => console.log(r.values)} style="width: 400px">
  <Form.Input field="name" label="姓名" trigger="blur" noLabel placeholder="请输入姓名（noLabel）" />
  <Form.Input field="purename" pure placeholder="DOM 结构与普通 Input 完全一致（pure）" />
</Form>
