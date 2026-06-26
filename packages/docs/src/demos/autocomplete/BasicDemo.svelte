<script lang="ts">
  import { AutoComplete, Text } from '@chenzy-design/svelte';

  let acVal = $state('');
  let acInsetVal = $state('');
  let acGroupVal = $state('');
  let acRemoteVal = $state('');
  let acRemoteData = $state<{ label: string; value: string }[]>([]);
  let acRemoteLoading = $state(false);
  let acRemoteTimer: ReturnType<typeof setTimeout> | undefined;

  function handleAcRemoteSearch(q: string) {
    if (acRemoteTimer) clearTimeout(acRemoteTimer);
    if (!q.trim()) {
      acRemoteData = [];
      acRemoteLoading = false;
      return;
    }
    acRemoteLoading = true;
    acRemoteTimer = setTimeout(() => {
      acRemoteData = [1, 2, 3].map((i) => ({ label: `${q}-suggestion-${i}`, value: `${q}-${i}` }));
      acRemoteLoading = false;
    }, 500);
  }
</script>

<!-- 基础输入补全 -->
<div style="width: 220px">
  <AutoComplete
    data={['gmail.com', 'outlook.com', 'qq.com', '163.com']}
    value={acVal}
    placeholder="输入邮箱后缀"
    onChange={(v) => (acVal = v)}
  />
  <Text type="tertiary">输入：{acVal || '（空）'}</Text>
</div>

<!-- insetLabel + openOnFocus -->
<div style="width: 220px; margin-top: 12px" data-testid="autocomplete-inset">
  <AutoComplete
    data={['gmail.com', 'outlook.com', 'qq.com', '163.com']}
    insetLabel="https://"
    openOnFocus
    value={acInsetVal}
    placeholder="聚焦展开 + 内嵌标签"
    onChange={(v) => (acInsetVal = v)}
  />
  <Text type="tertiary">内嵌：{acInsetVal || '（空）'}</Text>
</div>

<!-- 分组候选 -->
<div style="width: 220px; margin-top: 12px" data-testid="autocomplete-group">
  <AutoComplete
    data={[
      { label: '热门', options: ['gmail.com', 'outlook.com'] },
      { label: '国内', options: ['qq.com', '163.com', '126.com'] },
    ]}
    openOnFocus
    value={acGroupVal}
    placeholder="分组候选"
    onChange={(v) => (acGroupVal = v)}
  />
  <Text type="tertiary">分组：{acGroupVal || '（空）'}</Text>
</div>

<!-- 远程联想 -->
<div style="width: 220px; margin-top: 12px" data-testid="autocomplete-remote">
  <AutoComplete
    data={acRemoteData}
    loading={acRemoteLoading}
    onSearch={handleAcRemoteSearch}
    searchDebounce={300}
    maxCount={5}
    clearable
    placeholder="远程联想（输入触发）"
    value={acRemoteVal}
    onChange={(v) => (acRemoteVal = v)}
  />
  <Text type="tertiary">远程输入：{acRemoteVal || '（空）'}</Text>
</div>
