<script lang="ts">
  import { Text, Title, Paragraph } from '@chenzy-design/svelte';

  // 1. 基础可编辑文本
  let basic = $state('这是一段可编辑的文本，点击右侧图标进入编辑态。');

  // 2. 长文本可编辑
  let long = $state(
    '这是一段较长的可编辑文本，用于验证编辑框能够自动换行并贴合容器宽度。' +
      '进入编辑态后，textarea 会随内容高度自适应增长，多行文本也能舒适编辑。',
  );

  // 3. 自定义编辑图标 + 自定义 tooltip
  let customIcon = $state('自定义铅笔图标与提示文案，鼠标悬浮图标看看 tooltip。');

  // 4. 触发方式切换
  let triggerText = $state('切换上方触发方式，再尝试进入编辑态。');
  let trigger = $state<'icon' | 'text' | 'both'>('icon');

  // 5. 编辑框自定义 enter 图标
  let customEnter = $state('编辑框右下角是自定义的回车确认图标。');

  // 6. 编辑框无 enter 图标
  let noEnter = $state('这个编辑框隐藏了回车确认图标。');

  // 7. 隐藏编辑 tooltip
  let noTooltip = $state('铅笔图标没有 tooltip 提示。');

  // 8. 限长文本 maxLength
  let limited = $state('最多 20 个字符。');

  // 9. 标题可编辑 h1~h5（各自独立 value）
  let titles = $state<Record<1 | 2 | 3 | 4 | 5, string>>({
    1: 'h1. chenzy design',
    2: 'h2. chenzy design',
    3: 'h3. chenzy design',
    4: 'h4. chenzy design',
    5: 'h5. chenzy design',
  });
  const headings = [1, 2, 3, 4, 5] as const;

  // 10. 禁用态可编辑
  let disabledText = $state('禁用态下铅笔不可点击。');
</script>

<div style="display: flex; flex-direction: column; gap: 24px; max-width: 560px;">
  <!-- 1. 基础 -->
  <section>
    <Paragraph type="secondary" size="small">基础可编辑（默认 icon 触发）</Paragraph>
    <Text editable value={basic} onChange={(v) => (basic = v)}>{basic}</Text>
  </section>

  <!-- 2. 长文本 -->
  <section>
    <Paragraph type="secondary" size="small">长文本可编辑（编辑框自动换行、贴合宽度）</Paragraph>
    <Paragraph editable value={long} onChange={(v) => (long = v)}>{long}</Paragraph>
  </section>

  <!-- 3. 自定义编辑图标 + tooltip -->
  <section>
    <Paragraph type="secondary" size="small">自定义编辑图标 + 自定义 tooltip（悬浮铅笔看提示）</Paragraph>
    <Text
      editable={{ editIcon: penIcon, tooltip: '点我改' }}
      value={customIcon}
      onChange={(v) => (customIcon = v)}
    >
      {customIcon}
    </Text>
  </section>

  <!-- 4. 触发方式切换 -->
  <section>
    <Paragraph type="secondary" size="small">触发方式切换</Paragraph>
    <div style="display: flex; gap: 16px; margin-bottom: 8px;">
      <label style="display: inline-flex; align-items: center; gap: 4px;">
        <input type="radio" bind:group={trigger} value="icon" />
        icon（仅点铅笔）
      </label>
      <label style="display: inline-flex; align-items: center; gap: 4px;">
        <input type="radio" bind:group={trigger} value="text" />
        text（点文本）
      </label>
      <label style="display: inline-flex; align-items: center; gap: 4px;">
        <input type="radio" bind:group={trigger} value="both" />
        both（文本 + 铅笔）
      </label>
    </div>
    <Text editable={{ trigger }} value={triggerText} onChange={(v) => (triggerText = v)}>
      {triggerText}
    </Text>
  </section>

  <!-- 5. 自定义 enter 图标 -->
  <section>
    <Paragraph type="secondary" size="small">编辑框自定义 enter 图标（进入编辑态查看右下角）</Paragraph>
    <Text
      editable={{ enterIcon: sendIcon }}
      value={customEnter}
      onChange={(v) => (customEnter = v)}
    >
      {customEnter}
    </Text>
  </section>

  <!-- 6. 无 enter 图标 -->
  <section>
    <Paragraph type="secondary" size="small">编辑框无 enter 图标</Paragraph>
    <Text editable={{ enterIcon: false }} value={noEnter} onChange={(v) => (noEnter = v)}>
      {noEnter}
    </Text>
  </section>

  <!-- 7. 隐藏编辑 tooltip -->
  <section>
    <Paragraph type="secondary" size="small">隐藏编辑图标 tooltip</Paragraph>
    <Text editable={{ tooltip: false }} value={noTooltip} onChange={(v) => (noTooltip = v)}>
      {noTooltip}
    </Text>
  </section>

  <!-- 8. maxLength -->
  <section>
    <Paragraph type="secondary" size="small">限长文本（maxLength=20，超过 20 字后打不进去）</Paragraph>
    <Text editable={{ maxLength: 20 }} value={limited} onChange={(v) => (limited = v)}>
      {limited}
    </Text>
  </section>

  <!-- 9. 标题可编辑 h1~h5 -->
  <section>
    <Paragraph type="secondary" size="small">标题可编辑（h1~h5，编辑框继承对应标题字号）</Paragraph>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      {#each headings as h (h)}
        <Title
          heading={h}
          editable
          value={titles[h]}
          onChange={(v) => (titles[h] = v)}
        >
          {titles[h]}
        </Title>
      {/each}
    </div>
  </section>

  <!-- 10. 禁用态可编辑 -->
  <section>
    <Paragraph type="secondary" size="small">禁用态可编辑（铅笔不可点）</Paragraph>
    <Text editable disabled value={disabledText} onChange={(v) => (disabledText = v)}>
      {disabledText}
    </Text>
  </section>
</div>

{#snippet penIcon()}
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
{/snippet}

{#snippet sendIcon()}
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
{/snippet}
