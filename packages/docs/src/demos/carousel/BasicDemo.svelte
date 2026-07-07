<script lang="ts">
  import { Carousel, Text, Space } from '@chenzy-design/svelte';

  let carouselIdx = $state(0);
</script>

{#snippet slideA()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-primary);color:#fff;font-size:20px">幻灯片 1</div>
{/snippet}
{#snippet slideB()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-success);color:#fff;font-size:20px">幻灯片 2</div>
{/snippet}
{#snippet slideC()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-warning);color:#fff;font-size:20px">幻灯片 3</div>
{/snippet}
{#snippet slideD()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-danger);color:#fff;font-size:20px">幻灯片 4</div>
{/snippet}
{#snippet slideE()}
  <div style="height:100%;display:grid;place-items:center;background:var(--cd-color-tertiary);color:#fff;font-size:20px">幻灯片 5</div>
{/snippet}

<Space vertical align="start">
  <Text type="tertiary">受控轮播（当前：{carouselIdx + 1}）：</Text>
  <div style="width: 360px">
    <Carousel
      slides={[slideA, slideB, slideC]}
      value={carouselIdx}
      onChange={(i) => (carouselIdx = i)}
      height={160}
    />
  </div>

  <Text type="tertiary">autoplay（1.2s 间隔，悬停暂停）：</Text>
  <div style="width: 360px" data-testid="carousel-autoplay">
    <Carousel slides={[slideA, slideB, slideC]} autoplay interval={1200} height={160} />
  </div>

  <Text type="tertiary">slidesToShow=2 多图同屏（slidesToScroll=2，可拖拽）：</Text>
  <div style="width: 480px" data-testid="carousel-multi">
    <Carousel
      slides={[slideA, slideB, slideC, slideD, slideE]}
      slidesToShow={2}
      slidesToScroll={2}
      loop={false}
      height={160}
    />
  </div>

  <Text type="tertiary">vertical 纵向（拖拽 / 箭头上下 / 右侧指示器）：</Text>
  <div style="width: 360px" data-testid="carousel-vertical">
    <Carousel
      slides={[slideA, slideB, slideC]}
      vertical
      height={200}
    />
  </div>

  <Text type="tertiary">indicatorType="line" 横线条指示器：</Text>
  <div style="width: 360px" data-testid="carousel-indicator-line">
    <Carousel slides={[slideA, slideB, slideC]} indicatorType="line" height={160} />
  </div>

  <Text type="tertiary">indicatorType="columnar" 竖栏指示器：</Text>
  <div style="width: 360px" data-testid="carousel-indicator-columnar">
    <Carousel slides={[slideA, slideB, slideC]} indicatorType="columnar" height={160} />
  </div>

  <Text type="tertiary">vertical + line 指示器（右侧纵向）：</Text>
  <div style="width: 360px" data-testid="carousel-indicator-vertical-line">
    <Carousel slides={[slideA, slideB, slideC]} vertical indicatorType="line" height={200} />
  </div>
</Space>
