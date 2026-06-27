<script lang="ts">
  import { Input, TextArea, Text } from '@chenzy-design/svelte';

  const {
    disabled = false,
    size = 'default',
    placeholder = '请输入',
  }: {
    disabled?: boolean;
    size?: 'small' | 'default' | 'large';
    placeholder?: string;
  } = $props();

  let inputVal = $state('');
  let taVal = $state('受控多行文本');
  let inputEvtLog = $state('');
  let taEvtLog = $state('');
  let taResizeH = $state(0);
</script>

<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px;">
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    <Input
      {placeholder}
      {disabled}
      {size}
      clearable
      value={inputVal}
      onChange={(v) => (inputVal = v)}
    />
    <Input type="password" placeholder="密码" {disabled} {size} />
    <Input status="error" placeholder="错误态" {disabled} {size} />
    <Input disabled={disabled || true} placeholder="禁用" {size} />
  </div>
  <Text type="tertiary">受控值：{inputVal || '（空）'}</Text>

  <div data-testid="textarea-autosize">
    <TextArea placeholder="多行文本，autosize（随输入增高）" autosize showCount maxLength={100} />
  </div>
  <div data-testid="textarea-maxrows" style="margin-top:12px">
    <TextArea placeholder="autosize 限高 minRows=2 maxRows=4，超出滚动" autosize={{ minRows: 2, maxRows: 4 }} />
  </div>
  <div data-testid="textarea-maxcount" style="margin-top:12px">
    <TextArea placeholder="maxCount=20，超限计数变红并播报" showCount maxCount={20} showClear />
  </div>
  <div data-testid="textarea-graphemes" style="margin-top:12px">
    <TextArea
      placeholder="countGraphemes：emoji 👨‍👩‍👧 按视觉字符计数"
      showCount
      countGraphemes
      maxCount={10}
      defaultValue="👨‍👩‍👧🇨🇳"
    />
  </div>
  <div data-testid="textarea-controlled" style="margin-top:12px">
    <TextArea
      value={taVal}
      onChange={(v) => (taVal = v)}
      showClear
      showCount
      validateStatus="warning"
      placeholder="受控 + showClear + validateStatus=warning"
    />
    <Text type="tertiary">受控值长度：{taVal.length}</Text>
  </div>
  <div data-testid="textarea-autofocus" style="margin-top:12px">
    <TextArea placeholder="status=error + autoFocus" status="error" autoFocus />
  </div>

  <div data-testid="input-events" style="margin-top:12px">
    <Input
      placeholder="onFocus/onBlur/onEnterPress 演示"
      onFocus={() => (inputEvtLog = 'focus')}
      onBlur={() => (inputEvtLog = 'blur')}
      onEnterPress={() => (inputEvtLog = 'enterPress')}
    />
    <Text type="tertiary">
      <span data-testid="input-evt-log">input 事件：{inputEvtLog || '（无）'}</span>
    </Text>
  </div>

  <div data-testid="textarea-events" style="margin-top:12px">
    <TextArea
      placeholder="onFocus/onBlur/onEnterPress/onResize/onComposition 演示"
      autosize={{ minRows: 1, maxRows: 6 }}
      onFocus={() => (taEvtLog = 'focus')}
      onBlur={() => (taEvtLog = 'blur')}
      onEnterPress={({ event }) =>
        (taEvtLog = event.ctrlKey || event.metaKey ? 'enterPress+mod' : 'enterPress')}
      onResize={({ height }) => (taResizeH = height)}
      onCompositionStart={() => (taEvtLog = 'compositionStart')}
      onCompositionEnd={() => (taEvtLog = 'compositionEnd')}
    />
    <Text type="tertiary">
      <span data-testid="textarea-evt-log">textarea 事件：{taEvtLog || '（无）'}</span>
      <span data-testid="textarea-resize-h"> | autosize 高度：{taResizeH}</span>
    </Text>
  </div>
</div>
