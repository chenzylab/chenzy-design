/**
 * 图标 SVG 路径常量 —— 图形逐一取自 Semi semi-icons(-lab) 源（viewBox 0 0 24 24）。
 * 由 scratchpad/gen-icons.mjs 从 Semi 已生成组件机械转换（JSX 驼峰属性→SVG kebab，
 * 数字表达式→字符串），主包为 currentColor 去色版、lab 包为彩色版（Semi 源已区分）。
 * 请勿手改；重生成见脚本。
 */

/** 统一包裹：24×24 viewBox；宽高由 Icon 基座 font-size 经 1em 控制。 */
const wrap = (inner: string): string =>
  `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">${inner}</svg>`;

export const accessibilitySvg = wrap(
  "<circle cx=\"12\" cy=\"4\" r=\"3\" fill=\"#4CC3FA\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M2 9.5C2 8.67 2.67 8 3.5 8h17a1.5 1.5 0 0 1 0 3H16v10.5a1.5 1.5 0 0 1-3 0V17a1 1 0 1 0-2 0v4.5a1.5 1.5 0 0 1-3 0V11H3.5A1.5 1.5 0 0 1 2 9.5Z\" fill=\"#6A6F7F\" />",
);

export const anchorSvg = wrap(
  "<path d=\"M6.17 12h-2.5a8.33 8.33 0 1 0 16.66 0h-2.5\" stroke=\"#AAB2BF\" stroke-width=\"2\" stroke-linejoin=\"round\" /><path d=\"M12 20.33V7.83\" stroke=\"#818A9B\" stroke-width=\"2\" stroke-linejoin=\"round\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M12 9.84a3.09 3.09 0 1 0 0-6.17 3.09 3.09 0 0 0 0 6.17Z\" fill=\"#324350\" stroke=\"#324350\" stroke-width=\"1.25\" stroke-linejoin=\"round\" />",
);

export const autocompleteSvg = wrap(
  "<rect x=\"1\" y=\"4\" width=\"22\" height=\"16\" rx=\"3\" fill=\"#DDE3E8\" /><path d=\"M3.1 16.31c.45 0 .7-.23.88-.83L4.46 14H7.5l.5 1.47c.16.59.43.83.9.83.48 0 .8-.3.8-.75 0-.18-.04-.39-.13-.66L7.4 8.64c-.27-.81-.65-1.14-1.37-1.14-.73 0-1.11.34-1.39 1.14L2.45 14.9c-.1.33-.15.52-.15.7 0 .42.32.71.8.71Zm1.74-3.58 1.1-3.5h.1l1.09 3.5H4.84Z\" fill=\"#4CC3FA\" /><path d=\"M10.93 15.14c0 .73.38 1.1 1.14 1.1h2.47c1.83 0 3.01-.96 3.01-2.45 0-1.18-.76-2-1.93-2.11v-.08a1.84 1.84 0 0 0 1.49-1.9c0-1.3-1-2.13-2.57-2.13h-2.47c-.76 0-1.14.37-1.14 1.1v6.47Zm1.7-3.96V8.86h1.52c.8 0 1.27.43 1.27 1.13 0 .76-.5 1.19-1.66 1.19h-1.13Zm0 3.77v-2.58h1.63c1 0 1.55.5 1.55 1.32 0 .82-.56 1.26-1.9 1.26h-1.28Z\" fill=\"#AAB2BF\" /><rect x=\"19\" y=\"6\" width=\"2\" height=\"12\" rx=\"1\" fill=\"#324350\" />",
);

export const avatarSvg = wrap(
  "<circle cx=\"12\" cy=\"12\" r=\"11\" fill=\"#FBCD2C\" /><mask id=\"mask0_1_3014\" style=\"mask-type:alpha\" maskUnits=\"userSpaceOnUse\" x=\"1\" y=\"1\" width=\"22\" height=\"22\" ><circle cx=\"12\" cy=\"12\" r=\"11\" fill=\"#A2845E\" /></mask><g mask=\"url(#mask0_1_3014)\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M12 17.8c1.72 0 3.25-1.44 4.09-3.6.52-.2 1.02-.86 1.24-1.7.3-1.1.24-2.09-.56-2.4-.08-3.83-1.6-5.31-4.77-5.31-3.18 0-4.69 1.48-4.77 5.32-.8.3-.86 1.28-.57 2.39.23.84.73 1.5 1.25 1.7.84 2.16 2.37 3.6 4.09 3.6Zm8.01 5.2c.33 0 .58-.3.46-.6-.86-2.14-4.33-3.74-8.47-3.74-4.14 0-7.61 1.6-8.47 3.74-.12.3.13.6.46.6H20Z\" fill=\"white\" /></g>",
);

export const backTopSvg = wrap(
  "<path d=\"M2.97 14.13 12 6l9.03 8.13a.5.5 0 0 1-.33.87H16v7H8v-7H3.3a.5.5 0 0 1-.33-.87Z\" fill=\"#4CC3FA\" /><rect x=\"3\" y=\"2\" width=\"18\" height=\"4\" rx=\"1\" fill=\"#AAB2BF\" />",
);

export const badgeSvg = wrap(
  "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M21 11.5A6.5 6.5 0 0 1 12.5 3H5a3 3 0 0 0-3 3v13a3 3 0 0 0 3 3h13a3 3 0 0 0 3-3v-7.5Z\" fill=\"#DDE3E8\" /><circle cx=\"18.5\" cy=\"5.5\" r=\"4.5\" fill=\"#FF7D95\" />",
);

export const badgeStarSvg = wrap(
  "<path d=\"M23 12a11 11 0 1 1-22 0 11 11 0 0 1 22 0Z\" fill=\"#FF7D95\" /><path d=\"M13.35 17.26c0-.07-.18-2.61-.33-3.56.76.6 2.92 2 2.98 2.01.24.14.5.2.75.18.63-.04 1.2-.44 1.23-1.2.08-.49-.1-.93-.6-1.18-.06-.05-2.41-1.15-3.33-1.51.92-.36 3.24-1.44 3.27-1.47.5-.25.74-.79.65-1.28-.04-.59-.57-1.1-1.25-1.14a1.2 1.2 0 0 0-.7.16c-.06.02-2.24 1.44-3 2.03.15-.95.33-3.47.33-3.54 0-.67-.6-1.26-1.34-1.26a1.3 1.3 0 0 0-1.34 1.31c0 .06.18 2.53.33 3.47-.77-.59-2.96-2.01-3.03-2.03-.2-.12-.44-.17-.7-.16-.63.04-1.2.52-1.23 1.14-.1.5.14 1.03.62 1.28.08.05 2.41 1.13 3.33 1.49-.92.36-3.3 1.47-3.36 1.51-.46.23-.7.67-.61 1.15.04.79.59 1.21 1.23 1.25.26.01.52-.04.75-.18.06-.02 2.23-1.42 2.98-2.03a83.1 83.1 0 0 0-.31 3.5c-.02.75.6 1.3 1.34 1.3.74 0 1.34-.59 1.34-1.24Z\" fill=\"white\" />",
);

export const bannerSvg = wrap(
  "<rect x=\"6\" y=\"19\" width=\"12\" height=\"1\" fill=\"#6A6F7F\" /><rect x=\"7.942\" y=\"0.897\" width=\"2\" height=\"22.2633\" rx=\"1\" transform=\"rotate(10 7.94241 0.896553)\" fill=\"#AAB2BF\" /><rect x=\"14.085\" y=\"1.229\" width=\"2\" height=\"22.3119\" rx=\"1\" transform=\"rotate(-10 14.0853 1.22887)\" fill=\"#AAB2BF\" /><rect x=\"1\" y=\"3\" width=\"22\" height=\"14\" rx=\"2\" fill=\"#FBCD2C\" /><rect x=\"4\" y=\"6\" width=\"16\" height=\"2\" fill=\"#324350\" /><rect x=\"4\" y=\"11\" width=\"9\" height=\"2\" fill=\"#324350\" />",
);

export const breadcrumbSvg = wrap(
  "<path d=\"M6 4h8l4 6.41a3 3 0 0 1 0 3.18L14 20H6V4Z\" fill=\"#AAB2BF\" /><path d=\"M2 7a3 3 0 0 1 3-3h2l4 6.41a3 3 0 0 1 0 3.18L7 20H5a3 3 0 0 1-3-3V7Z\" fill=\"#6A6F7F\" /><path d=\"M13 20h3.34a3 3 0 0 0 2.54-1.41l3.13-5a3 3 0 0 0 0-3.18l-3.13-5A3 3 0 0 0 16.34 4H13l4 6.41a3 3 0 0 1 0 3.18L13 20Z\" fill=\"#DDE3E8\" />",
);

export const buttonSvg = wrap(
  "<path d=\"M2 16.5A2.5 2.5 0 0 1 4.5 14h15a2.5 2.5 0 0 1 0 5h-15A2.5 2.5 0 0 1 2 16.5Z\" fill=\"#6A6F7F\" /><rect x=\"8\" y=\"12\" width=\"8\" height=\"2\" fill=\"#DDE3E8\" /><path d=\"M6 5.67c0-.93.65-1.74 1.58-1.87a33.07 33.07 0 0 1 8.84 0c.93.13 1.58.94 1.58 1.87V11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5.67Z\" fill=\"#F82C2C\" />",
);

export const calendarSvg = wrap(
  "<rect x=\"2.75\" y=\"2.75\" width=\"18.5\" height=\"18.5\" rx=\"3\" fill=\"white\" stroke=\"#AAB2BF\" stroke-width=\"1.5\" /><path d=\"M9.4 16.58c0 .91 1.14 1.75 2.63 1.75 1.66 0 2.83-.92 2.83-2.24a1.8 1.8 0 0 0-1.6-1.82v-.1c.76-.1 1.37-.86 1.37-1.67 0-1.18-1.07-2-2.6-2-1.43 0-2.5.81-2.5 1.7 0 .35.24.6.6.6.26 0 .45-.12.62-.4.29-.49.71-.74 1.26-.74.7 0 1.18.41 1.18 1.02 0 .6-.5 1.05-1.17 1.05h-.51a.56.56 0 0 0-.58.57c0 .35.25.6.58.6h.54c.8 0 1.35.46 1.35 1.14 0 .69-.53 1.13-1.36 1.13a1.6 1.6 0 0 1-1.43-.78c-.2-.3-.38-.4-.63-.4a.58.58 0 0 0-.58.6Z\" fill=\"#324350\" /><path d=\"M2 5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v4H2V5Z\" fill=\"#F82C2C\" /><path d=\"M9.97 7.5c.28 0 .44-.18.44-.5V4.12c0-.4-.2-.62-.56-.62-.3 0-.47.14-.64.5l-.79 1.77H8.4L7.61 4c-.18-.37-.35-.5-.64-.5-.35 0-.57.23-.57.61V7c0 .32.14.5.42.5.27 0 .43-.18.43-.5V5.02h.05l.66 1.49c.14.28.25.38.45.38s.3-.09.44-.38l.66-1.49h.05V7c0 .32.14.5.41.5Z\" fill=\"white\" /><path d=\"M11.35 7.5c.25 0 .39-.13.49-.46l.15-.47h1.32l.15.47c.1.32.24.46.5.46.27 0 .45-.16.45-.41 0-.1-.03-.22-.08-.38l-.87-2.55c-.16-.47-.37-.65-.79-.65-.41 0-.64.18-.8.65l-.86 2.55c-.07.2-.1.3-.1.4 0 .23.18.39.44.39Zm.83-1.62.45-1.5h.05l.44 1.5h-.94Z\" fill=\"white\" /><path d=\"M15.94 7.5c.29 0 .48-.2.47-.48l-.01-1.03 1-1.66c.11-.18.16-.3.16-.42a.41.41 0 0 0-.43-.41c-.2 0-.34.12-.46.35l-.71 1.31h-.04l-.69-1.31c-.12-.25-.26-.35-.46-.35-.26 0-.44.17-.44.43 0 .11.04.22.14.39l1.01 1.67-.02 1.03c0 .28.19.48.48.48Z\" fill=\"white\" />",
);

export const cardSvg = wrap(
  "<rect x=\"1\" y=\"4\" width=\"22\" height=\"16\" rx=\"2\" fill=\"#DDE3E8\" /><rect x=\"5\" y=\"8\" width=\"14\" height=\"4\" fill=\"#AAB2BF\" /><rect x=\"5\" y=\"14\" width=\"8\" height=\"2\" fill=\"#AAB2BF\" />",
);

export const carouselSvg = wrap(
  "<rect x=\"10.5\" y=\"7.5\" width=\"11\" height=\"11\" rx=\"2\" fill=\"#DDE3E8\" /><rect x=\"2.5\" y=\"7.5\" width=\"12\" height=\"11\" rx=\"2\" fill=\"#AAB2BF\" /><rect x=\"5\" y=\"5.5\" width=\"14\" height=\"13\" rx=\"2\" fill=\"#6A6F7F\" /><path d=\"M12.18 10.7a1.58 1.58 0 0 1 2.64 0l1.97 3.18c.59.94-.14 2.12-1.31 2.12h-3.96c-1.17 0-1.9-1.18-1.31-2.12l1.97-3.17Z\" fill=\"#DDE3E8\" /><circle cx=\"8.5\" cy=\"9.5\" r=\"1.5\" fill=\"white\" />",
);

