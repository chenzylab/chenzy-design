<script lang="ts">
  import {
    Empty,
    IllustrationSuccess, IllustrationSuccessDark,
    IllustrationFailure, IllustrationFailureDark,
    IllustrationNoAccess, IllustrationNoAccessDark,
    IllustrationNoContent, IllustrationNoContentDark,
    IllustrationNotFound, IllustrationNotFoundDark,
    IllustrationNoResult, IllustrationNoResultDark,
    IllustrationConstruction, IllustrationConstructionDark,
    IllustrationIdle, IllustrationIdleDark,
  } from '@chenzy-design/svelte';

  const items = [
    { light: IllustrationSuccess, dark: IllustrationSuccessDark, desc: '创建成功' },
    { light: IllustrationFailure, dark: IllustrationFailureDark, desc: '加载失败' },
    { light: IllustrationNoAccess, dark: IllustrationNoAccessDark, desc: '没有权限' },
    { light: IllustrationNoContent, dark: IllustrationNoContentDark, desc: '暂无内容，请添加' },
    { light: IllustrationNotFound, dark: IllustrationNotFoundDark, desc: '页面404' },
    { light: IllustrationNoResult, dark: IllustrationNoResultDark, desc: '搜索无结果' },
    { light: IllustrationConstruction, dark: IllustrationConstructionDark, desc: '建设中' },
    { light: IllustrationIdle, dark: IllustrationIdleDark, desc: '神游四方' },
  ];
</script>

<div style="display: flex; flex-wrap: wrap;">
  {#each items as item (item.desc)}
    {@const Light = item.light}
    {@const Dark = item.dark}
    <Empty description={item.desc} style="padding: 30px;">
      {#snippet imageSlot()}
        <Light style="width: 150px; height: 150px;" />
      {/snippet}
      {#snippet darkModeImageSlot()}
        <Dark style="width: 150px; height: 150px;" />
      {/snippet}
    </Empty>
  {/each}
</div>
