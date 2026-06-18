<script lang="ts">
  import {
    Button,
    Icon,
    Divider,
    Space,
    Title,
    Text,
    Paragraph,
    Link,
  } from '@chenzy-design/svelte';

  let theme = $state<'light' | 'dark'>('light');
  $effect(() => {
    document.documentElement.dataset.theme = theme;
  });
</script>

<main class="p-6">
  <header class="flex items-center justify-between mb-6">
    <Title heading={3}>chenzy-design · M1 Basic</Title>
    <Button
      type="tertiary"
      onclick={() => (theme = theme === 'light' ? 'dark' : 'light')}
    >
      切换主题：{theme}
    </Button>
  </header>

  <Title heading={5}>Button</Title>
  <Space wrap>
    <Button type="primary">主要按钮</Button>
    <Button type="secondary">次要</Button>
    <Button type="tertiary">文字</Button>
    <Button type="warning">警告</Button>
    <Button type="danger">危险</Button>
    <Button type="primary" disabled>禁用</Button>
    <Button type="primary" loading>加载中</Button>
  </Space>

  <Divider />

  <Title heading={5}>Icon</Title>
  <Space>
    <Icon size="small">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
      </svg>
    </Icon>
    <Icon status="success">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </Icon>
    <Icon status="error" size="large">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
      </svg>
    </Icon>
    <Icon spin label="加载中">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 3a9 9 0 1 0 9 9" stroke-linecap="round" />
      </svg>
    </Icon>
  </Space>

  <Divider>分割线带文字</Divider>

  <Title heading={5}>Typography</Title>
  <Paragraph>
    这是一段正文 <Text type="secondary">次要文字</Text>、
    <Text mark>高亮</Text>、<Text code>code</Text>、
    <Text delete>删除线</Text>、<Text strong>加粗</Text>，以及
    <Link href="https://semi.design" target="_blank">一个链接</Link>。
  </Paragraph>

  <Divider dashed />

  <Title heading={5}>Space（vertical）</Title>
  <Space direction="vertical" align="start">
    <Text>第一行</Text>
    <Text type="tertiary">第二行</Text>
    <Button type="primary" size="small">一个按钮</Button>
  </Space>
</main>
