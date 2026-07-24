<script lang="ts">
  import { Carousel, RadioGroup, Radio, Space, Typography } from '@chenzy-design/svelte';
  import { imgList, semiLogo, textList } from './_data.js';

  const { Title, Paragraph } = Typography;
  let show = $state(true);
  let arrowType = $state<'always' | 'hover'>('always');

  const titleStyle = 'position:absolute;top:100px;left:100px;';
  const colorStyle = 'color:#1C1F23;';
</script>

<div>
  <Carousel
    style="width:100%;height:400px"
    showArrow={show}
    {arrowType}
    theme="dark"
    autoPlay={false}
    slides={[slide0, slide1, slide2]}
  />
  <br />
  <Space vertical align="start">
    <Space>
      <div>展示箭头</div>
      <RadioGroup value={show} onChange={(e) => (show = e.target.value as boolean)} type="button">
        <Radio value={true}>show</Radio>
        <Radio value={false}>hide</Radio>
      </RadioGroup>
    </Space>
    <Space>
      <div>展示时机</div>
      <RadioGroup value={arrowType} onChange={(e) => (arrowType = e.target.value as typeof arrowType)} type="button">
        <Radio value="always">always</Radio>
        <Radio value="hover">hover</Radio>
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
