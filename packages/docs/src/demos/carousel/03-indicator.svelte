<script lang="ts">
  import { Carousel, RadioGroup, Radio, Space, Typography } from '@chenzy-design/svelte';
  import { imgList, semiLogo, textList } from './_data.js';

  const { Title, Paragraph } = Typography;
  let size = $state<'small' | 'medium'>('small');
  let type = $state<'dot' | 'line' | 'columnar'>('dot');
  let position = $state<'left' | 'center' | 'right'>('left');

  const titleStyle = 'position:absolute;top:100px;left:100px;';
  const colorStyle = 'color:#1C1F23;';
</script>

<div>
  <Carousel
    style="width:100%;height:400px"
    theme="dark"
    autoPlay={false}
    indicatorType={type}
    indicatorPosition={position}
    indicatorSize={size}
    slides={[slide0, slide1, slide2]}
  />
  <br />
  <Space vertical align="start">
    <Space>
      <div>类型</div>
      <RadioGroup value={type} onChange={(e) => (type = e.target.value as typeof type)} type="button">
        <Radio value="dot">dot</Radio>
        <Radio value="line">line</Radio>
        <Radio value="columnar">columnar</Radio>
      </RadioGroup>
    </Space>
    <Space>
      <div>位置</div>
      <RadioGroup value={position} onChange={(e) => (position = e.target.value as typeof position)} type="button">
        <Radio value="left">left</Radio>
        <Radio value="center">center</Radio>
        <Radio value="right">right</Radio>
      </RadioGroup>
    </Space>
    <Space>
      <div>尺寸</div>
      <RadioGroup value={size} onChange={(e) => (size = e.target.value as typeof size)} type="button">
        <Radio value="small">small</Radio>
        <Radio value="medium">medium</Radio>
      </RadioGroup>
    </Space>
  </Space>
</div>

{#snippet slide(index: number)}
  <div style="width:100%;height:100%;background-size:cover;background-image:url('{imgList[index]}')">
    <Space vertical align="start" spacing="medium" style={titleStyle}>
      <img src={semiLogo} alt="semi_logo" style="width:87px;height:31px" />
      <Title heading={2} style={colorStyle}>{textList[index][0]}</Title>
      <Space vertical align="start">
        <Paragraph style={colorStyle}>{textList[index][1]}</Paragraph>
        <Paragraph style={colorStyle}>{textList[index][2]}</Paragraph>
      </Space>
    </Space>
  </div>
{/snippet}
{#snippet slide0()}{@render slide(0)}{/snippet}
{#snippet slide1()}{@render slide(1)}{/snippet}
{#snippet slide2()}{@render slide(2)}{/snippet}
