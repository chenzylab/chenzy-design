/**
 * previewGeometry — 预览图缩放/旋转/平移的纯几何计算（无框架依赖、无 DOM）。
 * 逐一移植自 Semi semi-foundation/image/previewImageFoundation.ts，供 PreviewImage 消费。
 * 纯函数 → 可单测（红线 #2：派生几何为纯函数）。
 */

export interface Size {
  width: number;
  height: number;
}

export interface Translate {
  x: number;
  y: number;
}

export interface DragDirection {
  canDragVertical: boolean;
  canDragHorizontal: boolean;
}

/** 把 zoom 夹在 [minZoom, maxZoom]，非法值回落到 min。对齐 Semi _clampZoom。 */
export function clampZoom(zoom: number, minZoom: number, maxZoom: number): number {
  const max = typeof maxZoom === 'number' ? maxZoom : 5;
  const min = typeof minZoom === 'number' ? minZoom : 0.1;
  if (typeof zoom !== 'number' || !Number.isFinite(zoom)) return min;
  return Math.min(max, Math.max(min, zoom));
}

/** 旋转后外接矩形尺寸。对齐 Semi calcBoundingRectSize。 */
export function calcBoundingRectSize(width = 0, height = 0, rotation = 0): Size {
  const angleInRadians = (rotation * Math.PI) / 180;
  const sinTheta = Math.abs(Math.sin(angleInRadians));
  const cosTheta = Math.abs(Math.cos(angleInRadians));
  return {
    width: width * cosTheta + height * sinTheta,
    height: width * sinTheta + height * cosTheta,
  };
}

/** 适应页面缩放比：容器内边留 80px，取宽高比更小者。对齐 Semi _getAdaptationZoom。 */
export function getAdaptationZoom(
  containerWidth: number,
  containerHeight: number,
  originImageWidth: number,
  originImageHeight: number,
  rotation: number,
): number {
  if (!containerWidth || !containerHeight || !originImageWidth || !originImageHeight) {
    return 1;
  }
  const { width: imageWidth, height: imageHeight } = calcBoundingRectSize(
    originImageWidth,
    originImageHeight,
    rotation,
  );
  const reservedWidth = containerWidth - 80;
  const reservedHeight = containerHeight - 80;
  return Number(Math.min(reservedWidth / imageWidth, reservedHeight / imageHeight).toFixed(2));
}

/** 某方向图片是否超出容器 → 是否可拖拽。对齐 Semi getCanDragDirection。 */
export function getCanDragDirection(
  width: number,
  height: number,
  containerWidth: number,
  containerHeight: number,
): DragDirection {
  return {
    canDragHorizontal: width > containerWidth,
    canDragVertical: height > containerHeight,
  };
}

/** 平移极值（图片可移动到的边界）。对齐 Semi getExtremeTranslate。 */
export function getExtremeTranslate(
  width: number,
  height: number,
  containerWidth: number,
  containerHeight: number,
): Translate {
  return {
    x: (width - containerWidth) / 2,
    y: (height - containerHeight) / 2,
  };
}

/** 把平移量夹进安全边界，不可拖方向归零。对齐 Semi getSafeTranslate。 */
export function getSafeTranslate(
  width: number,
  height: number,
  translateX: number,
  translateY: number,
  containerWidth: number,
  containerHeight: number,
): Translate {
  const { x: extremeX, y: extremeY } = getExtremeTranslate(
    width,
    height,
    containerWidth,
    containerHeight,
  );
  const { canDragVertical, canDragHorizontal } = getCanDragDirection(
    width,
    height,
    containerWidth,
    containerHeight,
  );
  let x = 0;
  let y = 0;
  if (canDragHorizontal) {
    x = translateX > 0 ? Math.min(translateX, extremeX) : Math.max(translateX, -extremeX);
  }
  if (canDragVertical) {
    y = translateY > 0 ? Math.min(translateY, extremeY) : Math.max(translateY, -extremeY);
  }
  return { x, y };
}

export interface ChangeZoomInput {
  newZoom: number;
  currZoom: number;
  originImageWidth: number;
  originImageHeight: number;
  width: number;
  height: number;
  translate: Translate;
  rotation: number;
  containerWidth: number;
  containerHeight: number;
  /** 滚轮缩放时以指针为锚点：{ offsetX, offsetY, onImage } */
  wheel?: { offsetX: number; offsetY: number; onImage: boolean } | null;
}

export interface ChangeZoomResult {
  translate: Translate;
  width: number;
  height: number;
  currZoom: number;
  canDrag: boolean;
}

/**
 * 缩放并重算图片尺寸/平移。对齐 Semi changeZoom：
 * 有滚轮锚点时按指针偏移做「以指针为中心」缩放，否则按缩放比同比缩放已有平移。
 */
