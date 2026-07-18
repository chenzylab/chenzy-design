<!--
  后代 hook 面板：用 useFormApi / useFormState / getFieldApi 拿句柄并操作字段。
  暴露按钮与只读文本供测试断言。仅供 FormInputGroup.test.ts 使用，不导出。
-->
<script lang="ts">
  import { useFormApi, useFormState, getFieldApi } from './hooks.js';

  const api = useFormApi();
  const areaApi = getFieldApi('areaCode');
</script>

<div data-testid="hook-panel">
  <span data-testid="area-value">{String(useFormState()?.values.areaCode ?? '')}</span>
  <!-- 展示走 reactive 的 useFormState（core getError 是非响应式读取，只作命令式用途） -->
  <span data-testid="area-error">{String(useFormState()?.errors.areaCode ?? '')}</span>
  <span data-testid="has-api">{api ? 'yes' : 'no'}</span>
  <button type="button" data-testid="set-value" onclick={() => areaApi.setValue('+86')}>set</button>
  <button type="button" data-testid="set-error" onclick={() => areaApi.setError('forced error')}>err</button>
  <button type="button" data-testid="set-touched" onclick={() => areaApi.setTouched(true)}>touch</button>
  <span data-testid="area-touched">{areaApi.getTouched() ? 'touched' : 'untouched'}</span>
</div>
