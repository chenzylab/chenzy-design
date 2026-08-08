<script lang="ts">
  // 严格对齐 Semi「操作区域」demo：renderActionArea 整块替换，在默认按钮组
  // （menuItem）之前插入一枚圆形删除按钮 + 竖向 Divider。
  //
  // 关键点：容器 class 由组件回传（className），需自行挂到根节点上；menuItem 渲染出的
  // 就是内置的「上传 + 发送/停止」，因此自定义后内置能力（上传管线、发送态、禁用态）不丢。
  import type { Snippet } from 'svelte';
  import { AIChatInput, Button, Divider } from '@chenzy-design/svelte';
  import { IconDeleteStroked } from '@chenzy-design/icons';

  const uploadProps = { action: 'https://api.semi.design/upload' };
</script>

<div style="margin: 12px;">
  <AIChatInput placeholder="输入内容或者上传内容..." {uploadProps} {renderActionArea} />
</div>

{#snippet renderActionArea({ menuItem, className }: { menuItem: Snippet; className: string })}
  <div class={className}>
    <div style="display: flex; align-items: center;">
      <Button type="tertiary" style="border-radius: 50%;">
        {#snippet icon()}<IconDeleteStroked />{/snippet}
      </Button>
      <Divider layout="vertical" style="margin-left: 8px;" />
    </div>
    {@render menuItem()}
  </div>
{/snippet}
