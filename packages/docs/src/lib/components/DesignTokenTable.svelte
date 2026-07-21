<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Table, Tabs, type TabItem } from '@chenzy-design/svelte';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';
  // 数据源：tokens 包构建产出的结构化 manifest（从 TS token 源直接生成，
  // 取代旧 build-tokens-detail.ts 的正则事后解析）。见 dsm.spec.md §地基1。
  import manifest from '@chenzy-design/tokens/token-manifest.json';

  const lang = $derived(locale.value);

  interface TokenDetail {
    name: string;
    value: string;
    category: string;
    component: string | null;
    usage: string;
    // 索引签名：满足 Table 的 dataSource 泛型约束 Record<string, unknown>。
    [key: string]: unknown;
  }

  // component：组件名（小写，如 'dropdown'）。仅展示该组件专属变量；null 时展示全部。
  const { component = null }: { component?: string | null } = $props();

  const allTokens = (manifest as { tokens: TokenDetail[] }).tokens;

  // 该页相关 token：组件专属变量。
  // component 为 null → 展示全部；为 '' → 视为「无专属变量」展示空态（区别于 null）。
  const scoped = $derived(
    component === null
      ? allTokens
      : component === ''
        ? []
        : allTokens.filter((tk) => tk.component === component),
  );

  // 类别 tab：仅展示该组件实际拥有的类别，按固定顺序（对齐 Semi 按 category 分 Tab）。
  const CATEGORY_ORDER = [
    'animation',
    'color',
    'font',
    'height',
    'other',
    'radius',
    'spacing',
    'width',
  ];
  const categories = $derived(
    CATEGORY_ORDER.filter((c) => scoped.some((tk) => tk.category === c)),
  );

  const tabList = $derived<TabItem[]>(categories.map((c) => ({ tab: c, itemKey: c })));

  // 用户点选的类别（null = 跟随默认）。effective 类别从 categories 派生，
  // 避免在 $effect 内写 $state：切换组件时 picked 若失效自动回落到首个类别。
  let pickedCat = $state<string | null>(null);
  const activeCat = $derived(
    pickedCat && categories.includes(pickedCat) ? pickedCat : (categories[0] ?? ''),
  );

  const rows = $derived(scoped.filter((tk) => tk.category === activeCat));

  // 判定是否为可预览的颜色值（直接色值；别名在此不展开，仅对字面色块预览）。
  function colorSwatch(value: string): string | null {
    const v = value.trim();
    if (/^#([0-9a-f]{3,8})$/i.test(v)) return v;
    if (/^rgba?\(/i.test(v) || /^hsla?\(/i.test(v)) return v;
    return null;
  }

  // 对齐 Semi：Table columns（变量 / 默认值 / 用法各占 1/3），变量列加粗 + 色值前色块。
  const columns = $derived([
    {
      dataIndex: 'name',
      title: t('token.var', lang),
      width: '33%',
      render: varCell as Snippet<[{ value: unknown; record: TokenDetail; index: number }]>,
    },
    {
      dataIndex: 'value',
      title: t('token.value', lang),
      width: '33%',
      render: valueCell as Snippet<[{ value: unknown; record: TokenDetail; index: number }]>,
    },
    {
      dataIndex: 'usage',
      title: t('token.usage', lang),
      width: '34%',
    },
  ]);
</script>

{#if scoped.length === 0}
  <p class="empty">{t('token.empty', lang)}</p>
{:else}
  <Tabs {tabList} activeKey={activeCat} onChange={(k) => (pickedCat = String(k))}>
    <Table
      columns={columns}
      dataSource={rows}
      rowKey="name"
      pagination={{ pageSize: 10 }}
      ariaLabel={t('section.tokens', lang)}
    />
  </Tabs>
{/if}

{#snippet varCell({ value }: { value: unknown; record: TokenDetail; index: number })}
  <span class="dtt-var">{value}</span>
{/snippet}

{#snippet valueCell({ value }: { value: unknown; record: TokenDetail; index: number })}
  {#if colorSwatch(String(value))}
    <span class="dtt-swatch" style:background={colorSwatch(String(value))}></span>
  {/if}{value}
{/snippet}

<style>
  .empty {
    color: var(--cd-color-text-2, #86909c);
    font-size: 14px;
    padding: 16px 0;
  }
  /* 变量名：加粗（对齐 Semi TokenTable render fontWeight:600），等宽字体便于辨认。 */
  .dtt-var {
    font-weight: 600;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }
  .dtt-swatch {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    vertical-align: -3px;
    margin-right: 8px;
  }
</style>