export const cascaderSvg = wrap(
  "<path d=\"M2 3.55a1 1 0 0 1 1.41-.91L9 5.16V22l-5.82-2.63A2 2 0 0 1 2 17.55v-14Z\" fill=\"#4CC3FA\" /><path d=\"m15 2 5.82 2.63A2 2 0 0 1 22 6.45v14a1 1 0 0 1-1.41.91L15 18.84V2Z\" fill=\"#FBCD2C\" /><path d=\"M9 5.16 15 2v16.84L9 22V5.16Z\" fill=\"#324350\" />",
);

export const changelogSvg = wrap(
  "<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"#DDE3E8\" /><rect x=\"5\" y=\"6\" width=\"14\" height=\"2\" fill=\"#324350\" /><rect x=\"5\" y=\"11\" width=\"14\" height=\"2\" fill=\"#324350\" /><rect x=\"5\" y=\"16\" width=\"10\" height=\"2\" fill=\"#324350\" />",
);

export const chartSvg = wrap(
  "<path d=\"M21.9 11.25c.58 0 1.05-.5.95-1.06a11 11 0 0 0-9.04-9.04c-.57-.1-1.06.37-1.06.94v4.1c0 .5.37.91.84 1.07a5.01 5.01 0 0 1 3.15 3.15c.16.47.57.84 1.07.84h4.1Z\" fill=\"#4CC3FA\" style=\"fill:color(display-p3 0.2980 0.7647 0.9804);fill-opacity:1\" /><path d=\"M17.8 12.75c-.49 0-.9.37-1.06.84a5 5 0 0 1-6.97 2.89c-.45-.23-1-.2-1.34.15l-2.19 2.19c-.41.41-.39 1.09.1 1.42a10 10 0 0 0 15.5-6.42c.1-.57-.36-1.07-.94-1.07h-3.1Z\" fill=\"#6A6F7F\" style=\"fill:color(display-p3 0.4157 0.4353 0.4980);fill-opacity:1\" /><path d=\"M8.43 7.37c.35.35.9.38 1.34.15.2-.1.42-.19.64-.26.47-.16.84-.57.84-1.06V3.1c0-.58-.5-1.04-1.07-.94-1.4.26-2.71.82-3.85 1.6-.48.33-.5 1-.09 1.42l2.19 2.19Z\" fill=\"#DDE3E8\" style=\"fill:color(display-p3 0.8667 0.8902 0.9098);fill-opacity:1\" /><path d=\"M7.37 15.57c.35-.35.38-.9.15-1.34a4.98 4.98 0 0 1 0-4.46c.23-.45.2-1-.15-1.34L5.18 6.24c-.41-.41-1.09-.39-1.42.1a9.95 9.95 0 0 0 0 11.33c.33.48 1 .5 1.42.09l2.19-2.19Z\" fill=\"#AAB2BF\" style=\"fill:color(display-p3 0.6667 0.6980 0.7490);fill-opacity:1\" />",
);

export const chatSvg = wrap(
  "<path d=\"M18 5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v12.59a1 1 0 0 0 1.7.7l1.71-1.7A2 2 0 0 1 4.83 16H16a2 2 0 0 0 2-2V5Z\" fill=\"#DFDFE7\" /><path d=\"M4 2c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v12.59a1 1 0 0 1-1.7.7l-1.71-1.7a2 2 0 0 0-1.42-.59H6a2 2 0 0 1-2-2V2Z\" fill=\"#49C4FD\" /><rect x=\"14\" y=\"2.5\" width=\"4\" height=\"1.5\" fill=\"#F4CE2D\" /><rect x=\"8\" y=\"8.5\" width=\"10\" height=\"1.5\" fill=\"#F9FCFF\" /><rect x=\"8\" y=\"5.5\" width=\"10\" height=\"1.5\" fill=\"#F9FCFF\" />",
);

export const checkboxSvg = wrap(
  "<rect x=\"1.009\" y=\"3.1\" width=\"20\" height=\"20\" rx=\"3\" transform=\"rotate(-6 1.00949 3.10003)\" fill=\"#4CC3FA\" /><path d=\"m8.07 12.92 3.35 3.16 4.24-7.48\" stroke=\"white\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" />",
);

export const codeHighlightSvg = wrap(
  "<rect y=\"0.406\" width=\"22\" height=\"10\" rx=\"2\" fill=\"#49C4FD\" /><path d=\"M0 4.6h11v13H2a2 2 0 0 1-2-2v-11Z\" fill=\"#F9FCFF\" /><path d=\"M11 4.6h11v11a2 2 0 0 1-2 2h-9v-13Z\" fill=\"#F9FCFF\" /><path d=\"m7 8-3 3 3 3\" stroke=\"#F8CE27\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /><path d=\"m15 8 3 3-3 3\" stroke=\"#49C4FD\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /><path d=\"m12 8-2 6.5\" stroke=\"#E0E4E7\" stroke-width=\"1.5\" stroke-linecap=\"round\" />",
);

export const collapseSvg = wrap(
  "<rect x=\"2\" y=\"2\" width=\"20\" height=\"9\" rx=\"2\" fill=\"#DDE3E8\" /><rect x=\"2\" y=\"13\" width=\"20\" height=\"9\" rx=\"2\" fill=\"#DDE3E8\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M17 14.5a1 1 0 0 0-1 1v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1a1 1 0 0 0-1-1Z\" fill=\"#4CC3FA\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M17 3.5a1 1 0 0 0-1 1v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1a1 1 0 0 0-1-1Z\" fill=\"#4CC3FA\" />",
);

export const collapsibleSvg = wrap(
  "<path d=\"M2.72 5.45A1 1 0 0 1 3.62 4h16.76a1 1 0 0 1 .9 1.45L18 12H6L2.72 5.45Z\" fill=\"#DDE3E8\" /><path d=\"M2.72 18.55a1 1 0 0 0 .9 1.45h16.76a1 1 0 0 0 .9-1.45L18 12H6l-3.28 6.55Z\" fill=\"#6A6F7F\" /><path d=\"M12 2v8\" stroke=\"#4CC3FA\" stroke-width=\"2\" stroke-linecap=\"round\" /><path d=\"m9 7 3 3 3-3\" stroke=\"#4CC3FA\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /><path d=\"M12 22v-8\" stroke=\"#4CC3FA\" stroke-width=\"2\" stroke-linecap=\"round\" /><path d=\"m9 17 3-3 3 3\" stroke=\"#4CC3FA\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" />",
);

export const colorPlatteSvg = wrap(
  "<path d=\"M12 2a10 10 0 0 0 0 20 1.66 1.66 0 0 0 1.23-2.78 1.66 1.66 0 0 1 1.25-2.77h1.96A5.56 5.56 0 0 0 22 10.88C22 5.98 17.52 2 12 2Z\" fill=\"#DDE3E8\" stroke=\"#DDE3E8\" stroke-width=\"1.5\" /><circle cx=\"6\" cy=\"12\" r=\"2\" fill=\"#F82C2C\" /><circle cx=\"10.5\" cy=\"7\" r=\"2\" fill=\"#4CC3FA\" /><circle cx=\"17\" cy=\"9\" r=\"2\" fill=\"#3BCE4A\" />",
);

export const colorPlatteNewSvg = wrap(
  "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M23 12c0 3.54-2.87 3.97-5.51 4.36-1.46.22-2.86.42-3.66 1.14-.84.76-.52 1.9-.22 2.94.38 1.36.72 2.56-1.61 2.56a11 11 0 1 1 11-11Zm-2.3-.69a2.06 2.06 0 1 1-4.12 0 2.06 2.06 0 0 1 4.13 0Zm-5.72-3.44a2.06 2.06 0 1 0 0-4.12 2.06 2.06 0 0 0 0 4.13Zm-4.36-2.06a2.06 2.06 0 1 1-4.12 0 2.06 2.06 0 0 1 4.13 0ZM4.9 13.38a2.06 2.06 0 1 0 0-4.13 2.06 2.06 0 0 0 0 4.13Z\" fill=\"#0077FA\" />",
);

export const configSvg = wrap(
  "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M10.3 1a1 1 0 0 0-.98.78l-.67 2.95a8 8 0 0 0-1.27.74l-2.9-.9a1 1 0 0 0-1.16.46l-1.7 2.94a1 1 0 0 0 .19 1.24l2.22 2.06a8.1 8.1 0 0 0 0 1.46L1.81 14.8a1 1 0 0 0-.19 1.24l1.7 2.94a1 1 0 0 0 1.17.46l2.9-.9a8 8 0 0 0 1.26.74l.67 2.95c.1.46.51.78.98.78h3.4a1 1 0 0 0 .98-.78l.67-2.95c.45-.2.87-.46 1.27-.74l2.9.9a1 1 0 0 0 1.16-.46l1.7-2.94a1 1 0 0 0-.19-1.24l-2.22-2.06a8.1 8.1 0 0 0 0-1.46l2.22-2.06a1 1 0 0 0 .19-1.24l-1.7-2.94a1 1 0 0 0-1.17-.46l-2.9.9a8 8 0 0 0-1.26-.74l-.67-2.95A1 1 0 0 0 13.7 1h-3.4Z\" fill=\"#DDE3E8\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z\" fill=\"#AAB2BF\" /><circle cx=\"12\" cy=\"12\" r=\"3\" fill=\"#324350\" />",
);

export const darkModeSvg = wrap(
  "<circle cx=\"12\" cy=\"12\" r=\"11\" fill=\"#324350\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M18 15.95a7.29 7.29 0 0 1-7.41-11.12A7.3 7.3 0 1 0 18 15.95Z\" fill=\"#FBCD2C\" />",
);

export const datePickerSvg = wrap(
  "<g clip-path=\"url(#clip0_1_3038)\"><rect x=\"1\" y=\"4\" width=\"22\" height=\"16\" rx=\"3\" fill=\"#DDE3E8\" /><path d=\"M6.5 11H9v2.5H6.5V11Zm6 4.5h-7V10h7v5.5Zm0-8H12v-1h-1v1H7v-1H6v1h-.5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1Z\" fill=\"#4CC3FA\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M13.5 12.8a1 1 0 0 1 1.7-.71l8.71 8.7a1 1 0 0 1-.7 1.71h-3.96a2 2 0 0 0-1.5.67l-2.5 2.8a1 1 0 0 1-1.75-.66V12.79Zm4.18 8.2H22l-7-7v10l2.68-3Z\" fill=\"white\" /><path d=\"M15 24V14l7 7h-4.32L15 24Z\" fill=\"#324350\" /></g><defs><clipPath id=\"clip0_1_3038\"><rect width=\"24\" height=\"24\" fill=\"white\" /></clipPath></defs>",
);

export const descriptionsSvg = wrap(
  "<rect x=\"2.75\" y=\"2.75\" width=\"18.5\" height=\"18.5\" rx=\"3\" fill=\"white\" stroke=\"#AAB2BF\" stroke-width=\"1.5\" /><rect x=\"5\" y=\"6\" width=\"4\" height=\"2\" fill=\"#AAB2BF\" /><rect x=\"5\" y=\"11\" width=\"4\" height=\"2\" fill=\"#AAB2BF\" /><rect x=\"5\" y=\"16\" width=\"2\" height=\"2\" fill=\"#AAB2BF\" /><rect x=\"11\" y=\"11\" width=\"4\" height=\"2\" fill=\"#324350\" /><rect x=\"11\" y=\"16\" width=\"8\" height=\"2\" fill=\"#324350\" /><rect x=\"11\" y=\"6\" width=\"8\" height=\"2\" fill=\"#324350\" />",
);

export const dividerSvg = wrap(
  "<rect x=\"2.75\" y=\"2.75\" width=\"18.5\" height=\"18.5\" rx=\"3\" fill=\"white\" stroke=\"#AAB2BF\" stroke-width=\"1.5\" /><rect x=\"5\" y=\"11\" width=\"4\" height=\"2\" fill=\"#4CC3FA\" /><rect x=\"15\" y=\"11\" width=\"4\" height=\"2\" fill=\"#4CC3FA\" /><rect x=\"10\" y=\"11\" width=\"4\" height=\"2\" fill=\"#324350\" /><rect x=\"10\" y=\"11\" width=\"4\" height=\"2\" fill=\"#4CC3FA\" /><rect x=\"5\" y=\"16\" width=\"14\" height=\"2\" fill=\"#324350\" /><rect x=\"5\" y=\"6\" width=\"14\" height=\"2\" fill=\"#324350\" />",
);

export const dropdownSvg = wrap(
  "<rect x=\"1.009\" y=\"3.1\" width=\"20\" height=\"20\" rx=\"3\" transform=\"rotate(-6 1.00949 3.10007)\" fill=\"#6A6F7F\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M5.65 9.59a1.5 1.5 0 0 1 2.11-.22l4.33 3.5 3.5-4.33a1.5 1.5 0 0 1 2.34 1.9l-4.45 5.49a1.5 1.5 0 0 1-2.11.22l-5.5-4.45a1.5 1.5 0 0 1-.22-2.11Z\" fill=\"white\" />",
);

export const emptySvg = wrap(
  "<path d=\"M5.44 9.08A2 2 0 0 1 7.22 8h9.56a2 2 0 0 1 1.78 1.08l3.37 6.56-19.8-.13 3.31-6.43Z\" fill=\"#AAB2BF\" /><path d=\"M6.73 11.32a1 1 0 0 1 .9-.58h8.73a1 1 0 0 1 .91.58L19 15H5l1.73-3.68Z\" fill=\"#6A6F7F\" /><path d=\"M2 16a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5Z\" fill=\"#DDE3E8\" /><rect x=\"11\" y=\"1\" width=\"2\" height=\"5\" rx=\"1\" fill=\"#AAB2BF\" /><rect x=\"3.879\" y=\"4.293\" width=\"2\" height=\"4.3448\" rx=\"1\" transform=\"rotate(-45 3.87866 4.29285)\" fill=\"#AAB2BF\" /><rect x=\"18.573\" y=\"2.879\" width=\"2\" height=\"4.2175\" rx=\"1\" transform=\"rotate(45 18.5731 2.87866)\" fill=\"#AAB2BF\" /><circle cx=\"12\" cy=\"18.5\" r=\"1.5\" fill=\"#AAB2BF\" />",
);

