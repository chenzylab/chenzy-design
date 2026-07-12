import type { Snippet } from 'svelte';
import type { MenuProps } from './PreviewFooter.svelte';

export type RatioType = 'adaptation' | 'realSize';
export type { MenuProps };

/**
 * 预览参数（对齐 Semi PreviewProps）。既作 <Image preview={...}> 的对象形态，
 * 也作 <ImagePreview {...}> 组件 props 的公共子集。
 */
export interface PreviewProps {
  /** 受控可见（不回写，仅经 onVisibleChange）。 */
  visible?: boolean;
  defaultVisible?: boolean;
  /** 预览图源：字符串或字符串数组（组/独立用）。 */
  src?: string | string[];
  /** 预览标题（string 或 Snippet）。 */
  previewTitle?: string | Snippet;
  /** 受控当前索引（不回写，仅经 onChange）。 */
  currentIndex?: number;
  defaultCurrentIndex?: number;
  maskClosable?: boolean;
  closable?: boolean;
  closeOnEsc?: boolean;
  zoomStep?: number;
  infinite?: boolean;
  showTooltip?: boolean;
  prevTip?: string;
  nextTip?: string;
  zoomInTip?: string;
  zoomOutTip?: string;
  rotateTip?: string;
  downloadTip?: string;
  adaptiveTip?: string;
  originTip?: string;
  lazyLoad?: boolean;
  lazyLoadMargin?: string;
  preLoad?: boolean;
  preLoadGap?: number;
  viewerVisibleDelay?: number;
  disableDownload?: boolean;
  zIndex?: number;
  crossOrigin?: 'anonymous' | 'use-credentials';
  maxZoom?: number;
  minZoom?: number;
  initialZoom?: number;
  previewCls?: string;
  previewStyle?: string;
  getPopupContainer?: () => HTMLElement | null;
  setDownloadName?: (src: string) => string;
  renderHeader?: Snippet<[string | Snippet | undefined]>;
  renderPreviewMenu?: Snippet<[MenuProps]>;
  renderCloseIcon?: Snippet;
  renderLeftIcon?: Snippet;
  renderRightIcon?: Snippet;
  onVisibleChange?: (visible: boolean) => void;
  onChange?: (index: number) => void;
  onClose?: () => void;
  onZoomIn?: (zoom: number) => void;
  onZoomOut?: (zoom: number) => void;
  onPrev?: (index: number) => void;
  onNext?: (index: number) => void;
  onRotateLeft?: (angle: number) => void;
  onRatioChange?: (type: RatioType) => void;
  onDownload?: (src: string, index: number) => void;
  onDownloadError?: (src: string) => void;
}
