<script>
  import { base } from '$app/paths';
</script>

# Theming 主题定制

chenzy-design 的 token 是**运行时 CSS 变量**（三层：global 原子 → alias 语义 → component 组件）。这带来相对 Semi 的关键优势：改一个值 `setProperty` 即时生效，导出主题就是一段 CSS —— **无需 SCSS 编译、无需生成 npm 包**。

提供三种定制路径，从轻到重：

## 1. 局部主题 · `ConfigProvider`

在子树注入一组 token 覆写，只影响该子树，不污染全局、不影响兄弟节点。适合「页面局部换肤」。

```svelte
<script>
  import { ConfigProvider, Button } from '@chenzy-design/svelte';
</script>

<ConfigProvider tokens={{ 'color-primary': '#0af', 'button-color-bg-primary': '#f50' }}>
  <!-- 子树内 --cd-color-primary / --cd-button-color-bg-primary 被覆写 -->
  <Button type="primary">局部主题按钮</Button>
</ConfigProvider>
```

- key 是去掉 `--cd-` 前缀的 token 名。
- 改 alias（如 `color-primary`）→ 引用它的组件 token 级联跟随；改组件 token（如 `button-color-bg-primary`）→ 只影响该组件。
- 保留字符串枚举形态 `theme="dark"`，可与对象组合。

## 2. 可视化编辑 · DSM 主题编辑器

访问文档站 <a href="{base}/dsm"><code>/dsm</code></a> —— 在界面里拖调 token、实时预览、导出主题 CSS。

- **全局层**：编辑品牌色/状态色/背景/文本等 alias 语义色。改 `color-primary`，预览里所有引用它的组件主色联动变，其他语义色保持隔离。
- **组件层**：下钻到单个组件（64 个），按分类精细编辑该组件的 token。
- **导出**：产出一段 `:root{ --cd-xxx: …; }`，可直接贴进宿主项目 `<style>` 或存为主题文件。

> global 原子层（如 `--cd-color-blue-3`）不直接暴露编辑 —— 用户调的是语义 alias，底层色阶由体系维护。

## 3. 编译期品牌包 · `@chenzy-design/theme-cli`

用命令行从配置文件产出可分发的主题 CSS，适合「一次定义品牌、多项目复用」。

```bash
npx chenzy-theme init      # 生成 theme.config.ts
npx chenzy-theme build     # 产出 dist/theme.css（含暗色段）
```

```ts
// theme.config.ts
import { defineTheme } from '@chenzy-design/theme-cli';

export default defineTheme({
  alias: { 'color-primary': '#0066ff', 'border-radius-medium': '10px' },
  dark:  { 'color-bg-0': '#16161a', 'color-primary': '#4d94ff' },
});
```

产出：

```css
:root {
  --cd-color-primary: #0066ff;
  --cd-border-radius-medium: 10px;
}
[data-theme="dark"] {
  --cd-color-bg-0: #16161a;
  --cd-color-primary: #4d94ff;
}
```

- 宿主项目引入 `theme.css` 即生效，无需改任何组件源码。
- CLI 会校验 config 里的 key 是否为合法 token（拼错报错、组件层 key 给警告）。
- 暗色：`dark` 段落到 `[data-theme="dark"]`，配合宿主的 `data-theme` 切换生效。

## 暗色模式

暗色由 alias 层在 `[data-theme="dark"]` 重映射实现。三种路径都支持：ConfigProvider 组合 `theme="dark"`、DSM 导出可含暗色段、theme-cli 的 `dark` 配置。组件层无需感知明暗 —— 它们消费 alias，明暗切换由 alias 重映射统一驱动。
