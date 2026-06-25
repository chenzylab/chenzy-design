<!--
  仅供 Menu.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  外层 LocaleProvider 提供 context；菜单前放一个「before」按钮，
  用于验证 Tab 从 before 进入菜单时只停靠在单一 menuitem（roving 单停靠点），
  而非逐个 menuitem 都进 Tab 序。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Menu from './Menu.svelte';

  const items = [
    { key: 'home', label: 'Home' },
    { key: 'profile', label: 'Profile' },
    { key: 'settings', label: 'Settings' },
  ];
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Menu {items} ariaLabel="Main menu" mode="vertical" />
  <button type="button" data-testid="after">after</button>
</LocaleProvider>