export function changeZoom(input: ChangeZoomInput): ChangeZoomResult {
  const {
    newZoom,
    currZoom,
    originImageWidth,
    originImageHeight,
    width,
    height,
    translate,
    rotation,
    containerWidth,
    containerHeight,
    wheel,
  } = input;

  const changeScale = newZoom / (currZoom || 1);
  const newWidth = Math.floor(originImageWidth * newZoom);
  const newHeight = Math.floor(originImageHeight * newZoom);
  let newTranslateX = Math.floor(translate.x * changeScale);
  let newTranslateY = Math.floor(translate.y * changeScale);

  const imageBound = calcBoundingRectSize(width, height, rotation);
  const newImageBound = {
    width: imageBound.width * changeScale,
    height: imageBound.height * changeScale,
  };

  if (wheel && wheel.onImage && currZoom) {
    let angle = rotation % 360;
    if (angle < 0) angle = 360 + angle;
    const { offsetX, offsetY } = wheel;
    switch (angle) {
      case 0:
        newTranslateX = (offsetX - 0.5 * width) * (1 - newZoom / currZoom) + translate.x;
        newTranslateY = (offsetY - 0.5 * height) * (1 - newZoom / currZoom) + translate.y;
        break;
      case 90:
        newTranslateX = (0.5 * height - offsetY) * (1 - newZoom / currZoom) + translate.x;
        newTranslateY = (offsetX - 0.5 * width) * (1 - newZoom / currZoom) + translate.y;
        break;
      case 180:
        newTranslateX = (0.5 * width - offsetX) * (1 - newZoom / currZoom) + translate.x;
        newTranslateY = (0.5 * height - offsetY) * (1 - newZoom / currZoom) + translate.y;
        break;
      case 270:
        newTranslateX = (offsetY - 0.5 * height) * (1 - newZoom / currZoom) + translate.x;
        newTranslateY = (0.5 * width - offsetX) * (1 - newZoom / currZoom) + translate.y;
        break;
      default:
        break;
    }
  }

  const safe = getSafeTranslate(
    newImageBound.width,
    newImageBound.height,
    newTranslateX,
    newTranslateY,
    containerWidth,
    containerHeight,
  );
  const { canDragVertical, canDragHorizontal } = getCanDragDirection(
    newImageBound.width,
    newImageBound.height,
    containerWidth,
    containerHeight,
  );

  return {
    translate: safe,
    width: newWidth,
    height: newHeight,
    currZoom: newZoom,
    canDrag: canDragVertical || canDragHorizontal,
  };
}

/** 拖拽移动后新的安全平移。对齐 Semi moveImage。 */
export function moveImage(
  clientX: number,
  clientY: number,
  startX: number,
  startY: number,
  width: number,
  height: number,
  translate: Translate,
  rotation: number,
  containerWidth: number,
  containerHeight: number,
): { translate: Translate; moved: boolean } {
  const imageBound = calcBoundingRectSize(width, height, rotation);
  const { canDragVertical, canDragHorizontal } = getCanDragDirection(
    imageBound.width,
    imageBound.height,
    containerWidth,
    containerHeight,
  );
  if (!canDragVertical && !canDragHorizontal) {
    return { translate, moved: false };
  }
  const newTranslateX = canDragHorizontal ? translate.x + clientX - startX : translate.x;
  const newTranslateY = canDragVertical ? translate.y + clientY - startY : translate.y;
  const safe = getSafeTranslate(
    imageBound.width,
    imageBound.height,
    newTranslateX,
    newTranslateY,
    containerWidth,
    containerHeight,
  );
  return { translate: safe, moved: true };
}

/**
 * 预加载图片索引数组。对齐 Semi getPreloadImagArr（含 crossMerge 交叉合并 + 去重）。
 */
export function crossMerge<T>(leftArr: T[] = [], rightArr: T[] = []): T[] {
  let newArr: T[] = [];
  const leftLen = leftArr.length;
  const rightLen = rightArr.length;
  const crossLength = leftLen <= rightLen ? leftLen : rightLen;
  for (let index = 0; index < crossLength; index++) {
    newArr.push(rightArr[index] as T);
    newArr.push(leftArr[index] as T);
  }
  if (leftLen > rightLen) {
    newArr = newArr.concat(leftArr.slice(rightLen, leftLen));
  } else if (leftLen < rightLen) {
    newArr = newArr.concat(rightArr.slice(leftLen, rightLen));
  }
  return newArr;
}

export function getPreloadImageArr(
  imgSrc: string[],
  currentIndex: number,
  preLoadGap: number,
  infinite: boolean,
): string[] {
  const beginIndex = currentIndex - preLoadGap;
  const endIndex = currentIndex + preLoadGap;
  const srcLength = imgSrc.length;
  let leftArr: string[];
  let rightArr: string[];
  if (preLoadGap >= Math.floor(srcLength / 2)) {
    if (infinite) {
      leftArr = imgSrc
        .concat(imgSrc)
        .slice(beginIndex + srcLength < 0 ? 0 : beginIndex + srcLength, currentIndex + srcLength);
      rightArr = imgSrc
        .concat(imgSrc)
        .slice(currentIndex + 1, endIndex + 1 < 2 * srcLength ? endIndex + 1 : 2 * srcLength);
    } else {
      leftArr = imgSrc.slice(0, currentIndex);
      rightArr = imgSrc.slice(currentIndex + 1, srcLength);
    }
  } else if (infinite) {
    leftArr = imgSrc.concat(imgSrc).slice(beginIndex + srcLength, currentIndex + srcLength);
    rightArr = imgSrc.concat(imgSrc).slice(currentIndex + 1, endIndex + 1);
  } else if (beginIndex >= 0 && endIndex < srcLength) {
    leftArr = imgSrc.slice(beginIndex, currentIndex);
    rightArr = imgSrc.slice(currentIndex + 1, endIndex + 1);
  } else if (beginIndex < 0) {
    leftArr = imgSrc.slice(0, currentIndex);
    rightArr = imgSrc.slice(currentIndex + 1, 2 * preLoadGap + 1);
  } else {
    rightArr = imgSrc.slice(currentIndex + 1, srcLength);
    leftArr = imgSrc.slice(srcLength - 2 * preLoadGap - 1, currentIndex);
  }
  const result = crossMerge(leftArr.reverse(), rightArr);
  return Array.from(new Set(result));
}
