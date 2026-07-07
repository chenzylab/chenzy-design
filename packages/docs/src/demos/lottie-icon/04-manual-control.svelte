<script lang="ts">
  import { LottieIcon, Button, Space } from '@chenzy-design/svelte';
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

  // trigger="manual" + bind:this：完全由按钮命令式驱动
  let icon = $state<{ play: () => void; pause: () => void; stop: () => void } | undefined>();
</script>

<Space vertical align="start">
  <LottieIcon
    bind:this={icon}
    data={{}}
    player={mockPlayer}
    size="large"
    trigger="manual"
    autoplay={false}
    decorative={false}
    label="手动控制图标"
  />
  <Space>
    <Button onclick={() => icon?.play()}>播放</Button>
    <Button onclick={() => icon?.pause()}>暂停</Button>
    <Button onclick={() => icon?.stop()}>停止</Button>
  </Space>
</Space>

<style>
  @keyframes -global-cd-lottie-spin {
    to { transform: rotate(360deg); }
  }
</style>
