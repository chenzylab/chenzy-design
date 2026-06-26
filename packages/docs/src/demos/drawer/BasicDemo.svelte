<script lang="ts">
  import { Drawer, Input, Button } from '@chenzy-design/svelte';

  let drawerRight = $state(false);
  let drawerLeft = $state(false);
  let drawerTop = $state(false);
  let drawerBottom = $state(false);
  let drawerDestroy = $state(false);
  let drawerNestOuter = $state(false);
  let drawerNestInner = $state(false);
  let drawerNoKbd = $state(false);
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button type="primary" onclick={() => (drawerRight = true)}>右侧抽屉</Button>
  <Button onclick={() => (drawerLeft = true)}>左侧抽屉</Button>
  <Button onclick={() => (drawerTop = true)}>顶部抽屉</Button>
  <Button onclick={() => (drawerBottom = true)}>底部抽屉</Button>
  <Button onclick={() => (drawerDestroy = true)}>destroyOnClose</Button>
  <Button onclick={() => (drawerNestOuter = true)}>嵌套抽屉</Button>
  <Button onclick={() => (drawerNoKbd = true)}>keyboard=false（禁键盘）</Button>
</div>

<Drawer
  open={drawerRight}
  placement="right"
  title="编辑用户"
  onOpenChange={(o) => (drawerRight = o)}
>
  <p style="margin:0; line-height:1.8">
    右侧抽屉从视口右边缘滑入，承载较长的编辑表单。按 Esc 或点击遮罩关闭，背景滚动被锁定，焦点被捕获在面板内。
  </p>
  {#snippet footer()}
    <Button onclick={() => (drawerRight = false)}>取消</Button>
    <Button type="primary" onclick={() => (drawerRight = false)}>保存</Button>
  {/snippet}
</Drawer>

<Drawer
  open={drawerLeft}
  placement="left"
  size="small"
  title="导航菜单"
  onOpenChange={(o) => (drawerLeft = o)}
>
  <p style="margin:0; line-height:1.8">左侧小尺寸抽屉，常用于移动端导航菜单。</p>
</Drawer>

<Drawer
  open={drawerTop}
  placement="top"
  title="系统通知"
  onOpenChange={(o) => (drawerTop = o)}
>
  <p style="margin:0; line-height:1.8">顶部抽屉从上方滑入，适合通知横幅、公告等场景。</p>
</Drawer>

<Drawer
  open={drawerBottom}
  placement="bottom"
  title="筛选条件"
  onOpenChange={(o) => (drawerBottom = o)}
>
  <p style="margin:0; line-height:1.8">底部抽屉从下方滑入，适合筛选面板等场景。</p>
</Drawer>

<Drawer
  open={drawerDestroy}
  placement="right"
  title="destroyOnClose 演示"
  destroyOnClose
  onOpenChange={(o) => (drawerDestroy = o)}
>
  <p style="margin:0 0 12px; line-height:1.8">
    destroyOnClose 时关闭即从 DOM 卸载内部内容，重开重建并重置内部状态。下方输入框的值在关闭后不会保留。
  </p>
  <Input placeholder="输入点内容再关闭重开试试" />
</Drawer>

<Drawer
  open={drawerNestOuter}
  placement="right"
  title="外层抽屉"
  onOpenChange={(o) => (drawerNestOuter = o)}
>
  <p style="margin:0 0 12px; line-height:1.8">
    嵌套抽屉：在外层抽屉中再打开一层，内层 z-index 自动递增（与 Modal 共享层栈），叠在外层之上。
  </p>
  <Button type="primary" onclick={() => (drawerNestInner = true)}>打开内层抽屉</Button>
</Drawer>

<Drawer
  open={drawerNestInner}
  placement="right"
  size="small"
  title="内层抽屉"
  onOpenChange={(o) => (drawerNestInner = o)}
>
  <p style="margin:0; line-height:1.8">内层抽屉叠在外层之上，关闭后回收 z-index。</p>
</Drawer>

<Drawer
  open={drawerNoKbd}
  placement="right"
  title="keyboard=false 总开关"
  keyboard={false}
  onOpenChange={(o) => (drawerNoKbd = o)}
>
  <p style="margin:0 0 12px; line-height:1.8">
    keyboard=false 停用全部键盘交互：按 Esc 不会关闭（覆盖 closeOnEsc），Tab/Shift+Tab 也不做焦点循环捕获。请用关闭按钮或点击遮罩关闭。
  </p>
  <Input placeholder="Tab 不被锁在面板内" />
</Drawer>