export const faqSvg = wrap(
  "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M19 10a3 3 0 0 1 3 3v10l-3.33-2H8a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3h11Z\" fill=\"#6A6F7F\" /><path d=\"M11.76 18.04c.35 0 .53-.17.66-.63l.2-.63h1.8l.2.63c.13.45.33.63.67.63.37 0 .62-.22.62-.56 0-.13-.04-.29-.1-.5l-1.19-3.46c-.21-.64-.5-.9-1.07-.9-.56 0-.87.26-1.08.9l-1.18 3.45c-.09.26-.12.41-.12.54 0 .31.24.53.6.53Zm1.13-2.2.6-2.02h.07l.6 2.02h-1.27Z\" fill=\"white\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M5 2a3 3 0 0 0-3 3v12l3.53-4H16a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Z\" fill=\"#FF7D95\" /><path d=\"M12.18 10.62c.32 0 .54-.23.54-.54 0-.13-.02-.24-.16-.45l-.13-.18c.4-.4.62-1 .62-1.77v-.64c0-1.54-.89-2.47-2.35-2.47-1.49 0-2.36.93-2.36 2.47v.64c0 1.52.86 2.44 2.36 2.44.26 0 .5-.04.71-.1l.13.17c.2.3.4.43.64.43ZM9.63 7.75v-.72c0-.88.4-1.4 1.07-1.4.63 0 1.05.52 1.05 1.4v.72c0 .33-.06.56-.17.75l-.09-.13a.47.47 0 0 0-.36-.17c-.27 0-.47.2-.47.48 0 .1.04.21.09.3l.08.12a.59.59 0 0 1-.2.04c-.63-.04-1-.54-1-1.39Z\" fill=\"white\" />",
);

export const formSvg = wrap(
  "<g clip-path=\"url(#clip0_1_3028)\"><rect x=\"3.051\" y=\"2.888\" width=\"16\" height=\"21\" rx=\"2\" transform=\"rotate(-6 3.05081 2.88827)\" fill=\"#FF7D95\" /><rect x=\"5.249\" y=\"4.668\" width=\"12\" height=\"17\" rx=\"1\" transform=\"rotate(-6 5.2489 4.66825)\" fill=\"white\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M12.3.91 13.9.74a1 1 0 0 1 1.1.9l.3 2.98-7.95.83-.31-2.98a1 1 0 0 1 .89-1.1l1.58-.16a1.5 1.5 0 0 1 2.8-.3Z\" fill=\"#AAB2BF\" /><rect x=\"7.656\" y=\"8.437\" width=\"8\" height=\"2\" transform=\"rotate(-6 7.65607 8.43729)\" fill=\"#DDE3E8\" /><rect x=\"8.074\" y=\"12.415\" width=\"8\" height=\"2\" transform=\"rotate(-6 8.07417 12.4154)\" fill=\"#DDE3E8\" /><rect x=\"8.492\" y=\"16.393\" width=\"3.35025\" height=\"2\" transform=\"rotate(-6 8.49229 16.3935)\" fill=\"#DDE3E8\" /><path d=\"m20.03 9.95-4.92 4.96c-.1.09-.17.2-.21.31l-.86 2.13c-.16.39.23.77.61.62l2.16-.86a.96.96 0 0 0 .32-.2l4.92-4.97-2.02-2Z\" fill=\"#6A6F7F\" /><path d=\"m22.05 11.94.67-.67a.93.93 0 0 0 0-1.33l-.67-.66a.96.96 0 0 0-1.35 0l-.67.67 2.02 2Z\" fill=\"#6A6F7F\" /></g><defs><clipPath id=\"clip0_1_3028\"><rect width=\"24\" height=\"24\" fill=\"white\" /></clipPath></defs>",
);

export const gettingStartedSvg = wrap(
  "<circle cx=\"12\" cy=\"12\" r=\"11\" fill=\"#4CC3FA\" /><path d=\"M16.9 11.33c.37.38.37.96 0 1.34a22.88 22.88 0 0 1-6.71 4.39 1.01 1.01 0 0 1-1.42-.83 33.04 33.04 0 0 1 0-8.46c.1-.69.77-1.1 1.41-.82a22.89 22.89 0 0 1 6.72 4.38Z\" fill=\"white\" />",
);

export const gridSvg = wrap(
  "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M22 2H2v20h20V2Zm-2 2H4v16h16V4Z\" fill=\"#6A6F7F\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M22 9h-2v6h2V9ZM2 15h2V9H2v6Z\" fill=\"#DDE3E8\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M15 22v-2H9v2h6ZM9 2v2h6V2H9Z\" fill=\"#DDE3E8\" /><rect x=\"7\" y=\"7\" width=\"3\" height=\"3\" fill=\"#6A6F7F\" /><rect x=\"7\" y=\"10\" width=\"3\" height=\"4\" fill=\"#DDE3E8\" /><rect x=\"14\" y=\"10\" width=\"3\" height=\"4\" fill=\"#DDE3E8\" /><rect x=\"10\" y=\"7\" width=\"4\" height=\"3\" fill=\"#DDE3E8\" /><rect x=\"10\" y=\"14\" width=\"4\" height=\"3\" fill=\"#DDE3E8\" /><rect x=\"14\" y=\"7\" width=\"3\" height=\"3\" fill=\"#6A6F7F\" /><rect x=\"7\" y=\"14\" width=\"3\" height=\"3\" fill=\"#6A6F7F\" /><rect x=\"14\" y=\"14\" width=\"3\" height=\"3\" fill=\"#6A6F7F\" />",
);

export const heartSvg = wrap(
  "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M20.5 13.99 12.01 5.5l.75-.74a6 6 0 1 1 8.48 8.48l-.74.75Z\" fill=\"#F82C2C\" /><path d=\"M11.24 4.76a6 6 0 1 0-8.48 8.48L12 22.5 20.5 14c1.3-1.25 1.84-2 2.16-3-2.66 3-4.16 1-10.65-5.5-.5-.5-.77-.74-.77-.74Z\" fill=\"#FF7D95\" />",
);

export const highlightSvg = wrap(
  "<rect x=\"3\" y=\"8\" width=\"18\" height=\"8\" rx=\"1\" fill=\"#FAC800\" /><path d=\"M4.44 4.44a.96.96 0 0 0-.28.68v3.06a.96.96 0 0 0 1.93 0v-2.1h4.95v11.83h-2.1a.96.96 0 0 0-.68 1.65l.14-.14-.14.14c.18.18.43.28.68.28h6.12a.96.96 0 0 0 0-1.93h-2.1V6.1h4.95v2.1a.96.96 0 0 0 1.93 0V5.11a.96.96 0 0 0-.96-.96H5.13c-.26 0-.5.1-.69.28Z\" fill=\"#6A6F7F\" stroke=\"#6A6F7F\" stroke-width=\"0.4\" />",
);

export const imageSvg = wrap(
  "<path d=\"M4 4h7v7H4V4Z\" fill=\"#FBCD2C\" /><path d=\"M3 11h17v9H3v-9Z\" fill=\"#3BCE4A\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm6.7 4.2a1 1 0 0 0-1.4 0L11 16l-1.3-1.3a1 1 0 0 0-1.4 0L5 18v1h14v-5l-2.3-2.3Z\" fill=\"#324350\" />",
);

export const inputSvg = wrap(
  "<path d=\"M12 8.5S12.5 6 11 4 8 2 8 2\" stroke=\"#AAB2BF\" stroke-width=\"2\" stroke-linecap=\"round\" /><rect x=\"1\" y=\"6\" width=\"22\" height=\"15\" rx=\"2\" fill=\"#DDE3E8\" /><rect x=\"3\" y=\"8\" width=\"3\" height=\"3\" rx=\"1.5\" fill=\"#6A6F7F\" /><rect x=\"8\" y=\"8\" width=\"3\" height=\"3\" rx=\"1.5\" fill=\"#6A6F7F\" /><rect x=\"13\" y=\"8\" width=\"3\" height=\"3\" rx=\"1.5\" fill=\"#6A6F7F\" /><rect x=\"18\" y=\"8\" width=\"3\" height=\"3\" rx=\"1.5\" fill=\"#6A6F7F\" /><rect x=\"3\" y=\"12\" width=\"3\" height=\"3\" rx=\"1.5\" fill=\"#6A6F7F\" /><rect x=\"8\" y=\"12\" width=\"3\" height=\"3\" rx=\"1.5\" fill=\"#6A6F7F\" /><rect x=\"13\" y=\"12\" width=\"3\" height=\"3\" rx=\"1.5\" fill=\"#6A6F7F\" /><rect x=\"18\" y=\"12\" width=\"3\" height=\"3\" rx=\"1.5\" fill=\"#6A6F7F\" /><rect x=\"6\" y=\"17\" width=\"12\" height=\"2\" rx=\"1\" fill=\"#6A6F7F\" />",
);

export const inputNumberSvg = wrap(
  "<rect x=\"1\" y=\"4\" width=\"22\" height=\"16\" rx=\"3\" fill=\"#DDE3E8\" /><path d=\"M15 4h5a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-5V4Z\" fill=\"#4CC3FA\" /><path d=\"m19 7.5 2 3h-4l2-3Z\" fill=\"white\" /><path d=\"m19 16.5-2-3h4l-2 3Z\" fill=\"white\" /><path d=\"M8.36 15.78c-.97 0-1.65-.6-1.65-1.43s.68-1.43 1.65-1.43c.96 0 1.65.6 1.65 1.43s-.7 1.43-1.65 1.43Zm0-4.05c-.8 0-1.37-.53-1.37-1.25s.57-1.24 1.37-1.24c.8 0 1.37.52 1.37 1.24 0 .73-.57 1.25-1.37 1.25ZM8.34 17c2 0 3.37-1.03 3.37-2.55 0-1.06-.73-1.93-1.82-2.15v-.1c.93-.28 1.48-1 1.48-1.92C11.37 8.95 10.13 8 8.36 8c-1.77 0-3.01.95-3.01 2.3 0 .91.54 1.63 1.47 1.91v.1A2.18 2.18 0 0 0 5 14.47C5 15.99 6.34 17 8.34 17Z\" fill=\"#324350\" />",
);

export const introSvg = wrap(
  "<path d=\"M3.13 8.1A3 3 0 0 0 2 10.44V19a3 3 0 0 0 3 3h4v-6a3 3 0 1 1 6 0v6h4a3 3 0 0 0 3-3v-8.56a3 3 0 0 0-1.13-2.34L13.25 2a2 2 0 0 0-2.5 0L3.13 8.1Z\" fill=\"#DDE3E8\" /><path d=\"M9 15v7h6v-7a3 3 0 1 0-6 0Z\" fill=\"#6A6F7F\" />",
);

export const jsonViewerSvg = wrap(
  "<path d=\"M2 5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5Z\" fill=\"#DDE3E8\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M12.16 4.98a.87.87 0 1 0-1.74-.21L9.26 14.1a.88.88 0 0 0 1.73.22l1.17-9.34Zm.85 1.03a.87.87 0 0 1 1.23 0l2.92 2.91c.34.34.34.9 0 1.24l-2.92 2.92a.87.87 0 1 1-1.23-1.24l2.3-2.3-2.3-2.3a.88.88 0 0 1 0-1.23Z\" fill=\"#AAB2BF\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M13 6a.87.87 0 0 1 1.24 0l2.92 2.92c.34.34.34.9 0 1.24l-2.92 2.92a.87.87 0 1 1-1.23-1.24l2.3-2.3-2.3-2.3a.88.88 0 0 1 0-1.23Z\" fill=\"#4CC3FA\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M8.41 6a.88.88 0 0 0-1.24 0L4.26 8.93a.88.88 0 0 0 0 1.24l2.91 2.92a.88.88 0 1 0 1.24-1.24l-2.3-2.3 2.3-2.3a.88.88 0 0 0 0-1.23Z\" fill=\"#FBCD2C\" /><path d=\"m18.46 11.62 2.91 2.92 1.22-1.22c.46-.45.46-1.19 0-1.65l-1.27-1.26a1.17 1.17 0 0 0-1.64 0l-1.22 1.21Z\" fill=\"#6A6F7F\" /><path d=\"m11.31 21.33.98-3.43c.03-.1.08-.19.15-.26l5.14-5.14 2.92 2.92-5.14 5.14a.58.58 0 0 1-.26.15l-3.43.98a.3.3 0 0 1-.36-.36Z\" fill=\"#6A6F7F\" />",
);

export const layoutSvg = wrap(
  "<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"#DDE3E8\" /><rect x=\"5\" y=\"5\" width=\"14\" height=\"4\" fill=\"#6A6F7F\" /><rect x=\"11\" y=\"11\" width=\"8\" height=\"3\" fill=\"#AAB2BF\" /><rect x=\"11\" y=\"16\" width=\"8\" height=\"3\" fill=\"#AAB2BF\" /><rect x=\"5\" y=\"11\" width=\"4\" height=\"8\" fill=\"#AAB2BF\" />",
);

