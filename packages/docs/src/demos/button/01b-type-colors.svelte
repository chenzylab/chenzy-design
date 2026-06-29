<script lang="ts">
  // 每种 type 的语义色都是 CSS 变量，可直接用于自定义元素
  const types: { var: string; label: string }[] = [
    { var: '--cd-color-primary', label: '主要' },
    { var: '--cd-color-secondary', label: '次要' },
    { var: '--cd-color-tertiary', label: '第三' },
    { var: '--cd-color-warning', label: '警告' },
    { var: '--cd-color-danger', label: '危险' },
  ];
</script>

<article style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
  {#each types as t (t.var)}
    <strong style="color: var({t.var});">{t.label}</strong>
  {/each}
</article>
