// visual project 的 setup（真实 chromium / toMatchScreenshot）。
//
// 关键：组件样式全部依赖 @chenzy-design/tokens 的 CSS 变量
// （packages/tokens/dist/tokens.css，约 37KB）。不注入这套 token CSS，
// 截图里的颜色/间距/圆角全是浏览器默认值，基线无意义。
// vitest browser（vite 驱动）支持把 CSS 当副作用 import：import 后 vite
// 会把这套样式注入页面 <head>，对所有 visual 测试全局生效。
// 走相对路径直指 dist（不经 package exports map 的 query 解析坑），
// setup 文件在仓库根，相对 ./packages/tokens/dist/tokens.css 即可。
import './packages/tokens/dist/tokens.css';

// body 基础重置：去 margin、刷纯白背景，避免不同环境默认 body 样式
// 渗进截图边缘造成像素差异。
const STYLE_ID = 'chenzy-visual-reset';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = 'html, body { margin: 0; padding: 0; background: #ffffff; }';
  document.head.appendChild(style);
}
