<script lang="ts">
  import { Breadcrumb } from '@chenzy-design/svelte';
  import { IconHome } from '@chenzy-design/icons';
</script>

<!-- 尺寸对齐 Semi：默认 compact 紧凑；compact={false} 使图标和文字尺寸增加。
     icon 为组件引用直传，size 由 Item 内部按 compact 自动注入，无需在此指定。 -->
<div>
  <Breadcrumb compact>
    <Breadcrumb.Item icon={IconHome}></Breadcrumb.Item>
    <Breadcrumb.Item>Breadcrumb</Breadcrumb.Item>
    <Breadcrumb.Item>Loose</Breadcrumb.Item>
  </Breadcrumb>
  <br />
  <Breadcrumb compact={false}>
    <Breadcrumb.Item icon={IconHome}></Breadcrumb.Item>
    <Breadcrumb.Item>Breadcrumb</Breadcrumb.Item>
    <Breadcrumb.Item>Loose</Breadcrumb.Item>
  </Breadcrumb>
</div>
