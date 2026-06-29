<script lang="ts">
  import { Layout } from '@chenzy-design/svelte';

  // padding 档位：false=0 / true=token / number=px / string=原样
  const cases = [
    { label: 'padding={false}（0）', padding: false as const },
    { label: 'padding（true，token 默认）', padding: true as const },
    { label: 'padding={32}（32px）', padding: 32 },
    { label: "padding='8px 32px'（原样）", padding: '8px 32px' },
  ];
</script>

<div style="display:flex; flex-direction:column; gap:16px;">
  {#each cases as c (c.label)}
    <div style="border:1px solid var(--cd-color-border); border-radius:8px; overflow:hidden;">
      <Layout>
        <Layout.Content padding={c.padding} style="background: var(--cd-color-bg-0);">
          <div style="background: var(--cd-color-fill-1); color: var(--cd-color-text-2); border-radius:4px;">
            {c.label}
          </div>
        </Layout.Content>
      </Layout>
    </div>
  {/each}
</div>
