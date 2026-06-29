<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';

  const cell = 'color: var(--cd-color-text-2);';
  const tocLeft = ['快速开始', '安装', '主题', '组件总览'];
  const tocRight = ['概述', 'API', '示例', '无障碍'];
</script>

{#snippet logo()}
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
    <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
  </svg>
{/snippet}

<div style="border:1px solid var(--cd-color-border); border-radius:8px; overflow:hidden; height:300px;">
  <Layout style="height:100%;">
    <Layout.Header
      sticky
      style="display:flex; align-items:center; gap:8px; padding-inline:16px; background: var(--cd-color-bg-1); font-weight:600; color: var(--cd-color-text-1);"
    >
      {@render logo()} 文档站
    </Layout.Header>
    <Layout hasSider style="height:100%;">
      <Layout.Sider width={160} style="background: var(--cd-color-bg-1); overflow-y:auto;">
        <div style="padding:12px;">
          {#each tocLeft as t (t)}
            <div style="padding:6px 10px; {cell}">{t}</div>
          {/each}
        </div>
      </Layout.Sider>
      <Layout.Content padding style="overflow-y:auto; background: var(--cd-color-bg-0); {cell}">
        <h4 style="margin:0 0 8px; color: var(--cd-color-text-0);">文档站布局</h4>
        顶栏 + 左目录 + 中正文 + 右页内锚点（TOC）。三栏 + 顶栏的典型文档结构，
        正文区独立滚动。
      </Layout.Content>
      <Layout.Sider placement="right" width={120} style="background: var(--cd-color-bg-0); border-inline-start:1px solid var(--cd-color-border);">
        <div style="padding:12px;">
          <div style="font-size:12px; color: var(--cd-color-text-3); margin-bottom:6px;">本页目录</div>
          {#each tocRight as t (t)}
            <div style="padding:4px 0; font-size:13px; {cell}">{t}</div>
          {/each}
        </div>
      </Layout.Sider>
    </Layout>
  </Layout>
</div>