export const listSvg = wrap(
  "<path d=\"M2 4a1 1 0 0 1 1-1h3v5H3a1 1 0 0 1-1-1V4Z\" fill=\"#0077FA\" /><path d=\"M8 3h13a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H8V3Z\" fill=\"#4CC3FA\" /><path d=\"M2 11a1 1 0 0 1 1-1h3v5H3a1 1 0 0 1-1-1v-3Z\" fill=\"#AAB2BF\" /><path d=\"M8 10h13a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H8v-5Z\" fill=\"#DDE3E8\" /><path d=\"M2 18a1 1 0 0 1 1-1h3v5H3a1 1 0 0 1-1-1v-3Z\" fill=\"#AAB2BF\" /><path d=\"M8 17h13a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H8v-5Z\" fill=\"#DDE3E8\" />",
);

export const localeProviderSvg = wrap(
  "<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"#DDE3E8\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M8.4 4.14c-.5.3-.68.94-.39 1.44l.25.44H5.13C4.5 6.02 4 6.49 4 7.07c0 .59.5 1.06 1.13 1.06h1.33c0 1.73.6 3.32 1.59 4.58-.78.44-1.68.7-2.64.7a1.06 1.06 0 1 0 0 2.11c1.57 0 3.03-.49 4.22-1.32a7.36 7.36 0 0 0 4.23 1.32 1.06 1.06 0 1 0 0-2.1c-.96 0-1.87-.27-2.64-.71a7.36 7.36 0 0 0 1.58-4.58h1.34c.62 0 1.13-.47 1.13-1.06 0-.58-.5-1.05-1.13-1.05H10.7l-.86-1.5c-.29-.5-.93-.67-1.44-.38Zm2.29 4H8.58c0 1.18.39 2.28 1.05 3.16a5.26 5.26 0 0 0 1.06-3.17Z\" fill=\"#4CC3FA\" /><path d=\"M13 19c.58 0 .9-.3 1.11-1.05l.35-1.05h3.03l.34 1.05c.22.74.55 1.05 1.13 1.05.63 0 1.04-.36 1.04-.93 0-.23-.06-.49-.18-.85l-1.98-5.75c-.37-1.05-.87-1.47-1.82-1.47-.95 0-1.46.42-1.82 1.47l-1.99 5.75c-.15.44-.21.68-.21.9 0 .52.4.88 1 .88Zm1.9-3.66L15.94 12h.1l1.02 3.35H14.9Z\" fill=\"#324350\" />",
);

export const lottieSvg = wrap(
  "<rect width=\"22\" height=\"18\" rx=\"2\" fill=\"#F9FCFF\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M18 0h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2V0Zm3 2v2h-2V2h2Zm0 6V6h-2v2h2Zm0 2v2h-2v-2h2Zm0 6v-2h-2v2h2Z\" fill=\"#AEB2BE\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M0 2C0 .9.9 0 2 0h2v18H2a2 2 0 0 1-2-2V2Zm3 0v2H1V2h2Zm0 6V6H1v2h2Zm0 2v2H1v-2h2Zm0 6v-2H1v2h2Z\" fill=\"#AEB2BE\" /><path d=\"M14.5 5c-2 0-4 .36-4 4 0 3.5-1.5 5-4 5\" stroke=\"#AEB2BE\" /><rect x=\"14\" y=\"4\" width=\"2\" height=\"2\" fill=\"#F77C93\" /><rect x=\"6\" y=\"13\" width=\"2\" height=\"2\" fill=\"#F8CE27\" /><path d=\"M6.83 9.21c0-.01.03-.02.04 0l.3.51.02.01.6.1c.01 0 .02.03 0 .04l-.51.3-.01.02-.1.6c0 .01-.03.02-.04 0l-.3-.51-.02-.01-.6-.1a.02.02 0 0 1 0-.04l.51-.3.01-.02.1-.6Z\" fill=\"#F8CE27\" />",
);

export const markdownSvg = wrap(
  "<path d=\"M0 14h22v2a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2Z\" fill=\"#6A6F7F\" /><path d=\"M0 2C0 .9.9 0 2 0h18a2 2 0 0 1 2 2v12H0V2Z\" fill=\"#DDE3E8\" /><rect opacity=\"0.5\" x=\"18\" y=\"15\" width=\"2\" height=\"2\" rx=\"1\" fill=\"#DDE3E8\" /><rect x=\"3\" y=\"5\" width=\"5\" height=\"1.5\" fill=\"#6A6F7F\" /><rect x=\"3\" y=\"9\" width=\"7\" height=\"1.5\" fill=\"#6A6F7F\" /><rect x=\"12\" y=\"4\" width=\"7\" height=\"7\" rx=\"1\" fill=\"#F8CE27\" />",
);

export const modalSvg = wrap(
  "<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"#AAB2BF\" /><rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"1\" fill=\"white\" /><rect x=\"6\" y=\"13\" width=\"5\" height=\"3\" rx=\"1\" fill=\"#AAB2BF\" /><rect x=\"13\" y=\"13\" width=\"5\" height=\"3\" rx=\"1\" fill=\"#4CC3FA\" />",
);

export const navigationSvg = wrap(
  "<g clip-path=\"url(#clip0_1_3057)\"><circle cx=\"12\" cy=\"12\" r=\"11\" transform=\"rotate(-45 12 12)\" fill=\"#DDE3E8\" /><path d=\"m4.95 12.24 11.87-5.32-4.58 12.17-1.73-5.46-5.56-1.4Z\" fill=\"#324350\" /></g><defs><clipPath id=\"clip0_1_3057\"><rect width=\"24\" height=\"24\" fill=\"white\" /></clipPath></defs>",
);

export const notificationSvg = wrap(
  "<g clip-path=\"url(#clip0_1_3040)\"><circle cx=\"13.0623\" cy=\"19.0623\" r=\"2.78627\" transform=\"rotate(-6 13.0623 19.0623)\" fill=\"#324350\" /><path d=\"M11.16.96c-.99.1-1.93.71-1.83 1.7l.07.69c-2.5.93-3.66 3.42-3.37 6.2l.32 2.98c.28 2.65-1.15 3.78-2.37 5.34-.58.75.02 1.95.96 1.85l16.21-1.7c.94-.1 1.28-1.4.56-2.01-1.52-1.28-3.15-2.08-3.43-4.73l-.31-2.99c-.3-2.78-1.94-4.97-4.59-5.36l-.07-.68c-.1-1-1.15-1.4-2.15-1.29Z\" fill=\"#FBCD2C\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M18.42 4.9c-.31-.52-.84-.98-1.87-1.5a1 1 0 0 1 .9-1.78c1.19.6 2.1 1.27 2.69 2.26.58.98.79 2.15.86 3.58a1 1 0 0 1-2 .1 5.65 5.65 0 0 0-.58-2.65Z\" fill=\"#DDE3E8\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M3.35 12.68c.15-.67.11-1.4-.14-2.45a1 1 0 1 1 1.95-.46c.28 1.21.38 2.25.15 3.32a9.26 9.26 0 0 1-1.48 3.17 1 1 0 1 1-1.66-1.1 7.34 7.34 0 0 0 1.18-2.48Z\" fill=\"#DDE3E8\" /></g><defs><clipPath id=\"clip0_1_3040\"><rect width=\"24\" height=\"24\" fill=\"white\" /></clipPath></defs>",
);

export const overflowSvg = wrap(
  "<rect x=\"1\" y=\"4\" width=\"22\" height=\"16\" rx=\"3\" fill=\"#DDE3E8\" /><circle cx=\"6\" cy=\"12\" r=\"2\" fill=\"#6A6F7F\" /><circle cx=\"12\" cy=\"12\" r=\"2\" fill=\"#6A6F7F\" /><circle cx=\"18\" cy=\"12\" r=\"2\" fill=\"#6A6F7F\" />",
);

export const paginationSvg = wrap(
  "<path d=\"M1 8a3 3 0 0 1 3-3h8v14H4a3 3 0 0 1-3-3V8Z\" fill=\"#6A6F7F\" /><path d=\"m8 9-3 3 3 3\" stroke=\"white\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /><path d=\"M12 5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-8V5Z\" fill=\"#DDE3E8\" /><path d=\"m16 9 3 3-3 3\" stroke=\"#AAB2BF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" />",
);

export const pincodeSvg = wrap(
  "<rect width=\"22\" height=\"16\" rx=\"2\" fill=\"#4CC3FA\" /><rect x=\"3\" y=\"4\" width=\"16\" height=\"8\" rx=\"1\" fill=\"white\" /><circle cx=\"6.5\" cy=\"8\" r=\"1\" fill=\"#4CC3FA\" /><circle cx=\"9.5\" cy=\"8\" r=\"1\" fill=\"#4CC3FA\" /><circle cx=\"12.5\" cy=\"8\" r=\"1\" fill=\"#4CC3FA\" /><circle cx=\"15.5\" cy=\"8\" r=\"1\" fill=\"#4CC3FA\" /><path d=\"M3 7V4.5c0-.28.22-.5.5-.5H6\" stroke=\"#F8CE27\" stroke-width=\"1.5\" stroke-linecap=\"square\" stroke-linejoin=\"round\" /><path d=\"M19 9v2.5a.5.5 0 0 1-.5.5H16\" stroke=\"#F8CE27\" stroke-width=\"1.5\" stroke-linecap=\"square\" stroke-linejoin=\"round\" />",
);

export const popconfirmSvg = wrap(
  "<rect x=\"5\" y=\"8\" width=\"17\" height=\"14\" rx=\"2\" fill=\"#AAB2BF\" /><path d=\"M8.47 2.3a.6.6 0 0 0-1.04 0L5.83 5H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h13a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-6.92L8.47 2.3Z\" fill=\"#DDE3E8\" /><rect x=\"7\" y=\"13\" width=\"4\" height=\"3\" rx=\"1\" fill=\"#4CC3FA\" /><rect x=\"13\" y=\"13\" width=\"4\" height=\"3\" rx=\"1\" fill=\"#324350\" />",
);

export const popoverSvg = wrap(
  "<rect x=\"9\" y=\"9\" width=\"13\" height=\"13\" rx=\"2\" fill=\"#6A6F7F\" /><rect x=\"2\" y=\"7\" width=\"12\" height=\"12\" rx=\"2\" fill=\"#AAB2BF\" /><rect x=\"8\" y=\"2\" width=\"11\" height=\"11\" rx=\"2\" fill=\"#DDE3E8\" />",
);

export const progressSvg = wrap(
  "<circle cx=\"12\" cy=\"12\" r=\"8\" stroke=\"#3BCE4A\" stroke-width=\"6\" /><path d=\"M12.14 4A7.93 7.93 0 0 1 20 12c0 4.42-3.52 8-7.86 8A7.8 7.8 0 0 1 6 17\" stroke=\"#3BCE4A\" stroke-width=\"6\" stroke-linecap=\"round\" />",
);

export const radioSvg = wrap(
  "<circle cx=\"12\" cy=\"12\" r=\"11\" fill=\"#4CC3FA\" /><circle cx=\"12\" cy=\"12\" r=\"5\" fill=\"white\" />",
);

export const ratingSvg = wrap(
  "<g clip-path=\"url(#clip0_1_3049)\"><path d=\"M7.93 5.5a.83.83 0 0 1 1.36-.28l3.62 3.62 5.13.27c.6.03.98.68.7 1.22l-2.37 4.52 1.3 4.88a.83.83 0 0 1-.96 1.03l-5.1-1-4.25 2.96a.83.83 0 0 1-1.3-.56l-.76-4.99-3.98-3.2a.83.83 0 0 1 .15-1.4l4.6-2.3L7.93 5.5Z\" fill=\"#FBCD2C\" /><path d=\"M19.94 1.14c.2-.16.5-.06.57.19l.55 2.14 1.85 1.22c.22.15.22.47 0 .6l-1.87 1.18-.58 2.1a.36.36 0 0 1-.59.17L18.2 7.25l-2.24.17a.36.36 0 0 1-.36-.49l.8-2.02-.77-2.07c-.1-.24.1-.5.36-.48l2.21.15 1.74-1.37Z\" fill=\"#DDE3E8\" /></g><defs><clipPath id=\"clip0_1_3049\"><rect width=\"24\" height=\"24\" fill=\"white\" /></clipPath></defs>",
);

export const scrollListSvg = wrap(
  "<rect x=\"2.75\" y=\"2.75\" width=\"18.5\" height=\"18.5\" rx=\"3\" fill=\"white\" stroke=\"#AAB2BF\" stroke-width=\"1.5\" /><path d=\"M16 2h3a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3h-3V2Z\" fill=\"#6A6F7F\" /><rect x=\"3.5\" y=\"7\" width=\"12.5\" height=\"5\" fill=\"#4CC3FA\" /><path d=\"M3.5 17H16v3.5H5.5a2 2 0 0 1-2-2V17Z\" fill=\"#DDE3E8\" /><path d=\"m19 4 1.3 2.25h-2.6L19 4Z\" fill=\"#AAB2BF\" /><path d=\"M19 20.25 17.7 18h2.6L19 20.25Z\" fill=\"#AAB2BF\" /><rect x=\"18\" y=\"8\" width=\"2\" height=\"6\" rx=\"1\" fill=\"#DDE3E8\" />",
);

