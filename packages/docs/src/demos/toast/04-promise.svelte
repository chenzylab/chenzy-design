<script lang="ts">
  import { Toast, Button } from '@chenzy-design/svelte';

  function save(ok: boolean) {
    return new Promise<string>((resolve, reject) =>
      setTimeout(() => (ok ? resolve('草稿') : reject(new Error('网络中断'))), 1800),
    );
  }

  // 同 id 命令式从 loading 更新为 success
  function stepUpdate() {
    const id = Toast.loading('正在处理…', { duration: 0, position: 'topRight' });
    setTimeout(() => Toast.update(id, { type: 'success', content: '处理完成', duration: 3 }), 1500);
  }
</script>

<div style="display:flex; gap:12px; flex-wrap:wrap">
  <Button
    type="primary"
    onclick={() =>
      Toast.promise(
        save(true),
        { loading: '保存中…', success: (name) => `已保存「${name}」`, error: '保存失败' },
        { position: 'bottom' },
      )}>promise（resolve）</Button>
  <Button
    type="danger"
    onclick={() =>
      Toast.promise(
        save(false),
        { loading: '提交中…', success: '已提交', error: (e) => `失败：${(e as Error).message}` },
        { position: 'bottom' },
      ).catch(() => {})}>promise（reject）</Button>
  <Button onclick={stepUpdate}>同 id 更新（loading → success）</Button>
</div>
