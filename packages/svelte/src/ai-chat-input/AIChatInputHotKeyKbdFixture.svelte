<!--
  browser project 夹具（真实 chromium）：验证 allowHotKeySend 热键让路机制。

  必须真实浏览器：需要真的 tiptap Editor 实例才有 editor.storage 命名空间，
  jsdom 下编辑器根本挂不起来。

  两个实例共用同一份 skills/placeholder，区别只在 allow：
  · allow=true（默认）→ Enter 应触发 onMessageSend
  · allow=false → 自定义扩展声明「Enter 归我」，Enter 不应发送
-->
<script lang="ts">
  import '@chenzy-design/tokens/tokens.css';
  import AIChatInput from './AIChatInput.svelte';

  let sentOn = $state(0);
  let sentOff = $state(0);

  // 模拟一个占用 Enter 的自定义扩展：挂载时把 allowHotKeySend 置 false。
  // 这里直接改 storage（等价于 Semi demo 里 mentionList 调 command 的效果），
  // 避免夹具依赖 @tiptap/core 的 Extension.create 静态导入。
  let refOff = $state<{ getEditor: () => unknown }>();

  // 把 storage 命名空间是否存在暴露给用例断言——否则「Enter 没发送」可能是因为
  // 扩展压根没装上（假绿），而不是让路机制生效。
  let storageState = $state('pending');

  $effect(() => {
    const ed = refOff?.getEditor() as
      | { storage?: Record<string, { allowHotKeySend: boolean }> }
      | undefined;
    const ns = ed?.storage?.['CdAIChatInput'];
    if (!ed) return;
    if (!ns) {
      storageState = 'missing';
      return;
    }
    ns.allowHotKeySend = false;
    storageState = 'set-false';
  });
</script>

<div data-testid="allow-on">
  <!-- canSend 显式为 true：本用例只验热键让路，不验内容判空。 -->
  <AIChatInput canSend placeholder="可发送" onMessageSend={() => (sentOn += 1)} />
  <span data-testid="count-on">{sentOn}</span>
</div>

<div data-testid="allow-off">
  <AIChatInput
    bind:this={refOff}
    canSend
    placeholder="Enter 被扩展占用"
    onMessageSend={() => (sentOff += 1)}
  />
  <span data-testid="count-off">{sentOff}</span>
  <span data-testid="storage-state">{storageState}</span>
</div>
