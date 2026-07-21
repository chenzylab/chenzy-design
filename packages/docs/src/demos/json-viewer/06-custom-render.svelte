<script lang="ts" module>
  import { mount, createRawSnippet } from 'svelte';
</script>

<script lang="ts">
  // 对齐 Semi「自定义渲染规则」：options.customRenderRule 在只读模式下匹配 key/value，
  // 命中 token 用自定义内容渲染。
  // 技术差异：Semi render 返回 ReactNode；本库 core 契约 render 返回 HTMLElement，
  // 故用 Svelte 命令式 mount() 把真实组件（Popover/Rating/Tag/Image）挂到返回的 DOM 上，
  // 视觉与交互与 Semi 等效（不降级为纯文本）。
  import { JsonViewer, Popover, Rating, Tag, Image } from '@chenzy-design/svelte';

  const data = `{
  "name": "Semi",
  "version": "2.7.4",
  "rating": 5,
  "tags": ["design", "svelte", "ui"],
  "image": "https://picsum.photos/id/24/200/200"
}`;

  // 把纯文本包成 snippet（Popover / Tag 的 children 需要 Snippet）。
  function textSnippet(text: string) {
    return createRawSnippet(() => ({
      render: () => `<span>${text.replace(/</g, '&lt;')}</span>`,
    }));
  }

  const customRenderRule = [
    {
      // 精确匹配字符串值 Semi → Popover（hover 展示自定义内容），对齐 Semi。
      match: 'Semi',
      render: (content: string) => {
        const host = document.createElement('span');
        mount(Popover, {
          target: host,
          props: {
            showArrow: true,
            trigger: 'hover',
            content: '我是用户自定义的渲染',
            children: textSnippet(content),
          },
        });
        return host;
      },
    },
    {
      // 函数匹配：值等于 5 → Rating 星级组件，对齐 Semi。
      match: (value: string | number | boolean | null) => value === 5,
      render: (content: string) => {
        const host = document.createElement('span');
        mount(Rating, {
          target: host,
          props: { defaultValue: Number(content) || 5, size: 10, disabled: true },
        });
        return host;
      },
    },
    {
      // path 匹配 tags 数组项 → Tag 组件（small / circle），对齐 Semi。
      match: (_value: string | number | boolean | null, path: string) =>
        path === 'root.tags[0]' || path === 'root.tags[1]' || path === 'root.tags[2]',
      render: (content: string) => {
        const host = document.createElement('span');
        mount(Tag, {
          target: host,
          props: {
            size: 'small',
            shape: 'circle',
            children: textSnippet(content.replace(/^"|"$/g, '')),
          },
        });
        return host;
      },
    },
    {
      // 正则匹配 http 开头 → Popover 内嵌 Image 缩略图，对齐 Semi。
      // content 用模板定义的 imageContent snippet（真 snippet 可渲染 Image 组件），
      // 每次调用绑定当前 url。
      match: new RegExp('^http'),
      render: (content: string) => {
        currentImageUrl = content.replace(/^"|"$/g, '');
        const host = document.createElement('span');
        mount(Popover, {
          target: host,
          props: {
            showArrow: true,
            trigger: 'hover',
            content: imageContent,
            children: textSnippet(content),
          },
        });
        return host;
      },
    },
  ];

  // 供 image 规则的 Popover content 使用（当前演示仅一个图片 url，直接用模块级变量绑定）。
  let currentImageUrl = $state('');
</script>

{#snippet imageContent()}
  <Image width={100} height={100} src={currentImageUrl} />
{/snippet}

<div style="margin-bottom: 16px; margin-top: 16px;">
  <JsonViewer
    height={200}
    width={600}
    value={data}
    showSearch={false}
    options={{
      formatOptions: { tabSize: 4, insertSpaces: true, eol: '\n' },
      customRenderRule,
      readOnly: true,
      autoWrap: true,
    }}
  />
</div>
