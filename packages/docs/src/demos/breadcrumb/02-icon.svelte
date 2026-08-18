<script lang="ts">
  import { Breadcrumb } from '@chenzy-design/svelte';
  import { IconHome, IconArticle } from '@chenzy-design/icons';
</script>

<!-- icon 为组件引用直传（非 Snippet）：icon={IconHome}，内部按 compact 注入 size（对齐 Semi renderIcon）。 -->
<Breadcrumb>
  <Breadcrumb.Item icon={IconHome}></Breadcrumb.Item>
  <Breadcrumb.Item icon={IconArticle}>Breadcrumb</Breadcrumb.Item>
  <Breadcrumb.Item>With Icon</Breadcrumb.Item>
</Breadcrumb>