export const selectSvg = wrap(
  "<g clip-path=\"url(#clip0_1_3050)\"><rect x=\"2\" y=\"2\" width=\"16\" height=\"5\" rx=\"0.5\" fill=\"#DDE3E8\" /><rect x=\"2\" y=\"17\" width=\"16\" height=\"5\" rx=\"0.5\" fill=\"#DDE3E8\" /><rect x=\"6\" y=\"9\" width=\"16\" height=\"6\" rx=\"0.5\" fill=\"#FBCD2C\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M12.5 10.8a1 1 0 0 1 1.7-.71l8.71 8.7a1 1 0 0 1-.7 1.71h-3.96a2 2 0 0 0-1.5.67l-2.5 2.8a1 1 0 0 1-1.75-.66V10.79Zm4.18 8.2H21l-7-7v10l2.68-3Z\" fill=\"white\" /><path d=\"M14 22V12l7 7h-4.32L14 22Z\" fill=\"#324350\" /></g><defs><clipPath id=\"clip0_1_3050\"><rect width=\"24\" height=\"24\" fill=\"white\" /></clipPath></defs>",
);

export const sideSheetSvg = wrap(
  "<path d=\"M2 5a3 3 0 0 1 3-3h9v20H5a3 3 0 0 1-3-3V5Z\" fill=\"#DDE3E8\" /><path d=\"M14 2h5a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3h-5V2Z\" fill=\"#4CC3FA\" /><rect x=\"11\" y=\"8\" width=\"2\" height=\"8\" rx=\"1\" fill=\"#AAB2BF\" />",
);

export const skeletonSvg = wrap(
  "<rect x=\"2\" y=\"11\" width=\"21\" height=\"3\" fill=\"#DDE3E8\" /><rect x=\"2\" y=\"15\" width=\"21\" height=\"3\" fill=\"#DDE3E8\" /><rect x=\"11\" y=\"2\" width=\"12\" height=\"3\" fill=\"#AAB2BF\" /><rect x=\"11\" y=\"6\" width=\"9\" height=\"3\" fill=\"#AAB2BF\" /><rect x=\"2\" y=\"19\" width=\"11\" height=\"3\" fill=\"#DDE3E8\" /><rect x=\"2\" y=\"2\" width=\"7\" height=\"7\" fill=\"#6A6F7F\" />",
);

export const sliderSvg = wrap(
  "<rect x=\"5\" y=\"4\" width=\"17\" height=\"2\" rx=\"1\" fill=\"#AAB2BF\" /><rect x=\"2\" y=\"11\" width=\"18\" height=\"2\" rx=\"1\" fill=\"#4CC3FA\" /><rect x=\"5\" y=\"18\" width=\"17\" height=\"2\" rx=\"1\" fill=\"#AAB2BF\" /><circle cx=\"5.5\" cy=\"5\" r=\"3.5\" fill=\"#DDE3E8\" /><circle cx=\"18.5\" cy=\"12\" r=\"3.5\" fill=\"#DDE3E8\" /><circle cx=\"5.5\" cy=\"19\" r=\"3.5\" fill=\"#DDE3E8\" />",
);

export const spaceSvg = wrap(
  "<rect x=\"1\" y=\"2\" width=\"2\" height=\"20\" rx=\"1\" fill=\"#DDE3E8\" /><rect x=\"21\" y=\"2\" width=\"2\" height=\"20\" rx=\"1\" fill=\"#DDE3E8\" /><path d=\"M6 12h12\" stroke=\"#4CC3FA\" stroke-width=\"2\" stroke-linecap=\"round\" /><path d=\"m15 9 3 3-3 3\" stroke=\"#4CC3FA\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /><path d=\"m9 9-3 3 3 3\" stroke=\"#4CC3FA\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" />",
);

export const spinSvg = wrap(
  "<path d=\"M13.5 2.5a1.5 1.5 0 0 0-3 0v4a1.5 1.5 0 0 0 3 0v-4Z\" fill=\"#AAB2BF\" /><path d=\"M13.5 17.5a1.5 1.5 0 0 0-3 0v4a1.5 1.5 0 0 0 3 0v-4Z\" fill=\"#AAB2BF\" /><path d=\"M4.52 5.95a1.5 1.5 0 1 0-1.5 2.6l3.47 2a1.5 1.5 0 0 0 1.5-2.6l-3.47-2Z\" fill=\"#AAB2BF\" /><path d=\"M17.51 13.45a1.5 1.5 0 0 0-1.5 2.6l3.47 2a1.5 1.5 0 1 0 1.5-2.6l-3.47-2Z\" fill=\"#AAB2BF\" /><path d=\"M3.02 15.45a1.5 1.5 0 1 0 1.5 2.6l3.47-2a1.5 1.5 0 1 0-1.5-2.6l-3.47 2Z\" fill=\"#AAB2BF\" /><path d=\"M16.01 7.95a1.5 1.5 0 0 0 1.5 2.6l3.47-2a1.5 1.5 0 1 0-1.5-2.6l-3.47 2Z\" fill=\"#FF7D95\" />",
);

export const stepsSvg = wrap(
  "<path d=\"M14 10a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h4.5a.5.5 0 0 0 .5-.5V14a1 1 0 0 1 1-1h4.5a.5.5 0 0 0 .5-.5V10Z\" fill=\"#AAB2BF\" /><rect x=\"16\" y=\"5\" width=\"2\" height=\"4\" fill=\"#AAB2BF\" /><path d=\"m23 5-7-3v6l7-3Z\" fill=\"#F82C2C\" />",
);

export const switchSvg = wrap(
  "<rect x=\"2\" y=\"1\" width=\"20\" height=\"10\" rx=\"5\" fill=\"#DDE3E8\" /><circle cx=\"7.5\" cy=\"5.99997\" r=\"3.5\" fill=\"white\" /><rect x=\"2\" y=\"13\" width=\"20\" height=\"10\" rx=\"5\" fill=\"#3BCE4A\" /><circle cx=\"16.5\" cy=\"18\" r=\"3.5\" fill=\"white\" />",
);

export const tableSvg = wrap(
  "<path d=\"M2 5c0-1.1.9-2 2-2h7v5H2V5Z\" fill=\"#3BCE4A\" /><path d=\"M13 3h7a2 2 0 0 1 2 2v3h-9V3Z\" fill=\"#3BCE4A\" /><rect x=\"2\" y=\"10\" width=\"9\" height=\"5\" fill=\"#AAB2BF\" /><rect x=\"13\" y=\"10\" width=\"9\" height=\"5\" fill=\"#DDE3E8\" /><path d=\"M2 17h9v5H4a2 2 0 0 1-2-2v-3Z\" fill=\"#DDE3E8\" /><path d=\"M13 17h9v3a2 2 0 0 1-2 2h-7v-5Z\" fill=\"#AAB2BF\" />",
);

export const tabsSvg = wrap(
  "<path d=\"M12 6c0-1.1.9-2 2-2h5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V6Z\" fill=\"#818A9B\" /><path d=\"M4 2a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-6a2 2 0 0 1-2-2V4a2 2 0 0 0-2-2H4Z\" fill=\"#DDE3E8\" /><rect x=\"6\" y=\"12\" width=\"12\" height=\"2\" fill=\"#AAB2BF\" /><rect x=\"6\" y=\"16\" width=\"9\" height=\"2\" fill=\"#AAB2BF\" />",
);

export const tagSvg = wrap(
  "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M13.24 3.34a4 4 0 0 0-2.83 1.17L1.7 13.24a2 2 0 0 0 0 2.83l5.65 5.66a2 2 0 0 0 2.83 0L18.9 13a4 4 0 0 0 1.17-2.83V5.34a2 2 0 0 0-2-2h-4.83ZM13 7.6a2 2 0 1 0 2.83 2.82A2 2 0 0 0 13 7.6Z\" fill=\"#F82C2C\" /><path d=\"M14.85 8.4c1.2-1.5 4.85-3.7 6.65-1.9 2.25 2.25-1.5 6-1.5 9.5 0 2.47 2.15 3 2.85 3\" stroke=\"#AAB2BF\" stroke-width=\"1.5\" stroke-linecap=\"round\" />",
);

export const tagInputSvg = wrap(
  "<rect x=\"1\" y=\"4\" width=\"22\" height=\"16\" rx=\"2\" fill=\"#DDE3E8\" /><path d=\"M4.1 16.4c.45 0 .7-.23.88-.83l.48-1.47H8.5l.5 1.47c.16.6.43.84.9.84.48 0 .8-.3.8-.75 0-.18-.04-.4-.13-.66L8.4 8.74c-.27-.82-.65-1.15-1.37-1.15-.73 0-1.11.34-1.39 1.15L3.45 15c-.1.32-.15.52-.15.69 0 .43.32.72.8.72Zm1.74-3.57 1.1-3.5h.1l1.09 3.5H5.84Z\" fill=\"#AAB2BF\" /><path d=\"M20.12 9.88a1 1 0 0 0-1.41 0l-.71.7-.7-.7a1 1 0 1 0-1.42 1.41l.7.71-.7.7a1 1 0 0 0 1.41 1.42l.71-.7.7.7a1 1 0 0 0 1.42-1.41l-.7-.71.7-.7a1 1 0 0 0 0-1.42Z\" fill=\"#324350\" />",
);

export const timelineSvg = wrap(
  "<rect x=\"3\" y=\"11\" width=\"18\" height=\"2\" fill=\"#AAB2BF\" /><circle cx=\"4\" cy=\"12\" r=\"3\" fill=\"#DDE3E8\" /><circle cx=\"12\" cy=\"12\" r=\"3\" fill=\"#DDE3E8\" /><circle cx=\"20\" cy=\"12\" r=\"3\" fill=\"#4CC3FA\" />",
);

export const timePickerSvg = wrap(
  "<circle cx=\"12\" cy=\"12\" r=\"10.25\" fill=\"white\" stroke=\"#AAB2BF\" stroke-width=\"1.5\" /><path d=\"M14.5 6.5 12 12l5 5.5\" stroke=\"#6A6F7F\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /><circle cx=\"12\" cy=\"12\" r=\"2\" fill=\"#324350\" /><path d=\"M13 11.63 12 12l-7 3\" stroke=\"#FBCD2C\" stroke-linecap=\"round\" /><circle cx=\"12\" cy=\"12\" r=\"1\" fill=\"#FBCD2C\" />",
);

export const toastSvg = wrap(
  "<g clip-path=\"url(#clip0_1_3058)\"><path d=\"M.82 4.55c-.4.45-.47 1.38-.4 2L.76 9.8c.1 1.03.98 1.78 1.95 1.68l.23-.02.9 8.57c.2 1.87 1.3 2.76 3.29 2.55l10.94-1.15c2.98-.31 3.87-1.41 3.68-3.28l-.9-8.58c.97-.1 1.9-1.04 1.79-2.07l-.34-3.23c-.09-.8-.41-1.46-1.08-1.86-1.35-.79-4.97-1.9-10.32-1.34C5.34 1.64 1.73 3.52.82 4.55Z\" fill=\"#FBCD2C\" /><circle cx=\"7.21108\" cy=\"8.98682\" r=\"1.5\" transform=\"rotate(-6 7.21108 8.98682)\" fill=\"#324350\" /><circle cx=\"16.1618\" cy=\"8.04605\" r=\"1.5\" transform=\"rotate(-6 16.1618 8.04605)\" fill=\"#324350\" /><path d=\"M12.47 15.98a4 4 0 0 0 3.56-4.4s-1.05-.4-4.03-.08c-2.98.31-3.93.92-3.93.92a4 4 0 0 0 4.4 3.56Z\" fill=\"#324350\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M14.67 15.02a3.98 3.98 0 0 1-4.55.48 2.4 2.4 0 0 1 4.55-.48Z\" fill=\"#FF2969\" /></g><defs><clipPath id=\"clip0_1_3058\"><rect width=\"24\" height=\"24\" fill=\"white\" /></clipPath></defs>",
);

export const tokenSvg = wrap(
  "<rect width=\"8\" height=\"8\" rx=\"4\" fill=\"#F0B114\" /><rect y=\"10\" width=\"8\" height=\"8\" rx=\"4\" fill=\"#E91E63\" /><rect x=\"10\" width=\"8\" height=\"8\" rx=\"4\" fill=\"#0077FA\" /><rect x=\"10\" y=\"10\" width=\"8\" height=\"8\" rx=\"4\" fill=\"#00B3A1\" />",
);

export const tooltipSvg = wrap(
  "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M3.3 3.87A2.3 2.3 0 0 0 1.23 6.4l1.2 11.46a2.3 2.3 0 0 0 2.54 2.05l4.1-.43 3.46 2.8c.25.2.61.16.81-.08l2.8-3.47 4.3-.45a2.3 2.3 0 0 0 2.05-2.53L21.3 4.29a2.3 2.3 0 0 0-2.54-2.05L3.29 3.87Z\" fill=\"#6A6F7F\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M11.46 8.57c-.55.06-.95.57-.9 1.14.07.56-.33 1.07-.89 1.13a1.02 1.02 0 0 1-1.1-.92 3.07 3.07 0 0 1 2.67-3.41 3.07 3.07 0 0 1 3.34 2.77c.09.88-.27 1.59-.59 2.06a6.1 6.1 0 0 1-.47.6l-.16.17-.12.14-.6.75a.99.99 0 0 1-1.41.15 1.06 1.06 0 0 1-.16-1.45l.6-.76c.07-.1.18-.22.27-.32a14.08 14.08 0 0 0 .4-.48c.2-.29.25-.49.23-.65a1.02 1.02 0 0 0-1.1-.92Z\" fill=\"white\" /><circle cx=\"12.0566\" cy=\"15.1576\" r=\"1.2\" transform=\"rotate(-6 12.0566 15.1576)\" fill=\"white\" />",
);

