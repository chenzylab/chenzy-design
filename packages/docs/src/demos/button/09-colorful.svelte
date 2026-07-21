<script lang="ts">
  import { Button } from '@chenzy-design/svelte';
  import { IconAIFilledLevel1, IconAIFilledLevel2, IconAIFilledLevel3 } from '@chenzy-design/icons';
  import type { ComponentProps } from 'svelte';

  type Theme = NonNullable<ComponentProps<typeof Button>['theme']>;
  const themes: Theme[] = ['solid', 'light', 'outline', 'borderless'];

  // 两组内容（对齐 Semi colorful.jsx 的 ['Colorful', undefined]）：有文字 / 无文字（纯图标）。
  const contents: (string | undefined)[] = ['Colorful', undefined];

  // 图标映射严格对齐 Semi（button/_story/colorful.jsx），按 theme × type：
  //   solid   → primary=Level1, tertiary=Level3
  //   light   → primary=Level3, tertiary=Level2
  //   outline → primary=Level1, tertiary=Level2
  //   borderless → primary=Level3, tertiary=Level2
  // light/borderless primary 用 Level3——它 fill=url(#gradient) 自带渐变、不依赖 currentColor，
  // 故在“渐变文字”方案（content color:transparent）的纯图标场景下依然能显示。
  function iconLevel(theme: Theme, type: 'primary' | 'tertiary'): 1 | 2 | 3 {
    if (type === 'primary') return theme === 'light' || theme === 'borderless' ? 3 : 1;
    return theme === 'solid' ? 3 : 2;
  }
</script>

{#snippet aiIcon(level: 1 | 2 | 3)}
  {#if level === 1}<IconAIFilledLevel1 />{:else if level === 2}<IconAIFilledLevel2 />{:else}<IconAIFilledLevel3 />{/if}
{/snippet}

{#each contents as content (content ?? '__empty__')}
  <div style="display: flex; row-gap: 16px; margin-top: 20px; margin-left: 10px; flex-direction: column;">
    {#each themes as theme (theme)}
      {@const pIcon = iconLevel(theme, 'primary')}
      {@const tIcon = iconLevel(theme, 'tertiary')}
      <div style="display: flex; column-gap: 16px; flex-wrap: wrap;">
        <Button colorful {theme} type="primary" ariaLabel={content ? undefined : 'AI Level1'}>
          {#snippet icon()}{@render aiIcon(pIcon)}{/snippet}
          {content}
        </Button>
        <Button colorful {theme} type="primary" loading ariaLabel={content ? undefined : '加载中'}>
          {content}
        </Button>
        <Button colorful {theme} type="primary" disabled ariaLabel={content ? undefined : 'AI Level1'}>
          {#snippet icon()}{@render aiIcon(pIcon)}{/snippet}
          {content}
        </Button>
        <Button colorful {theme} type="tertiary" ariaLabel={content ? undefined : 'AI Level'}>
          {#snippet icon()}{@render aiIcon(tIcon)}{/snippet}
          {content}
        </Button>
        <Button colorful {theme} type="tertiary" loading ariaLabel={content ? undefined : '加载中'}>
          {content}
        </Button>
        <Button colorful {theme} type="tertiary" disabled ariaLabel={content ? undefined : 'AI Level'}>
          {#snippet icon()}{@render aiIcon(tIcon)}{/snippet}
          {content}
        </Button>
      </div>
    {/each}
  </div>
{/each}
