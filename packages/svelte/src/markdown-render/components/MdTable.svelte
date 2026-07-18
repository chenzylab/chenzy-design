<!--
  MdTable — MarkdownRender 默认 table 覆盖（严格对齐 Semi markdownRender components/table.tsx）。
  Semi 把 thead/tbody 解析成 Semi Table 的 columns/dataSource。这里从 hast table 节点
  （table > thead > tr > th / tbody > tr > td）解析等价结构，渲染本库 Table。
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
  function childEls(el: Element | undefined, tag?: string): Element[] {
    if (!el?.children) return [];
    return el.children.filter((c): c is Element => isEl(c, tag));
  }
  function text(el: ElementContent): string {
    if (el.type === 'text') return el.value;
    if (el.type === 'element' && el.children) return el.children.map(text).join('');
    return '';
  }

  const thead = $derived(childEls(node, 'thead')[0]);
  const tbody = $derived(childEls(node, 'tbody')[0]);

  // 表头：thead > tr > th → columns（dataIndex 用列序号，对齐 Semi）。
  const columns = $derived.by(() => {
    const headTr = childEls(thead, 'tr')[0];
    const ths = childEls(headTr).filter((c) => c.tagName === 'th' || c.tagName === 'td');
    return ths.map((th, i) => ({ dataIndex: String(i), title: text(th) }));
  });

  // 数据行：tbody > tr → dataSource（每行 td 按列序号存）。
  const dataSource = $derived.by(() => {
    const rows = childEls(tbody, 'tr');
    return rows.map((tr, ri) => {
      const item: Record<string, string> = { key: String(ri) };
      childEls(tr).forEach((td, ci) => {
        item[String(ci)] = text(td);
      });
      return item;
    });
  });
</script>

<Table {columns} {dataSource} />
