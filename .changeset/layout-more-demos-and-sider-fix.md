---
"@chenzy-design/svelte": patch
---

修复 Sider 受控折叠 toggle 卡死：受控模式（collapsed + onCollapse）下，headless createSider 在构造时捕获了初始 collapsed 值，其 current() 始终返回陈旧值，导致默认/自定义触发器反复点击只会折叠、无法再展开。改为在 Sider 层用 live 的 collapsedState 计算翻转目标（受控走 setCollapsed、非受控仍走 headless toggle）。补受控 toggle 往返回归测试。
