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

<div style="display:flex; gap:32px; align-items:center">
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" decorative={false} label="自动播放" />
    <Text type="tertiary">自动播放</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" trigger="hover" decorative={false} label="悬停播放" />
    <Text type="tertiary">悬停播放</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" reducedMotion decorative={false} label="降级静止" />
    <Text type="tertiary">reducedMotion</Text>
  </div>
</div>

<style>
  @keyframes -global-cd-lottie-spin {
    to { transform: rotate(360deg); }
  }
</style>
