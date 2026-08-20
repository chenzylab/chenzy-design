/**
 * Cropper 几何工具函数。逐行对齐 Semi semi-foundation/cropper/utils.ts。
 */

/** 将 value 钳制到 [min, max]。（Semi cropper.utils.getMiddle） */
export function getMiddle(value: number, [min, max]: [number, number]): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 在给定 (width, height) 外接框内取满足 aspect(=w/h) 的最大内接矩形宽高。
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
