<script lang="ts">
  import type { Component } from 'svelte';
  import { tick, mount } from 'svelte';
  import { IconLink } from '@chenzy-design/icons';
  import { Toast } from '@chenzy-design/svelte';
  import { makeAnchorId } from '$lib/anchor-id';
  import type { PageData } from './$types';
  import { base } from '$app/paths';
  import { replaceState } from '$app/navigation';
  import { loadScrollSection, beginRestore, endRestore } from '$lib/scroll-restore';
  import { browser } from '$app/environment';
  import componentsJson from '@chenzy-design/svelte/components.json';
  import type { DemoEntry } from './+page.ts';
  import ApiTable from '$lib/components/ApiTable.svelte';
  import DesignTokenTable from '$lib/components/DesignTokenTable.svelte';
  import DemoBox from '$lib/components/DemoBox.svelte';
  import CodeBlock from '$lib/components/CodeBlock.svelte';
  import Toc from '$lib/components/Toc.svelte';
  import SectionAnchor from '$lib/components/SectionAnchor.svelte';
  import { locale } from '$lib/locale.svelte';
  import { t, localize } from '$lib/i18n';
  import { resolveTokenPrefix } from '$lib/token-prefix';
  import { nameToDir } from '$lib/component-dir';

  const { data }: { data: PageData } = $props();
  const meta = $derived(data.meta);
  const lang = $derived(locale.value);
  // docMode='inline'：整页由 md 内联驱动（复刻 Semi 无 tab 纵向流）。
  // 其余组件保持 meta 驱动的 api/usage 双 tab 不变。
  const inlineDoc = $derived(data.docMode === 'inline');

  let activeTab = $state<'api' | 'usage'>('api');

  // —— inline 模式：TOC 由 md 渲染出的标题实时扫描生成 ——
  // md 编译时已由 rehypeSemiAnchor 给每个标题加上与 Semi 一致的 id。
  // 对齐 Semi PageAnchor：① 从「代码演示」标题之后才开始收集（之前的总述章节不进 TOC）；
  // ② 「代码演示」标题本身不显示，其下 demo 直接平铺；③ 全部一级平铺，不缩进不分树。
  let inlineTocSections = $state<{ id: string; title: string; level?: number }[]>([]);
  let contentEl = $state<HTMLElement | null>(null);

  // 给 inline md 标题追加「复制链接」锚点按钮（对齐 Semi postTemplate 的 h2/h3 渲染器：
  // 标题末尾放 anchor-link 图标，点击复制 location+#id 并提示）。mdsvex 无 MDXProvider
  // 等价物覆写标题渲染器，故编译期加 id（rehypeSemiAnchor）+ 运行期 DOM 注入按钮。
  function injectAnchor(h: HTMLElement, title: string): void {
    if (h.querySelector('.header-anchor')) return; // 幂等：切页重扫时不重复注入
    const btn = document.createElement('button');
    btn.className = 'header-anchor';
    btn.type = 'button';
    btn.setAttribute('aria-label', '复制本节链接');
    btn.title = '复制链接';
    // 用本库具名图标 IconLink（对齐 Semi postTemplate 的 IconLink），非手写 svg。
    mount(IconLink, { target: btn });
    btn.addEventListener('click', () => {
      // 严格对齐 Semi postTemplate 的复制逻辑：
      // copy(`${location.href.replace(location.hash,'')}#${encodeURI(标题文本)}`) + Toast.success。
      // 注意 hash 用原始标题文本的 encodeURI（可读，如 #基本写法），非 slug id；
      // 定位时再 makeAnchorId(decodeURI(hash)) 转回 id（见滚动恢复逻辑）。
      const url = `${location.href.replace(location.hash, '')}#${encodeURI(title)}`;
      void navigator.clipboard?.writeText(url).then(() => {
        Toast.success('复制成功');
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1500);
      });
    });
    h.appendChild(btn);
  }

  $effect(() => {
    if (!inlineDoc || !browser) return;
    lowerName; // 切换组件时重扫
    lang; // 切换语言时 md 换、标题变，重扫 TOC
    // 等 md DOM 就位后扫标题（数据同步，tick 一次即可）
    tick().then(() => {
      if (!contentEl) return;
      const heads = Array.from(contentEl.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
      const sections: { id: string; title: string; level?: number }[] = [];
      let started = false;
      for (const h of heads) {
        const title = h.textContent?.trim() ?? '';
        // 每个带 id 的标题注入「复制链接」锚点按钮（对齐 Semi 标题旁的分享图标 +
        // meta 驱动页的 SectionAnchor）。md 标题是原生元素、无法嵌组件，故 DOM 注入。
        // 传注入前捕获的纯标题文本（此时 h 尚无按钮），供复制逻辑用 encodeURI(title)。
        injectAnchor(h, title);
        // 「代码演示」是分界：之前的总述不进 TOC，标题本身也不显示。
        if (title === '代码演示' || title === 'Demos') {
          started = true;
          continue;
        }
        if (!started) continue;
        sections.push({ id: h.id, title, level: 1 });
      }
      inlineTocSections = sections;
    });
  });

  // demo 场景与「使用场景」正文改由 load（+page.ts）同步预取，页面首帧即完整。
  // 不再客户端异步加载，避免 TOC/锚点/页面高度在渲染后才变化导致的滚动错位。
  const demoList = $derived<DemoEntry[]>(data.demos ?? []);
  // 按文档站语言选中/英 md（对齐 Semi 双 md）；英文缺失时回退中文。
  const ContentComponent = $derived<Component | null>(
    lang === 'en' ? (data.ContentEn ?? data.Content ?? null) : (data.Content ?? null),
  );

  const lowerName = $derived(meta.name.toLowerCase());
  // token 归属前缀：用数据集真实存在的前缀匹配，避免命名漂移（见 token-prefix.ts）
  const tokenComponent = $derived(resolveTokenPrefix(lowerName, nameToDir[lowerName]));

  // 「设计文档」外链：对齐 Semi 的 /design 子站习惯，新窗口打开
  const designUrl = $derived(`${base}/design/components/${lowerName}`);

  // —— meta 字段归一化（命名不统一：subComponents/subcomponents、configObjects/config）——
  interface SubComp {
    name: string;
    element?: string;
    desc?: string;
    props?: any[];
  }
  const subComponents = $derived<SubComp[]>(meta.subComponents ?? meta.subcomponents ?? []);

  interface ConfigObj {
    name: string;
    fields: { name: string; type: string; default?: string; desc?: string }[];
  }
  const configObjects = $derived.by<ConfigObj[]>(() => {
    if (Array.isArray(meta.configObjects)) return meta.configObjects;
    // Notification.config 是 { key: 说明 } 形态 → 归一为单个配置对象
    if (meta.config && typeof meta.config === 'object') {
      return [
        {
          name: 'Config',
          fields: Object.entries(meta.config as Record<string, string>).map(([k, v]) => ({
            name: k,
            type: '—',
            desc: v,
          })),
        },
      ];
    }
    return [];
  });

  const methods = $derived<any[]>(meta.methods ?? meta.imperative ?? []);

  // a11y 归一：兼容 role/hasRole、note/notes 等。
  // 注意 hasRole 是布尔标记（「是否有 role」），不是 role 值本身，故只取字符串 role。
  const a11y = $derived(meta.a11y ?? null);
  const a11yRole = $derived(typeof a11y?.role === 'string' ? a11y.role : null);
  // keyboard 形态不统一：多数组件是 string[]（按键芯片），少数是单条 string（用 / 分隔的说明）。
  // 归一为数组：string 按 / 切分为多段，避免 {#each} 误把字符串按字符迭代（重复空格 key 崩溃）。
  const a11yKeyboard = $derived<string[]>(
    Array.isArray(a11y?.keyboard)
      ? a11y.keyboard
      : typeof a11y?.keyboard === 'string'
        ? a11y.keyboard.split('/').map((s: string) => s.trim()).filter(Boolean)
        : [],
  );
  const a11yNotes = $derived<string[]>(
    a11y?.notes ?? (a11y?.note ? [a11y.note] : []),
  );
  const a11yPattern = $derived(meta.a11yPattern ?? a11y?.pattern ?? null);
  const apgRef = $derived(meta.apgRef ?? null);

  // 文案规范来源
  const usageHints = $derived(meta.usageHints ?? null);
  const dangerousActions = $derived(meta.dangerousActions ?? null);
  // 仅保留实际存在文档页的相关组件，避免预渲染爬到不存在的页面（如 Numeral）报 404
  const validNames = new Set(
    Object.values(componentsJson.components).map((m: any) => m.name.toLowerCase()),
  );
  const relatedComponents = $derived<string[]>(
    (meta.relatedComponents ?? []).filter((rc: string) => validNames.has(rc.toLowerCase())),
  );

  // 场景 demo：demos.ts 全部条目，逐个作为顶级章节
  // 每个场景生成稳定锚点 id（按序号），供 TOC 跳转
  const allDemos = $derived(demoList.map((d, i) => ({ ...d, anchorId: `demo-${i}` })));
  // pageHead demo（如图标列表）置于「如何引入」之前、裸渲染；其余为常规场景。
  const headDemos = $derived(allDemos.filter((d) => d.pageHead));
  const sceneDemos = $derived(allDemos.filter((d) => !d.pageHead));

  const hasA11y = $derived(!!(a11yRole || a11yKeyboard.length || a11yNotes.length || a11yPattern));
  const hasContent = $derived(!!(usageHints || dangerousActions || relatedComponents.length));
  const hasTokens = $derived(tokenComponent.length > 0);

  // 「如何引入」import 片段：主组件 + 子组件具名导入（对齐 Semi 的安装/引入节）
  const importNames = $derived(
    [meta.name, ...subComponents.map((s) => s.name)]
      .filter((n, i, arr) => n && arr.indexOf(n) === i)
      .join(', '),
  );
  const importCode = $derived(`import { ${importNames} } from '@chenzy-design/svelte';`);

  interface TocItem {
    id: string;
    title: string;
    level?: number;
  }

  // TOC 章节：每个 demo 场景都是顶级章节（对齐 Semi——按钮类型/主题/尺寸… 平铺，
  // 不再统一收进「代码演示」一节）。交互式 playground 作为首个「代码演示」节。
  const tocSections = $derived(
    [
      // 页首区块（图标列表等）不进 TOC（对齐 Semi：图标列表不在右侧目录）
      { id: 'install', title: t('section.install', lang) },
      ...sceneDemos.map((d) => ({ id: d.anchorId, title: localize(d.title, lang) })),
      { id: 'api', title: t('section.api', lang) },
      hasA11y ? { id: 'a11y', title: t('section.a11y', lang) } : null,
      hasContent ? { id: 'content', title: t('section.content', lang) } : null,
      hasTokens ? { id: 'tokens', title: t('section.tokens', lang) } : null,
    ].filter((s): s is TocItem => s !== null),
  );

  // 恢复滚动位置。demo/正文已由 load 同步预取，页面首帧即完整——锚点从一开始
  // 就在 DOM 里、页面高度稳定，故恢复简单可靠。两种来源：
  //  1) URL 带 #demo-N —— 分享链接场景。滚到锚点后把 hash 从地址栏清掉。
  //  2) 无 hash —— 普通刷新场景，读 sessionStorage 里记住的上次章节。
  // 用 beginRestore/endRestore 闸门包住程序化滚动，避免其触发的 onScroll
  // 把 sessionStorage 覆盖成落点。
  $effect(() => {
    if (!browser) return;
    lowerName; // 依赖组件名：SPA 切换组件时按新页重新恢复
    const rawHash = decodeURIComponent(location.hash.slice(1));
    // inline 模式复制的 hash 是原始标题文本（对齐 Semi），需 makeAnchorId 转回元素 id 定位；
    // 非 inline 页复制的本就是 id，原样用。
    const hashId = rawHash ? (inlineDoc ? makeAnchorId(rawHash) : rawHash) : '';
    const fromHash = !!hashId;
    const targetId = hashId || loadScrollSection(location.pathname) || '';
    if (!targetId) return;

    // 接管滚动：关原生恢复、开闸门。
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    beginRestore();

    // 等首次挂载的 DOM 就绪再定位（数据同步，tick 一次即可）。
    tick().then(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ block: 'start' });
        if (fromHash) {
          // 分享链接：定位后清掉 hash，保留 path/query。
          try {
            replaceState(location.pathname + location.search, {});
          } catch {
            // 路由未就绪时静默跳过
          }
        }
      }
      // 两帧后放开闸门，确保 scrollIntoView 引发的 scroll 回调已过去。
      requestAnimationFrame(() => requestAnimationFrame(() => endRestore()));
    });
  });
