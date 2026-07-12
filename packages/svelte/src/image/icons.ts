/**
 * 预览工具栏/状态图标的 SVG 字符串常量。图形逐一取自 Semi @douyinfe/semi-icons
 * （viewBox 0 0 24 24，fill=currentColor），React 的 fillRule/clipRule 已改为 HTML
 * 的 fill-rule/clip-rule。经 <Icon svg={...} /> 以 {@html} 渲染（构建期净化，来源可信）。
 */

const wrap = (inner: string): string =>
  `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" focusable="false" aria-hidden="true">${inner}</svg>`;

export const iconChevronLeft = wrap(
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M16.28 4.24a1.5 1.5 0 0 1 0 2.12l-5.66 5.66 5.66 5.65a1.5 1.5 0 1 1-2.12 2.13l-6.72-6.72a1.5 1.5 0 0 1 0-2.12l6.72-6.72a1.5 1.5 0 0 1 2.12 0Z" fill="currentColor" />',
);

export const iconChevronRight = wrap(
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M7.44 19.8a1.5 1.5 0 0 1 0-2.13l5.66-5.65-5.66-5.66a1.5 1.5 0 1 1 2.12-2.12l6.72 6.72a1.5 1.5 0 0 1 0 2.12L9.56 19.8a1.5 1.5 0 0 1-2.12 0Z" fill="currentColor" />',
);

export const iconMinus = wrap(
  '<path d="M2 12c0-.83.67-1.5 1.5-1.5h17a1.5 1.5 0 0 1 0 3h-17A1.5 1.5 0 0 1 2 12Z" fill="currentColor" />',
);

export const iconPlus = wrap(
  '<path d="M20.5 13.5a1.5 1.5 0 0 0 0-3h-7v-7a1.5 1.5 0 0 0-3 0v7h-7a1.5 1.5 0 0 0 0 3h7v7a1.5 1.5 0 0 0 3 0v-7h7Z" fill="currentColor" />',
);

export const iconRotate = wrap(
  '<path d="M14.2 2.2A1 1 0 0 0 12.8.8l-2.5 2.5a1 1 0 0 0 0 1.4l2.5 2.5a1 1 0 1 0 1.4-1.4l-.79-.8H16a5 5 0 0 1 5 5v2a1 1 0 1 0 2 0v-2a7 7 0 0 0-7-7h-2.59l.8-.8Z" fill="currentColor" /><path d="M3 10c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10Z" fill="currentColor" />',
);

export const iconDownload = wrap(
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M17.84 8.06A6.5 6.5 0 1 0 5.18 11 4.5 4.5 0 0 0 5.5 20H17a6 6 0 0 0 .84-11.94Zm-6.16 9.67a.5.5 0 0 0 .64 0l5.15-4.29a.25.25 0 0 0-.16-.44H14V9.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V13H6.7c-.24 0-.35.3-.17.44l5.15 4.3Z" fill="currentColor" />',
);

export const iconRealSize = wrap(
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M1 6c0-1.1.9-2 2-2h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6Zm20 0H3v12h18V6ZM5 9a1 1 0 0 1 1-1h1.5a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-5H6a1 1 0 0 1-1-1Zm11-1a1 1 0 1 0 0 2h.5v5a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1H16Zm-3 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />',
);

export const iconWindowAdaption = wrap(
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M14 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V4h-5a1 1 0 0 1-1-1Zm-4 18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-6a1 1 0 1 1 2 0v5h5a1 1 0 0 1 1 1ZM2 9a1 1 0 0 0 2 0V4h5a1 1 0 1 0 0-2H3a1 1 0 0 0-1 1v6Zm19 5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6a1 1 0 1 1 0-2h5v-5a1 1 0 0 1 1-1ZM8.5 7.5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-7Zm1 7v-5h5v5h-5Z" fill="currentColor" />',
);

export const iconClose = wrap(
  '<path d="M17.66 19.78a1.5 1.5 0 0 0 2.12-2.12L14.12 12l5.66-5.66a1.5 1.5 0 0 0-2.12-2.12L12 9.88 6.34 4.22a1.5 1.5 0 1 0-2.12 2.12L9.88 12l-5.66 5.66a1.5 1.5 0 0 0 2.12 2.12L12 14.12l5.66 5.66Z" fill="currentColor" />',
);

export const iconArrowLeft = wrap(
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M23 12c0 .83-.67 1.5-1.5 1.5H6.12l6.44 6.44a1.5 1.5 0 0 1-2.12 2.12l-9-9a1.5 1.5 0 0 1 0-2.12l9-9a1.5 1.5 0 0 1 2.12 2.12L6.12 10.5H21.5c.83 0 1.5.67 1.5 1.5Z" fill="currentColor" />',
);

export const iconArrowRight = wrap(
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M1 12c0-.83.67-1.5 1.5-1.5h15.38l-6.44-6.44a1.5 1.5 0 0 1 2.12-2.12l9 9a1.5 1.5 0 0 1 0 2.12l-9 9a1.5 1.5 0 0 1-2.12-2.12l6.44-6.44H2.5A1.5 1.5 0 0 1 1 12Z" fill="currentColor" />',
);

export const iconEyeOpened = wrap(
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C5 4 1 10 1 12s4 8 11 8 11-6 11-8-4-8-11-8Zm5 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="currentColor" />',
);

export const iconUploadError = wrap(
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M23 12a11 11 0 1 1-22 0 11 11 0 0 1 22 0Zm-9.5 5.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM12 5a1.9 1.9 0 0 0-1.89 2l.3 5.5a1.59 1.59 0 0 0 3.17 0l.3-5.5c.07-1.09-.8-2-1.88-2Z" fill="currentColor" />',
);
