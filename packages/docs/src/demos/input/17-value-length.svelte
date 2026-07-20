<script lang="ts">
  import { Input, Typography, Form, FormInput, TextArea, Button } from '@chenzy-design/svelte';

  let value = $state('');

  // 用原生 Intl.Segmenter 按 grapheme（可见字符）计长度，emoji（含组合 emoji）算 1。
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  function getValueLength(str: string): number {
    if (typeof str === 'string') {
      return [...segmenter.segment(str)].length;
    }
    return 0;
  }

  function getTextAreaStrLength(str: string): number {
    const filteredStr = str.replace(/\s/g, '');
    return filteredStr.length;
  }
</script>

<div>
  <h4>maxLength=10</h4>
  <div>
    <Typography.Text>尝试输入以下字符</Typography.Text>
    <div><Typography.Text copyable>💖</Typography.Text></div>
    <div><Typography.Text copyable>👨‍👩‍👧‍👦</Typography.Text></div>
  </div>
  <Input
    maxLength={10}
    {getValueLength}
    onChange={(v) => (value = v)}
    style="width: 200px; margin-top: 12px; margin-bottom: 12px;"
  />
  {#if value}
    <div>
      <div><Typography.Text type="tertiary">{`getValueLength=${getValueLength(value)}`}</Typography.Text></div>
      <div><Typography.Text type="tertiary">{`length=${value.length}`}</Typography.Text></div>
    </div>
  {/if}
  <br /><br />
  <h4>Form.Input + minLength=4</h4>
  <Form layout="horizontal">
    <FormInput noLabel field="username" minLength={4} {getValueLength} style="width: 200px;" />
    <Button type="primary" htmlType="submit">提交</Button>
  </Form>
  <h4>maxCount=10</h4>
  <TextArea
    defaultValue="semi design"
    rows={2}
    maxCount={10}
    getValueLength={getTextAreaStrLength}
    style="width: 200px;"
  />
</div>
