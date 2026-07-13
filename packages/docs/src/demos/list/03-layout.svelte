<script lang="ts">
  // 布局：layout='horizontal' 让列表项横向排列（split 时用右边框分隔）。
  import { List, Avatar } from '@chenzy-design/svelte';

  const data = [
    { title: 'Semi Design Title 1', color: 'light-blue' as const },
    { title: 'Semi Design Title 2', color: 'grey' as const },
    { title: 'Semi Design Title 3', color: 'light-green' as const },
  ];
</script>

<div style="padding:12px; border:1px solid var(--cd-color-border);">
  <List dataSource={data} layout="horizontal">
    {#snippet renderItem(item)}
      <List.Item>
        {#snippet header()}
          <Avatar color={item.color}>SE</Avatar>
        {/snippet}
        {#snippet main()}
          <div>
            <span style="color:var(--cd-color-text-0); font-weight:500;">{item.title}</span>
            <p style="color:var(--cd-color-text-2); margin:4px 0;">
              Semi Design 设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的 Web 应用。
            </p>
          </div>
        {/snippet}
      </List.Item>
    {/snippet}
  </List>
</div>
