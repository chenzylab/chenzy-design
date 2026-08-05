<script lang="ts">
  import { Typography } from '@chenzy-design/svelte';

  const { Text } = Typography;
</script>

<!-- 链接型文字按钮推荐用 Typography 的 link prop 实现（而非 Button，对齐 Semi）。
     容器不用 flex（flex item 默认按最小内容宽度收缩会把 <a> 挤到比文字自然宽度更窄，
     触发不该有的换行），改用 block 流 + margin 间距，贴近 Semi 官方 story 的裸 <br/> 排布。 -->
<div>
  <Text link={{ href: 'https://github.com/bytegolang/chenzy.design', target: '_blank', rel: 'noreferrer' }}>
    链接文本
  </Text>
  <br />
  <br />
  <Text link={{ href: 'https://svelte.dev', target: '_blank', rel: 'noreferrer' }}>
    打开网站
  </Text>
  <br />
  <br />
  <!-- 带图标 + 下划线的链接（hover 出下划线，对齐 Semi）。icon 用前缀 snippet。 -->
  <Text link={{ href: 'https://svelte.dev', target: '_blank', rel: 'noreferrer' }} underline>
    {#snippet icon()}
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    {/snippet}
    带下划线的网页链接
  </Text>
</div>
