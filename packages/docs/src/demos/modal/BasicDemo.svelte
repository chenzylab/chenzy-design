<script lang="ts">
  import { Modal, modal, Button, Text, Tag } from '@chenzy-design/svelte';

  let modalOpen = $state(false);
  let dangerModalOpen = $state(false);
  let destroyModalOpen = $state(false);
  let dragModalOpen = $state(false);
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button type="primary" onclick={() => (modalOpen = true)}>打开对话框</Button>
  <Button type="danger" onclick={() => (dangerModalOpen = true)}>删除确认</Button>
</div>

<Text type="tertiary">命令式 modal.confirm/info/...（mount 到 body、堆叠、async 确认）：</Text>
<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button
    onclick={() =>
      modal.confirm({
        title: '确认操作',
        content: '确定要执行此操作吗？',
        onOk: () => {},
        onCancel: () => {},
      })}>confirm</Button
  >
  <Button onclick={() => modal.info({ title: '提示', content: '这是一条信息。' })}>info</Button>
  <Button onclick={() => modal.success({ title: '成功', content: '操作已完成。' })}>success</Button>
  <Button
    onclick={() =>
      modal.confirm({
        title: '异步提交',
        content: '点击确定后将等待 1 秒（模拟请求）。',
        onOk: () => new Promise((r) => setTimeout(r, 1000)),
      })}>async confirm</Button
  >
</div>

<Text type="tertiary">Modal.confirm 工厂 + 堆叠 z-index：</Text>
<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button
    onclick={() =>
      Modal.confirm({
        title: '第一层',
        content: '点击确定将在上层再弹出一个确认框（验证堆叠）。',
        onOk: () => {
          Modal.confirm({
            title: '第二层（更高 z-index）',
            content: '这一层叠在第一层之上。',
          });
        },
      })}>Modal.confirm 堆叠</Button
  >
  <Button onclick={() => (destroyModalOpen = true)}>打开（destroyOnClose）</Button>
  <Button onclick={() => (dragModalOpen = true)}>打开（draggable）</Button>
</div>

<Modal
  open={modalOpen}
  title="编辑资料"
  onOpenChange={(o) => (modalOpen = o)}
  onOk={() => (modalOpen = false)}
>
  <p style="margin:0; line-height:1.8">
    这是模态对话框的内容区。打开时焦点被捕获在面板内，Tab 循环不逃逸；按 Esc 或点击遮罩可关闭；背景滚动被锁定。
  </p>
</Modal>

<Modal
  open={dangerModalOpen}
  title="删除项目"
  okType="danger"
  okText="删除"
  onOpenChange={(o) => (dangerModalOpen = o)}
  onOk={() => (dangerModalOpen = false)}
>
  <p style="margin:0; line-height:1.8">
    确定删除此项目？此操作不可撤销，项目下的全部数据将被永久移除。
  </p>
</Modal>

<Modal
  open={destroyModalOpen}
  title="destroyOnClose 演示"
  destroyOnClose
  onOpenChange={(o) => (destroyModalOpen = o)}
  onOk={() => (destroyModalOpen = false)}
>
  <p style="margin:0 0 8px; line-height:1.6">在下方输入内容后关闭再重开，内容会被重置（内容随关闭卸载）：</p>
  <input
    placeholder="输入草稿…"
    style="inline-size:100%; box-sizing:border-box; padding:6px 10px; border:1px solid var(--cd-color-border); border-radius:6px"
  />
</Modal>

<Modal
  open={dragModalOpen}
  title="可拖拽对话框"
  draggable
  onOpenChange={(o) => (dragModalOpen = o)}
  onOk={() => (dragModalOpen = false)}
>
  <p style="margin:0; line-height:1.8">
    按住上方标题栏即可拖动整个对话框。拖拽是鼠标增强，键盘 Tab 焦点循环与 Esc 关闭不受影响；重新打开会回到初始居中位置。
  </p>
</Modal>
