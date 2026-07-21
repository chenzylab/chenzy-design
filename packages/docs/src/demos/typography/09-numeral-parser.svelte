<script lang="ts">
  import { Typography } from '@chenzy-design/svelte';

  const { Numeral } = Typography;

  // 千分位 + 结尾加号（对齐 Semi parserTCH）。
  function parserTCH(oldVal: string): string {
    return oldVal
      .split(' ')
      .map((item) =>
        Number(item) ? `${item.replace(/(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,')}+` : item,
      )
      .join(' ');
  }

  const infos = [
    { type: 'Stars', min: '7100' },
    { type: 'Fork', min: '560' },
    { type: 'Downloads', min: '5000000' },
    { type: 'Contributors', min: '100' },
  ];
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <Numeral parser={parserTCH} component="div">
    chenzy Design 重视我们的用户，加入并助力我们不断完善
    {#each infos as info (info.min)}
      <p style="margin: 4px 0;">
        {info.type}：<b style="color: var(--cd-color-primary);">{info.min}</b>
      </p>
    {/each}
  </Numeral>

  <Numeral link={{ href: 'https://semi.design', target: '_blank' }} parser={parserTCH}>
    现已服务 100000 用户，前往官网 &gt;&gt;
  </Numeral>
</div>