export const transferSvg = wrap(
  "<path d=\"m7.07 20.35-5.48-4.38a.6.6 0 0 1 0-.94l5.48-4.38a.5.5 0 0 1 .81.39v2.26h5.67c.25 0 .45.2.45.45v3.5c0 .25-.2.45-.45.45H7.88v2.26a.5.5 0 0 1-.81.4Z\" fill=\"#AAB2BF\" /><path d=\"m13.8 5.63 7.6 5.9c.3.24.3.7 0 .94l-7.6 5.9a.5.5 0 0 1-.8-.4V14.8H7.5a.5.5 0 0 1-.5-.5V9.7c0-.28.22-.5.5-.5H13V6.02a.5.5 0 0 1 .8-.4Z\" fill=\"white\" /><path d=\"m14.8 4.63 7.6 5.9c.3.24.3.7 0 .94l-7.6 5.9a.5.5 0 0 1-.8-.4V13.8H8.5a.5.5 0 0 1-.5-.5V8.7c0-.28.22-.5.5-.5H14V5.02a.5.5 0 0 1 .8-.4Z\" fill=\"#4CC3FA\" />",
);

export const treeSvg = wrap(
  "<rect x=\"9\" y=\"16\" width=\"13\" height=\"5\" rx=\"0.5\" fill=\"#6A6F7F\" /><rect x=\"9\" y=\"9\" width=\"13\" height=\"5\" rx=\"0.5\" fill=\"#6A6F7F\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M5 6a1 1 0 0 1 1 1v11h1a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z\" fill=\"#AAB2BF\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M5 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z\" fill=\"#AAB2BF\" /><rect x=\"2\" y=\"2\" width=\"15\" height=\"5\" rx=\"0.5\" fill=\"#4CC3FA\" />",
);

export const treeSelectSvg = wrap(
  "<rect x=\"2\" y=\"10\" width=\"20\" height=\"12\" rx=\"2\" fill=\"#DDE3E8\" /><path d=\"M8 13a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-1Z\" fill=\"#AAB2BF\" /><path d=\"M4 13a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1Z\" fill=\"#AAB2BF\" /><path d=\"M10 18a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-1Z\" fill=\"#AAB2BF\" /><path d=\"M2 4c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z\" fill=\"#3BCE4A\" /><path d=\"M14 2h6a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-6V2Z\" fill=\"#818A9B\" /><path d=\"M18.42 6.08a.5.5 0 0 1-.84 0l-1.06-1.6a.5.5 0 0 1 .41-.78h2.14c.4 0 .63.45.41.78l-1.06 1.6Z\" fill=\"white\" />",
);

export const typographySvg = wrap(
  "<path d=\"M2.85 19.13c.77 0 1.2-.4 1.5-1.4l.82-2.5h5.14l.83 2.5c.3 1 .74 1.4 1.53 1.4.82 0 1.37-.5 1.37-1.27 0-.3-.07-.65-.22-1.12l-3.7-10.59c-.46-1.37-1.1-1.93-2.32-1.93-1.22 0-1.88.57-2.34 1.93l-3.7 10.6a3.8 3.8 0 0 0-.26 1.16c0 .74.55 1.22 1.35 1.22Zm2.96-6.06 1.87-5.93h.14l1.86 5.93H5.81Z\" fill=\"#6A6F7F\" /><path d=\"M16.93 15.98c0-.8.6-1.28 1.6-1.28h1.89v1.02c0 .92-.83 1.65-1.88 1.65-.96 0-1.6-.57-1.6-1.39Zm3.6 2.05v-.28.34c.07.64.5 1 1.14 1 .76 0 1.19-.47 1.19-1.3V12.4c0-2.18-1.45-3.4-4.03-3.4-1.07 0-1.9.18-2.52.5-.86.45-1.26 1.03-1.26 1.6 0 .5.33.87.87.87.4 0 .66-.1.94-.33.54-.49 1.07-.77 1.81-.77 1.13 0 1.75.52 1.75 1.52v.8h-2.34c-2.23 0-3.58 1.12-3.58 2.94 0 1.8 1.3 3 3.22 3 1.2 0 2.3-.22 2.8-1.1Z\" fill=\"#AAB2BF\" />",
);

export const uploadSvg = wrap(
  "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"m14 2 6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2h8Z\" fill=\"#4CC3FA\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M12.7 9.3a1 1 0 0 0-1.4 0l-3 3a1 1 0 1 0 1.4 1.4l1.3-1.29V17a1 1 0 1 0 2 0v-4.59l1.3 1.3a1 1 0 0 0 1.4-1.42l-3-3Z\" fill=\"white\" /><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"m20 8-6-6v4c0 1.1.9 2 2 2h4Z\" fill=\"#324350\" />",
);

export const versionOneSvg = wrap(
  "<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"#4CC3FA\" /><path d=\"M8.33 8.27h-1.5l-2.18 1.4v1.45l2.04-1.3h.05V17h1.59V8.27Zm2.7 8.82c.5 0 .93-.41.94-.93a.95.95 0 0 0-.94-.93.93.93 0 1 0 0 1.87Zm5.4.08c2.1 0 3.36-1.66 3.36-4.53 0-2.84-1.27-4.49-3.36-4.49-2.1 0-3.36 1.64-3.37 4.5 0 2.85 1.26 4.52 3.37 4.52Zm0-1.34c-1.09 0-1.77-1.09-1.77-3.19 0-2.07.68-3.17 1.77-3.17 1.08 0 1.76 1.1 1.77 3.17 0 2.1-.68 3.2-1.77 3.2Z\" fill=\"white\" />",
);

export const versionTwoSvg = wrap(
  "<path d=\"M19 2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3Z\" fill=\"#4CC3FA\" /><path d=\"M4.05 16.85h5.98v-1.32h-3.8v-.06l1.5-1.53c1.7-1.63 2.17-2.42 2.17-3.4C9.9 9.06 8.71 8 6.96 8 5.23 8 4 9.07 4 10.73h1.5c0-.89.57-1.45 1.44-1.45.83 0 1.44.51 1.44 1.33 0 .73-.44 1.25-1.3 2.12L4.05 15.7v1.15Z\" fill=\"white\" /><path d=\"M12 16.94c.5 0 .92-.42.93-.94a.95.95 0 0 0-.94-.93.93.93 0 1 0 0 1.87Z\" fill=\"white\" /><path d=\"M16.91 17.01c2.1 0 3.36-1.65 3.36-4.52 0-2.85-1.26-4.49-3.36-4.49-2.1 0-3.36 1.64-3.36 4.5 0 2.85 1.26 4.51 3.36 4.51Zm0-1.33c-1.09 0-1.77-1.1-1.76-3.19 0-2.08.68-3.17 1.76-3.17 1.09 0 1.76 1.1 1.77 3.17 0 2.1-.68 3.19-1.77 3.19Z\" fill=\"white\" />",
);

export const webcomponentsSvg = wrap(
  "<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"5\" fill=\"#41B3FF\" /><rect x=\"7\" y=\"5.5\" width=\"10\" height=\"3\" rx=\"1.5\" fill=\"#E9E7E7\" /><rect x=\"7\" y=\"10.5\" width=\"10\" height=\"3\" rx=\"1.5\" fill=\"#483D3D\" /><rect x=\"7\" y=\"15.5\" width=\"10\" height=\"3\" rx=\"1.5\" fill=\"#E9E7E7\" />",
);

export const wheelChairSvg = wrap(
  "<path d=\"M6.94 8.66a.2.2 0 0 0-.26-.14A7.5 7.5 0 1 0 16.9 16.7a.2.2 0 0 0-.2-.23h-2.65a.2.2 0 0 0-.2.16 4.5 4.5 0 1 1-6.35-5.19.2.2 0 0 0 .11-.24l-.67-2.54Z\" fill=\"#4CC3FA\" /><path d=\"M13 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z\" fill=\"#6A6F7F\" /><path d=\"M9.7 13.8a2 2 0 0 0 2 1.5h5.9c.1 0 .18.06.2.16l1.38 6.03a1.75 1.75 0 1 0 3.42-.78l-1.83-7.97a1.75 1.75 0 0 0-1.1-1.25 2 2 0 0 0-.85-.19h-5.47a.2.2 0 0 1-.19-.15l-.23-.9a.2.2 0 0 1 .2-.25h3.62a1.25 1.25 0 1 0 0-2.5h-4.52l-.13-.51a2 2 0 1 0-3.88.99l1.49 5.81Z\" fill=\"#6A6F7F\" />",
);

export const audioPlayerSvg = wrap(
  "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M11.433 2.099A1 1 0 0112 3v18a1 1 0 01-1.625.78L4.65 17H2a1 1 0 01-1-1V8a1 1 0 011-1h2.65l5.725-4.78a1 1 0 011.058-.121z\" fill=\"#AAB2BF\"></path><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M13.95 8.429a1.5 1.5 0 012.121.021 4.989 4.989 0 011.429 3.5c0 1.361-.546 2.599-1.429 3.499a1.5 1.5 0 11-2.142-2.1c.355-.362.571-.854.571-1.4 0-.545-.216-1.037-.571-1.4a1.5 1.5 0 01.021-2.12z\" fill=\"#FBCD2C\"></path><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M18.845 4.26a1.5 1.5 0 00-1.69 2.48A6.492 6.492 0 0120 12.116a6.492 6.492 0 01-2.845 5.375 1.5 1.5 0 001.69 2.48A9.492 9.492 0 0023 12.115a9.492 9.492 0 00-4.155-7.855z\" fill=\"#FBCD2C\"></path>",
);

export const videoPlayerSvg = wrap(
  "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M1 6a2 2 0 012-2h11a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V6zm3.982 2h3v3h-3V8zM23 7.619a1 1 0 00-1.447-.895l-3.997 2a1 1 0 00-.552.894v4.764a1 1 0 00.552.895l3.997 1.999A1 1 0 0023 16.38V7.62z\" fill=\"#AAB2BF\"></path>",
);

export const userGuideSvg = wrap(
  "<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"#AAB2BF\"></rect><rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"1\" fill=\"#fff\"></rect><rect x=\"6\" y=\"14\" width=\"5\" height=\"3\" rx=\"1\" fill=\"#AAB2BF\"></rect><rect x=\"13\" y=\"14\" width=\"5\" height=\"3\" rx=\"1\" fill=\"#4CC3FA\"></rect>",
);

export const feedbackSvg = wrap(
  "<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"#AAB2BF\"></rect><rect x=\"4\" y=\"6\" width=\"16\" height=\"12\" rx=\"1\" fill=\"#fff\"></rect><rect x=\"13\" y=\"13\" width=\"5\" height=\"3\" rx=\"1\" fill=\"#4CC3FA\"></rect><circle cx=\"7.5\" cy=\"9.5\" r=\"1.5\" fill=\"#D9D9D9\"></circle><circle cx=\"12\" cy=\"9.5\" r=\"1.5\" fill=\"#FBCD2C\"></circle><circle cx=\"16.5\" cy=\"9.5\" r=\"1.5\" fill=\"#D9D9D9\"></circle>",
);

export const floatButtonSvg = wrap(
  "<circle cx=\"12\" cy=\"12\" r=\"11\" fill=\"#DDE3E8\"></circle><circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"#4CC3FA\"></circle><path d=\"M6.927 11.573l4.896-4.896a.25.25 0 01.354 0l4.896 4.896a.25.25 0 01-.177.427H14v4.5a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5V12H7.104a.25.25 0 01-.177-.427z\" fill=\"#fff\"></path>",
);

export const cropperSvg = wrap(
  "<path d=\"M4 4h7v7H4V4z\" fill=\"#FBCD2C\"></path><path d=\"M3 11h17v9H3v-9z\" fill=\"#3BCE4A\"></path><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M5 2a3 3 0 00-3 3v14a3 3 0 003 3h14a3 3 0 003-3V5a3 3 0 00-3-3H5zm6 6.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm5.707 3.207a1 1 0 00-1.414 0L11 16l-1.293-1.293a1 1 0 00-1.414 0L5 18v1h14v-5l-2.293-2.293z\" fill=\"#324350\"></path><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M2 5a3 3 0 013-3h14a3 3 0 013 3v14a3 3 0 01-3 3H5a3 3 0 01-3-3V5zm4 0a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1H6z\" fill=\"#AAB2BF\"></path><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M9 4.25a.75.75 0 00-.75-.75H6A2.5 2.5 0 003.5 6v2.25a.75.75 0 001.5 0V6a1 1 0 011-1h2.25A.75.75 0 009 4.25zm6.75.75a.75.75 0 010-1.5H18A2.5 2.5 0 0120.5 6v2.25a.75.75 0 01-1.5 0V6a1 1 0 00-1-1h-2.25zM15 19.75a.75.75 0 01.75-.75H18a1 1 0 001-1v-2.25a.75.75 0 011.5 0V18a2.5 2.5 0 01-2.5 2.5h-2.25a.75.75 0 01-.75-.75zM4.25 15a.75.75 0 01.75.75V18a1 1 0 001 1h2.25a.75.75 0 010 1.5H6A2.5 2.5 0 013.5 18v-2.25a.75.75 0 01.75-.75z\" fill=\"#fff\"></path>",
);

