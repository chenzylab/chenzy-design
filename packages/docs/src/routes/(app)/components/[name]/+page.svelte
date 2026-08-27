<script lang="ts">
  import type { Component } from 'svelte';
  import { tick, mount, untrack } from 'svelte';
  import { IconLink } from '@chenzy-design/icons';
  import { Toast } from '@chenzy-design/svelte';
  import { makeAnchorId } from '$lib/anchor-id';
  import type { PageData } from './$types';
  import { base } from '$app/paths';
  import { replaceState } from '$app/navigation';
  import { loadScrollSection, beginRestore, endRestore } from '$lib/scroll-restore';
  import { browser } from '$app/environment';
  import DesignTokenTable from '$lib/components/DesignTokenTable.svelte';
  import Toc from '$lib/components/Toc.svelte';
  import SectionAnchor from '$lib/components/SectionAnchor.svelte';
  import PrevNextNav from '$lib/components/PrevNextNav.svelte';
  import { locale } from '$lib/locale.svelte';
  import { t, localize } from '$lib/i18n';
  import { resolveTokenPrefix } from '$lib/token-prefix';
  import { nameToDir } from '$lib/component-dir';
  import { pushRecentComponent } from '$lib/search-prefs.svelte';

  const { data }: { data: PageData } = $props();
  const meta = $derived(data.meta);
  const lang = $derived(locale.value);

  // 记录「最近浏览」供搜索面板空态展示（去重置顶，localStorage 持久化）。
  // 仅依赖 meta.name（页面身份）；push 内部读写 recentComponents 用 untrack 隔离，
  // 否则 effect 会因读写同一 state 自触发导致 effect_update_depth_exceeded。
  $effect(() => {
    const name = meta?.name;
    if (browser && name) untrack(() => pushRecentComponent(name));
  });
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
    if (!browser) return;
    lowerName; // 切换组件时重扫
    lang; // 切换语言时 md 换、标题变，重扫 TOC
    hasTokens; // 有无设计变量决定 TOC 末尾是否补 tokens 条目
    // 等 md DOM 就位后扫标题（数据同步，tick 一次即可）
    tick().then(() => {
      if (!contentEl) return;
      const heads = Array.from(contentEl.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
      const sections: { id: string; title: string; level?: number }[] = [];
      let started = false;
      // 仅「代码演示」章节辖区内的 demo h3 进 TOC；其它 h2 章节（API 参考 / 无障碍 /
      // 文案规范…）只收 h2 本身，其内部 h3（Checkbox / CheckboxGroup / Methods / ARIA /
      // 键盘和焦点…）不进——对齐 Semi TOC 与本站 meta 驱动页的 tocSections 规则。
      let inDemos = false;
      for (const h of heads) {
        const title = h.textContent?.trim() ?? '';
        const isH2 = h.tagName === 'H2';
        // 每个带 id 的标题注入「复制链接」锚点按钮（对齐 Semi 标题旁的分享图标 +
        // meta 驱动页的 SectionAnchor）。md 标题是原生元素、无法嵌组件，故 DOM 注入。
        // 传注入前捕获的纯标题文本（此时 h 尚无按钮），供复制逻辑用 encodeURI(title)。
        injectAnchor(h, title);
        // 「代码演示」是分界：之前的总述不进 TOC，标题本身也不显示。
        if (title === '代码演示' || title === 'Demos') {
          started = true;
          inDemos = true;
          continue;
        }
        if (!started) continue;
        // 进入下一个 h2 即离开「代码演示」辖区，此后 h3 不再收录。
        if (isH2) inDemos = false;
        if (!isH2 && !inDemos) continue;
        // 「设计变量」h2 现在也带原生 id="tokens"（供锚点跳转），但它由下方专属
        // 逻辑手动补进 TOC 末尾——此处跳过，避免 key 重复导致 Toc 的 keyed each 报错。
        if (h.id === 'tokens') continue;
        sections.push({ id: h.id, title, level: 1 });
      }
      // 设计变量 section 由页面在 md 之后补渲染（不在 md 标题里），故手动补进 TOC 末尾。
      if (hasTokens) sections.push({ id: 'tokens', title: t('section.tokens', lang), level: 1 });
      inlineTocSections = sections;
    });
  });

  // 按文档站语言选中/英 md（对齐 Semi 双 md）；英文缺失时回退中文。
  const ContentComponent = $derived<Component | null>(
    lang === 'en' ? (data.ContentEn ?? data.Content ?? null) : (data.Content ?? null),
  );

  const lowerName = $derived(meta.name.toLowerCase());
  // token 归属前缀：用数据集真实存在的前缀匹配，避免命名漂移（见 token-prefix.ts）
  const tokenComponent = $derived(resolveTokenPrefix(lowerName, nameToDir[lowerName]));

  // 「设计文档」外链：对齐 Semi 的 /design 子站习惯，新窗口打开
  const designUrl = $derived(`${base}/design/components/${lowerName}`);

  // 设计变量章节由页面在 md 之后统一补渲染，需知道该组件是否有 token。
  const hasTokens = $derived(tokenComponent.length > 0);

  interface TocItem {
    id: string;
    title: string;
    level?: number;
  }


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
    // 复制的 hash 是原始标题文本（对齐 Semi），需 makeAnchorId 转回元素 id 定位。
    const hashId = rawHash ? makeAnchorId(rawHash) : '';
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
    <div class="component-header">
      <div class="breadcrumb">
        <a href="{base}/components">{t('search.components', lang)}</a>
        <span> / </span>
        <span>{t(`cat.${meta.category}`, lang)}</span>
      </div>
      <h1>{meta.name}</h1>
      <!-- 头部用 md brief（简洁，对齐 Semi 头部简介），缺省回退 meta.description。 -->
      <p class="description">{data.brief || meta.description}</p>
      <!-- 「设计文档」外链。原挂在双 tab 栏里，收尾清理删 tab 路径后移到头部：
           它同时是 /design/components/[name] 的站内入口，删掉会让该页对用户不可达。 -->
      <a class="design-link" href={designUrl} target="_blank" rel="noreferrer">
        {t('design.openInNew', lang)}
      </a>
    </div>

    <!-- 整页由 md 内联驱动：单页纵向流，无 tab（复刻 Semi）。
         md 顶部 import DemoBox/Notice/各 demo，正文按 Semi 章节顺序内联书写。 -->
    <div class="content-body inline-doc prose" bind:this={contentEl}>
      {#if ContentComponent}
        <ContentComponent />
      {/if}
      <!-- 设计变量：md 是静态内容，无法内联组件表格，故由页面在 md 之后统一补渲染
           （数据驱动，对齐 Semi 组件页末尾的「设计变量」章节 <DesignToken/>）。 -->
      {#if hasTokens}
        <section class="section" id="tokens">
          <h2 id="tokens">{t('section.tokens', lang)}<SectionAnchor id="tokens" /></h2>
          <DesignTokenTable component={tokenComponent} />
        </section>
      {/if}
    </div>

    <!-- 页脚「上一个 / 下一个」组件导航（对齐 Semi PrevAndNext），置于主内容区底部。 -->
    <PrevNextNav name={lowerName} />
  </div>

  <Toc sections={inlineTocSections} />
</div>

<style>
  .page {
    display: flex;
    /* 内容↔TOC 间距对齐 Semi（1512px 视口实测 ~52px）。 */
    gap: 52px;
    align-items: flex-start;
  }
  .page-main {
    flex: 1;
    min-width: 0;
    /* 内容区可读宽度对齐 Semi（.content 约占 80%，1512px 视口实测 ~980px）。 */
    max-width: 980px;
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
    margin: 0 0 12px;
  }
  /* 「设计文档」外链（原双 tab 栏里的 .tab-link，收尾清理后移到头部简介下方）。 */
  .design-link {
    display: inline-block;
    margin: 0 0 24px;
    font-size: 13px;
    color: var(--cd-color-text-2, #86909c);
    text-decoration: none;
  }
  .design-link:hover {
    color: var(--cd-color-primary, #0064fa);
  }
  .section {
    margin-bottom: 48px;
    scroll-margin-top: 80px;
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
  /* preset-typography 的 prose 默认给容器加 max-width:65ch（Tailwind Typography 惯例，
     约 655px），会把正文压窄。本站正文跟随内容区全宽，故重置。特异性 (0,1,0) 覆盖
     preset 的 :where(.prose)(0,0,0)。 */
  .content-body {
    max-inline-size: none;
  }
  /* 正文标题/段落/列表/链接/代码/表格排版由 UnoCSS presetTypography 的 prose 默认接管
     （不再手写 :global 规则）；仅在 vite.config cssExtend 去掉 code 反引号这一默认缺陷。 */
  /* demo 预览区内「裸」原生标题（无 class，即 demo 里手写 <h2> 包裹用，如 Highlight demo）
     不吃正文章节标题样式（27.65px flex 等），改为对齐 Semi 全局 heading 排版
     （Semi demo <h2> 实测 21px/700/lh20）。
     关键：用 :not([class]) 只命中裸标签，绝不碰组件渲染的带 class 标题
     （如 Typography Title 的 .cd-typography-h1，其字号由组件自身 token 决定，不可覆盖）。
     display:block 消除正文标题注入的 flex 布局。 */
  .inline-doc :global(.demo-box__preview :is(h1, h2, h3, h4, h5, h6):not([class])) {
    display: block;
    color: var(--cd-color-text-0, #1f2329);
    line-height: 1.5;
    margin: 0.4em 0;
    font-weight: 700;
  }
  .inline-doc :global(.demo-box__preview h1:not([class])) { font-size: 28px; }
  .inline-doc :global(.demo-box__preview h2:not([class])) { font-size: 21px; line-height: 20px; }
  .inline-doc :global(.demo-box__preview h3:not([class])) { font-size: 18px; }
  .inline-doc :global(.demo-box__preview h4:not([class])) { font-size: 16px; }
  .inline-doc :global(.demo-box__preview h5:not([class])) { font-size: 14px; }
  .inline-doc :global(.demo-box__preview h6:not([class])) { font-size: 12px; }
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
  /* 正文段落/列表/链接/行内代码/强调/表格已迁至 UnoCSS presetTypography 的 cssExtend
     （prose 作用域收敛 + demo not-prose 隔离，取代此前手写 :global + :not([class])）。 */


</style>
