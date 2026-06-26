<script lang="ts">
  import { Anchor, Text } from '@chenzy-design/svelte';

  let anchorKey = $state('#sec-1');
  const anchorLinks = [
    { key: '#sec-1', href: '#sec-1', title: '第一节' },
    { key: '#sec-2', href: '#sec-2', title: '第二节' },
    { key: '#sec-3', href: '#sec-3', title: '第三节' },
  ];

  let anchorContainerEl = $state<HTMLElement | null>(null);
  let anchorContainerKey = $state('#cbox-1');
  const anchorContainerLinks = [
    { key: '#cbox-1', href: '#cbox-1', title: '容器节 1' },
    { key: '#cbox-2', href: '#cbox-2', title: '容器节 2' },
    { key: '#cbox-3', href: '#cbox-3', title: '容器节 3' },
  ];

  let anchorHKey = $state('#hsec-1');
  const anchorHLinks = [
    { key: '#hsec-1', href: '#hsec-1', title: '概述' },
    { key: '#hsec-2', href: '#hsec-2', title: '安装' },
    { key: '#hsec-3', href: '#hsec-3', title: '用法' },
  ];

  let anchorNestEl = $state<HTMLElement | null>(null);
  let anchorNestKey = $state('#nest-1');
  const anchorNestLinks = [
    {
      key: '#nest-1',
      href: '#nest-1',
      title: '开始',
      children: [
        { key: '#nest-1-1', href: '#nest-1-1', title: '安装' },
        { key: '#nest-1-2', href: '#nest-1-2', title: '快速上手' },
      ],
    },
    {
      key: '#nest-2',
      href: '#nest-2',
      title: '组件',
      children: [
        {
          key: '#nest-2-1',
          href: '#nest-2-1',
          title: '导航',
          children: [
            { key: '#nest-2-1-1', href: '#nest-2-1-1', title: 'Anchor' },
            { key: '#nest-2-1-2', href: '#nest-2-1-2', title: 'Menu' },
          ],
        },
        { key: '#nest-2-2', href: '#nest-2-2', title: '反馈' },
      ],
    },
    { key: '#nest-3', href: '#nest-3', title: '主题' },
  ];
</script>

<div style="display:flex; flex-direction:column; gap:24px">
  <div data-testid="anchor-demo">
    <Text type="tertiary">基础锚点（affix 固钉 + updateHash）</Text>
    <div style="width:160px">
      <Anchor links={anchorLinks} value={anchorKey} affix updateHash onChange={(k) => (anchorKey = k)} />
    </div>
    <Text type="tertiary">锚点：{anchorKey}</Text>
  </div>

  <div data-testid="anchor-container">
    <Text type="tertiary">getContainer 自定义滚动容器（锚点定位/激活随容器滚动）</Text>
    <div style="display:flex; gap:16px; margin-top:8px">
      <div style="width:120px">
        <Anchor
          links={anchorContainerLinks}
          value={anchorContainerKey}
          getContainer={() => anchorContainerEl}
          onChange={(k) => (anchorContainerKey = k)}
        />
      </div>
      <div
        bind:this={anchorContainerEl}
        data-testid="anchor-container-scroll"
        style="height:160px; overflow:auto; flex:1; border:1px solid var(--cd-color-border); padding:8px"
      >
        <div id="cbox-1" style="height:140px">容器节 1 内容</div>
        <div id="cbox-2" style="height:140px">容器节 2 内容</div>
        <div id="cbox-3" style="height:140px">容器节 3 内容</div>
      </div>
    </div>
    <Text type="tertiary">容器锚点：{anchorContainerKey}</Text>
  </div>

  <div data-testid="anchor-horizontal">
    <Text type="tertiary">horizontal 水平模式（链接横排 + 底部 ink）</Text>
    <Anchor
      horizontal
      links={anchorHLinks}
      value={anchorHKey}
      onChange={(k) => (anchorHKey = k)}
    />
    <Text type="tertiary">水平锚点：{anchorHKey}</Text>
  </div>

  <div data-testid="anchor-nested">
    <Text type="tertiary">多级嵌套链接树（children 逐级缩进，父子皆跳转/高亮）</Text>
    <div style="display:flex; gap:16px; margin-top:8px">
      <div style="width:160px">
        <Anchor
          links={anchorNestLinks}
          value={anchorNestKey}
          getContainer={() => anchorNestEl}
          onChange={(k) => (anchorNestKey = k)}
        />
      </div>
      <div
        bind:this={anchorNestEl}
        data-testid="anchor-nested-scroll"
        style="height:180px; overflow:auto; flex:1; border:1px solid var(--cd-color-border); padding:8px"
      >
        <div id="nest-1" style="height:120px">开始</div>
        <div id="nest-1-1" style="height:120px">安装</div>
        <div id="nest-1-2" style="height:120px">快速上手</div>
        <div id="nest-2" style="height:120px">组件</div>
        <div id="nest-2-1" style="height:120px">导航</div>
        <div id="nest-2-1-1" style="height:120px">Anchor</div>
        <div id="nest-2-1-2" style="height:120px">Menu</div>
        <div id="nest-2-2" style="height:120px">反馈</div>
        <div id="nest-3" style="height:120px">主题</div>
      </div>
    </div>
    <Text type="tertiary">嵌套锚点：{anchorNestKey}</Text>
  </div>
</div>
