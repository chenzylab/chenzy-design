<script lang="ts">
  import { SideBarAnnotation, Button } from '@chenzy-design/svelte';
  import type { SideBarAnnotationGroup } from '@chenzy-design/svelte';

  let visible = $state(false);
  // 数据照搬 Semi md defaultInfoList（1 组 3 条 video + 1 组 1 条无 type 文本卡）；
  // Semi activeKey 初始为单值字符串 '1'，本库底层复用 Collapse 数组机制，
  // 用等价的初始展开集合表达（onChange 回调固定收 string[]）。
  let activeKey = $state<string[]>(['1']);

  const info: SideBarAnnotationGroup[] = [
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
</script>

<Button onclick={() => (visible = !visible)}>{visible ? '关闭' : '展示'}参考来源</Button>

<SideBarAnnotation
  defaultSize={{ width: 420 }}
  {visible}
  {info}
  {activeKey}
  onCancel={() => (visible = !visible)}
  onChange={(keys) => (activeKey = keys)}
  onClick={(_e, item) => console.log('onClick', item)}
/>
