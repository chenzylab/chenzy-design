<script lang="ts">
  import { ResizeObserver, Button, Text, resize } from '@chenzy-design/svelte';

  let roThrottleCount = $state(0);
  let roInstantCount = $state(0);
  let roMultiLast = $state('—');
  let roMultiCount = $state(0);
  let roDprLast = $state('—');
  let roActionBox = $state<'content-box' | 'device-pixel-content-box'>('content-box');
  let roActionLast = $state('—');
  let roActionBoxSeen = $state('—');
  let roFbLast = $state('—');
  let roFbCount = $state(0);
  let roSeStatus = $state('空闲');
  let roSeStart = $state(0);
  let roSeEnd = $state(0);
  let roSeLast = $state('—');
</script>

<Text type="tertiary">拖拽右下角调整容器大小，slot 实时显示尺寸</Text>
<div style="margin-top:8px; resize:both; overflow:auto; width:280px; height:120px; min-width:160px; min-height:80px; border:1px dashed var(--cd-color-border); border-radius:8px">
  <ResizeObserver>
    {#snippet children({ width, height })}
      <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--cd-color-text-1)">
        {Math.round(width)} × {Math.round(height)} px
      </div>
    {/snippet}
  </ResizeObserver>
</div>

<div style="margin-top:16px"><Text type="tertiary">throttle 节流（200ms，leading+trailing）：拖拽时回调计数受控，对比下方即时</Text></div>
<div style="display:flex; gap:16px; margin-top:8px">
  <div style="resize:both; overflow:auto; width:240px; height:110px; min-width:140px; min-height:70px; border:1px dashed var(--cd-color-border); border-radius:8px">
    <ResizeObserver throttle={200} onResize={() => (roThrottleCount += 1)}>
      {#snippet children({ width, height })}
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:4px; color:var(--cd-color-text-1)">
          <span>{Math.round(width)} × {Math.round(height)}</span>
          <span>throttle 回调：{roThrottleCount}</span>
        </div>
      {/snippet}
    </ResizeObserver>
  </div>
  <div style="resize:both; overflow:auto; width:240px; height:110px; min-width:140px; min-height:70px; border:1px dashed var(--cd-color-border); border-radius:8px">
    <ResizeObserver onResize={() => (roInstantCount += 1)}>
      {#snippet children({ width, height })}
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:4px; color:var(--cd-color-text-1)">
          <span>{Math.round(width)} × {Math.round(height)}</span>
          <span>即时 回调：{roInstantCount}</span>
        </div>
      {/snippet}
    </ResizeObserver>
  </div>
</div>

<div style="margin-top:16px"><Text type="tertiary">multiple 多目标 + debounce（150ms trailing）：观测两个子元素，停止拖拽后才更新</Text></div>
<div style="margin-top:8px; border:1px dashed var(--cd-color-border); border-radius:8px; padding:8px">
  <ResizeObserver multiple debounce={150} onResize={(e) => { roMultiLast = `${Math.round(e.width)}×${Math.round(e.height)}`; roMultiCount += 1; }}>
    <div style="resize:horizontal; overflow:auto; width:160px; height:40px; min-width:80px; background:var(--cd-color-fill-0); border-radius:6px; margin-bottom:8px; display:flex; align-items:center; padding-left:8px; color:var(--cd-color-text-1)">子元素 A（横向可拖）</div>
    <div style="resize:horizontal; overflow:auto; width:200px; height:40px; min-width:80px; background:var(--cd-color-fill-0); border-radius:6px; display:flex; align-items:center; padding-left:8px; color:var(--cd-color-text-1)">子元素 B（横向可拖）</div>
  </ResizeObserver>
  <div style="margin-top:8px"><Text type="tertiary">最后变化：{roMultiLast}（debounced 回调 {roMultiCount} 次）</Text></div>
</div>

<div style="margin-top:16px"><Text type="tertiary">device-pixel-content-box（物理像素，含 DPR）+ tag 自定义包裹标签（section）</Text></div>
<div style="margin-top:8px; resize:both; overflow:auto; width:240px; height:90px; min-width:140px; min-height:60px; border:1px dashed var(--cd-color-border); border-radius:8px">
  <ResizeObserver tag="section" box="device-pixel-content-box" onResize={(e) => (roDprLast = `${Math.round(e.width)}×${Math.round(e.height)} 物理px (box=${e.box})`)}>
    {#snippet children({ width, height })}
      <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--cd-color-text-1)">
        <span>{Math.round(width)} × {Math.round(height)} 物理px</span>
      </div>
    {/snippet}
  </ResizeObserver>
</div>
<div style="margin-top:8px"><Text type="tertiary">{roDprLast}</Text></div>

<div style="margin-top:16px"><Text type="tertiary">use:resize action 动态参数重建：切换 box 即 disconnect 旧 observer 重建</Text></div>
<div style="display:flex; gap:12px; align-items:center; margin-top:8px">
  <Button size="small" onclick={() => (roActionBox = roActionBox === 'content-box' ? 'device-pixel-content-box' : 'content-box')}>切换 box（当前 {roActionBox}）</Button>
</div>
<div
  use:resize={{ box: roActionBox, onResize: (e) => { roActionLast = `${Math.round(e.width)}×${Math.round(e.height)}`; roActionBoxSeen = e.box; } }}
  style="margin-top:8px; resize:both; overflow:auto; width:220px; height:80px; min-width:120px; min-height:50px; border:1px dashed var(--cd-color-border); border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--cd-color-text-1)"
>
  <span>{roActionLast} · box={roActionBoxSeen}</span>
</div>

<div style="margin-top:16px"><Text type="tertiary">fallbackToWindow 降级：显式开启后改用 window.resize 近似重测（缩放浏览器窗口触发）</Text></div>
<div style="margin-top:8px; width:100%; max-width:360px; height:64px; border:1px dashed var(--cd-color-border); border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--cd-color-text-1)">
  <ResizeObserver fallbackToWindow onResize={(e) => { roFbLast = `${Math.round(e.width)}×${Math.round(e.height)}`; roFbCount += 1; }}>
    {#snippet children()}
      <span>window 降级测得：{roFbLast}（{roFbCount} 次）</span>
    {/snippet}
  </ResizeObserver>
</div>

<div style="margin-top:16px"><Text type="tertiary">onResizeStart / onResizeEnd：拖拽开始即 start，静默约 150ms 后 end</Text></div>
<div style="margin-top:8px; resize:both; overflow:auto; width:240px; height:90px; min-width:140px; min-height:60px; border:1px dashed var(--cd-color-border); border-radius:8px">
  <ResizeObserver
    onResizeStart={() => { roSeStatus = '调整中…'; roSeStart += 1; }}
    onResizeEnd={(e) => { roSeStatus = '已完成'; roSeEnd += 1; roSeLast = `${Math.round(e.width)}×${Math.round(e.height)}`; }}
  >
    {#snippet children({ width, height })}
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:4px; color:var(--cd-color-text-1)">
        <span>{Math.round(width)} × {Math.round(height)}</span>
        <span>状态：{roSeStatus}（start {roSeStart} / end {roSeEnd}，末值 {roSeLast}）</span>
      </div>
    {/snippet}
  </ResizeObserver>
</div>
