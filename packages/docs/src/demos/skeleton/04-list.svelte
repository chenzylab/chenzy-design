<script lang="ts">
  import {
    Skeleton,
    SkeletonAvatar,
    SkeletonTitle,
    SkeletonParagraph,
    Button,
    Avatar,
    Text,
  } from '@chenzy-design/svelte';

  let loading = $state(true);

  const people = [
    { name: '陈一', desc: '资深前端工程师，专注设计系统与组件库建设。' },
    { name: '林二', desc: '产品设计师，负责无障碍与交互规范落地。' },
    { name: '王三', desc: '全栈开发，关注性能优化与构建工具链。' },
  ];
</script>

<Button onclick={() => (loading = !loading)}>
  {loading ? '加载完成' : '重新加载'}
</Button>

<div style="width:420px; margin-top:12px; padding:8px 16px; border:1px solid var(--cd-color-border); border-radius:8px">
  {#each people as person (person.name)}
    <div style="padding:12px 0; border-bottom:1px solid var(--cd-color-border)">
      <Skeleton {loading} active>
        {#snippet placeholder()}
          <div style="display:flex; gap:16px">
            <SkeletonAvatar />
            <div style="flex:1">
              <SkeletonTitle width="30%" />
              <div style="margin-top:8px">
                <SkeletonParagraph rows={2} width={['100%', '70%']} />
              </div>
            </div>
          </div>
        {/snippet}
        <div style="display:flex; gap:16px; align-items:flex-start">
          <Avatar>{person.name[0]}</Avatar>
          <div style="flex:1; min-width:0">
            <strong>{person.name}</strong>
            <p style="margin:6px 0 0; color:var(--cd-color-text-1); line-height:1.6">
              {person.desc}
            </p>
          </div>
        </div>
      </Skeleton>
    </div>
  {/each}
  <Text type="tertiary" size="small">列表项各自占位，loading 切换为真实数据。</Text>
</div>
