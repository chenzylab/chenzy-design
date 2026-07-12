<script lang="ts">
  import { Carousel, Typography, Space } from '@chenzy-design/svelte';

  const { Title, Paragraph } = Typography;
</script>

<!-- 幻灯片内文字用 Typography 排版；wrapper 覆盖 --cd-typography-color 为深色（对齐 Semi #1C1F23）。 -->
{#snippet slide0()}
  <div style="width:100%;height:100%;background:var(--cd-color-primary);padding:40px;box-sizing:border-box;--cd-typography-color:#1c1f23">
    <Space vertical align="start">
      <Title heading={3}>Semi 设计管理系统</Title>
      <Paragraph>从 Semi Design，到 Any Design</Paragraph>
      <Paragraph>快速定制你的设计系统，并应用在设计稿和代码中</Paragraph>
    </Space>
  </div>
{/snippet}
{#snippet slide1()}
  <div style="width:100%;height:100%;background:var(--cd-color-success);padding:40px;box-sizing:border-box;--cd-typography-color:#1c1f23">
    <Space vertical align="start">
      <Title heading={3}>Semi 物料市场</Title>
      <Paragraph>面向业务场景的定制化组件，支持线上预览和调试</Paragraph>
      <Paragraph>内容由 Semi Design 用户共建</Paragraph>
    </Space>
  </div>
{/snippet}
{#snippet slide2()}
  <div style="width:100%;height:100%;background:var(--cd-color-warning);padding:40px;box-sizing:border-box;--cd-typography-color:#1c1f23">
    <Space vertical align="start">
      <Title heading={3}>Semi Template</Title>
      <Paragraph>高效的 Design2Code 设计稿转代码</Paragraph>
      <Paragraph>海量 Figma 设计模板一键转为真实前端代码</Paragraph>
    </Space>
  </div>
{/snippet}

<Carousel slides={[slide0, slide1, slide2]} theme="dark" style="width:100%;height:400px" />
