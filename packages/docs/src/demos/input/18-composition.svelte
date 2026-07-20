<script lang="ts">
  import { Input, TextArea } from '@chenzy-design/svelte';

  let inputValue = $state('');
  let textAreaValue = $state('');
  let inputLogs = $state<string[]>([]);
  let textAreaLogs = $state<string[]>([]);

  function handleInputChange(value: string) {
    inputValue = value;
    inputLogs = [...inputLogs, value];
  }

  function handleTextAreaChange(value: string) {
    textAreaValue = value;
    textAreaLogs = [...textAreaLogs, value];
  }
</script>

<div>
  <h4>Input with composition</h4>
  <Input
    composition
    value={inputValue}
    onChange={handleInputChange}
    placeholder="开启 composition，拼音输入时不会触发 onChange"
    style="width: 300px;"
  />
  <div style="margin-top: 8px; color: var(--cd-color-text-2); font-size: 12px;">
    onChange 触发次数: {inputLogs.length}
  </div>
  <br /><br />
  <h4>TextArea with composition</h4>
  <TextArea
    composition
    value={textAreaValue}
    onChange={handleTextAreaChange}
    placeholder="开启 composition，拼音输入时不会触发 onChange"
    style="width: 300px;"
  />
  <div style="margin-top: 8px; color: var(--cd-color-text-2); font-size: 12px;">
    onChange 触发次数: {textAreaLogs.length}
  </div>
</div>
