<script lang="ts">
  import { Slider } from '@chenzy-design/svelte';

  let value = $state<[number, number]>([20, 60]);

  const changeValue = (newValue: number | number[]) => {
    value = newValue as [number, number];
  };

  const range: [number, number] = [10, 100];

  const railStyle = $derived.by(() => {
    // 第二段颜色继承自 .cd-slider-track
    const color = ['var(--cd-color-danger)', 'transparent', 'var(--cd-color-success)'];
    const gradientPos = value.map(
      (val) => Number(((val - range[0]) / (range[1] - range[0])).toFixed(2)) * 100,
    );
    return `background: linear-gradient(to right, ${color[0]} ${gradientPos[0]}%, ${color[1]} ${gradientPos[0]}%, ${color[1]} ${gradientPos[1]}%, ${color[2]} ${gradientPos[1]}%)`;
  });
</script>

<Slider range min={range[0]} max={range[1]} onChange={changeValue} {railStyle} {value} />
