<script lang="ts">
  import { Tabs, TabPane, RadioGroup, Radio } from '@chenzy-design/svelte';
  import { IconFile, IconGlobe, IconHelpCircle } from '@chenzy-design/icons';

  let type = $state<'line' | 'card' | 'button'>('line');
  let active = $state<string | number>('1');
</script>

{#snippet iconFile()}<IconFile />{/snippet}
{#snippet iconGlobe()}<IconGlobe />{/snippet}
{#snippet iconHelp()}<IconHelpCircle />{/snippet}

<RadioGroup
  value={type}
  onChange={(e) => (type = e.target.value as 'line' | 'card' | 'button')}
  type="button"
  style="display:flex; width:200px; justify-content:center; margin-bottom:16px"
>
  <Radio value="line">Line</Radio>
  <Radio value="card">Card</Radio>
  <Radio value="button">Button</Radio>
</RadioGroup>

<!-- tabPosition=left：竖向标签栏，支持 line / card / button 三型（对齐 Semi）。 -->
<Tabs {type} tabPosition="left" activeKey={active} onChange={(k) => (active = k)}>
  <TabPane tab="文档" itemKey="1" icon={iconFile}>
    <div style="padding: 0 24px;">
      <h3>文档</h3>
      <p style="line-height: 1.8;">
        chenzy-design 是一套对齐 Semi Design 的 Svelte 组件库，包含设计语言以及一整套可复用的前端组件，
        帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的 Web 应用。
      </p>
      <p style="line-height: 1.8;">区别于其他的组件库而言，chenzy-design 以内容优先、用户中心、设计人性化为设计理念，具有以下优势：</p>
    </div>
  </TabPane>
  <TabPane tab="快速起步" itemKey="2" icon={iconGlobe}>
    <div style="padding: 0 24px;">
      <h3>快速起步</h3>
      <pre style="margin: 24px 0; padding: 20px; border: none; white-space: normal; border-radius: 6px; color: var(--cd-color-text-1); background-color: var(--cd-color-fill-0);"><code>pnpm add @chenzy-design/svelte</code></pre>
    </div>
  </TabPane>
  <TabPane tab="帮助" itemKey="3" icon={iconHelp}>
    <div style="padding: 0 24px;">
      <h3>帮助</h3>
      <p style="line-height: 1.8; color: var(--cd-color-text-0); font-weight: 600;">
        Q：有新组件需求、或者现有组件 feature 不能满足业务需求？
      </p>
      <p style="line-height: 1.8; color: var(--cd-color-text-1);">
        右上角问题反馈，提交 issue，label 选择 Feature Request / New Component Request，我们会高优处理这些需求。
      </p>
      <p style="line-height: 1.8; color: var(--cd-color-text-0); font-weight: 600;">Q：对组件的使用有疑惑？</p>
      <p style="line-height: 1.8; color: var(--cd-color-text-1);">欢迎在仓库提 issue 咨询提问。</p>
    </div>
  </TabPane>
</Tabs>
