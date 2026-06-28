<script lang="ts">
  import { LottieIcon, Text } from '@chenzy-design/svelte';
  import type { LottiePlayerFactory } from '@chenzy-design/svelte';

  // mock player：CSS 旋转方块模拟动画
  const mockPlayer: LottiePlayerFactory = ({ container, autoplay }) => {
    const el = document.createElement('div');
    el.style.cssText =
      'width:100%;height:100%;border-radius:3px;background:var(--cd-color-primary);' +
      'animation:cd-lottie-spin 1s linear infinite;animation-play-state:paused';
    container.appendChild(el);
    const setState = (s: string) => (el.style.animationPlayState = s);
    if (autoplay) setState('running');
    return {
      play: () => setState('running'),
      pause: () => setState('paused'),
      stop: () => { setState('paused'); },
      goToFrame: () => setState('paused'),
      playSegments: () => setState('running'),
      destroy: () => el.remove(),
    };
  };
</script>

<div style="display:flex; gap:32px; align-items:flex-end">
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="small" decorative={false} label="小尺寸" />
    <Text type="tertiary">small</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="default" decorative={false} label="默认尺寸" />
    <Text type="tertiary">default</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" decorative={false} label="大尺寸" />
    <Text type="tertiary">large</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size={64} decorative={false} label="自定义 64px" />
    <Text type="tertiary">size=64</Text>
  </div>
</div>

<style>
  @keyframes -global-cd-lottie-spin {
    to { transform: rotate(360deg); }
  }
</style>
