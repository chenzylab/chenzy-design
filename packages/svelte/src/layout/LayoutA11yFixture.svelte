<!--
  仅供 Layout.a11y.test.ts 使用的测试夹具：Layout 根 + Header/Sider/Content/Footer。
  语义元素齐全（section/header/aside/main/footer）；Sider 传 aria-label 描述其作用。
-->
<script lang="ts">
  import { Layout } from './index.js';
</script>

<Layout hasSider>
  <Layout.Sider ariaLabel="主导航">Navigation</Layout.Sider>
  <Layout>
    <Layout.Header>Page header</Layout.Header>
    <Layout.Content>Main content</Layout.Content>
    <Layout.Footer>Page footer</Layout.Footer>
  </Layout>
</Layout>
