<script lang="ts">
  import { VirtualList, Text, Space, Button, InputNumber } from '@chenzy-design/svelte';

  const bigData = Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `第 ${i + 1} 行` }));

  const dynData = Array.from({ length: 2000 }, (_, i) => {
    const lines = (i % 5) + 1;
    return {
      id: i,
      text: `第 ${i + 1} 项 · ${lines} 行\n` + Array.from({ length: lines }, (_, l) => `内容 ${l + 1}`).join('\n'),
    };
  });

  const hData = Array.from({ length: 200 }, (_, i) => ({ id: i, text: `列 ${i + 1}` }));

  const winData = Array.from({ length: 2000 }, (_, i) => ({ id: i, text: `窗口滚动行 ${i + 1}` }));

  let scrollToVL = $state<{ scrollToIndex: (i: number, o?: { align?: 'start' | 'center' | 'end' }) => void } | null>(null);
  let scrollToTarget = $state(500);
</script>

<Space vertical align="start">
  <Text type="tertiary">固定高（1 万行，itemSize=36）：</Text>
  <div style="width: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px">
    <VirtualList data={bigData} height={200} itemSize={36} getKey={(it) => it.id}>
      {#snippet renderItem(item)}
        <div style="padding: 0 12px; line-height: 36px; border-bottom: 1px solid var(--cd-color-border)">
          {(item as { text: string }).text}
        </div>
      {/snippet}
    </VirtualList>
  </div>

  <Text type="tertiary">dynamic 不定高（itemSize="auto" + ResizeObserver 实测）：</Text>
  <div
    style="width: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px"
    data-testid="virtuallist-dynamic"
  >
    <VirtualList
      data={dynData}
      height={300}
      itemSize="auto"
      estimatedItemSize={48}
      getKey={(it) => it.id}
    >
      {#snippet renderItem(item)}
        <div
          style="padding: 8px 12px; border-bottom: 1px solid var(--cd-color-border); white-space: pre-line"
        >
          {(item as { text: string }).text}
        </div>
      {/snippet}
    </VirtualList>
  </div>

  <Text type="tertiary">horizontal 横向虚拟化（itemSize 作列宽 + scrollLeft）：</Text>
  <div
    style="width: 360px; height: 80px; border: 1px solid var(--cd-color-border); border-radius: 8px"
    data-testid="virtuallist-horizontal"
  >
    <VirtualList
      data={hData}
      horizontal
      height={360}
      itemSize={96}
      getKey={(it) => it.id}
    >
      {#snippet renderItem(item)}
        <div
          style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-right: 1px solid var(--cd-color-border)"
        >
          {(item as { text: string }).text}
        </div>
      {/snippet}
    </VirtualList>
  </div>

  <Text type="tertiary">scrollToIndex 命令式跳转：</Text>
  <Space align="center">
    <InputNumber
      value={scrollToTarget}
      min={0}
      max={9999}
      onChange={(v) => (scrollToTarget = v ?? 0)}
    />
    <Button
      onclick={() => scrollToVL?.scrollToIndex(scrollToTarget, { align: 'start' })}
    >
      跳到第 N 项
    </Button>
  </Space>
  <div
    style="width: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px"
    data-testid="virtuallist-scrollto"
  >
    <VirtualList
      bind:this={scrollToVL}
      data={bigData}
      height={200}
      itemSize={36}
      getKey={(it) => it.id}
    >
      {#snippet renderItem(item)}
        <div style="padding: 0 12px; line-height: 36px; border-bottom: 1px solid var(--cd-color-border)">
          {(item as { text: string }).text}
        </div>
      {/snippet}
    </VirtualList>
  </div>

  <Text type="tertiary">scrollTarget="window" 整页长列表（虚拟化跟随窗口滚动）：</Text>
  <div
    style="width: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px"
    data-testid="virtuallist-window"
  >
    <VirtualList
      data={winData}
      scrollTarget="window"
      itemSize={36}
      getKey={(it) => it.id}
    >
      {#snippet renderItem(item)}
        <div style="padding: 0 12px; line-height: 36px; border-bottom: 1px solid var(--cd-color-border)">
          {(item as { text: string }).text}
        </div>
      {/snippet}
    </VirtualList>
  </div>
</Space>
