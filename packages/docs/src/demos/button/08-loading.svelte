<script lang="ts">
  import { Button } from '@chenzy-design/svelte';

  // 受控加载态：两个切换按钮开关下方一组按钮的 loading
  let loading = $state(true);
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  <!-- 切换：关闭 / 开启加载态 -->
  <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
    <Button theme="light" onclick={() => (loading = false)}>关闭加载态</Button>
    <Button theme="light" onclick={() => (loading = true)}>开启加载态</Button>
  </div>

  <!-- 受控 loading 的一组按钮 -->
  <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
    <Button type="primary" theme="light" {loading}>保存</Button>
    <Button type="danger" theme="light" {loading}>删除</Button>
    <Button type="warning" theme="solid" {loading}>撤销</Button>
  </div>

  <!-- 静态加载态一览：各 theme + 纯图标 -->
  <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
    <Button type="primary" loading>加载中</Button>
    <Button type="primary" theme="light" loading>处理中</Button>
    <Button type="primary" theme="outline" loading>提交中</Button>
    <Button type="primary" loading ariaLabel="加载中" />
  </div>
</div>
