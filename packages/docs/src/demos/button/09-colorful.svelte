<script lang="ts">
  import { Button } from '@chenzy-design/svelte';
  import { IconAIFilledLevel1, IconAIFilledLevel2, IconAIFilledLevel3 } from '@chenzy-design/icons';
  import type { ComponentProps } from 'svelte';

  type Theme = NonNullable<ComponentProps<typeof Button>['theme']>;
  const themes: Theme[] = ['solid', 'light', 'outline', 'borderless'];

  // 图标选择严格对齐 Semi 官方 colorful demo（button/_story/colorful.jsx）：
  //   solid   → primary=Level1(currentColor 白图标@渐变底), tertiary=Level3(自带渐变)
  //   light   → primary=Level3(自带渐变), tertiary=Level2(自带双色)
  //   outline → primary=Level1, tertiary=Level2
  //   borderless → primary=Level3, tertiary=Level2
  // 关键：light/borderless primary 用 Level3——它 fill=url(#gradient) 自带渐变、不依赖 currentColor，
  //   故在“渐变文字”方案（content color:transparent）的纯图标场景下依然能显示；若误用 Level1
  //   （fill=currentColor），会被 transparent 吃掉而消失（Semi 同理）。
  // 返回 level 编号（1/2/3），渲染层用带参 snippet 生成独立实例（勿把 snippet 存对象跨处复用）。
  function iconLevel(theme: Theme, type: 'primary' | 'tertiary'): 1 | 2 | 3 {
    if (type === 'primary') return theme === 'light' || theme === 'borderless' ? 3 : 1;
    return theme === 'solid' ? 3 : 2;
  }
</script>

{#snippet aiIcon(level: 1 | 2 | 3)}
  {#if level === 1}<IconAIFilledLevel1 />{:else if level === 2}<IconAIFilledLevel2 />{:else}<IconAIFilledLevel3 />{/if}
{/snippet}

<!-- 设 colorful 即获得多彩按钮：蓝→紫渐变。带文字 4 行 + 纯图标 4 行，各覆盖 4 theme × primary/tertiary × 普通/加载/禁用 -->
<div style="display: flex; flex-direction: column; gap: 12px;">
  <!-- 带文字 -->
  {#each themes as theme (theme)}
    {@const pIcon = iconLevel(theme, 'primary')}
    {@const tIcon = iconLevel(theme, 'tertiary')}
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <Button colorful {theme} type="primary">
        {#snippet icon()}{@render aiIcon(pIcon)}{/snippet}
        AI 生成
      </Button>
      <Button colorful {theme} type="primary" loading>处理中</Button>
      <Button colorful {theme} type="primary" disabled>禁用</Button>
      <Button colorful {theme} type="tertiary">
        {#snippet icon()}{@render aiIcon(tIcon)}{/snippet}
        智能优化
      </Button>
      <Button colorful {theme} type="tertiary" loading>加载</Button>
      <Button colorful {theme} type="tertiary" disabled>禁用</Button>
    </div>
  {/each}

  <!-- 纯图标 -->
  {#each themes as theme (`${theme}-icon`)}
    {@const pIcon = iconLevel(theme, 'primary')}
    {@const tIcon = iconLevel(theme, 'tertiary')}
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <Button colorful {theme} type="primary" ariaLabel="AI 生成">
        {#snippet icon()}{@render aiIcon(pIcon)}{/snippet}
      </Button>
      <Button colorful {theme} type="primary" loading ariaLabel="处理中" />
      <Button colorful {theme} type="primary" disabled ariaLabel="禁用">
        {#snippet icon()}{@render aiIcon(pIcon)}{/snippet}
      </Button>
      <Button colorful {theme} type="tertiary" ariaLabel="智能优化">
        {#snippet icon()}{@render aiIcon(tIcon)}{/snippet}
      </Button>
      <Button colorful {theme} type="tertiary" loading ariaLabel="加载" />
      <Button colorful {theme} type="tertiary" disabled ariaLabel="禁用">
        {#snippet icon()}{@render aiIcon(tIcon)}{/snippet}
      </Button>
    </div>
  {/each}
</div>
