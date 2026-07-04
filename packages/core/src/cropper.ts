/**
 * createCropper — framework-agnostic geometry engine for the Cropper component.
 * Ported 逐行 from Semi 的 semi-foundation/cropper/foundation.js (CropperFoundation).
 * See specs/components/show/Cropper.spec.md §3.
 *
 * 纯几何/状态：容器/图片/裁切框坐标换算、8 角点 resize（自由 + aspectRatio 约束）、
 * 裁切框拖拽、图片拖拽、滚轮缩放（min/maxZoom 钳制）、resize 重排、坐标→canvas。
 * 所有 DOM 读取（container/img 尺寸、bounding rect）经 adapter 注入，
 * document 级 mousemove/mouseup 绑定由 svelte 渲染层负责；本模块只算不碰 DOM 监听。
 *
 * 坐标系：以裁切容器左上角为原点，x 向右、y 向下。centerPoint 存的是几何中心。
 */

/** 2D 点。 */
export interface Point {
  x: number;
  y: number;
}

/** 图片的固有信息（原始像素尺寸 + 初始适配缩放）。 */
export interface CropperImageData {
  originalWidth: number;
  originalHeight: number;
  /** 图片加载后为适配容器所做的初始缩放（naturalWidth * scale = 显示宽）。 */
  scale: number;
}

/** 图片当前的显示态（显示宽高 + 中心点，随缩放/拖拽/旋转变化）。 */
export interface CropperImageState {
  width: number;
  height: number;
  centerPoint: Point;
}

/** 裁切框当前态。 */
export interface CropperBox {
  width: number;
  height: number;
  centerPoint: Point;
}

/** 容器尺寸。 */
export interface ContainerData {
  width: number;
  height: number;
}

/** 角点方向：4 角 + 4 边中点。 */
export type CropperCorner = 'tl' | 'tm' | 'tr' | 'ml' | 'mr' | 'bl' | 'bm' | 'br';

/** 裁切框形状。 */
export type CropperShape = 'rect' | 'round' | 'roundRect';

/** 角点全集与圆形（round）时仅保留的 4 个边中点角点。 */
export const CROPPER_CORNERS: readonly CropperCorner[] = [
  'tl',
  'tm',
  'tr',
  'ml',
  'mr',
  'bl',
  'bm',
  'br',
];
export const CROPPER_ROUND_CORNERS: readonly CropperCorner[] = ['tm', 'ml', 'mr', 'bm'];
export const CROPPER_SHAPES: readonly CropperShape[] = ['rect', 'round', 'roundRect'];

/** adapter：渲染层注入的 DOM 读取 + 变更通知。core 只调、不持有 DOM 引用。 */
export interface CropperAdapter {
  /** 返回裁切容器元素（读 clientWidth/clientHeight/getBoundingClientRect）。 */
  getContainer: () => { clientWidth: number; clientHeight: number; getBoundingClientRect: () => DOMRect } | null;
  /** 返回原始 <img> 元素（getCropperCanvas 绘制时用）。 */
  getImg: () => HTMLImageElement | null;
  /** zoom 变化通知（映射 onZoomChange）。 */
  notifyZoomChange: (zoom: number) => void;
}

/** core 需消费的 props（默认值语义对齐 Semi defaultProps）。 */
export interface CropperFoundationProps {
  src?: string | undefined;
  /** 受控裁切比例。设置后角点 resize 走 aspect 约束分支。 */
  aspectRatio?: number | undefined;
  /** 图片加载时裁切框初始比例，默认 1（仅 aspectRatio 未设时生效）。 */
  defaultAspectRatio: number;
  fill: string;
  maxZoom: number;
  minZoom: number;
  zoomStep: number;
}

/** core 维护的响应式状态（渲染层订阅）。 */
export interface CropperFoundationState {
  imgData: CropperImageState;
  cropperBox: CropperBox;
  zoom: number;
  rotate: number;
  loaded: boolean;
}

/** getMiddle — 将 value 钳制到 [min, max]。（Semi cropper.utils.getMiddle） */
export function getMiddle(value: number, [min, max]: [number, number]): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * getAspectHW — 在给定 (width, height) 外接框内取满足 aspect(=w/h) 的最大内接矩形宽高。
 * （Semi cropper.utils.getAspectHW）
 */
export function getAspectHW(width: number, height: number, aspect: number): [number, number] {
  if (width / height > aspect) {
    width = height * aspect;
  } else {
    height = width / aspect;
  }
  return [width, height];
}

const DEFAULT_PROPS: CropperFoundationProps = {
  defaultAspectRatio: 1,
  fill: 'rgba(0, 0, 0, 0)',
  maxZoom: 3,
  minZoom: 0.1,
  zoomStep: 0.1,
};

