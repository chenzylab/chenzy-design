<script lang="ts">
  // 对齐 Semi「侧边信息栏」完整 demo：4 个 Options 切换不同内容（查看搜索 → Annotation、
  // 文件预览 → FileContent、代码预览 → CodeContent、浏览器 → 图片占位），renderMainContent
  // 按 activeKey 分流渲染；CodeContent/FileContent 的 onExpand 联动切到详情视图（mode 变为
  // 'code'/'file'），SideBar 内置渲染详情（detailContent + fileEditable），onBackWard 返回主视图。
  import {
    SideBarContainer,
    SideBar,
    SideBarAnnotationContent,
    SideBarCodeContent,
    SideBarFileContent,
    Button,
  } from '@chenzy-design/svelte';
  import type {
    SideBarOption,
    SideBarAnnotationGroup,
    CodeItemProps,
    FileItemProps,
    SideBarDetailContent,
    SideBarImageUploadOptions,
  } from '@chenzy-design/svelte';
  import {
    IconSearch,
    IconBriefStroked,
    IconCodeStroked,
    IconModalStroked,
  } from '@chenzy-design/icons';

  const options: SideBarOption[] = [
    { key: 'searchResult', name: '查看搜索', icon: searchIcon },
    { key: 'filePreview', name: '文件预览', icon: filesIcon },
    { key: 'codePreview', name: '代码预览', icon: codeIcon },
    { key: 'network', name: '浏览器', icon: networkIcon },
  ];

  // 三份数据与 05-annotation / 05b-code-list / 07b-file-list 同源（对齐 Semi md：
  // 完整工作流 demo 与这几段独立 demo 共用同一份 defaultInfoList/defaultCodes/defaultFiles）。
  const annotationInfo: SideBarAnnotationGroup[] = [
    {
      header: 'Semi design introduction',
      key: '1',
      annotations: [
        {
          order: 1,
          type: 'video',
          duration: 4432,
          title: 'Semi Design is a design system designed',
          url: 'https://semi.design/',
          logo: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png',
          siteName: 'Semi Design',
          detail:
            ' As a comprehensive, easy-to-use, and high-quality modern enterprise-level application UI solution',
          img: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg',
        },
        {
          order: 2,
          title: 'Quick start',
          type: 'video',
          duration: 56,
          url: 'https://semi.design/',
          detail:
            ' As a comprehensive, easy-to-use, and high-quality modern enterprise-level application UI solution',
          logo: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png',
          siteName: 'Semi Design',
          img: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg',
        },
        {
          order: 3,
          title: 'Use components in a modular way',
          url: 'https://semi.design/',
          detail: `Semi provides esm format dist, and the css of the component is only imported by the corresponding js.
When used in Webpack, Rspack, create-react-app or Vite projects, there is no need to configure any compilation items.`,
          logo: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png',
          siteName: 'Semi Design',
          img: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg',
        },
      ],
    },
    {
      header: 'Design resource',
      key: '2',
      annotations: [
        {
          order: 2,
          title: 'Semi Design resource',
          url: 'https://semi.design/',
          detail:
            'Semi Design provides a wealth of design resources to help designers and developers collaborate efficiently. Whether you are a community user or a ByteDance internal designer, you can find UI Kit resource and Figma plug-ins that suit you here.',
          logo: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png',
          siteName: 'Semi Design resource',
          img: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/abstract.jpg',
        },
      ],
    },
  ];

  const codes: CodeItemProps[] = [
    {
      key: 'code1',
      name: 'Component.js',
      language: 'javascript',
      content: `import React from 'react';
import { AutoComplete } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';

() => {
    const [stringData, setStringData] = useState([]);
    const [value, setValue] = useState('');
    const handleStringSearch = (value) => {
        let result;
        if (value) {
            result = ['gmail.com', '163.com', 'qq.com'].map(domain => value+domain);
        } else {
            result = [];
        }
        setStringData(result);
    };

    const handleChange = (value) => {
        console.log('onChange', value);
        setValue(value);
    };
    return (
        <AutoComplete
            data={stringData}
            value={value}
            showClear
            prefix={<IconSearch />}
            placeholder="搜索... "
            onSearch={handleStringSearch}
            onChange={handleChange}
            style={{ width: 200 }}
        />
    );
};
`,
    },
    {
      key: 'code2',
      name: 'Style.css',
      language: 'css',
      content: `.semi-animation-react-demo-auto {
    button {
        height: 50px;
        border: 0;
        cursor: pointer !important;
        background: #777;
        color: white;
        outline: none;
        -webkit-appearance: none;
    }

    button:hover {
        background: #878787;
    }

    .auto-main {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: auto 1fr;
        background: #575757;
    }

    .content {
        grid-column: span 3;
    }

    .item {
        background: indianred;
        width: 100%;
        overflow: hidden;
        color: white;
    }

    .item p {
        margin: 0;
        padding: 10px;
    }
}
`,
    },
    {
      key: 'code3',
      name: 'Chart.json',
      isJson: true,
      language: 'html',
      content: `{
    "axisX": {
        "title": {
            "visible": false,
            "position": "center"
        },
        "label": {
            "visible": true,
            "style": {
                "fontSize": 12,
                "fontWeight": 400,
                "lineHeight": 16,
                "fontFamily": [
                    "Inter"
                ],
                "fill": "rgba(0, 0, 0, 0.47843137254901963)"
            },
            "space": 12
        },
        "domainLine": {
            "visible": true,
            "style": {
                "lineWidth": 1,
                "stroke": "rgba(0, 0, 0, 0.12156862745098039)",
                "lineDash": []
            }
        },
        "tick": {
            "visible": false,
            "style": {
                "lineWidth": 1,
                "stroke": "rgba(255, 255, 255, 0)"
            }
        },
        "subTick": {
            "visible": false
        },
        "grid": {
            "visible": false
        },
        "subGrid": {
            "visible": false
        }
    }
}`,
    },
  ];

  // 数据照搬 Semi md defaultFiles（3 条：file1 同一段介绍重复 3 次的长文/file2 英文
  // 主题简介/file3 英文框架适配说明），段落结构与重复次数一致，文案替换为本库品牌。
  const introParagraph = `<p>
  chenzy-design 是由 <strong>chenzy</strong> 设计并维护的<em>组件库</em>。作为一个全面、易用、优质的现代前端组件解决方案，chenzy-design 基于 Svelte 5 构建，严格对齐 Semi Design 的设计与交互规范，详情见 https://chenzy.design/。chenzy-design 的特点包括：
</p>
<ul>
  <li>
    设计简洁、现代化。
  </li>
  <li>
    提供主题方案，可深度样式定制。
  </li>
</ul>
<p>
  组件基于原生 DOM API 实现，无第三方 UI 依赖，Svelte 5 编译产物体积小，运行时无虚拟 DOM 开销。
</p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
<p>
  采用 Foundation 和 Adapter 跨框架技术方案，方便扩展。
</p>
<blockquote>
  chenzy-design 是由 chenzy 设计并维护的组件库
  <br />
  — chenzy-design
</blockquote>`;

  const introContent = `
<h2>
  chenzy-design 介绍
</h2>
${introParagraph}
${introParagraph}
${introParagraph}
`;

  const files: FileItemProps[] = [
    {
      key: 'file1',
      name: 'chenzy-design 介绍',
      content: introContent,
    },
    {
      key: 'file2',
      name: 'chenzy-design Theme',
      content: `<h2>
  chenzy-design Theme
</h2>
<p>chenzy-design Theme is a design token management capability provided by chenzy-design. It supports global and component-level style customization and keeps synchronization between design resources and front-end code. Suitable for teams of all sizes. Whether you need to simplify workflow, improve team collaboration, or increase productivity, we have features suitable for you.</p>
`,
    },
    {
      key: 'file3',
      name: 'Svelte 5 Adaptation',
      content: `<h2>
  Svelte 5 Adaptation
</h2>
<p>Svelte 5 introduces runes, a new set of primitives for reactivity, along with numerous compiler and API changes. To ensure chenzy-design is built entirely on the latest reactivity model, all components are authored with Svelte 5 runes from the ground up, and we do not provide a Svelte 4 compatibility package.
Installation & Usage
Install @chenzy-design/svelte and its peer dependency svelte@^5 to get started.</p>
`,
    },
  ];

  let visible = $state(false);
  let mode = $state<'main' | 'code' | 'file'>('main');
  let activeKey = $state('searchResult');
  let activeCodeKey = $state<string[]>(['code1']);
  let activeFileKey = $state<string[]>(['file1']);
  let activeReferKey = $state<string[]>(['1']);
  let currentDetail = $state<SideBarDetailContent | undefined>(undefined);

  function onExpand(_e: MouseEvent, content: CodeItemProps | FileItemProps, expandMode: string) {
    mode = expandMode as 'code' | 'file';
    currentDetail = content as SideBarDetailContent;
  }

  function onBackWard() {
    mode = 'main';
  }

  // 对齐 Semi md 1239-1246 行：<Sidebar imgUploadProps> 由 renderDetail() 消费，
  // mode='file' 详情视图内置渲染 FileItem 时透传（与 renderMainContent 里
  // SideBarFileContent 单独的 imgUploadProps 是不同的消费点）。
  const imgUploadProps: SideBarImageUploadOptions = {
    action: 'https://api.example.com/upload',
    getUploadImageSrc: () =>
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png',
  };