export const aIChatDialogueSvg = wrap(
  "<path d=\"M15.535 21.708a.6.6 0 001.03 0L18.18 19H20a2 2 0 002-2V9a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2h6.921l1.614 2.708z\" fill=\"#324350\"></path><path d=\"M8.465 16.708a.6.6 0 01-1.03 0l-.742-1.244A3 3 0 004.116 14H4a2 2 0 01-2-2V4a2 2 0 012-2h13a2 2 0 012 2v8a2 2 0 01-2 2h-5.217a3 3 0 00-2.577 1.464l-.74 1.244z\" fill=\"url(#doc-aiDialogue_svg__paint0_linear_9669_13028)\"></path><path d=\"M5 6a1 1 0 011-1h9a1 1 0 110 2H6a1 1 0 01-1-1z\" fill=\"url(#doc-aiDialogue_svg__paint1_linear_9669_13028)\"></path><path d=\"M5 10a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1z\" fill=\"url(#doc-aiDialogue_svg__paint2_linear_9669_13028)\"></path><defs><linearGradient id=\"doc-aiDialogue_svg__paint0_linear_9669_13028\" x1=\"19\" y1=\"2\" x2=\"0.09\" y2=\"5.014\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#FFDAFE\"></stop><stop offset=\"0.3\" stop-color=\"#F2DAFF\"></stop><stop offset=\"0.6\" stop-color=\"#DFE0FF\"></stop><stop offset=\"1\" stop-color=\"#D5EBFF\"></stop></linearGradient><linearGradient id=\"doc-aiDialogue_svg__paint1_linear_9669_13028\" x1=\"16\" y1=\"7\" x2=\"8.149\" y2=\"0.928\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#E945FF\"></stop><stop offset=\"0.3\" stop-color=\"#A647FF\"></stop><stop offset=\"0.6\" stop-color=\"#6B61FF\"></stop><stop offset=\"1\" stop-color=\"#2E8CFF\"></stop></linearGradient><linearGradient id=\"doc-aiDialogue_svg__paint2_linear_9669_13028\" x1=\"11\" y1=\"11\" x2=\"5.19\" y2=\"8.549\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#E945FF\"></stop><stop offset=\"0.3\" stop-color=\"#A647FF\"></stop><stop offset=\"0.6\" stop-color=\"#6B61FF\"></stop><stop offset=\"1\" stop-color=\"#2E8CFF\"></stop></linearGradient></defs>",
);

export const aIChatInputSvg = wrap(
  "<path d=\"M2 8a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H5a3 3 0 01-3-3V8z\" fill=\"url(#doc-aiInput_svg__paint0_linear_9668_12907)\"></path><rect x=\"4\" y=\"8\" width=\"6\" height=\"2\" rx=\"1\" fill=\"url(#doc-aiInput_svg__paint1_linear_9668_12907)\"></rect><rect x=\"4\" y=\"12\" width=\"6\" height=\"2\" rx=\"1\" fill=\"url(#doc-aiInput_svg__paint2_linear_9668_12907)\"></rect><rect x=\"4\" y=\"16\" width=\"14\" height=\"2\" rx=\"1\" fill=\"url(#doc-aiInput_svg__paint3_linear_9668_12907)\"></rect><path d=\"M17.458 4.625l2.917 2.917 1.217-1.217a1.167 1.167 0 000-1.65l-1.267-1.267a1.167 1.167 0 00-1.65 0l-1.217 1.217zM10.31 14.329l.982-3.434a.583.583 0 01.148-.252L16.583 5.5 19.5 8.417l-5.143 5.143a.583.583 0 01-.252.148l-3.434.981a.292.292 0 01-.36-.36z\" fill=\"#324350\"></path><defs><linearGradient id=\"doc-aiInput_svg__paint0_linear_9668_12907\" x1=\"20\" y1=\"21\" x2=\"-0.03\" y2=\"17.831\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#FFDAFE\"></stop><stop offset=\"0.3\" stop-color=\"#F2DAFF\"></stop><stop offset=\"0.6\" stop-color=\"#DFE0FF\"></stop><stop offset=\"1\" stop-color=\"#D5EBFF\"></stop></linearGradient><linearGradient id=\"doc-aiInput_svg__paint1_linear_9668_12907\" x1=\"10\" y1=\"10\" x2=\"4.19\" y2=\"7.549\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#E945FF\"></stop><stop offset=\"0.3\" stop-color=\"#A647FF\"></stop><stop offset=\"0.6\" stop-color=\"#6B61FF\"></stop><stop offset=\"1\" stop-color=\"#2E8CFF\"></stop></linearGradient><linearGradient id=\"doc-aiInput_svg__paint2_linear_9668_12907\" x1=\"10\" y1=\"14\" x2=\"4.19\" y2=\"11.549\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#E945FF\"></stop><stop offset=\"0.3\" stop-color=\"#A647FF\"></stop><stop offset=\"0.6\" stop-color=\"#6B61FF\"></stop><stop offset=\"1\" stop-color=\"#2E8CFF\"></stop></linearGradient><linearGradient id=\"doc-aiInput_svg__paint3_linear_9668_12907\" x1=\"18\" y1=\"18\" x2=\"9.89\" y2=\"10.017\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#E945FF\"></stop><stop offset=\"0.3\" stop-color=\"#A647FF\"></stop><stop offset=\"0.6\" stop-color=\"#6B61FF\"></stop><stop offset=\"1\" stop-color=\"#2E8CFF\"></stop></linearGradient></defs>",
);

export const iconSvg = wrap(
  "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M20.5 13.985L12.015 5.5l.742-.743a6 6 0 118.486 8.486l-.743.742z\" fill=\"#F82C2C\"></path><path d=\"M11.243 4.757a6 6 0 10-8.486 8.486L12 22.485s5.183-5.168 8.5-8.485c1.3-1.253 1.84-2 2.16-3-2.66 3-4.16 1-10.645-5.5-.507-.508-.772-.743-.772-.743z\" fill=\"#FF7D95\"></path>",
);


export const aIComponentSvg = wrap(
  "<path d=\"M18.121 4.693a3 3 0 01.88 2.12V18.5a2 2 0 01-2 2H5a2 2 0 01-2-2v-16a2 2 0 012-2h7.685a3 3 0 012.121.879l3.314 3.314z\" fill=\"url(#doc-aiComponent_svg__paint0_linear_9694_703)\"></path><path d=\"M3.838 2.224c.113-.551.901-.551 1.014 0A4.393 4.393 0 008.276 5.65c.551.113.551.9 0 1.014a4.392 4.392 0 00-3.424 3.423c-.113.552-.9.552-1.014 0A4.393 4.393 0 00.413 6.663c-.55-.113-.55-.901 0-1.014a4.394 4.394 0 003.425-3.425zM8.078.301c.083-.401.657-.401.74 0a1.771 1.771 0 001.38 1.38c.402.082.402.657 0 .74a1.773 1.773 0 00-1.38 1.38c-.083.402-.657.402-.74 0a1.772 1.772 0 00-1.38-1.38c-.402-.083-.402-.658 0-.74a1.77 1.77 0 001.38-1.38z\" fill=\"url(#doc-aiComponent_svg__paint1_linear_9694_703)\"></path><path d=\"M14 9.5a1 1 0 010 2H8a1 1 0 110-2h6zM14 13.496a1 1 0 010 2H8a1 1 0 110-2h6z\" fill=\"#324350\"></path><defs><linearGradient id=\"doc-aiComponent_svg__paint0_linear_9694_703\" x1=\"19\" y1=\"20.5\" x2=\"0.978\" y2=\"18.473\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#FFDAFE\"></stop><stop offset=\"0.3\" stop-color=\"#F2DAFF\"></stop><stop offset=\"0.6\" stop-color=\"#DFE0FF\"></stop><stop offset=\"1\" stop-color=\"#D5EBFF\"></stop></linearGradient><linearGradient id=\"doc-aiComponent_svg__paint1_linear_9694_703\" x1=\"10.5\" y1=\"10.5\" x2=\"-1.244\" y2=\"8.849\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#E945FF\"></stop><stop offset=\"0.3\" stop-color=\"#A647FF\"></stop><stop offset=\"0.6\" stop-color=\"#6B61FF\"></stop><stop offset=\"1\" stop-color=\"#2E8CFF\"></stop></linearGradient></defs>",
);

export const sideBarSvg = wrap(
  "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M5 2h14a3 3 0 013 3v14a3 3 0 01-3 3H5a3 3 0 01-3-3V5a3 3 0 013-3zm1 2a1 1 0 00-1 1v14a1 1 0 001 1h3a1 1 0 001-1V5a1 1 0 00-1-1H6z\" fill=\"url(#doc-sidebar_svg__paint0_linear_9801_3966)\"></path><path d=\"M16 5a1 1 0 110 2h-3a1 1 0 110-2h3zM16 8.996a1 1 0 110 2h-3a1 1 0 110-2h3zM16 13a1 1 0 110 2h-3a1 1 0 110-2h3z\" fill=\"#324350\"></path><circle cx=\"19\" cy=\"6\" r=\"1\" fill=\"url(#doc-sidebar_svg__paint1_linear_9801_3966)\"></circle><circle cx=\"19\" cy=\"10\" r=\"1\" fill=\"url(#doc-sidebar_svg__paint2_linear_9801_3966)\"></circle><circle cx=\"19\" cy=\"14\" r=\"1\" fill=\"url(#doc-sidebar_svg__paint3_linear_9801_3966)\"></circle><path d=\"M16 17a1 1 0 110 2h-3a1 1 0 110-2h3z\" fill=\"#324350\"></path><circle cx=\"19\" cy=\"18\" r=\"1\" fill=\"url(#doc-sidebar_svg__paint4_linear_9801_3966)\"></circle><defs><linearGradient id=\"doc-sidebar_svg__paint0_linear_9801_3966\" x1=\"22\" y1=\"22\" x2=\"-0.37\" y2=\"18.854\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#FFDAFE\"></stop><stop offset=\"0.3\" stop-color=\"#F2DAFF\"></stop><stop offset=\"0.6\" stop-color=\"#DFE0FF\"></stop><stop offset=\"1\" stop-color=\"#D5EBFF\"></stop></linearGradient><linearGradient id=\"doc-sidebar_svg__paint1_linear_9801_3966\" x1=\"20\" y1=\"7\" x2=\"17.763\" y2=\"6.685\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#E945FF\"></stop><stop offset=\"0.3\" stop-color=\"#A647FF\"></stop><stop offset=\"0.6\" stop-color=\"#6B61FF\"></stop><stop offset=\"1\" stop-color=\"#2E8CFF\"></stop></linearGradient><linearGradient id=\"doc-sidebar_svg__paint2_linear_9801_3966\" x1=\"20\" y1=\"11\" x2=\"17.763\" y2=\"10.685\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#E945FF\"></stop><stop offset=\"0.3\" stop-color=\"#A647FF\"></stop><stop offset=\"0.6\" stop-color=\"#6B61FF\"></stop><stop offset=\"1\" stop-color=\"#2E8CFF\"></stop></linearGradient><linearGradient id=\"doc-sidebar_svg__paint3_linear_9801_3966\" x1=\"20\" y1=\"15\" x2=\"17.763\" y2=\"14.685\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#E945FF\"></stop><stop offset=\"0.3\" stop-color=\"#A647FF\"></stop><stop offset=\"0.6\" stop-color=\"#6B61FF\"></stop><stop offset=\"1\" stop-color=\"#2E8CFF\"></stop></linearGradient><linearGradient id=\"doc-sidebar_svg__paint4_linear_9801_3966\" x1=\"20\" y1=\"19\" x2=\"17.763\" y2=\"18.685\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#E945FF\"></stop><stop offset=\"0.3\" stop-color=\"#A647FF\"></stop><stop offset=\"0.6\" stop-color=\"#6B61FF\"></stop><stop offset=\"1\" stop-color=\"#2E8CFF\"></stop></linearGradient></defs>",
);

export const introductionSvg = wrap(
  "<path d=\"M3.126 8.1A3 3 0 002 10.441V19a3 3 0 003 3h4v-6a3 3 0 116 0v6h4a3 3 0 003-3v-8.558a3 3 0 00-1.126-2.343L13.25 2a2 2 0 00-2.498 0L3.126 8.1z\" fill=\"#DDE3E8\"></path><path d=\"M9 15v7h6v-7a3 3 0 10-6 0z\" fill=\"#6A6F7F\"></path>",
);

export const overviewSvg = wrap(
  "<path d=\"M24 0H0v24h24V0z\" fill=\"#fff\" fill-opacity=\"0.01\"></path><path d=\"M10 3H3v7h7V3z\" fill=\"#4CC3FA\" stroke=\"#4CC3FA\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M10 14H3v7h7v-7z\" fill=\"#3BCE4A\" stroke=\"#3BCE4A\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M21 3h-7v7h7V3z\" fill=\"#4CC3FA\" stroke=\"#4CC3FA\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M14 14l7 7m-7-7h7-7zm0 0v7-7z\" stroke=\"#324350\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path>",
);

export const contentGuidelinesSvg = wrap(
  "<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"3\" fill=\"#4CC3FA\"></rect><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M6.75 7.625c0-.483.392-.875.875-.875h8.75c.483 0 .875.392.875.875v1.75a.875.875 0 01-1.75 0V8.5h-2.625v7.583h1.167a.875.875 0 010 1.75H9.958a.875.875 0 110-1.75h1.167V8.5H8.5v.875a.875.875 0 11-1.75 0v-1.75z\" fill=\"#fff\"></path>",
);

