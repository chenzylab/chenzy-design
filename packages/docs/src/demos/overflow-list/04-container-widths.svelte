<script lang="ts">
  import { OverflowList, Text } from '@chenzy-design/svelte';

  const items = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京'];
  const presets = [160, 280, 400, 9999];
</script>

<Text type="tertiary">同一组数据在不同容器宽度下的折叠结果（alwaysVisibleIndexes 让首项恒可见）</Text>
<div style="display:flex;flex-direction:column;gap:16px;margin-top:8px">
  {#each presets as w (w)}
    <div>
      <Text type="tertiary" size="small">容器宽度 {w >= 9999 ? '充足' : `${w}px`}</Text>
      <div style="width:{w >= 9999 ? '100%' : `${w}px`}; border:1px dashed var(--cd-color-border); padding:8px; border-radius:6px; margin-top:4px">
        <OverflowList {items} alwaysVisibleIndexes={[0]} ariaLabel="城市列表 {w}">
          {#snippet item({ item })}
            <span style="display:inline-block;padding:2px 10px;background:var(--cd-color-fill-1);border-radius:4px;white-space:nowrap">{item}</span>
          {/snippet}
        </OverflowList>
      </div>
    </div>
  {/each}
</div>