</script>

{#snippet searchIcon()}<IconSearch />{/snippet}
{#snippet filesIcon()}<IconBriefStroked />{/snippet}
{#snippet codeIcon()}<IconCodeStroked />{/snippet}
{#snippet networkIcon()}<IconModalStroked />{/snippet}

<Button onclick={() => (visible = true)}>打开完整工作流</Button>

<SideBarContainer
  {visible}
  showClose={false}
  motion={false}
  title="Agent 的工作空间"
  defaultSize={{ width: '60%' }}
  onCancel={() => (visible = false)}
>
  <SideBar
    {mode}
    {activeKey}
    {options}
    onActiveOptionChange={(_e, key) => (activeKey = key)}
    onBackWard={onBackWard}
    detailContent={currentDetail}
    {imgUploadProps}
    {renderMainContent}
  />
</SideBarContainer>

{#snippet renderMainContent(key: string | undefined)}
  {#if key === 'searchResult'}
    <SideBarAnnotationContent
      info={annotationInfo}
      activeKey={activeReferKey}
      onChange={(keys: string[]) => (activeReferKey = keys)}
    />
  {:else if key === 'filePreview'}
    <SideBarFileContent
      {files}
      activeKey={activeFileKey}
      onChange={(keys) => (activeFileKey = keys)}
      {onExpand}
    />
  {:else if key === 'codePreview'}
    <SideBarCodeContent
      {codes}
      activeKey={activeCodeKey}
      onChange={(keys) => (activeCodeKey = keys)}
      {onExpand}
    />
  {:else if key === 'network'}
    <img
      alt="network"
      src="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/test.jpg"
      style="width: 100%;"
    />
  {/if}
{/snippet}
