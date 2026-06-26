<script lang="ts">
  import { Slider, Text, Space } from '@chenzy-design/svelte';

  let sliderVal = $state(40);
  let rangeVal = $state<[number, number]>([20, 60]);
  let sliderTipVal = $state(60);
  let sliderDotsVal = $state(40);
  let sliderVertVal = $state(30);
</script>

<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px;">
  <div style="width: 280px">
    <Slider value={sliderVal} onChange={(v) => (sliderVal = v as number)} />
    <Text type="tertiary">单值：{sliderVal}</Text>
  </div>

  <div style="width: 280px">
    <Slider
      range
      value={rangeVal}
      onChange={(v) => (rangeVal = v as [number, number])}
    />
    <Text type="tertiary">区间：{rangeVal[0]} – {rangeVal[1]}</Text>
  </div>

  <div style="width: 280px" data-testid="slider-status">
    <Text type="tertiary">status 校验态：</Text>
    <Slider status="warning" defaultValue={40} />
    <Slider status="error" defaultValue={70} />
  </div>

  <div style="width: 280px" data-testid="slider-tip">
    <Text type="tertiary">tipFormatter + alwaysShowTip（带单位常驻气泡）：</Text>
    <Slider
      value={sliderTipVal}
      alwaysShowTip
      tipFormatter={(v) => `¥${v}`}
      getAriaValueText={(v) => `价格 ${v} 元`}
      onChange={(v) => (sliderTipVal = v as number)}
    />
  </div>

  <div style="width: 280px" data-testid="slider-dots">
    <Text type="tertiary">dots 刻度点 + marks（step=10）：</Text>
    <Slider
      value={sliderDotsVal}
      dots
      step={10}
      marks={{ 0: '0', 50: '50', 100: '100' }}
      onChange={(v) => (sliderDotsVal = v as number)}
    />
  </div>

  <div style="width: 280px" data-testid="slider-clickable">
    <Text type="tertiary">clickable=false（仅手柄可拖，轨道点击不跳转）：</Text>
    <Slider defaultValue={50} clickable={false} />
  </div>

  <div data-testid="slider-vertical">
    <Space>
      <div>
        <Text type="tertiary">vertical</Text>
        <Slider
          vertical
          height={160}
          value={sliderVertVal}
          tipFormatter={(v) => `${v}%`}
          onChange={(v) => (sliderVertVal = v as number)}
        />
      </div>
      <div>
        <Text type="tertiary">verticalReverse（顶部为 min）</Text>
        <Slider vertical verticalReverse height={160} defaultValue={30} />
      </div>
    </Space>
  </div>

  <div style="width: 280px">
    <Text type="tertiary">railStyle / handleStyle 自定义样式透传：</Text>
    <Slider
      defaultValue={55}
      railStyle="background: #e0e7ff"
      handleStyle="border-color:#7c3aed"
    />
  </div>
</div>
