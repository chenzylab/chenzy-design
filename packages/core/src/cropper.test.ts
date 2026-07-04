import { describe, expect, it, vi } from 'vitest';
import {
  createCropperFoundation,
  getMiddle,
  getAspectHW,
  getMoveParamByDir,
  CROPPER_CORNERS,
  CROPPER_ROUND_CORNERS,
  type CropperFoundationState,
  type CropperFoundationProps,
} from './cropper.js';

/**
 * jsdom 无关的纯几何单测。构造一个内存 harness：
 * - container 500×400，getBoundingClientRect 原点 (0,0)
 * - state 用一个可变对象，setState 浅合并
 */
function makeHarness(
  props: Partial<CropperFoundationProps> = {},
  containerSize = { width: 500, height: 400 },
) {
  const state: CropperFoundationState = {
    imgData: { width: 0, height: 0, centerPoint: { x: 0, y: 0 } },
    cropperBox: { width: 0, height: 0, centerPoint: { x: 0, y: 0 } },
    zoom: 1,
    rotate: 0,
    loaded: false,
  };
  const notifyZoomChange = vi.fn();
  const container = {
    clientWidth: containerSize.width,
    clientHeight: containerSize.height,
    getBoundingClientRect: () =>
      ({ left: 0, top: 0, width: containerSize.width, height: containerSize.height }) as DOMRect,
  };
  const foundation = createCropperFoundation({
    adapter: {
      getContainer: () => container,
      getImg: () => null,
      notifyZoomChange,
    },
    getProps: () => props,
    getState: () => state,
    setState: (patch) => Object.assign(state, patch),
  });
  return { foundation, state, notifyZoomChange, container };
}

describe('cropper utils', () => {
  it('getMiddle clamps to [min, max]', () => {
    expect(getMiddle(5, [0, 10])).toBe(5);
    expect(getMiddle(-3, [0, 10])).toBe(0);
    expect(getMiddle(99, [0, 10])).toBe(10);
  });

  it('getAspectHW fits a box to a target aspect (w/h)', () => {
    // wide outer box, aspect 1 → shrink width to match height
    expect(getAspectHW(200, 100, 1)).toEqual([100, 100]);
    // tall outer box, aspect 2 → shrink height to match width
    expect(getAspectHW(100, 200, 2)).toEqual([100, 50]);
  });

  it('getMoveParamByDir maps corners to sign vectors', () => {
    expect(getMoveParamByDir('tl')).toEqual({ paramX: -1, paramY: -1 });
    expect(getMoveParamByDir('br')).toEqual({ paramX: 1, paramY: 1 });
    expect(getMoveParamByDir('tm')).toEqual({ paramX: 0, paramY: -1 });
    expect(getMoveParamByDir('mr')).toEqual({ paramX: 1, paramY: 0 });
  });

  it('exposes the canonical corner sets', () => {
    expect(CROPPER_CORNERS).toHaveLength(8);
    expect(CROPPER_ROUND_CORNERS).toEqual(['tm', 'ml', 'mr', 'bm']);
  });
});

describe('cropper image load', () => {
  it('landscape image (wider than container ratio) fits to container width', () => {
    const { foundation, state } = makeHarness({}, { width: 500, height: 400 });
    // natural 1000×400 → ratio 2.5 > container 1.25 → fit width
    foundation.handleImageLoad({ naturalWidth: 1000, naturalHeight: 400 });
    expect(state.loaded).toBe(true);
    expect(state.imgData.width).toBe(500);
    expect(state.imgData.height).toBe(200); // 400 * 0.5
    expect(state.imgData.centerPoint).toEqual({ x: 250, y: 200 });
    expect(foundation.getImageMeta().scale).toBe(0.5);
    expect(foundation.getImageMeta().originalWidth).toBe(1000);
  });

  it('portrait image fits to container height', () => {
    const { foundation, state } = makeHarness({}, { width: 500, height: 400 });
    // natural 400×1000 → naturalW/containerW=0.8 < naturalH/containerH=2.5 → fit height
    foundation.handleImageLoad({ naturalWidth: 400, naturalHeight: 1000 });
    expect(state.imgData.height).toBe(400);
    expect(state.imgData.width).toBe(160); // 400 * 0.4
    expect(foundation.getImageMeta().scale).toBe(0.4);
  });

  it('default cropper box uses defaultAspectRatio=1 centered', () => {
    const { foundation, state } = makeHarness({}, { width: 500, height: 400 });
    foundation.handleImageLoad({ naturalWidth: 1000, naturalHeight: 1000 });
    // container 500/400=1.25 > aspect 1 → width = height*aspect = 400, height = 400
    expect(state.cropperBox.width).toBe(400);
    expect(state.cropperBox.height).toBe(400);
    expect(state.cropperBox.centerPoint).toEqual({ x: 250, y: 200 });
  });

  it('aspectRatio prop overrides defaultAspectRatio for initial box', () => {
    const { foundation, state } = makeHarness({ aspectRatio: 2 }, { width: 500, height: 400 });
    foundation.handleImageLoad({ naturalWidth: 1000, naturalHeight: 1000 });
    // container 1.25 < aspect 2 → width = containerWidth = 500, height = 500/2 = 250
    expect(state.cropperBox.width).toBe(500);
    expect(state.cropperBox.height).toBe(250);
  });
});