/** 每个方向的 resize 参数（自由 resize 分支用）。 */
export function getMoveParamByDir(dir: CropperCorner): { paramX: number; paramY: number } {
  let paramX = 0;
  let paramY = 0;
  switch (dir) {
    case 'tl':
      paramX = -1;
      paramY = -1;
      break;
    case 'tm':
      paramY = -1;
      break;
    case 'tr':
      paramX = 1;
      paramY = -1;
      break;
    case 'ml':
      paramX = -1;
      break;
    case 'mr':
      paramX = 1;
      break;
    case 'bl':
      paramX = -1;
      paramY = 1;
      break;
    case 'bm':
      paramY = 1;
      break;
    case 'br':
      paramX = 1;
      paramY = 1;
      break;
    default:
      break;
  }
  return { paramX, paramY };
}

/**
 * createCropperFoundation — 构造几何引擎实例。
 * 状态经 `getState()` 读、`setState()` 写（渲染层将其桥接到框架响应式）。
 */
export function createCropperFoundation(options: {
  adapter: CropperAdapter;
  getProps: () => Partial<CropperFoundationProps>;
  getState: () => CropperFoundationState;
  setState: (patch: Partial<CropperFoundationState>) => void;
}) {
  const { adapter, getState, setState } = options;
  const getProps = (): CropperFoundationProps => ({ ...DEFAULT_PROPS, ...options.getProps() });

  // ——— 非响应式内部簿记（Semi 中挂在 foundation 实例上的字段） ———
  const containerData: ContainerData = { width: 0, height: 0 };
  const imgData: CropperImageData = { originalWidth: 0, originalHeight: 0, scale: 1 };
  let boxMoveDir: CropperCorner | '' = '';
  let boxMoveParam = { paramX: 0, paramY: 0 };
  let rangeX: [number, number] = [0, 0];
  let rangeY: [number, number] = [0, 0];
  let initial = false;
  let cropperBoxMoveStart: Point | null = null;
  let imgMoveStart: Point | null = null;
  let moveRange = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };

  function init(): void {
    const container = adapter.getContainer();
    if (container) {
      containerData.width = container.clientWidth;
      containerData.height = container.clientHeight;
    }
    cropperBoxMoveStart = null;
  }

  // ——— resize 重排 ———
  function getImgDataWhenResize(ratio: number): CropperImageState {
    const { imgData: imgState } = getState();
    const newImgData: CropperImageState = {
      width: imgState.width * ratio,
      height: imgState.height * ratio,
      centerPoint: {
        x: imgState.centerPoint.x * ratio,
        y: imgState.centerPoint.y * ratio,
      },
    };
    imgData.scale *= ratio;
    return newImgData;
  }

  function getCropperBoxWhenResize(ratio: number, newContainerData: ContainerData): CropperBox {
    const { cropperBox } = getState();
    const { aspectRatio } = getProps();
    const tempCropperBox = {
      width: cropperBox.width * ratio,
      height: cropperBox.height * ratio,
      centerPoint: {
        x: cropperBox.centerPoint.x * ratio,
        y: cropperBox.centerPoint.y * ratio,
      },
    };
    let xMin = tempCropperBox.centerPoint.x - tempCropperBox.width / 2;
    let xMax = tempCropperBox.centerPoint.x + tempCropperBox.width / 2;
    let yMin = tempCropperBox.centerPoint.y - tempCropperBox.height / 2;
    let yMax = tempCropperBox.centerPoint.y + tempCropperBox.height / 2;
    if (aspectRatio) {
      if (xMax > newContainerData.width) {
        xMax = newContainerData.width;
        xMin =
          tempCropperBox.width > newContainerData.width ? 0 : newContainerData.width - tempCropperBox.width;
        tempCropperBox.width = xMax - xMin;
        tempCropperBox.height = tempCropperBox.width / aspectRatio;
        yMax = yMin + tempCropperBox.height;
      }
      if (yMax > newContainerData.height) {
        yMax = newContainerData.height;
        yMin =
          tempCropperBox.height > newContainerData.height
            ? 0
            : newContainerData.height - tempCropperBox.height;
        tempCropperBox.height = yMax - yMin;
        tempCropperBox.width = tempCropperBox.height * aspectRatio;
        xMax = xMin + tempCropperBox.width;
      }
    } else {
      if (xMax > newContainerData.width) {
        xMax = newContainerData.width;
        xMin =
          tempCropperBox.width > newContainerData.width ? 0 : newContainerData.width - tempCropperBox.width;
      }
      if (yMax > newContainerData.height) {
        yMax = newContainerData.height;
        yMin =
          tempCropperBox.height > newContainerData.height
            ? 0
            : newContainerData.height - tempCropperBox.height;
      }
    }
    return {
      width: xMax - xMin,
      height: yMax - yMin,
      centerPoint: {
        x: (xMax + xMin) / 2,
        y: (yMax + yMin) / 2,
      },
    };
  }

  function handleResize(): void {
    const { loaded } = getState();
    // Semi：首帧（观测器 observe 时的初始回调）跳过，避免用 0 尺寸重排。
    if (!initial) {
      initial = true;
      return;
    }
    if (!loaded) {
      return;
    }
    const container = adapter.getContainer();
    if (!container) return;
    const newContainerData: ContainerData = {
      width: container.clientWidth,
      height: container.clientHeight,
    };
    if (containerData.width === 0) return;
    const ratio = newContainerData.width / containerData.width;
    const newImgData = getImgDataWhenResize(ratio);
    const newCropperBox = getCropperBoxWhenResize(ratio, newContainerData);
    containerData.width = newContainerData.width;
    containerData.height = newContainerData.height;
    setState({ imgData: newImgData, cropperBox: newCropperBox });
  }

  // ——— 图片加载：计算初始适配缩放 + 裁切框初始尺寸 ———
  function handleImageLoad(target: { naturalWidth: number; naturalHeight: number }): void {
    const { naturalWidth, naturalHeight } = target;
    const container = adapter.getContainer();
    // 容器尺寸以最新读取为准（首次加载时 init 可能早于布局稳定）。
    if (container) {
      containerData.width = container.clientWidth;
      containerData.height = container.clientHeight;
    }
    const { width: containerWidth, height: containerHeight } = containerData;
    imgData.originalWidth = naturalWidth;
    imgData.originalHeight = naturalHeight;
    let scale: number;
    const newImgDataState: CropperImageState = {
      width: 0,
      height: 0,
      centerPoint: { x: 0, y: 0 },
    };
    if (naturalWidth / containerWidth > naturalHeight / containerHeight) {
      scale = containerWidth / naturalWidth;
      newImgDataState.width = containerWidth;
      newImgDataState.height = naturalHeight * scale;
    } else {
      scale = containerHeight / naturalHeight;
      newImgDataState.width = naturalWidth * scale;
      newImgDataState.height = containerHeight;
    }
    imgData.scale = scale;
    newImgDataState.centerPoint = {
      x: containerWidth / 2,
      y: containerHeight / 2,
    };
    // 裁切框初始尺寸
    const { defaultAspectRatio, aspectRatio } = getProps();
    const calcAspect = aspectRatio || defaultAspectRatio;
    const newCropperBoxState: CropperBox = {
      width: 0,
      height: 0,
      centerPoint: { x: containerWidth / 2, y: containerHeight / 2 },
    };
    if (containerWidth / containerHeight > calcAspect) {
      newCropperBoxState.width = containerHeight * calcAspect;
      newCropperBoxState.height = containerHeight;
    } else {
      newCropperBoxState.width = containerWidth;
      newCropperBoxState.height = containerWidth / calcAspect;
    }
    setState({ imgData: newImgDataState, cropperBox: newCropperBoxState, loaded: true });
  }

  // ——— 滚轮缩放（以指针位置为缩放中心，钳制 min/maxZoom） ———
  function handleWheel(e: {
    deltaY: number;
    clientX: number;
    clientY: number;
    preventDefault?: () => void;
  }): void {
    e.preventDefault?.();
    const { imgData: imgState, zoom: currZoom } = getState();
    const { maxZoom, minZoom, zoomStep } = getProps();
    let nextZoom: number | undefined;
    if (e.deltaY < 0) {
      // zoom in
      if (currZoom + zoomStep <= maxZoom) {
        nextZoom = Number((currZoom + zoomStep).toFixed(2));
      }
    } else if (e.deltaY > 0) {
      // zoom out
      if (currZoom - zoomStep >= minZoom) {
        nextZoom = Number((currZoom - zoomStep).toFixed(2));
      }
    }
    if (nextZoom === undefined) {
      return;
    }
    const container = adapter.getContainer();
    if (!container) return;
    const boundingRect = container.getBoundingClientRect();
    const offsetX = e.clientX - boundingRect.left;
    const offsetY = e.clientY - boundingRect.top;
    const scaleCenter = { x: offsetX, y: -offsetY };
    const currentPoint = { ...imgState.centerPoint };
    currentPoint.y = -currentPoint.y;
    const newCenterPoint: Point = {
      x: ((currentPoint.x - scaleCenter.x) / currZoom) * nextZoom + scaleCenter.x,
      y: -(((currentPoint.y - scaleCenter.y) / currZoom) * nextZoom + scaleCenter.y),
    };
    const newWidth = (imgState.width / currZoom) * nextZoom;
    const newHeight = (imgState.height / currZoom) * nextZoom;
    setState({
      imgData: { width: newWidth, height: newHeight, centerPoint: newCenterPoint },
      zoom: nextZoom,
    });
    adapter.notifyZoomChange(nextZoom);
  }

  // ——— 角点 resize：aspect 约束下的可移动范围 ———
  function getRangeForAspectChange(): void {
    const { cropperBox } = getState();
    const { aspectRatio } = getProps();
    const { width: containerWidth, height: containerHeight } = containerData;
    if (!aspectRatio) return;
    let height: number;
    let width: number;
    const xMin = cropperBox.centerPoint.x - cropperBox.width / 2;
    const xMax = cropperBox.centerPoint.x + cropperBox.width / 2;
    const yMin = cropperBox.centerPoint.y - cropperBox.height / 2;
    const yMax = cropperBox.centerPoint.y + cropperBox.height / 2;
    switch (boxMoveDir) {
      case 'tl':
        height = yMax;
        width = xMax;
        [width, height] = getAspectHW(width, height, aspectRatio);
        rangeX = [xMax - width, xMax];
        rangeY = [yMax - height, yMax];
        break;
      case 'tm': {
        height = yMax;
        const leftHalfWidth = cropperBox.centerPoint.x;
        const rightHalfWidth = containerWidth - cropperBox.centerPoint.x;
        width = 2 * (leftHalfWidth < rightHalfWidth ? leftHalfWidth : rightHalfWidth);
        [width, height] = getAspectHW(width, height, aspectRatio);
        rangeX = [cropperBox.centerPoint.x - width / 2, cropperBox.centerPoint.x + width / 2];
        rangeY = [yMax - height, yMax];
        break;
      }
      case 'tr':
        height = yMax;
        width = containerWidth - xMin;
        [width, height] = getAspectHW(width, height, aspectRatio);
        rangeX = [xMin, xMin + width];
        rangeY = [yMax - height, yMax];
        break;
      case 'ml': {
        width = xMax;
        const topHalfHeight = cropperBox.centerPoint.y;
        const bottomHalfHeight = containerHeight - cropperBox.centerPoint.y;
        height = 2 * (topHalfHeight < bottomHalfHeight ? topHalfHeight : bottomHalfHeight);
        [width, height] = getAspectHW(width, height, aspectRatio);
        rangeX = [xMax - width, xMax];
        rangeY = [cropperBox.centerPoint.y - height / 2, cropperBox.centerPoint.y + height / 2];
        break;
      }
      case 'mr': {
        width = containerWidth - xMin;
        const topHalfHeight = cropperBox.centerPoint.y;
        const bottomHalfHeight = containerHeight - cropperBox.centerPoint.y;
        height = 2 * (topHalfHeight < bottomHalfHeight ? topHalfHeight : bottomHalfHeight);
        [width, height] = getAspectHW(width, height, aspectRatio);
        rangeX = [xMin, xMin + width];
        rangeY = [cropperBox.centerPoint.y - height / 2, cropperBox.centerPoint.y + height / 2];
        break;
      }
      case 'bl':
        height = containerHeight - yMin;
        width = xMax;
        [width, height] = getAspectHW(width, height, aspectRatio);
        rangeX = [xMax - width, xMax];
        rangeY = [yMin, yMin + height];
        break;
      case 'bm': {
        height = containerHeight - yMin;
        const leftHalfWidth = cropperBox.centerPoint.x;
        const rightHalfWidth = containerWidth - cropperBox.centerPoint.x;
        width = 2 * (leftHalfWidth < rightHalfWidth ? leftHalfWidth : rightHalfWidth);
        [width, height] = getAspectHW(width, height, aspectRatio);
        rangeX = [cropperBox.centerPoint.x - width / 2, cropperBox.centerPoint.x + width / 2];
        rangeY = [yMin, yMin + height];
        break;
      }
      case 'br':
        height = containerHeight - yMin;
        width = containerWidth - xMin;
        [width, height] = getAspectHW(width, height, aspectRatio);
        rangeX = [xMin, xMin + width];
        rangeY = [yMin, yMin + height];
        break;
      default:
        break;
    }
  }

  /** 角点 mousedown：记录方向、算参数与可移动范围。渲染层随后绑 document 事件。 */
  function handleCornerMouseDown(dir: CropperCorner): void {
    boxMoveDir = dir;
    boxMoveParam = getMoveParamByDir(dir);
    const { aspectRatio } = getProps();
    if (aspectRatio) {
      getRangeForAspectChange();
    } else {
      rangeX = [0, containerData.width];
      rangeY = [0, containerData.height];
    }
  }

  function changeDir(): void {
    if (boxMoveDir.includes('t')) {
      boxMoveDir = boxMoveDir.replace('t', 'b') as CropperCorner;
    } else if (boxMoveDir.includes('b')) {
      boxMoveDir = boxMoveDir.replace('b', 't') as CropperCorner;
    }
    if (boxMoveDir.includes('l')) {
      boxMoveDir = boxMoveDir.replace('l', 'r') as CropperCorner;
    } else if (boxMoveDir.includes('r')) {
      boxMoveDir = boxMoveDir.replace('r', 'l') as CropperCorner;
    }
  }

  /** aspectRatio 约束下的角点 resize。clientX/Y 为鼠标坐标。 */
  function handleCornerAspectMouseMove(clientX: number, clientY: number): void {
    const { cropperBox } = getState();
    const { aspectRatio } = getProps();
    const container = adapter.getContainer();
    if (!container || !aspectRatio) return;
    const boundingRect = container.getBoundingClientRect();
    const newCropperBoxPos: CropperBox = {
      width: cropperBox.width,
      height: cropperBox.height,
      centerPoint: { ...cropperBox.centerPoint },
    };
    let offsetX = 0;
    let offsetY = 0;
    if (boxMoveDir === 'ml' || boxMoveDir === 'mr') {
      offsetX = getMiddle(clientX - boundingRect.left, rangeX);
    } else {
      offsetY = getMiddle(clientY - boundingRect.top, rangeY);
    }
    switch (boxMoveDir) {
      case 'tl':
        newCropperBoxPos.height = rangeY[1] - offsetY;
        newCropperBoxPos.width = newCropperBoxPos.height * aspectRatio;
        newCropperBoxPos.centerPoint = {
          x: rangeX[1] - newCropperBoxPos.width / 2,
          y: rangeY[1] - newCropperBoxPos.height / 2,
        };
        break;
      case 'tm':
        newCropperBoxPos.height = rangeY[1] - offsetY;
        newCropperBoxPos.width = newCropperBoxPos.height * aspectRatio;
        newCropperBoxPos.centerPoint = {
          x: cropperBox.centerPoint.x,
          y: rangeY[1] - newCropperBoxPos.height / 2,
        };
        break;
      case 'tr':
        newCropperBoxPos.height = rangeY[1] - offsetY;
        newCropperBoxPos.width = newCropperBoxPos.height * aspectRatio;
        newCropperBoxPos.centerPoint = {
          x: rangeX[0] + newCropperBoxPos.width / 2,
          y: rangeY[1] - newCropperBoxPos.height / 2,
        };
        break;
      case 'ml':
        newCropperBoxPos.width = rangeX[1] - offsetX;
        newCropperBoxPos.height = newCropperBoxPos.width / aspectRatio;
        newCropperBoxPos.centerPoint = {
          x: rangeX[1] - newCropperBoxPos.width / 2,
          y: cropperBox.centerPoint.y,
        };
        break;
      case 'mr':
        newCropperBoxPos.width = offsetX - rangeX[0];
        newCropperBoxPos.height = newCropperBoxPos.width / aspectRatio;
        newCropperBoxPos.centerPoint = {
          x: rangeX[0] + newCropperBoxPos.width / 2,
          y: cropperBox.centerPoint.y,
        };
        break;
      case 'bl':
        newCropperBoxPos.height = offsetY - rangeY[0];
        newCropperBoxPos.width = newCropperBoxPos.height * aspectRatio;
        newCropperBoxPos.centerPoint = {
          x: rangeX[1] - newCropperBoxPos.width / 2,
          y: rangeY[0] + newCropperBoxPos.height / 2,
        };
        break;
      case 'bm':
        newCropperBoxPos.height = offsetY - rangeY[0];
        newCropperBoxPos.width = newCropperBoxPos.height * aspectRatio;
        newCropperBoxPos.centerPoint = {
          x: cropperBox.centerPoint.x,
          y: rangeY[0] + newCropperBoxPos.height / 2,
        };
        break;
      case 'br':
        newCropperBoxPos.height = offsetY - rangeY[0];
        newCropperBoxPos.width = newCropperBoxPos.height * aspectRatio;
        newCropperBoxPos.centerPoint = {
          x: rangeX[0] + newCropperBoxPos.width / 2,
          y: rangeY[0] + newCropperBoxPos.height / 2,
        };
        break;
      default:
        break;
    }
    // 收缩到 0 时反向翻转方向，允许跨过对边继续拉伸。
    if (newCropperBoxPos.height === 0 && newCropperBoxPos.width === 0) {
      changeDir();
      getRangeForAspectChange();
    }
    setState({ cropperBox: newCropperBoxPos });
  }

  /** 自由（无 aspectRatio）角点 resize。 */
  function handleCornerMouseMove(clientX: number, clientY: number): void {
    const { cropperBox } = getState();
    const container = adapter.getContainer();
    if (!container) return;
    const boundingRect = container.getBoundingClientRect();
    const offsetX = getMiddle(clientX - boundingRect.left, rangeX);
    const offsetY = getMiddle(clientY - boundingRect.top, rangeY);
    const newCropperBoxPos: CropperBox = {
      width: cropperBox.width,
      height: cropperBox.height,
      centerPoint: { x: cropperBox.centerPoint.x, y: cropperBox.centerPoint.y },
    };
    const { paramX, paramY } = boxMoveParam;
    if (paramX) {
      const x = cropperBox.centerPoint.x + (paramX * cropperBox.width) / 2;
      newCropperBoxPos.width = cropperBox.width + paramX * (offsetX - x);
      if (newCropperBoxPos.width < 0) {
        newCropperBoxPos.width = -newCropperBoxPos.width;
        boxMoveParam.paramX = -paramX;
      }
      newCropperBoxPos.centerPoint.x = offsetX - (boxMoveParam.paramX * newCropperBoxPos.width) / 2;
    }
    if (paramY) {
      const y = cropperBox.centerPoint.y + (paramY * cropperBox.height) / 2;
      newCropperBoxPos.height = cropperBox.height + paramY * (offsetY - y);
      if (newCropperBoxPos.height < 0) {
        newCropperBoxPos.height = -newCropperBoxPos.height;
        boxMoveParam.paramY = -paramY;
      }
      newCropperBoxPos.centerPoint.y = offsetY - (boxMoveParam.paramY * newCropperBoxPos.height) / 2;
    }
    setState({ cropperBox: newCropperBoxPos });
  }

  /** 角点拖拽移动的统一入口，按当前是否 aspect 约束分派。 */
  function handleCornerMove(clientX: number, clientY: number): void {
    const { aspectRatio } = getProps();
    if (aspectRatio) {
      handleCornerAspectMouseMove(clientX, clientY);
    } else {
      handleCornerMouseMove(clientX, clientY);
    }
  }

  function handleCornerMouseUp(): void {
    boxMoveParam = { paramX: 0, paramY: 0 };
  }

  // ——— 裁切框整体拖拽 ———
  function handleCropperBoxMouseDown(clientX: number, clientY: number): void {
    const { cropperBox } = getState();
    const container = adapter.getContainer();
    if (!container) return;
    const boundingRect = container.getBoundingClientRect();
    cropperBoxMoveStart = { x: clientX, y: clientY };
    moveRange = {
      xMin: cropperBox.width / 2,
      xMax: boundingRect.width - cropperBox.width / 2,
      yMin: cropperBox.height / 2,
      yMax: boundingRect.height - cropperBox.height / 2,
    };
  }

  function handleCropperBoxMouseMove(clientX: number, clientY: number): void {
    if (!cropperBoxMoveStart) return;
    const { cropperBox } = getState();
    const offsetX = clientX - cropperBoxMoveStart.x;
    const offsetY = clientY - cropperBoxMoveStart.y;
    const newCenterPointX = getMiddle(cropperBox.centerPoint.x + offsetX, [
      moveRange.xMin,
      moveRange.xMax,
    ]);
    const newCenterPointY = getMiddle(cropperBox.centerPoint.y + offsetY, [
      moveRange.yMin,
      moveRange.yMax,
    ]);
    cropperBoxMoveStart = { x: clientX, y: clientY };
    setState({
      cropperBox: {
        width: cropperBox.width,
        height: cropperBox.height,
        centerPoint: { x: newCenterPointX, y: newCenterPointY },
      },
    });
  }

  function handleCropperBoxMouseUp(): void {
    if (!cropperBoxMoveStart) return;
    cropperBoxMoveStart = null;
  }

  // ——— 遮罩层（图片）拖拽 ———
  function handleImgMoveStart(clientX: number, clientY: number): void {
    imgMoveStart = { x: clientX, y: clientY };
  }

  function handleImgMove(clientX: number, clientY: number): void {
    if (!imgMoveStart) return;
    const { imgData: imgState } = getState();
    const offsetX = clientX - imgMoveStart.x;
    const offsetY = clientY - imgMoveStart.y;
    imgMoveStart = { x: clientX, y: clientY };
    setState({
      imgData: {
        width: imgState.width,
        height: imgState.height,
        centerPoint: {
          x: imgState.centerPoint.x + offsetX,
          y: imgState.centerPoint.y + offsetY,
        },
      },
    });
  }

  function handleImgMoveUp(): void {
    if (!imgMoveStart) return;
    imgMoveStart = null;
  }

  // ——— 受控 rotate / zoom 变化的几何重算（映射 Semi getDerivedStateFromProps） ———
  /**
   * 由渲染层在 rotate/zoom prop 变化时调用，围绕裁切框中心旋转/缩放图片中心点。
   * 返回新的 imgData（渲染层写回 state）。不含 loaded 判定（渲染层已判）。
   */
  function computeControlledImgData(nextRotate: number, nextZoom: number): CropperImageState {
    const { rotate, zoom, imgData: imgState, cropperBox } = getState();
    let nextWidth = imgState.width;
    let nextHeight = imgState.height;
    let nextImgCenter = { ...imgState.centerPoint };
    if (nextRotate !== rotate) {
      const rotateCenter = { x: cropperBox.centerPoint.x, y: -cropperBox.centerPoint.y };
      const imgCenter = { x: imgState.centerPoint.x, y: -imgState.centerPoint.y };
      const angle = ((nextRotate - rotate) * Math.PI) / 180;
      nextImgCenter = {
        x:
          (imgCenter.x - rotateCenter.x) * Math.cos(angle) +
          (imgCenter.y - rotateCenter.y) * Math.sin(angle) +
          rotateCenter.x,
        y: -(
          -(imgCenter.x - rotateCenter.x) * Math.sin(angle) +
          (imgCenter.y - rotateCenter.y) * Math.cos(angle) +
          rotateCenter.y
        ),
      };
    }
    if (nextZoom !== zoom) {
      const scaleCenter = { x: cropperBox.centerPoint.x, y: -cropperBox.centerPoint.y };
      const currentImgCenter = { x: nextImgCenter.x, y: -nextImgCenter.y };
      nextWidth = (imgState.width / zoom) * nextZoom;
      nextHeight = (imgState.height / zoom) * nextZoom;
      nextImgCenter = {
        x: ((currentImgCenter.x - scaleCenter.x) / zoom) * nextZoom + scaleCenter.x,
        y: -(((currentImgCenter.y - scaleCenter.y) / zoom) * nextZoom + scaleCenter.y),
      };
    }
    return { width: nextWidth, height: nextHeight, centerPoint: nextImgCenter };
  }

  // ——— 裁切结果 canvas ———
  /**
   * 依当前裁切框/图片/rotate/zoom 生成裁切结果 canvas。
   * 逐行移植 Semi getCropperCanvas：先绘旋转后的整图到中间 canvas，
   * 再按裁切框相对位置 getImageData/putImageData 到结果 canvas，超界用 fill 填充。
   * 需要 DOM canvas 2D 上下文，jsdom 下不可用（渲染层测试对此 skip）。
   */
  function getCropperCanvas(): HTMLCanvasElement {
    const { cropperBox, imgData: imgState, rotate, zoom } = getState();
    const { fill } = getProps();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = adapter.getImg();
    if (!ctx || !img) {
      return canvas;
    }
    const angle = (rotate * Math.PI) / 180;
    const sine = Math.abs(Math.sin(angle));
    const cosine = Math.abs(Math.cos(angle));
    const imgWidth = imgData.originalWidth;
    const imgHeight = imgData.originalHeight;
    const containerWidth = imgWidth * cosine + imgHeight * sine;
    const containerHeight = imgHeight * cosine + imgWidth * sine;
    const cropperContainerWidth = containerWidth * zoom * imgData.scale;
    const cropperContainerHeight = containerHeight * zoom * imgData.scale;
    const cropperContainerTop = imgState.centerPoint.y - cropperContainerHeight / 2;
    const cropperContainerLeft = imgState.centerPoint.x - cropperContainerWidth / 2;
    const cropperBoxLeft = cropperBox.centerPoint.x - cropperBox.width / 2;
    const cropperBoxTop = cropperBox.centerPoint.y - cropperBox.height / 2;
    const realZoom = zoom * imgData.scale;
    const relativeCropLeft = (cropperBoxLeft - cropperContainerLeft) / realZoom;
    const relativeCropTop = (cropperBoxTop - cropperContainerTop) / realZoom;
    const relativeWidth = cropperBox.width / realZoom;
    const relativeHeight = cropperBox.height / realZoom;
    const relativeCropRight = relativeCropLeft + relativeWidth;
    const relativeCropBottom = relativeCropTop + relativeHeight;
    if (
      relativeCropRight < 0 ||
      relativeCropBottom < 0 ||
      relativeCropLeft > containerWidth ||
      relativeCropTop > containerHeight
    ) {
      const emptyCanvas = document.createElement('canvas');
      const emptyCtx = emptyCanvas.getContext('2d');
      emptyCanvas.width = relativeWidth;
      emptyCanvas.height = relativeHeight;
      if (emptyCtx) {
        emptyCtx.fillStyle = fill;
        emptyCtx.fillRect(0, 0, relativeWidth, relativeHeight);
      }
      return emptyCanvas;
    }
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, containerWidth, containerHeight);
    const halfWidth = containerWidth / 2;
    const halfHeight = containerHeight / 2;
    ctx.translate(halfWidth, halfHeight);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.translate(-halfWidth, -halfHeight);
    const imgX = (containerWidth - imgWidth) / 2;
    const imgY = (containerHeight - imgHeight) / 2;
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight, imgX, imgY, imgWidth, imgHeight);
    const canvas2 = document.createElement('canvas');
    const ctx2 = canvas2.getContext('2d');
    let realLeft = relativeCropLeft;
    let realTop = relativeCropTop;
    let realWidth = relativeWidth;
    let realHeight = relativeHeight;
    if (relativeCropLeft < 0) {
      realLeft = 0;
    }
    if (relativeCropTop < 0) {
      realTop = 0;
    }
    if (relativeCropRight > containerWidth) {
      realWidth = containerWidth - realLeft;
    } else if (relativeCropLeft < 0) {
      realWidth = relativeCropRight;
    }
    if (relativeCropBottom > containerHeight) {
      realHeight = containerHeight - realTop;
    } else if (relativeCropTop < 0) {
      realHeight = relativeCropBottom;
    }
    const imgDataResult = ctx.getImageData(realLeft, realTop, realWidth, realHeight);
    canvas2.width = relativeWidth;
    canvas2.height = relativeHeight;
    if (ctx2) {
      ctx2.fillStyle = fill;
      ctx2.fillRect(0, 0, relativeWidth, relativeHeight);
      ctx2.putImageData(
        imgDataResult,
        relativeCropLeft < 0 ? -relativeCropLeft : 0,
        relativeCropTop < 0 ? -relativeCropTop : 0,
      );
    }
    return canvas2;
  }

  /**
   * 预览尺寸/变换计算（映射 Semi updatePreview 的纯几何部分）。
   * 输入预览容器初始尺寸 + 当前图片/裁切框态，返回预览 img 与容器的样式尺寸。
   */
  function computePreview(
    previewContainerInitSize: { width: number; height: number },
    props: { width: number; height: number; translateX: number; translateY: number; rotate: number },
  ): {
    imgWidth: number;
    imgHeight: number;
    translateX: number;
    translateY: number;
    rotate: number;
    containerWidth: number;
    containerHeight: number;
  } {
    const { cropperBox } = getState();
    let zoom: number;
    const { width: containerWidth, height: containerHeight } = previewContainerInitSize;
    let previewWidth = containerWidth;
    let previewHeight = containerHeight;
    if (previewWidth < previewHeight) {
      zoom = containerWidth / cropperBox.width;
      const tempHeight = zoom * cropperBox.height;
      if (tempHeight > containerHeight) {
        zoom = containerHeight / cropperBox.height;
        previewWidth = zoom * cropperBox.width;
      } else {
        previewHeight = tempHeight;
      }
    } else {
      zoom = containerHeight / cropperBox.height;
      const tempWidth = zoom * cropperBox.width;
      if (tempWidth > containerWidth) {
        zoom = containerWidth / cropperBox.width;
        previewHeight = zoom * cropperBox.height;
      } else {
        previewWidth = tempWidth;
      }
    }
    return {
      imgWidth: props.width * zoom,
      imgHeight: props.height * zoom,
      translateX: props.translateX * zoom,
      translateY: props.translateY * zoom,
      rotate: props.rotate,
      containerWidth: previewWidth,
      containerHeight: previewHeight,
    };
  }

  return {
    // 状态读取（供测试/渲染层查内部簿记）
    getContainerData: () => ({ ...containerData }),
    getImageMeta: () => ({ ...imgData }),
    getBoxMoveDir: () => boxMoveDir,
    getRangeX: () => [...rangeX] as [number, number],
    getRangeY: () => [...rangeY] as [number, number],
    // 生命周期
    init,
    // resize
    handleResize,
    getImgDataWhenResize,
    getCropperBoxWhenResize,
    // 加载 / 缩放
    handleImageLoad,
    handleWheel,
    // 角点 resize
    handleCornerMouseDown,
    handleCornerMove,
    handleCornerMouseUp,
    getRangeForAspectChange,
    // 裁切框拖拽
    handleCropperBoxMouseDown,
    handleCropperBoxMouseMove,
    handleCropperBoxMouseUp,
    // 图片拖拽
    handleImgMoveStart,
    handleImgMove,
    handleImgMoveUp,
    // 受控变换
    computeControlledImgData,
    // 结果 / 预览
    getCropperCanvas,
    computePreview,
  };
}

export type CropperFoundation = ReturnType<typeof createCropperFoundation>;
