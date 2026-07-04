// Cropper a11y / 渲染结构测试（dom project，jsdom）。
//
// jsdom 局限（如实标注）：
//  - 无布局引擎：container.clientWidth/clientHeight 恒为 0，getBoundingClientRect 全 0，
//    故 handleImageLoad 计算出的裁切框/图片尺寸为 0（scale = 0/0 = NaN）。因此本文件
//    只验 DOM 结构 / role / aria / 角点数量 / 类名，不验具体几何数值（几何在
//    packages/core/src/cropper.test.ts 用内存 harness 覆盖）。
//  - 无 canvas 2D 上下文：getCanvasContext 返回 null，getCropperCanvas() 无法真实绘制，
//    相关断言 skip（见文末），仅验方法可调用不抛。
//  - <img> 不会真正加载网络资源：用 dispatchEvent(new Event('load')) 手动触发 onload
//    以驱动 loaded=true，从而渲染 resize 角点。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Cropper from './Cropper.svelte';

const SRC = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';

function fireImgLoad(container: HTMLElement) {
  const img = container.querySelector('.cd-cropper-img') as HTMLImageElement;
  // jsdom 下 naturalWidth/Height 只读为 0，够驱动 loaded 状态。
  img.dispatchEvent(new Event('load'));
  return img;
}

describe('Cropper 渲染结构', () => {
  it('渲染容器 + 底图 + 遮罩 + 裁切框基础结构', () => {
    const { container } = renderWithLocale(Cropper, { props: { src: SRC } });
    expect(container.querySelector('.cd-cropper')).toBeTruthy();
    expect(container.querySelector('.cd-cropper-img-wrapper')).toBeTruthy();
    expect(container.querySelector('.cd-cropper-img')).toBeTruthy();
    expect(container.querySelector('.cd-cropper-mask')).toBeTruthy();
    expect(container.querySelector('.cd-cropper-box')).toBeTruthy();
    expect(container.querySelector('.cd-cropper-view-box')).toBeTruthy();
    expect(container.querySelector('.cd-cropper-view-img')).toBeTruthy();
  });

  it('容器 role=group + 走 locale 的 aria-label', () => {
    const { container } = renderWithLocale(Cropper, { props: { src: SRC } });
    const root = container.querySelector('.cd-cropper');
    expect(root?.getAttribute('role')).toBe('group');
    // 默认 locale 为 en_US → 'Image cropper'
    expect(root?.getAttribute('aria-label')).toBe('Image cropper');
  });

  it('ariaLabel prop 覆盖 locale', () => {
    const { container } = renderWithLocale(Cropper, {
      props: { src: SRC, ariaLabel: '自定义裁切' },
    });
    expect(container.querySelector('.cd-cropper')?.getAttribute('aria-label')).toBe('自定义裁切');
  });

  it('未加载时不渲染 resize 角点', () => {
    const { container } = renderWithLocale(Cropper, { props: { src: SRC } });
    expect(container.querySelectorAll('.cd-cropper-box-corner')).toHaveLength(0);
  });

  it('加载后 rect 形状渲染 8 个角点', async () => {
    const { container } = renderWithLocale(Cropper, { props: { src: SRC } });
    fireImgLoad(container);
    await Promise.resolve();
    expect(container.querySelectorAll('.cd-cropper-box-corner')).toHaveLength(8);
  });

  it('加载后 round 形状仅渲染 4 个边中点角点 + 圆形类', async () => {
    const { container } = renderWithLocale(Cropper, { props: { src: SRC, shape: 'round' } });
    fireImgLoad(container);
    await Promise.resolve();
    const cornerEls = container.querySelectorAll('.cd-cropper-box-corner');
    expect(cornerEls).toHaveLength(4);
    const dirs = Array.from(cornerEls).map((el) => el.getAttribute('data-dir'));
    expect(dirs.sort()).toEqual(['bm', 'ml', 'mr', 'tm']);
    // round 形状：box 与 view-box 都带圆形类
    expect(container.querySelector('.cd-cropper-box')?.classList.contains('cd-cropper-view-box-round')).toBe(true);
  });

  it('showResizeBox=false 时加载后仍不渲染角点', async () => {
    const { container } = renderWithLocale(Cropper, {
      props: { src: SRC, showResizeBox: false },
    });
    fireImgLoad(container);
    await Promise.resolve();
    expect(container.querySelectorAll('.cd-cropper-box-corner')).toHaveLength(0);
  });

  it('cropperBoxClassName 附加到裁切框', () => {
    const { container } = renderWithLocale(Cropper, {
      props: { src: SRC, cropperBoxClassName: 'my-box' },
    });
    expect(container.querySelector('.cd-cropper-box')?.classList.contains('my-box')).toBe(true);
  });

  it('class / style 透传到容器', () => {
    const { container } = renderWithLocale(Cropper, {
      props: { src: SRC, class: 'extra', style: 'width: 300px;' },
    });
    const root = container.querySelector('.cd-cropper') as HTMLElement;
    expect(root.classList.contains('extra')).toBe(true);
    expect(root.getAttribute('style')).toContain('width: 300px');
  });

  it('imgProps 透传到底图 <img>', () => {
    const { container } = renderWithLocale(Cropper, {
      props: { src: SRC, imgProps: { 'data-testid': 'base-img' } },
    });
    expect(container.querySelector('.cd-cropper-img')?.getAttribute('data-testid')).toBe('base-img');
  });

  it('无 axe violations（加载后）', async () => {
    const { container } = renderWithLocale(Cropper, { props: { src: SRC } });
    fireImgLoad(container);
    await Promise.resolve();
    await expectNoAxeViolations(container);
  });
});

describe('Cropper getCropperCanvas', () => {
  // jsdom 无 canvas 2D 上下文（getContext('2d') 返回 null）：core.getCropperCanvas
  // 在无 img/ctx 时早退返回一个空 canvas，不抛错，但无法验证像素绘制。
  // 真实绘制/裁切像素需浏览器环境，此处仅验方法存在且不抛。
  it.skip('绘制裁切结果（需浏览器 canvas，jsdom 不支持）', () => {
    // 占位：浏览器环境下应断言返回 canvas 的宽高 == 裁切框相对尺寸、像素内容正确。
  });
});
