<!--
  table — MarkdownRender 默认 table 覆盖（严格对齐 Semi markdownRender/components/table.tsx）。
  Semi 把 thead/tbody 解析成 Semi Table 的 columns/dataSource。这里从 hast table 节点
  （table > thead > tr > th / tbody > tr > td）解析等价结构，渲染本库 Table。
  找不到 thead/tbody 时 fallback 到子元素序号 0/1（对齐 Semi elementChildren.find(...) ?? elementChildren[i]）。
-->
<script lang="ts">
  import type { Element, ElementContent } from 'hast';
  import Table from '../../table/Table.svelte';

  interface Props {
    node?: Element;
    [key: string]: unknown;
  }

  let { node }: Props = $props();

  function isEl(c: ElementContent, tag?: string): c is Element {
    return c.type === 'element' && (!tag || c.tagName === tag);
  }
  function elementChildren(el: Element | undefined): Element[] {
    if (!el?.children) return [];
    return el.children.filter((c): c is Element => isEl(c));
  }
  function text(el: ElementContent): string {
    if (el.type === 'text') return el.value;
    if (el.type === 'element' && el.children) return el.children.map(text).join('');
    return '';
  }

  // 找不到 thead/tbody 时按位置 fallback（对齐 Semi ?? elementChildren[0]/[1]）。
  const rootChildren = $derived(elementChildren(node));
  const thead = $derived(rootChildren.find((c) => c.tagName === 'thead') ?? rootChildren[0]);
  const tbody = $derived(rootChildren.find((c) => c.tagName === 'tbody') ?? rootChildren[1]);

  // 表头：thead > tr > th → columns（dataIndex 用列序号，对齐 Semi）。
  const columns = $derived.by(() => {
    const headTr = elementChildren(thead)[0];
    const ths = elementChildren(headTr);
    return ths.map((th, i) => ({ dataIndex: String(i), title: text(th) }));
  });

  // 数据行：tbody > tr → dataSource（每行 td 按列序号存）。
  const dataSource = $derived.by(() => {
    const rows = elementChildren(tbody);
    return rows.map((tr, ri) => {
      const item: Record<string, string> = { key: String(ri) };
      elementChildren(tr).forEach((td, ci) => {
        item[String(ci)] = text(td);
      });
      return item;
    });
  });
</script>

<Table {columns} {dataSource} />
