// VideoPlayer 渲染 + a11y（严格对齐 Semi 后 DOM 为 cd-videoPlayer 驼峰）：
// 控件为本库 Button（aria-label 走 locale）；进度/音量为 role=slider；倍速/清晰度/线路为 Dropdown；
// controlsList 控制控件增删。jsdom 不解码媒体（duration=NaN），但控件与 aria 结构仍可断言。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import VideoPlayer from './VideoPlayer.svelte';

const VP = VideoPlayer as unknown as Parameters<typeof renderWithLocale>[0];

describe('VideoPlayer a11y', () => {
  it('renders <video> + 根 cd-videoPlayer + labelled play/fullscreen buttons，no axe violations', async () => {
    const { container } = renderWithLocale(VP, {
      props: { src: 'https://example.com/v.mp4', poster: 'https://example.com/p.jpg' },
    });
    // 根节点 + wrapper（对齐 Semi cd-videoPlayer / -wrapper-{theme}）。
    expect(container.querySelector('.cd-videoPlayer')).toBeTruthy();
    expect(container.querySelector('.cd-videoPlayer-wrapper-dark')).toBeTruthy();
    expect(container.querySelector('video')).toBeTruthy();
    // play button labelled via locale (en_US → "Play")
    expect(container.querySelector('button[aria-label="Play"]')).toBeTruthy();
    expect(container.querySelector('button[aria-label="Fullscreen"]')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('progress 是 role=slider + aria bounds（cd-videoPlayer-progress）', () => {
    const { container } = renderWithLocale(VP, {
      props: { src: 'https://example.com/v.mp4' },
    });
    const progress = container.querySelector('.cd-videoPlayer-progress[role="slider"]');
    expect(progress).toBeTruthy();
    expect(progress?.getAttribute('aria-valuemin')).toBe('0');
    expect(progress?.getAttribute('aria-valuenow')).not.toBeNull();
  });

  it('controlsList removes control items', () => {
    const { container } = renderWithLocale(VP, {
      props: {
        src: 'https://example.com/v.mp4',
        controlsList: ['play', 'fullscreen'],
      },
    });
    // volume 移除 → 无静音按钮
    expect(container.querySelector('button[aria-label="Mute"]')).toBeNull();
    expect(container.querySelector('button[aria-label="Unmute"]')).toBeNull();
    // mirror 移除
    expect(container.querySelector('button[aria-label="Mirror"]')).toBeNull();
    // time 移除 → 无时间显示
    expect(container.querySelector('.cd-videoPlayer-controls-time')).toBeNull();
    // play + fullscreen 保留
    expect(container.querySelector('button[aria-label="Play"]')).toBeTruthy();
    expect(container.querySelector('button[aria-label="Fullscreen"]')).toBeTruthy();
  });

  it('中央播放按钮（未播放态）+ poster 渲染', () => {
    const { container } = renderWithLocale(VP, {
      props: { src: 'https://example.com/v.mp4', poster: 'https://example.com/p.jpg' },
    });
    // 中央 pause 区（IconPlayCircle）——未播放且无错误时渲染。
    expect(container.querySelector('.cd-videoPlayer-pause')).toBeTruthy();
    // poster img。
    const poster = container.querySelector('img.cd-videoPlayer-poster') as HTMLImageElement | null;
    expect(poster).toBeTruthy();
    expect(poster?.getAttribute('src')).toBe('https://example.com/p.jpg');
  });

  it('倍速触发块存在（cd-videoPlayer-controls-popup，Dropdown 触发器）', () => {
    const { container } = renderWithLocale(VP, {
      props: { src: 'https://example.com/v.mp4' },
    });
    // 倍速/清晰度/线路触发块 -controls-popup（默认 controlsList 含 playbackRate）。
    expect(container.querySelector('.cd-videoPlayer-controls-popup')).toBeTruthy();
  });

  it('light theme 设置 light 主题 class + wrapper', () => {
    const { container } = renderWithLocale(VP, {
      props: { src: 'https://example.com/v.mp4', theme: 'light' },
    });
    expect(container.querySelector('.cd-videoPlayer-wrapper-light')).toBeTruthy();
  });

  it('resource-not-found：src 为 undefined 时渲染暂无资源', () => {
    const { container } = renderWithLocale(VP, { props: {} });
    expect(container.querySelector('.cd-videoPlayer-resource-not-found')).toBeTruthy();
  });
});
