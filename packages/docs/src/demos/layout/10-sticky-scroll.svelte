<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';

  const cell =
    'display:flex; align-items:center; justify-content:center; color: var(--cd-color-text-2);';
  const rows = [1, 2, 3, 4, 5, 6, 7, 8];
</script>

<div style="border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <!-- 固定高度容器 + 内层滚动：Header sticky 吸顶、Footer sticky 吸底 -->
  <div style="height: 260px; overflow-y: auto;">
    <Layout>
      <Layout.Header
        sticky
        height={48}
        style="{cell} background: var(--cd-color-fill-0); font-weight:600; color: var(--cd-color-text-1); z-index:2;"
      >
        固定头部（sticky + height=48）
      </Layout.Header>
      <Layout.Content padding style="background: var(--cd-color-bg-0);">
        {#each rows as r (r)}
          <div
            style="height:48px; margin-bottom:12px; border-radius:6px; background: var(--cd-color-fill-1); {cell}"
          >
            内容行 {r}
          </div>
        {/each}
      </Layout.Content>
      <Layout.Footer
        sticky
        height={40}
        style="{cell} background: var(--cd-color-fill-0); z-index:2;"
      >
        固定底部（sticky）
      </Layout.Footer>
    </Layout>
  </div>
</div>
