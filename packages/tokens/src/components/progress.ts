/** Component tokens for Progress (M5 Feedback). 回退 Alias，禁写死。 */
export const progressTokens = {
  'progress-track-color': 'var(--cd-color-fill-0)',
  'progress-stroke-normal': 'var(--cd-color-success)', // 对齐 Semi 默认进度色 success 绿（原 primary 蓝）
  'progress-stroke-success': 'var(--cd-color-success)',
  'progress-stroke-error': 'var(--cd-color-danger)',
  'progress-stroke-warning': 'var(--cd-color-warning)',
  'progress-info-color': 'var(--cd-color-text-0)',
  'progress-info-success-color': 'var(--cd-color-success)',
  'progress-height-small': '4px',
  'progress-height-default': '4px', // 对齐 Semi 水平进度条高度 4px（原 8）
  'progress-height-large': '6px', // 对齐 Semi 大尺寸 6px（原 12）
  'progress-circle-size-small': '80px',
  'progress-circle-size-default': '120px',
  'progress-circle-size-large': '160px',
  'progress-transition': 'var(--cd-motion-duration-mid) var(--cd-motion-ease-standard)',
} as const;
