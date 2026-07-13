<script lang="ts">
  // 模板用法：List.Item 内置 header/main/extra 三段结构，align 控制 header 与 main 的垂直对齐。
  import { List, Avatar, Button } from '@chenzy-design/svelte';

  const data = [
    'Semi Design 是由抖音前端团队与 UED 团队共同设计开发并维护的设计系统。设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的 Web 应用。',
    'Semi Design 是由抖音前端团队与 UED 团队共同设计开发并维护的设计系统。',
    'Semi Design 以用户中心、内容优先、设计人性化的设计系统，打造一致、好看、好用、高效的用户体验。',
  ];
</script>

<div style="padding:12px; border:1px solid var(--cd-color-border);">
  <List dataSource={data}>
    {#snippet renderItem(item)}
      <List.Item>
        {#snippet header()}
          <Avatar color="blue">SE</Avatar>
        {/snippet}
        {#snippet main()}
          <div>
            <span style="color:var(--cd-color-text-0); font-weight:500;">示例标题</span>
            <p style="color:var(--cd-color-text-2); margin:4px 0;">{item}</p>
          </div>
        {/snippet}
        {#snippet extra()}
          <div style="display:flex; gap:8px;">
            <Button theme="borderless">编辑</Button>
            <Button theme="borderless">更多</Button>
          </div>
        {/snippet}
      </List.Item>
    {/snippet}
  </List>
</div>
