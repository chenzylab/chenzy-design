<script lang="ts">
  import { UserGuide, Button, Image, Text } from '@chenzy-design/svelte';
  import type { UserGuideStep } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

{#snippet cover1()}
  <Image
    width="600px"
    height="100%"
    preview={false}
    src="https://lf9-static.bytednsdoc.com/obj/eden-cn/nuhpxphk/dsm/dsm_welcome.png"
  />
{/snippet}
{#snippet cover2()}
  <Image
    width="600px"
    height="100%"
    preview={false}
    src="https://lf9-static.bytednsdoc.com/obj/eden-cn/nuhpxphk/dsm/dsm_console.png"
  />
{/snippet}
{#snippet cover3()}
  <Image
    width="600px"
    height="100%"
    preview={false}
    src="https://lf9-static.bytednsdoc.com/obj/eden-cn/nuhpxphk/dsm/dsm_palette.png"
  />
{/snippet}
{#snippet desc1()}
  <div>你可以从已发布的主题出发，或者选择<Text strong>立即创造</Text>来创造一个新的主题</div>
{/snippet}

<Button onclick={() => (visible = true)}>开始引导</Button>

<UserGuide
  mode="modal"
  mask
  {visible}
  steps={[
    { title: '欢迎使用 Semi DSM!', description: desc1, cover: cover1, position: 'bottom' },
    {
      title: '高可用的色盘',
      description: '选取主色后，我们的颜色算法会为你生成一套高可用的色盘',
      cover: cover2,
      position: 'bottom',
    },
    { title: '自由定制', description: '开始定制属于你的设计系统吧！', cover: cover3, position: 'bottom' },
  ]}
  onChange={(c) => console.log('当前引导步骤', c)}
  onNext={() => console.log('下一步引导')}
  onPrev={() => console.log('上一步引导')}
  onFinish={() => (visible = false)}
  onSkip={() => (visible = false)}
/>
