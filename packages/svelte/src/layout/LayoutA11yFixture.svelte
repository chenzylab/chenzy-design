<!--
  仅供 Layout.a11y.test.ts 使用的测试夹具：Layout 根 + Header/Sider/Content/Footer。
  Sider collapsible 渲染原生 button 触发器（aria-expanded/aria-controls/aria-label）。
-->
<script lang="ts">
  import { Layout } from './index.js';

  interface Props {
    collapsible?: boolean;
  }
  let { collapsible = false }: Props = $props();
</script>

<Layout hasSider>
  <Layout.Sider {collapsible}>Navigation</Layout.Sider>
  <Layout>
    <Layout.Header>Page header</Layout.Header>
    <Layout.Content padding>Main content</Layout.Content>
    <Layout.Footer>Page footer</Layout.Footer>
  </Layout>
</Layout>