</script>

<svelte:head>
  <title>{meta.name} — chenzy-design</title>
</svelte:head>

<div class="page">
  <div class="page-main">
    <div class="component-header" data-pagefind-meta="title:{meta.name}">
      <div class="breadcrumb">
        <a href="{base}/components">组件</a>
        <span> / </span>
        <span>{meta.category}</span>
      </div>
      <h1>{meta.name}</h1>
      <p class="description">{meta.description}</p>
    </div>

    {#if inlineDoc}
      <!-- 整页由 md 内联驱动：单页纵向流，无 tab（复刻 Semi）。
           md 顶部 import DemoBox/Notice/各 demo，正文按 Semi 章节顺序内联书写。 -->
      <div class="content-body inline-doc" bind:this={contentEl}>
        {#if ContentComponent}
          <ContentComponent />
        {/if}
      </div>
    {:else}
    <div class="tabs">
      <button class="tab" class:active={activeTab === 'api'} onclick={() => (activeTab = 'api')}>
        {t('tab.api', lang)}
      </button>
      <button class="tab" class:active={activeTab === 'usage'} onclick={() => (activeTab = 'usage')}>
        {t('tab.usage', lang)}
      </button>
      <a class="tab tab-link" href={designUrl} target="_blank" rel="noreferrer" title={t('design.openInNew', lang)}>
        {t('tab.design', lang)}
        <span class="ext-icon" aria-hidden="true">↗</span>
      </a>
    </div>

    {#if activeTab === 'api'}
      <!-- 页首区块（如图标列表）：置于「如何引入」之前，裸渲染无 DemoBox（对齐 Semi）-->
      {#each headDemos as demo (demo.anchorId)}
        {@const HeadComp = demo.component}
        <section class="section" id={demo.anchorId}>
          <h2>{localize(demo.title, lang)}<SectionAnchor id={demo.anchorId} /></h2>
          {#if demo.description}
            <p class="section-desc">{localize(demo.description, lang)}</p>
          {/if}
          <HeadComp />
        </section>
      {/each}

      <!-- 如何引入：具名导入片段（对齐 Semi 的引入说明）-->
      <section class="section" id="install">
        <h2>{t('section.install', lang)}<SectionAnchor id="install" /></h2>
        <CodeBlock code={importCode} codeLang="typescript" />
      </section>

      <!-- 每个场景都是顶级章节：标题作 h2，与 API/Accessibility 同级（对齐 Semi）-->
      {#each sceneDemos as demo (demo.anchorId)}
        {@const SceneComp = demo.component}
        <section class="section" id={demo.anchorId}>
          <h2>{localize(demo.title, lang)}<SectionAnchor id={demo.anchorId} /></h2>
          {#if demo.description || demo.seeAlso}
            <p class="section-desc">
              {#if demo.description}{localize(demo.description, lang)}{/if}
              {#if demo.seeAlso}<a
                  class="see-also"
                  href="{base}/components/{demo.seeAlso.component.toLowerCase()}"
                >{localize(demo.seeAlso.text, lang)}</a
                >{/if}
            </p>
          {/if}
          {#if demo.raw}
            <SceneComp />
          {:else}
            <DemoBox code={demo.code} highlightLines={demo.highlightLines}>
              <SceneComp />
            </DemoBox>
          {/if}
        </section>
      {/each}

      <!-- API 参考：主组件 + 子组件 + 配置对象 + 方法 -->
      <section class="section" id="api">
        <h2>{t('section.api', lang)}<SectionAnchor id="api" /></h2>

        <h3 class="api-group-title">{meta.name}</h3>
        <ApiTable props={meta.props ?? []} events={meta.events ?? []} slots={meta.slots ?? []} />

        {#each subComponents as sub (sub.name)}
          <div class="sub-api">
            <h3 class="api-group-title">
              {sub.name}
              {#if sub.element}<span class="el-tag">&lt;{sub.element}&gt;</span>{/if}
            </h3>
            {#if sub.desc}<p class="sub-desc">{sub.desc}</p>{/if}
            <ApiTable props={sub.props ?? []} events={[]} slots={[]} />
          </div>
        {/each}

        {#each configObjects as cfg (cfg.name)}
          <div class="sub-api">
            <h3 class="api-group-title">{cfg.name}</h3>
            <table class="api-table">
              <thead>
                <tr>
                  <th>{t('api.name', lang)}</th>
                  <th>{t('api.type', lang)}</th>
                  <th>{t('api.default', lang)}</th>
                  <th>{t('api.desc', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {#each cfg.fields as f (f.name)}
                  <tr>
                    <td><code>{f.name}</code></td>
                    <td><code class="type">{f.type}</code></td>
                    <td>{f.default ?? '—'}</td>
                    <td>{f.desc ?? '—'}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/each}

        {#if methods.length}
          <div class="sub-api">
            <h3 class="api-group-title">Methods</h3>
            <table class="api-table">
              <thead>
                <tr>
                  <th>{t('api.name', lang)}</th>
                  <th>{t('api.type', lang)}</th>
                  <th>{t('api.desc', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {#each methods as m (m.name)}
                  <tr>
                    <td><code>{m.name}</code></td>
                    <td><code class="type">{m.type ?? '—'}</code></td>
                    <td>{m.desc ?? '—'}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </section>

      <!-- Accessibility -->
      {#if hasA11y}
        <section class="section" id="a11y">
          <h2>{t('section.a11y', lang)}<SectionAnchor id="a11y" /></h2>
          {#if a11yRole || a11yPattern || a11yKeyboard.length}
            <table class="api-table a11y-table">
              <tbody>
                {#if a11yRole}
                  <tr>
                    <td class="a11y-key">{t('a11y.role', lang)}</td>
                    <td><code>{a11yRole}</code></td>
                  </tr>
                {/if}
                {#if a11yPattern}
                  <tr>
                    <td class="a11y-key">APG</td>
                    <td><code>{a11yPattern}</code></td>
                  </tr>
                {/if}
                {#if a11yKeyboard.length}
                  <tr>
                    <td class="a11y-key">{t('a11y.keyboard', lang)}</td>
                    <td>
                      {#each a11yKeyboard as k, i (i)}<kbd>{k}</kbd>{/each}
                    </td>
                  </tr>
                {/if}
              </tbody>
            </table>
          {/if}
          {#if a11yNotes.length}
            <ul class="a11y-notes">
              {#each a11yNotes as note (note)}<li>{note}</li>{/each}
            </ul>
          {/if}
          {#if apgRef}
            <p class="apg-ref">
              {t('a11y.apg', lang)}：<code>{apgRef}</code>
            </p>
          {/if}
        </section>
      {/if}

      <!-- 文案规范 -->
      {#if hasContent}
        <section class="section" id="content">
          <h2>{t('section.content', lang)}<SectionAnchor id="content" /></h2>
          {#if usageHints}
            <h3 class="content-sub">{t('content.usage', lang)}</h3>
            <p class="content-text">{usageHints}</p>
          {/if}
          {#if dangerousActions}
            <h3 class="content-sub">{t('content.danger', lang)}</h3>
            <p class="content-text">{dangerousActions}</p>
          {/if}
          {#if relatedComponents.length}
            <h3 class="content-sub">{t('content.related', lang)}</h3>
            <div class="related">
              {#each relatedComponents as rc (rc)}
                <a class="related-chip" href="{base}/components/{rc.toLowerCase()}">{rc}</a>
              {/each}
            </div>
          {/if}
          <p class="guide-link">
            {t('content.guideLink', lang)}
            <a href="{base}/guide/content-guidelines">{t('content.guideLinkText', lang)}</a>。
          </p>
        </section>
      {/if}

      <!-- 设计变量 -->
      {#if hasTokens}
        <section class="section" id="tokens">
          <h2>{t('section.tokens', lang)}<SectionAnchor id="tokens" /></h2>
          <DesignTokenTable component={tokenComponent} />
        </section>
      {/if}
    {:else if ContentComponent}
      <div class="content-body">
        <ContentComponent />
      </div>
    {:else}
      <p class="no-content">{t('usage.empty', lang)}</p>
    {/if}
    {/if}
  </div>

  {#if inlineDoc}
    <Toc sections={inlineTocSections} />
  {:else if activeTab === 'api'}
    <Toc sections={tocSections} />
  {/if}
</div>

<style>
  .page {
    display: flex;
    gap: 48px;
    align-items: flex-start;
  }
  .page-main {
    flex: 1;
    min-width: 0;
    /* 内容保持可读宽度，TOC 由 margin-left:auto 推到主区最右侧（对齐 Semi） */
    max-width: 860px;
  }
  .page > :global(.toc) {
    margin-left: auto;
  }
  .component-header {
    margin-bottom: 32px;
  }
  .breadcrumb {
    font-size: 12px;
    color: var(--cd-color-text-2, #86909c);
    margin-bottom: 8px;
  }
  .breadcrumb a {
    color: inherit;
    text-decoration: none;
  }
  .breadcrumb a:hover {
    color: var(--cd-color-primary, #0064fa);
  }
  h1 {
    font-size: 28px;
    margin: 0 0 8px;
  }
  .description {
    color: var(--cd-color-text-1, #4e5969);
    margin: 0 0 24px;
  }
  .section {
    margin-bottom: 48px;
    scroll-margin-top: 80px;
  }
  /* 场景章节描述：h2 与 DemoBox 之间的说明文字 */
  .section-desc {
    font-size: 14px;
    color: var(--cd-color-text-1, #4e5969);
    margin: 0 0 16px;
    line-height: 1.7;
  }
  .see-also {
    color: var(--cd-color-primary, #0064fa);
    text-decoration: none;
  }
  .see-also:hover {
    text-decoration: underline;
  }
  h2 {
    font-size: 18px;
    margin: 0 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  /* hover 标题时淡入「复制链接」按钮；键盘聚焦时也显示（可达性） */
  h2:hover :global(.section-anchor),
  h2 :global(.section-anchor:focus-visible) {
    opacity: 1;
  }
  .api-group-title {
    font-size: 15px;
    margin: 24px 0 8px;
    color: var(--cd-color-text-0, #1f2329);
    font-weight: 600;
  }
  .api-group-title:first-of-type {
    margin-top: 0;
  }
  .el-tag {
    font-size: 12px;
    font-weight: 400;
    color: var(--cd-color-text-2, #86909c);
    font-family: 'JetBrains Mono', monospace;
    margin-left: 6px;
  }
  .sub-desc {
    font-size: 13px;
    color: var(--cd-color-text-1, #4e5969);
    margin: 0 0 8px;
    line-height: 1.6;
  }
  .sub-api {
    margin-top: 24px;
  }
  .tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    margin-bottom: 24px;
  }
  .tab {
    padding: 8px 20px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 14px;
    color: var(--cd-color-text-1, #4e5969);
    margin-bottom: -1px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .tab.active {
    color: var(--cd-color-primary, #0064fa);
    border-bottom-color: var(--cd-color-primary, #0064fa);
  }
  .tab-link {
    margin-left: auto;
    color: var(--cd-color-text-2, #86909c);
  }
  .tab-link:hover {
    color: var(--cd-color-primary, #0064fa);
  }
  .ext-icon {
    font-size: 12px;
  }
  .content-body :global(h2) {
    font-size: 18px;
    margin: 24px 0 12px;
  }
  .content-body :global(h3) {
    font-size: 15px;
    margin: 16px 0 8px;
  }
  /* —— inline md 标题字号/间距严格对齐 Semi layout.scss（$bf=16px）——
     h2=$h2=27.65px、h3=$h3=23.04px、h4=$h4=19.2px；margin 用 $bf 倍数。
     display:flex 让锚点图标与标题基线居中对齐（对齐 Semi .gatsby-h2/h3）。
     scroll-margin-top 留出顶部固定导航高度，TOC 跳转不被遮。 */
  .inline-doc :global(h2) {
    display: flex;
    align-items: center;
    color: var(--cd-color-text-0, #1f2329);
    font-size: 27.65px;
    font-weight: 600;
    margin: 64px 0 24px;
    scroll-margin-top: 80px;
  }
  .inline-doc :global(h3) {
    display: flex;
    align-items: center;
    color: var(--cd-color-text-0, #1f2329);
    font-size: 23.04px;
    font-weight: 600;
    margin: 32px 0 24px;
    scroll-margin-top: 80px;
  }
  /* 注：Semi 的 h2.md + h3.md 收紧规则依赖其 markdown 每标题包 <section> 的结构，
     相邻选择器极少命中；本库 mdsvex 是扁平兄弟结构，该规则会错误命中（如「代码演示」
     h2 紧邻「声明写法」h3），使间距被收紧成 16px，与 Semi 官网的大间距不符。故不加此规则，
     h3 保持 32px margin-top（对齐 Semi 图中标题间距）。 */
  .inline-doc :global(h4) {
    display: flex;
    align-items: center;
    color: var(--cd-color-text-0, #1f2329);
    font-size: 19.2px;
    font-weight: 600;
    margin: 16px 0;
    scroll-margin-top: 80px;
  }
  /* 标题旁的「复制链接」锚点按钮（DOM 注入 IconLink）：对齐 Semi .anchor-link-button-icon
     （color:link、translateX(10px)、hover/focus 淡入）；点击复制后转绿常显 1.5s。 */
  .inline-doc :global(.header-anchor) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-color-link, #0064fa);
    cursor: pointer;
    transform: translateX(10px);
    opacity: 0;
    transition: opacity 0.15s;
  }
  .inline-doc :global(h2:hover .header-anchor),
  .inline-doc :global(h3:hover .header-anchor),
  .inline-doc :global(h4:hover .header-anchor),
  .inline-doc :global(.header-anchor:focus-visible) {
    opacity: 1;
  }
  .inline-doc :global(.header-anchor.copied) {
    opacity: 1;
    color: var(--cd-color-success, #00b42a);
  }
  .content-body :global(p) {
    line-height: 1.7;
    color: var(--cd-color-text-0, #1f2329);
    margin: 0 0 12px;
  }
  /* inline md 正文段落对齐 Semi：font-size 16px、line-height 1.75；
     说明文字用较浅的 text-2（对齐 Semi 官网正文说明的实际浅灰观感，非纯黑）。 */
  .inline-doc :global(p) {
    font-size: 16px;
    line-height: 1.75;
    color: var(--cd-color-text-2, #86909c);
  }
  .content-body :global(ul),
  .content-body :global(ol) {
    padding-left: 20px;
    margin: 0 0 12px;
  }
  .content-body :global(li) {
    line-height: 1.7;
    margin-bottom: 4px;
  }
  .content-body :global(a) {
    color: var(--cd-color-primary, #0064fa);
    text-decoration: none;
  }
  .content-body :global(a:hover) {
    text-decoration: underline;
  }
  .content-body :global(code) {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    padding: 1px 5px;
    border-radius: 3px;
  }
  .content-body :global(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin: 0 0 16px;
  }
  .content-body :global(th) {
    text-align: left;
    padding: 8px 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    font-weight: 600;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  .content-body :global(td) {
    padding: 8px 12px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    vertical-align: top;
  }
  .content-body :global(strong) {
    font-weight: 600;
    color: var(--cd-color-text-0, #1f2329);
  }
  .no-content {
    color: var(--cd-color-text-2, #86909c);
    font-size: 14px;
    padding: 24px 0;
  }
  /* inline api/config/method 表（与 ApiTable 视觉一致） */
  .api-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .api-table th {
    text-align: left;
    padding: 8px 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    font-weight: 600;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  .api-table td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    vertical-align: top;
  }
  .api-table code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    padding: 1px 4px;
    border-radius: 3px;
  }
  .api-table code.type {
    color: var(--cd-color-primary, #0064fa);
    background: transparent;
  }

  /* Accessibility */
  .a11y-table .a11y-key {
    width: 140px;
    color: var(--cd-color-text-2, #86909c);
    font-weight: 600;
  }
  kbd {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding: 2px 7px;
    margin: 0 4px 4px 0;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-bottom-width: 2px;
    border-radius: 5px;
    background: var(--cd-color-bg-0, #fff);
    color: var(--cd-color-text-0, #1f2329);
  }
  .a11y-notes {
    margin: 16px 0 0;
    padding-left: 20px;
  }
  .a11y-notes li {
    line-height: 1.7;
    color: var(--cd-color-text-1, #4e5969);
    margin-bottom: 6px;
  }
  .apg-ref {
    margin-top: 12px;
    font-size: 13px;
    color: var(--cd-color-text-2, #86909c);
  }
  .apg-ref code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    padding: 1px 5px;
    border-radius: 3px;
  }

  /* 文案规范 */
  .content-sub {
    font-size: 14px;
    margin: 20px 0 8px;
    color: var(--cd-color-text-0, #1f2329);
    font-weight: 600;
  }
  .content-sub:first-child {
    margin-top: 0;
  }
  .content-text {
    line-height: 1.7;
    color: var(--cd-color-text-1, #4e5969);
    margin: 0;
  }
  .related {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .related-chip {
    display: inline-block;
    padding: 4px 12px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 16px;
    font-size: 13px;
    text-decoration: none;
    color: var(--cd-color-text-1, #4e5969);
  }
  .related-chip:hover {
    border-color: var(--cd-color-primary, #0064fa);
    color: var(--cd-color-primary, #0064fa);
  }
  .guide-link {
    margin-top: 20px;
    font-size: 13px;
    color: var(--cd-color-text-2, #86909c);
  }
  .guide-link a {
    color: var(--cd-color-primary, #0064fa);
    text-decoration: none;
  }
</style>
