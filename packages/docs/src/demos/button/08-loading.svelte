<script lang="ts">
  import { Button } from '@chenzy-design/svelte';
  import { IconDelete } from '@chenzy-design/icons';

  // 三个独立受控加载态（对齐 Semi）：保存默认关，删除/撤销默认开。
  let saveLoading = $state(false);
  let delLoading = $state(true);
  let repLoading = $state(true);

  function reset(status: boolean) {
    saveLoading = status;
    delLoading = status;
    repLoading = status;
  }
</script>

{#snippet del()}<IconDelete />{/snippet}

<div>
  <div>
    <div
      style="display: inline-flex; align-items: center; gap: 14px; padding-bottom: 14px;"
    >
      <Button onclick={() => reset(false)}>关闭加载态</Button>
      <Button onclick={() => reset(true)}>开启加载态</Button>
    </div>
  </div>
  <hr />
  <Button loading={saveLoading} onclick={() => (saveLoading = true)} style="margin-right: 14px;">
    保存
  </Button>
  <Button
    loading={delLoading}
    icon={del}
    type="danger"
    onclick={() => (delLoading = true)}
    style="margin-right: 14px;"
  >
    删除
  </Button>
  <div style="width: 200px; display: inline-block;">
    <Button loading={repLoading} type="warning" block theme="solid" onclick={() => (repLoading = true)}>
      撤销
    </Button>
  </div>
</div>
