<!--
  测试夹具：组合式 <Avatar> 子项 + maxCount 折叠（对齐 Semi AvatarGroup children + maxCount）。
  验证「Svelte 无法遍历 snippet」不再是折叠的阻碍——子 Avatar 经 context 自注册序号，
  超出 maxCount 的自身不渲染，由组统一渲染「+N」。
-->
<script lang="ts">
  import AvatarGroup from './AvatarGroup.svelte';
  import Avatar from './Avatar.svelte';

  // 不设默认值：测试传 undefined 即代表「未启用折叠」。
  let { maxCount }: { maxCount?: number } = $props();
</script>

<!-- exactOptionalPropertyTypes：undefined 时不能显式传该 prop，故用 spread 条件透传。 -->
<AvatarGroup {...maxCount !== undefined ? { maxCount } : {}}>
  <Avatar alt="Lisa">LS</Avatar>
  <Avatar alt="Caroline">CA</Avatar>
  <Avatar alt="Zank">ZK</Avatar>
  <Avatar alt="Yuan">YU</Avatar>
</AvatarGroup>