export const internationalizationSvg = wrap(
  "<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"#4CC3FA\"></circle><path d=\"M18.5 13l3 2.5-.5.5-3.5 4.5-6.5 1 .5-1.5 4-1.5.5-4 2.5-1.5z\" fill=\"#6A6F7F\"></path><path d=\"M3 8l3-4 1.5-1L13 2l3.5 1.5v3L14 7l-.5 2.5-.5 3h-2.5L8 10 6.5 9 3 12H2l1-4z\" fill=\"#3BCE4A\"></path><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M1.25 12C1.25 6.063 6.063 1.25 12 1.25S22.75 6.063 22.75 12 17.937 22.75 12 22.75 1.25 17.937 1.25 12zm1.539-.85c.451-.2 1.189-.72 2.087-2.066.283-.425.618-.784 1.038-.964.47-.201.925-.131 1.303.068.342.18.63.47.866.746.242.283.483.619.715.943l.027.037c.473.664.93 1.302 1.457 1.763.517.452 1.025.664 1.612.58.331-.047.509-.143.61-.229a.764.764 0 00.23-.388c.123-.422.085-1 .019-1.763l-.003-.027c-.03-.344-.062-.721-.065-1.079-.002-.365.027-.765.15-1.138.127-.389.362-.761.765-1.024.392-.255.87-.359 1.4-.359.745 0 .952-.209 1.015-.3.088-.129.14-.383.06-.812-.076-.408-.249-.84-.415-1.189a7.104 7.104 0 00-.277-.52l-.016-.027-.003-.005a.698.698 0 01-.013-.021A9.227 9.227 0 0012 2.75c-4.822 0-8.782 3.69-9.211 8.4zm14.69-6.603c.027.103.05.209.07.315.108.57.129 1.317-.298 1.938-.453.659-1.246.95-2.251.95-.345 0-.508.068-.581.116-.061.04-.116.1-.16.235-.049.15-.075.364-.074.661.002.295.03.619.062.986l.005.061c.059.668.134 1.527-.08 2.254-.117.4-.329.794-.695 1.106-.364.311-.828.496-1.371.573-1.163.167-2.093-.308-2.81-.935-.664-.58-1.21-1.346-1.653-1.967l-.066-.092a12.787 12.787 0 00-.635-.84c-.199-.233-.338-.347-.425-.393a.283.283 0 00-.022-.01c-.045.023-.174.115-.371.411-1.056 1.584-2.04 2.333-2.846 2.655-.178.072-.346.121-.5.154a9.255 9.255 0 007.516 8.368c.102-.936.388-1.623.95-2.034.436-.263.756-.353 1.1-.382.296-.025.608-.007.863.007l.083.005c.614.032.948.011 1.204-.176.243-.179.601-.663.76-2.096.176-1.578.643-2.67 1.429-3.277.812-.626 1.762-.582 2.526-.36.723.21 1.394.607 1.88.944.106-.559.161-1.135.161-1.724a9.237 9.237 0 00-3.771-7.453zM12 21.25c-.071 0-.143 0-.214-.002.08-.718.265-.92.344-.979.057-.041.151-.081.34-.097.185-.016.39-.005.67.01l.07.004.015.001c.554.03 1.419.076 2.156-.465.757-.556 1.19-1.572 1.364-3.14.158-1.42.545-2.016.854-2.254.28-.217.665-.26 1.192-.108.529.154 1.075.474 1.51.783.135.095.254.186.355.266A9.253 9.253 0 0112 21.25z\" fill=\"#fff\"></path>",
);

export const themingSvg = wrap(
  "<path d=\"M12 2C6.478 2 2 6.478 2 12s4.478 10 10 10a1.664 1.664 0 001.233-2.783 1.651 1.651 0 01-.416-1.106c0-.922.744-1.667 1.666-1.667h1.961A5.558 5.558 0 0022 10.89C22 5.978 17.522 2 12 2z\" fill=\"#DDE3E8\" stroke=\"#DDE3E8\" stroke-width=\"1.5\"></path><circle cx=\"6\" cy=\"12\" r=\"2\" fill=\"#F82C2C\"></circle><circle cx=\"10.5\" cy=\"7\" r=\"2\" fill=\"#4CC3FA\"></circle><circle cx=\"17\" cy=\"9\" r=\"2\" fill=\"#3BCE4A\"></circle>",
);

export const dragMoveSvg = wrap(
  "<rect x=\"2\" y=\"2\" width=\"12\" height=\"12\" rx=\"2\" fill=\"#DDE3E8\"></rect><rect x=\"8\" y=\"6\" width=\"13\" height=\"13\" rx=\"2\" fill=\"#4CC3FA\"></rect><mask id=\"doc-dragmove_svg__a\" maskUnits=\"userSpaceOnUse\" x=\"9\" y=\"9\" width=\"14\" height=\"14\" fill=\"#000\"><path fill=\"#fff\" d=\"M9 9h14v14H9z\"></path><path d=\"M12.75 19.847l-1.25-3.625-.49-2.448a.536.536 0 01-.01-.105v-.04c0-.342.446-.475.633-.188a.52.52 0 01.037.066l.983 2.13a.25.25 0 00.314.129l.033-.012-.468-3.42a.58.58 0 01.111-.427.387.387 0 01.541-.078l.034.025c.102.077.18.183.221.304l1.028 2.97a.14.14 0 00.273-.055l-.22-3.421a.675.675 0 01.196-.52.45.45 0 01.598-.034l.085.069a.75.75 0 01.272.466l.56 3.47a.142.142 0 00.281-.01l.332-3.43a.75.75 0 01.278-.514l.052-.041a.466.466 0 01.621.034.7.7 0 01.205.495v4.877a.25.25 0 00.385.21l1.118-.718a1 1 0 01.54-.159h.518a.25.25 0 01.215.378l-2.151 3.622s-.875 1-2.875 1-2.833-.666-3-1z\"></path></mask><path d=\"M12.75 19.847l-1.25-3.625-.49-2.448a.536.536 0 01-.01-.105v-.04c0-.342.446-.475.633-.188a.52.52 0 01.037.066l.983 2.13a.25.25 0 00.314.129l.033-.012-.468-3.42a.58.58 0 01.111-.427.387.387 0 01.541-.078l.034.025c.102.077.18.183.221.304l1.028 2.97a.14.14 0 00.273-.055l-.22-3.421a.675.675 0 01.196-.52.45.45 0 01.598-.034l.085.069a.75.75 0 01.272.466l.56 3.47a.142.142 0 00.281-.01l.332-3.43a.75.75 0 01.278-.514l.052-.041a.466.466 0 01.621.034.7.7 0 01.205.495v4.877a.25.25 0 00.385.21l1.118-.718a1 1 0 01.54-.159h.518a.25.25 0 01.215.378l-2.151 3.622s-.875 1-2.875 1-2.833-.666-3-1z\" fill=\"#fff\"></path><path d=\"M12.75 19.847l-1.418.49c.021.061.047.122.076.181l1.342-.67zm-1.25-3.625l-1.47.294c.012.067.03.132.052.195l1.418-.489zm-.49-2.448l-1.47.294 1.47-.294zm.623-.333l-1.255.82 1.255-.82zm.037.066l1.362-.629-1.362.629zm.983 2.13l-1.362.628 1.362-.629zm.314.129l-.526-1.405.526 1.405zm.033-.012l.526 1.404a1.5 1.5 0 00.96-1.608L13 15.754zm-.468-3.42l-1.486.203 1.486-.204zm.111-.427l-1.2-.9 1.2.9zm.541-.078l.9-1.2-.9 1.2zm.034.025l-.9 1.2.9-1.2zm.221.304l-1.417.49 1.417-.49zm1.028 2.97l-1.417.49 1.417-.49zm.273-.055l1.497-.097-1.497.097zm-.22-3.421l-1.497.096 1.497-.096zm.196-.52l-1.061-1.061 1.06 1.06zm.598-.034l-.937 1.172.937-1.171zm.085.069l.937-1.172-.937 1.172zm.272.466l-1.48.239 1.48-.24zm.56 3.47l1.48-.239-1.48.239zm.281-.01l1.493.145-1.493-.144zm.332-3.43l-1.493-.145 1.493.145zm.278-.514l.938 1.172-.938-1.172zm.052-.041l-.937-1.171.937 1.171zm.621.034l1.06-1.06-1.06 1.06zm.59 5.583l.811 1.261-.81-1.261zm1.118-.719l.811 1.262-.811-1.262zm1.273.219l-1.29-.766 1.29.766zm-2.151 3.622l1.129.988a1.5 1.5 0 00.16-.222l-1.289-.766zm-4.457-.489l-1.25-3.625-2.836.978 1.25 3.625 2.836-.978zm-1.197-3.43l-.49-2.448-2.941.588.49 2.448 2.94-.588zm-.49-2.448a.969.969 0 01.019.19h-3c0 .133.013.267.04.398l2.941-.588zm.019.19v-.041h-3v.04h3zm0-.041c0 1.149-1.494 1.594-2.122.632l2.51-1.641c-1.003-1.535-3.388-.825-3.388 1.009h3zm-2.122.633a.98.98 0 01-.07-.127l2.724-1.257a2.012 2.012 0 00-.144-.259l-2.51 1.643zm-.07-.127l.983 2.13 2.724-1.257-.983-2.13-2.724 1.257zm.983 2.13a1.75 1.75 0 002.203.905l-1.053-2.809a1.25 1.25 0 011.574.647l-2.724 1.257zm2.203.905l.032-.012-1.052-2.81-.033.013 1.053 2.81zm.992-1.62l-.468-3.42-2.972.406.468 3.42 2.972-.406zm-.468-3.42a.92.92 0 01-.175.676l-2.4-1.8a2.08 2.08 0 00-.397 1.53l2.973-.406zm-.175.677a1.113 1.113 0 01-1.559.222l1.8-2.4a1.887 1.887 0 00-2.641.378l2.4 1.8zm-1.559.222l.034.025 1.8-2.4-.034-.025-1.8 2.4zm.034.025a.858.858 0 01-.296-.405l2.835-.982a2.142 2.142 0 00-.74-1.013l-1.8 2.4zm-.296-.405l1.028 2.97 2.835-.982-1.028-2.97-2.835.982zm1.028 2.97a1.64 1.64 0 001.55 1.103v-3c.58 0 1.095.367 1.285.915l-2.835.981zm1.55 1.103c.948 0 1.698-.8 1.637-1.746l-2.993.193a1.36 1.36 0 011.356-1.447v3zm1.637-1.746l-.22-3.421-2.994.193.22 3.421 2.994-.193zm-.22-3.421a.826.826 0 01-.24.637l-2.122-2.121a2.174 2.174 0 00-.632 1.677l2.994-.193zm-.24.637a1.05 1.05 0 01-1.4.078l1.874-2.343a1.95 1.95 0 00-2.596.144l2.121 2.121zm-1.4.078l.085.068 1.874-2.343-.085-.068-1.874 2.343zm.085.068a.75.75 0 01-.272-.466l2.962-.478a2.25 2.25 0 00-.816-1.399l-1.874 2.343zm-.272-.466l.56 3.47 2.962-.478-.56-3.47-2.962.478zm.56 3.47c.128.796.815 1.38 1.621 1.38v-3c.666 0 1.234.484 1.34 1.142l-2.961.477zm1.621 1.38c.846 0 1.553-.642 1.634-1.484l-2.986-.289a1.358 1.358 0 011.352-1.227v3zm1.634-1.484l.332-3.43-2.986-.29-.332 3.431 2.986.29zm.332-3.43a.75.75 0 01-.277.513l-1.874-2.343a2.25 2.25 0 00-.835 1.54l2.986.29zm-.277.512l.051-.04-1.874-2.343-.052.041 1.875 2.342zm.051-.04a1.034 1.034 0 01-1.377-.077l2.122-2.121a1.966 1.966 0 00-2.619-.145l1.874 2.342zm-1.377-.077a.8.8 0 01-.234-.566h3a2.2 2.2 0 00-.644-1.555l-2.122 2.121zm-.234-.566v4.877h3v-4.877h-3zm0 4.877c0 1.385 1.532 2.22 2.696 1.473l-1.622-2.524a1.25 1.25 0 011.926 1.051h-3zm2.696 1.472l1.118-.718-1.622-2.524-1.118.719 1.622 2.523zm1.118-.718a.5.5 0 01-.27.08v-3a2.5 2.5 0 00-1.352.396l1.622 2.524zm-.27.08h.517v-3h-.517v3zm.517 0a1.25 1.25 0 01-1.075-1.889l2.58 1.532c.692-1.167-.148-2.644-1.505-2.644v3zm-1.075-1.889l-2.15 3.622 2.579 1.532 2.15-3.622-2.579-1.532zm-.861 4.388c-1.129-.988-1.128-.988-1.128-.989l.001-.001.002-.002.004-.005.008-.008a.447.447 0 01.01-.012l.01-.01-.031.028a1.627 1.627 0 01-.27.176c-.265.141-.743.323-1.481.323v3c1.262 0 2.221-.318 2.893-.676a4.62 4.62 0 00.77-.512 3.523 3.523 0 00.32-.301l.011-.012.005-.006.003-.003c.001-.001.002-.002-1.127-.99zm-2.875-.5c-.837 0-1.335-.14-1.59-.25a.894.894 0 01-.199-.11c-.025-.022.051.03.13.19l-2.683 1.341c.301.601.903 1.046 1.556 1.33.704.306 1.623.5 2.786.5v-3z\" fill=\"#6A6F7F\" mask=\"url(#doc-dragmove_svg__a)\"></path>",
);
