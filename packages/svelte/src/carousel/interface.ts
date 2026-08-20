import type { Snippet } from 'svelte';

export type Animation = 'slide' | 'fade';
export type IndicatorType = 'dot' | 'line' | 'columnar';
export type IndicatorPosition = 'left' | 'center' | 'right';
export type IndicatorSize = 'small' | 'medium';
export type Theme = 'primary' | 'light' | 'dark';
export type ArrowType = 'hover' | 'always';
export type SlideDirection = 'left' | 'right';
export type TriggerType = 'hover' | 'click';

/** autoPlay 对象形式：{ interval?, hoverToPause? }（对齐 Semi）。 */
export type AutoPlayConfig = { interval?: number; hoverToPause?: boolean };

/** 单个箭头自定义：props 透传到箭头 div，children 覆盖默认 Icon（对齐 Semi ArrowButton）。 */
export interface ArrowButton {
  props?: Record<string, unknown> & { onClick?: () => void; style?: string; class?: string };
  children?: Snippet;
}

export interface ArrowProps {
  leftArrow?: ArrowButton;
  rightArrow?: ArrowButton;
}

export interface CarouselProps {
  /** 每项一张幻灯片的 Snippet 数组（对齐 Semi children）。 */
  slides?: Snippet[];
  /** 受控当前激活索引（Semi API: activeIndex）。 */
  activeIndex?: number;
  /** 非受控初始索引。 */
  defaultActiveIndex?: number;
  /** 自动播放；布尔或 { interval?, hoverToPause? }（默认 true，对齐 Semi）。 */
  autoPlay?: boolean | AutoPlayConfig;
  /** 切换动画。 */
  animation?: Animation;
  /** 切换速度（ms）。 */
  speed?: number;
  /** 是否展示指示器。 */
  showIndicator?: boolean;
  /** 指示器类型：dot / line / columnar。 */
  indicatorType?: IndicatorType;
  /** 指示器位置：left / center / right。 */
  indicatorPosition?: IndicatorPosition;
  /** 指示器尺寸：small / medium。 */
  indicatorSize?: IndicatorSize;
  /** 是否展示箭头。 */
  showArrow?: boolean;
  /** 箭头展示时机：hover 悬停显示 / always 始终显示。 */
  arrowType?: ArrowType;
  /** 自定义箭头内容与点击回调。 */
  arrowProps?: ArrowProps;
  /** 指示器与箭头主题：primary / light / dark（默认 light，对齐 Semi）。 */
  theme?: Theme;
  /** animation=slide 时的滑动方向：left / right。 */
  slideDirection?: SlideDirection;
  /** 指示器触发切换的交互方式：click / hover。 */
  trigger?: TriggerType;
  /** 索引变更回调（对齐 Semi：index, preIndex）。 */
  onChange?: (index: number, preIndex: number) => void;
  /** 根元素内联样式（对齐 Semi style；常用于设定宽高）。 */
  style?: string;
  class?: string;
}

/** i18n 翻译函数（对齐 Semi 由 index.tsx 拥有的 locale 上下文，子组件仅消费）。 */
export type CarouselTranslate = (key: string, params?: Record<string, string | number>) => string;

export interface CarouselIndicatorProps {
  type: IndicatorType;
  total: number;
  activeIndex: number;
  position: IndicatorPosition;
  trigger: TriggerType;
  size: IndicatorSize;
  theme: Theme;
  onIndicatorChange: (index: number) => void;
  t: CarouselTranslate;
}

export interface CarouselArrowProps {
  type: ArrowType;
  theme: Theme;
  prev: () => void;
  next: () => void;
  arrowProps?: ArrowProps | undefined;
  t: CarouselTranslate;
}