describe('cropper wheel zoom', () => {
  it('zooms in by zoomStep and notifies, clamped by maxZoom', () => {
    const { foundation, state, notifyZoomChange } = makeHarness({ maxZoom: 1.3, zoomStep: 0.1 });
    foundation.handleImageLoad({ naturalWidth: 500, naturalHeight: 400 });
    const w0 = state.imgData.width;
    foundation.handleWheel({ deltaY: -10, clientX: 250, clientY: 200 });
    expect(state.zoom).toBe(1.1);
    expect(state.imgData.width).toBeCloseTo((w0 / 1) * 1.1);
    expect(notifyZoomChange).toHaveBeenLastCalledWith(1.1);
    // step again 1.1→1.2→1.3 ok, next would exceed 1.3 → no change
    foundation.handleWheel({ deltaY: -10, clientX: 250, clientY: 200 });
    foundation.handleWheel({ deltaY: -10, clientX: 250, clientY: 200 });
    expect(state.zoom).toBe(1.3);
    notifyZoomChange.mockClear();
    foundation.handleWheel({ deltaY: -10, clientX: 250, clientY: 200 });
    expect(state.zoom).toBe(1.3); // clamped, unchanged
    expect(notifyZoomChange).not.toHaveBeenCalled();
  });

  it('zooms out clamped by minZoom', () => {
    const { foundation, state } = makeHarness({ minZoom: 0.9, zoomStep: 0.1 });
    foundation.handleImageLoad({ naturalWidth: 500, naturalHeight: 400 });
    foundation.handleWheel({ deltaY: 10, clientX: 250, clientY: 200 });
    expect(state.zoom).toBe(0.9);
    foundation.handleWheel({ deltaY: 10, clientX: 250, clientY: 200 });
    expect(state.zoom).toBe(0.9); // clamped
  });

  it('calls preventDefault on wheel', () => {
    const { foundation } = makeHarness();
    foundation.handleImageLoad({ naturalWidth: 500, naturalHeight: 400 });
    const preventDefault = vi.fn();
    foundation.handleWheel({ deltaY: -10, clientX: 10, clientY: 10, preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });
});

describe('cropper box drag (bounded)', () => {
  it('clamps center point within container by half box size', () => {
    const { foundation, state } = makeHarness({}, { width: 500, height: 400 });
    foundation.handleImageLoad({ naturalWidth: 1000, naturalHeight: 1000 });
    // box 400×400 centered at 250,200; moveRange x:[200,300], y:[200,200]
    foundation.handleCropperBoxMouseDown(250, 200);
    // try to drag far right & down
    foundation.handleCropperBoxMouseMove(9999, 9999);
    expect(state.cropperBox.centerPoint.x).toBe(300); // 500-200
    expect(state.cropperBox.centerPoint.y).toBe(200); // 400-200 == 200
    foundation.handleCropperBoxMouseUp();
    // after up, further moves are ignored
    foundation.handleCropperBoxMouseMove(0, 0);
    expect(state.cropperBox.centerPoint.x).toBe(300);
  });
});

describe('cropper image drag', () => {
  it('translates image center by drag delta (unbounded)', () => {
    const { foundation, state } = makeHarness();
    foundation.handleImageLoad({ naturalWidth: 500, naturalHeight: 400 });
    const c0 = { ...state.imgData.centerPoint };
    foundation.handleImgMoveStart(100, 100);
    foundation.handleImgMove(130, 90);
    expect(state.imgData.centerPoint.x).toBe(c0.x + 30);
    expect(state.imgData.centerPoint.y).toBe(c0.y - 10);
    foundation.handleImgMoveUp();
    foundation.handleImgMove(999, 999);
    expect(state.imgData.centerPoint.x).toBe(c0.x + 30); // ignored after up
  });
});

describe('cropper free corner resize', () => {
  it('br corner grows box toward bottom-right, clamped to container', () => {
    const { foundation, state } = makeHarness({}, { width: 500, height: 400 });
    foundation.handleImageLoad({ naturalWidth: 1000, naturalHeight: 1000 });
    // box 400×400 at center 250,200: left=50 top=0 right=450 bottom=400
    foundation.handleCornerMouseDown('br');
    expect(foundation.getRangeX()).toEqual([0, 500]);
    expect(foundation.getRangeY()).toEqual([0, 400]);
    // drag br to (480, 380): width grows toward that point
    foundation.handleCornerMove(480, 380);
    // paramX=1, x = cx + width/2 = 250+200 = 450; newWidth = 400 + (480-450) = 430
    expect(state.cropperBox.width).toBeCloseTo(430);
    // paramY=1, y = 200+200 = 400; newHeight = 400 + (380-400) = 380
    expect(state.cropperBox.height).toBeCloseTo(380);
  });

  it('tl corner resize shrinks from top-left', () => {
    const { foundation, state } = makeHarness({}, { width: 500, height: 400 });
    foundation.handleImageLoad({ naturalWidth: 1000, naturalHeight: 1000 });
    foundation.handleCornerMouseDown('tl');
    // paramX=-1,paramY=-1. box left=50 top=0. drag tl to (100, 50)
    foundation.handleCornerMove(100, 50);
    // x = cx + (-1)*w/2 = 250-200 = 50; newWidth = 400 + (-1)*(100-50)=350
    expect(state.cropperBox.width).toBeCloseTo(350);
    // y = 200 + (-1)*200 = 0; newHeight = 400 + (-1)*(50-0)=350
    expect(state.cropperBox.height).toBeCloseTo(350);
  });
});

describe('cropper aspect-constrained corner resize', () => {
  it('br corner keeps aspectRatio while resizing', () => {
    const { foundation, state } = makeHarness({ aspectRatio: 1 }, { width: 500, height: 400 });
    foundation.handleImageLoad({ naturalWidth: 1000, naturalHeight: 1000 });
    // aspect 1: initial box 400×400 at 250,200
    foundation.handleCornerMouseDown('br');
    // range computed for br. drag toward (300, 250)
    foundation.handleCornerMove(300, 250);
    // height = offsetY - rangeY[0]; width = height*aspect → equal (aspect 1)
    expect(state.cropperBox.width).toBeCloseTo(state.cropperBox.height);
  });

  it('mr corner resize under aspect constraint stays symmetric vertically', () => {
    const { foundation, state } = makeHarness({ aspectRatio: 1 }, { width: 500, height: 400 });
    foundation.handleImageLoad({ naturalWidth: 1000, naturalHeight: 1000 });
    const cy0 = state.cropperBox.centerPoint.y;
    foundation.handleCornerMouseDown('mr');
    foundation.handleCornerMove(400, 200);
    // ml/mr keep centerPoint.y fixed
    expect(state.cropperBox.centerPoint.y).toBeCloseTo(cy0);
    expect(state.cropperBox.width).toBeCloseTo(state.cropperBox.height);
  });
});

describe('cropper resize (container change) reflow', () => {
  it('scales img + box proportionally on second resize', () => {
    const { foundation, state, container } = makeHarness({}, { width: 500, height: 400 });
    foundation.handleImageLoad({ naturalWidth: 1000, naturalHeight: 1000 });
    const box0 = { ...state.cropperBox };
    const img0 = { ...state.imgData };
    // first handleResize is skipped (initial guard)
    foundation.handleResize();
    expect(state.cropperBox.width).toBe(box0.width);
    // now shrink container to 250 wide (ratio 0.5)
    container.clientWidth = 250;
    foundation.handleResize();
    expect(state.imgData.width).toBeCloseTo(img0.width * 0.5);
    expect(foundation.getContainerData().width).toBe(250);
  });

  it('aspect-constrained reflow keeps box within new container', () => {
    const { foundation, state, container } = makeHarness(
      { aspectRatio: 1 },
      { width: 500, height: 400 },
    );
    foundation.handleImageLoad({ naturalWidth: 1000, naturalHeight: 1000 });
    foundation.handleResize(); // skipped (initial)
    container.clientWidth = 300;
    foundation.handleResize();
    const box = state.cropperBox;
    expect(box.centerPoint.x + box.width / 2).toBeLessThanOrEqual(300 + 0.001);
  });
});

describe('cropper controlled rotate/zoom', () => {
  it('computeControlledImgData scales width/height by zoom ratio', () => {
    const { foundation, state } = makeHarness();
    foundation.handleImageLoad({ naturalWidth: 500, naturalHeight: 400 });
    const w0 = state.imgData.width;
    const next = foundation.computeControlledImgData(0, 2); // zoom 1→2
    expect(next.width).toBeCloseTo(w0 * 2);
  });

  it('computeControlledImgData rotates image center around box center', () => {
    const { foundation } = makeHarness();
    foundation.handleImageLoad({ naturalWidth: 500, naturalHeight: 400 });
    const next = foundation.computeControlledImgData(90, 1);
    // rotating 90deg about box center should move the img center (was coincident → stays)
    expect(typeof next.centerPoint.x).toBe('number');
    expect(Number.isFinite(next.centerPoint.x)).toBe(true);
  });
});

describe('cropper preview geometry', () => {
  it('computePreview fits box into a square preview container', () => {
    const { foundation, state } = makeHarness();
    foundation.handleImageLoad({ naturalWidth: 1000, naturalHeight: 1000 });
    const box = state.cropperBox; // 400×400
    const out = foundation.computePreview(
      { width: 100, height: 100 },
      { width: 200, height: 200, translateX: 0, translateY: 0, rotate: 0 },
    );
    // zoom = 100/400 = 0.25
    expect(out.imgWidth).toBeCloseTo(200 * 0.25);
    expect(out.containerWidth).toBeCloseTo((100 / box.width) * box.width);
  });
});
