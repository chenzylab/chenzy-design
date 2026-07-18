<script lang="ts">
  // 对齐 Semi「添加自定义组件」：通过 components 注册自定义组件，在 Markdown 中渲染自定义元素（支持 JS 事件）。
  // Semi 用 MDX 在正文直接写 <MyButton onClick={...}/>；Svelte 无 jsx-runtime，等价做法是用 rehype 插件
  // 把标记转成自定义标签节点，再由 components 注册的 Svelte 组件渲染（默认组件可从 MarkdownRender.defaultComponents 取用于二次封装）。
  import { MarkdownRender } from '@chenzy-design/svelte';
  import MyButton from './MyButton.svelte';

  // hast 节点用宽松内联类型（demo 无需引 @types/hast）。
  interface HNode {
    type?: string;
    value?: string;
    tagName?: string;
    children?: HNode[];
    properties?: Record<string, unknown>;
  }

  // rehype 插件：把段落里形如 [[MyButton:文本]] 的文本节点替换为 <myButton>文本</myButton> 元素。
  function rehypeMyButton() {
    return (tree: HNode) => {
      const visit = (node: HNode) => {
        if (!node.children) return;
        const next: HNode[] = [];
        for (const child of node.children) {
          if (child.type === 'text' && child.value && /\[\[MyButton:(.+?)\]\]/.test(child.value)) {
            const label = child.value.match(/\[\[MyButton:(.+?)\]\]/)![1];
            next.push({
              type: 'element',
              tagName: 'myButton',
              properties: {},
              children: [{ type: 'text', value: label }],
            });
          } else {
            if (child.children) visit(child);
            next.push(child);
          }
        }
        node.children = next;
      };
      visit(tree);
    };
  }

  const raw = `#### 下面是一个渲染在 Markdown 中的按钮

[[MyButton:MyButton 点我]]

通过 components 注册自定义组件即可在 Markdown 中嵌入带事件的组件。`;
</script>

<MarkdownRender {raw} components={{ myButton: MyButton }} rehypePlugins={[rehypeMyButton]} />
