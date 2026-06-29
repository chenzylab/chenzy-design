<!-- 测试夹具：声明式 Nav.Item / Nav.Sub 用法，验证收集 → 渲染管线。 -->
<script lang="ts">
  import Nav from './Nav.svelte';
  import NavItem from './NavItem.svelte';
  import NavSub from './NavSub.svelte';
</script>

<Nav mode="vertical" defaultOpenKeys={['mgmt']}>
  <NavItem itemKey="home" text="首页" />
  <NavSub itemKey="mgmt" text="管理">
    <NavItem itemKey="users" text="用户" />
    <NavItem itemKey="roles" text="角色" />
  </NavSub>
</Nav>
