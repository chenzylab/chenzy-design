<script lang="ts">
  import { Icon } from '@chenzy-design/svelte';

  const heart =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-6.7-4.35-9.33-8.24C.9 10.03 1.6 6.5 4.6 5.4c2.02-.74 4.02.2 5.4 1.9C11.38 5.6 13.38 4.66 15.4 5.4c3 1.1 3.7 4.63 1.93 7.36C18.7 16.65 12 21 12 21z"/></svg>';
  const lock =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 10V7a6 6 0 1 1 12 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1zm2 0h8V7a4 4 0 0 0-8 0v3z"/></svg>';
</script>

<div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
  <!-- 单色图标自动继承外层 color -->
  <div style="color: #e91e63; display: flex; gap: 12px;">
    <Icon size="extra-large" svg={heart} />
    <Icon size="extra-large" svg={lock} />
  </div>
  <!-- 通过 color prop 显式覆盖 -->
  <Icon size="extra-large" color="#6a3ac7" svg={lock} />
  <Icon size="extra-large" color="#00b42a" svg={heart} />
</div>
